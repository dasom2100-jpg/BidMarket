package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.entity.*;
import com.auction.service.AdminService;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ========== 대시보드 ==========

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ========== 회원 관리 ==========

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<Page<Member>>> getMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllMembers(page, size)));
    }

    @PutMapping("/members/{memberId}/toggle-active")
    public ResponseEntity<ApiResponse<Void>> toggleMemberActive(@PathVariable Long memberId) {
        adminService.toggleMemberActive(memberId);
        return ResponseEntity.ok(ApiResponse.success("회원 상태가 변경되었습니다"));
    }

    // ========== 상품 관리 ==========

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<Product>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllProducts(page, size)));
    }

    @PutMapping("/products/{productId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelProduct(@PathVariable Long productId) {
        adminService.cancelProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("상품이 취소되었습니다"));
    }

    // ========== 신고 관리 ==========

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Page<Report>>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getReports(status, page, size)));
    }

    @PutMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveReport(
            @PathVariable Long reportId, @RequestBody Map<String, String> body) {
        adminService.resolveReport(reportId, body.get("adminNote"), false);
        return ResponseEntity.ok(ApiResponse.success("신고가 처리되었습니다"));
    }

    @PutMapping("/reports/{reportId}/dismiss")
    public ResponseEntity<ApiResponse<Void>> dismissReport(
            @PathVariable Long reportId, @RequestBody Map<String, String> body) {
        adminService.resolveReport(reportId, body.get("adminNote"), true);
        return ResponseEntity.ok(ApiResponse.success("신고가 기각되었습니다"));
    }

    // ========== 공지사항 ==========

    @PostMapping("/notices")
    public ResponseEntity<ApiResponse<Notice>> createNotice(
            Authentication auth, @RequestBody Map<String, Object> body) {
        Long adminId = (Long) auth.getPrincipal();
        Notice notice = adminService.createNotice(adminId,
                (String) body.get("title"),
                (String) body.get("content"),
                Boolean.TRUE.equals(body.get("isPinned")));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("공지사항이 등록되었습니다", notice));
    }

    @DeleteMapping("/notices/{noticeId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotice(@PathVariable Long noticeId) {
        adminService.deleteNotice(noticeId);
        return ResponseEntity.ok(ApiResponse.success("공지사항이 삭제되었습니다"));
    }

    // ========== 1:1 문의 (관리자) ==========

    @GetMapping("/inquiries")
    public ResponseEntity<ApiResponse<Page<Inquiry>>> getAllInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllInquiries(page, size)));
    }

    @PutMapping("/inquiries/{inquiryId}/answer")
    public ResponseEntity<ApiResponse<Void>> answerInquiry(
            @PathVariable Long inquiryId, Authentication auth,
            @RequestBody Map<String, String> body) {
        Long adminId = (Long) auth.getPrincipal();
        adminService.answerInquiry(inquiryId, adminId, body.get("answer"));
        return ResponseEntity.ok(ApiResponse.success("답변이 등록되었습니다"));
    }
}
