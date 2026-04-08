package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.dto.ReviewDto;
import com.auction.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /** 리뷰 작성 */
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto.ReviewItem>> createReview(
            Authentication auth, @Valid @RequestBody ReviewDto.CreateRequest request) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("리뷰가 등록되었습니다", reviewService.createReview(memberId, request)));
    }

    /** 특정 회원이 받은 리뷰 목록 */
    @GetMapping("/member/{memberId}")
    public ResponseEntity<ApiResponse<List<ReviewDto.ReviewItem>>> getMemberReviews(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewsForMember(memberId)));
    }

    /** 거래에 대한 내 리뷰 작성 여부 */
    @GetMapping("/check/{tradeId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkReviewed(
            @PathVariable Long tradeId, Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        boolean reviewed = reviewService.hasReviewed(tradeId, memberId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("reviewed", reviewed)));
    }
}
