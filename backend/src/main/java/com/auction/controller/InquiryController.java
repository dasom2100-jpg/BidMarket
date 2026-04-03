package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.entity.Inquiry;
import com.auction.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final AdminService adminService;

    /** 내 문의 목록 */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<Inquiry>>> getMyInquiries(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(adminService.getMyInquiries(memberId, page, size)));
    }

    /** 문의 등록 */
    @PostMapping
    public ResponseEntity<ApiResponse<Inquiry>> createInquiry(
            Authentication auth, @RequestBody Map<String, String> body) {
        Long memberId = (Long) auth.getPrincipal();
        Inquiry inquiry = adminService.createInquiry(memberId, body.get("title"), body.get("content"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("문의가 등록되었습니다", inquiry));
    }
}
