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
        return productRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
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
        if (status != null && !status.isBlank()) {
            return reportRepository.findByStatusOrderByCreatedAtDesc(
                    ReportStatus.valueOf(status), pageable);
        }
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public void resolveReport(Long reportId, String adminNote, boolean dismiss) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다"));
        report.setStatus(dismiss ? ReportStatus.DISMISSED : ReportStatus.RESOLVED);
        report.setAdminNote(adminNote);
        report.setResolvedAt(LocalDateTime.now());
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
        return noticeRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(
                PageRequest.of(page, size));
    }

    public Notice getNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다"));
        notice.setViewCount(notice.getViewCount() + 1);
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
        return inquiryRepository.findByMemberIdOrderByCreatedAtDesc(memberId,
                PageRequest.of(page, size));
    }

    public Page<Inquiry> getAllInquiries(int page, int size) {
        return inquiryRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
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
