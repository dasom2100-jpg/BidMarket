package com.auction.service;

import com.auction.dto.AuthDto;
import com.auction.entity.*;
import com.auction.entity.Product.AuctionStatus;
import com.auction.entity.Report.ReportStatus;
import com.auction.entity.Inquiry.InquiryStatus;
import com.auction.repository.*;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final TradeRepository tradeRepository;
    private final ReportRepository reportRepository;
    private final NoticeRepository noticeRepository;
    private final InquiryRepository inquiryRepository;
    private final NotificationService notificationService;

    // ========== 대시보드 ==========

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalMembers", memberRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("activeAuctions", productRepository.findByStatus(AuctionStatus.ACTIVE,
                PageRequest.of(0, 1)).getTotalElements());
        stats.put("totalTrades", tradeRepository.count());
        stats.put("pendingReports", reportRepository.countByStatus(ReportStatus.PENDING));
        stats.put("pendingInquiries", inquiryRepository.countByStatus(InquiryStatus.PENDING));
        return stats;
    }

    // ========== 회원 관리 ==========

    public Page<Member> getAllMembers(int page, int size) {
        return memberRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @Transactional
    public void toggleMemberActive(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다"));
        if (member.getRole() == Member.Role.ADMIN) {
            throw new IllegalArgumentException("관리자 계정은 비활성화할 수 없습니다");
        }
        member.setIsActive(!member.getIsActive());
    }

    // ========== 상품 관리 ==========

    public Page<Product> getAllProducts(int page, int size) {
        Page<Product> products = productRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        // LAZY 필드 전부 강제 초기화
        products.getContent().forEach(p -> {
            if (p.getSeller() != null) p.getSeller().getNickname();
            if (p.getCategory() != null) p.getCategory().getName();
            if (p.getTopBidder() != null) p.getTopBidder().getNickname();
            if (p.getImages() != null) p.getImages().size();
        });
        return products;
    }

    @Transactional
    public void cancelProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));
        product.setStatus(AuctionStatus.CANCELLED);
    }

    // ========== 신고 관리 ==========

    public Page<Report> getReports(String status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Report> reports;
        if (status != null && !status.isBlank()) {
            reports = reportRepository.findByStatusOrderByCreatedAtDesc(
                    ReportStatus.valueOf(status), pageable);
        } else {
            reports = reportRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        reports.getContent().forEach(r -> {
            if (r.getReporter() != null) r.getReporter().getNickname();
        });
        return reports;
    }

    /**
     * 신고 처리 (제재 포함)
     * @param takeAction true면 신고 대상에 제재 조치 (상품 취소, 회원 정지 등)
     */
    @Transactional
    public void resolveReport(Long reportId, String adminNote, boolean dismiss, boolean takeAction) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다"));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new IllegalArgumentException("이미 처리된 신고입니다");
        }

        report.setStatus(dismiss ? ReportStatus.DISMISSED : ReportStatus.RESOLVED);
        report.setAdminNote(adminNote);
        report.setResolvedAt(LocalDateTime.now());

        // 제재 조치 (처리 + takeAction일 때만)
        if (!dismiss && takeAction) {
            if (report.getTargetType() == Report.TargetType.PRODUCT) {
                productRepository.findById(report.getTargetId()).ifPresent(product -> {
                    if (product.getStatus() == AuctionStatus.ACTIVE) {
                        product.setStatus(AuctionStatus.CANCELLED);
                        // 판매자에게 알림
                        notificationService.send(product.getSeller(),
                                Notification.NotificationType.SYSTEM,
                                "상품 제재 안내",
                                String.format("[%s] 상품이 신고 처리로 인해 취소되었습니다. 사유: %s",
                                        product.getTitle(), report.getReason()),
                                product.getId());
                    }
                });
            } else if (report.getTargetType() == Report.TargetType.MEMBER) {
                memberRepository.findById(report.getTargetId()).ifPresent(member -> {
                    if (member.getRole() != Member.Role.ADMIN) {
                        member.setIsActive(false);
                    }
                });
            }
        }

        // 신고자에게 결과 알림
        String resultMsg = dismiss
                ? "신고가 검토 결과 기각되었습니다."
                : takeAction
                    ? "신고가 접수되어 제재 조치가 완료되었습니다."
                    : "신고가 접수되어 처리되었습니다.";

        notificationService.send(report.getReporter(),
                Notification.NotificationType.SYSTEM,
                "신고 처리 결과",
                resultMsg,
                report.getTargetId());
    }

    /**
     * 신고 대상 상품명 조회 (프론트에서 사용)
     */
    public String getReportTargetName(Report report) {
        if (report.getTargetType() == Report.TargetType.PRODUCT) {
            return productRepository.findById(report.getTargetId())
                    .map(Product::getTitle)
                    .orElse("삭제된 상품");
        } else if (report.getTargetType() == Report.TargetType.MEMBER) {
            return memberRepository.findById(report.getTargetId())
                    .map(Member::getNickname)
                    .orElse("탈퇴한 회원");
        }
        return "알 수 없음";
    }

    // ========== 공지사항 관리 ==========

    @Transactional
    public Notice createNotice(Long adminId, String title, String content, boolean isPinned) {
        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다"));
        Notice notice = Notice.builder()
                .admin(admin)
                .title(title)
                .content(content)
                .isPinned(isPinned)
                .build();
        return noticeRepository.save(notice);
    }

    public Page<Notice> getNotices(int page, int size) {
        Page<Notice> notices = noticeRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(
                PageRequest.of(page, size));
        // LAZY 필드 강제 초기화 (open-in-view: false 대응)
        notices.getContent().forEach(n -> {
            if (n.getAdmin() != null) n.getAdmin().getNickname();
        });
        return notices;
    }

    @Transactional
    public Notice getNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다"));
        notice.setViewCount(notice.getViewCount() + 1);
        // LAZY 필드 강제 초기화
        if (notice.getAdmin() != null) notice.getAdmin().getNickname();
        return notice;
    }

    @Transactional
    public void deleteNotice(Long noticeId) {
        noticeRepository.deleteById(noticeId);
    }

    // ========== 1:1 문의 관리 ==========

    @Transactional
    public Inquiry createInquiry(Long memberId, String title, String content) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다"));
        return inquiryRepository.save(Inquiry.builder()
                .member(member).title(title).content(content).build());
    }

    public Page<Inquiry> getMyInquiries(Long memberId, int page, int size) {
        Page<Inquiry> inquiries = inquiryRepository.findByMemberIdOrderByCreatedAtDesc(memberId,
                PageRequest.of(page, size));
        initInquiryLazy(inquiries);
        return inquiries;
    }

    public Page<Inquiry> getAllInquiries(int page, int size) {
        Page<Inquiry> inquiries = inquiryRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        initInquiryLazy(inquiries);
        return inquiries;
    }

    private void initInquiryLazy(Page<Inquiry> page) {
        page.getContent().forEach(inq -> {
            if (inq.getMember() != null) inq.getMember().getNickname();
            if (inq.getAnsweredBy() != null) inq.getAnsweredBy().getNickname();
        });
    }

    @Transactional
    public void answerInquiry(Long inquiryId, Long adminId, String answer) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다"));
        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다"));
        inquiry.setAnswer(answer);
        inquiry.setAnsweredBy(admin);
        inquiry.setAnsweredAt(LocalDateTime.now());
        inquiry.setStatus(InquiryStatus.ANSWERED);

        notificationService.send(inquiry.getMember(),
                Notification.NotificationType.SYSTEM,
                "문의 답변", "1:1 문의에 답변이 등록되었습니다.", null);
    }
}
