package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.entity.Notice;
import com.auction.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notice>>> getNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getNotices(page, size)));
    }

    @GetMapping("/{noticeId}")
    public ResponseEntity<ApiResponse<Notice>> getNotice(@PathVariable Long noticeId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getNotice(noticeId)));
    }
}
