package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.entity.Member;
import com.auction.entity.Report;
import com.auction.repository.MemberRepository;
import com.auction.repository.ReportRepository;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;

    /**
     * 신고 등록 (사용자)
     * POST /api/reports
     * body: { targetType: "PRODUCT", targetId: 1, reason: "허위상품", detail: "..." }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createReport(
            Authentication auth, @RequestBody Map<String, Object> body) {

        Long memberId = (Long) auth.getPrincipal();
        Member reporter = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다"));

        String targetType = (String) body.get("targetType");
        Long targetId = Long.valueOf(body.get("targetId").toString());
        String reason = (String) body.get("reason");
        String detail = (String) body.get("detail");

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("신고 사유를 선택해주세요");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(Report.TargetType.valueOf(targetType))
                .targetId(targetId)
                .reason(reason)
                .detail(detail)
                .build();

        reportRepository.save(report);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("신고가 접수되었습니다. 관리자가 검토 후 처리합니다."));
    }
}
