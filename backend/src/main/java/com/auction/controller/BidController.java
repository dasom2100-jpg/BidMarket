package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.dto.BidDto;
import com.auction.service.BidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    /**
     * 입찰하기
     * POST /api/bids
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BidDto.BidResponse>> placeBid(
            Authentication authentication,
            @Valid @RequestBody BidDto.BidRequest request) {

        Long memberId = (Long) authentication.getPrincipal();
        BidDto.BidResponse response = bidService.placeBid(memberId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("입찰이 완료되었습니다", response));
    }

    /**
     * 즉시구매
     * POST /api/bids/buy-now
     */
    @PostMapping("/buy-now")
    public ResponseEntity<ApiResponse<BidDto.BidResponse>> buyNow(
            Authentication authentication,
            @Valid @RequestBody BidDto.BuyNowRequest request) {

        Long memberId = (Long) authentication.getPrincipal();
        BidDto.BidResponse response = bidService.buyNow(memberId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("즉시구매가 완료되었습니다", response));
    }

    /**
     * 상품의 입찰 내역 조회
     * GET /api/bids/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<BidDto.BidHistoryResponse>> getBidHistory(
            @PathVariable Long productId) {

        BidDto.BidHistoryResponse response = bidService.getBidHistory(productId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 내 입찰 내역
     * GET /api/bids/my
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BidDto.MyBidItem>>> getMyBids(
            Authentication authentication) {

        Long memberId = (Long) authentication.getPrincipal();
        List<BidDto.MyBidItem> bids = bidService.getMyBids(memberId);
        return ResponseEntity.ok(ApiResponse.success(bids));
    }
}
