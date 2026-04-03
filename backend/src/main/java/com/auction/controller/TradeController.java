package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.dto.TradeDto;
import com.auction.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    /** 거래 상세 조회 */
    @GetMapping("/{tradeId}")
    public ResponseEntity<ApiResponse<TradeDto.TradeDetail>> getTradeDetail(
            @PathVariable Long tradeId, Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(tradeService.getTradeDetail(tradeId, memberId)));
    }

    /** 상품 ID로 거래 조회 */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<TradeDto.TradeDetail>> getTradeByProduct(
            @PathVariable Long productId, Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(tradeService.getTradeByProduct(productId, memberId)));
    }

    /** 결제 확인 (구매자) */
    @PutMapping("/{tradeId}/pay")
    public ResponseEntity<ApiResponse<TradeDto.TradeDetail>> confirmPayment(
            @PathVariable Long tradeId, Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("결제가 확인되었습니다", tradeService.confirmPayment(tradeId, memberId)));
    }

    /** 배송 시작 — 송장번호 입력 (판매자) */
    @PutMapping("/{tradeId}/ship")
    public ResponseEntity<ApiResponse<TradeDto.TradeDetail>> shipOrder(
            @PathVariable Long tradeId, Authentication auth,
            @RequestBody TradeDto.ShipRequest request) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("배송이 시작되었습니다", tradeService.shipOrder(tradeId, memberId, request)));
    }

    /** 수령 확인 (구매자) */
    @PutMapping("/{tradeId}/confirm")
    public ResponseEntity<ApiResponse<TradeDto.TradeDetail>> confirmDelivery(
            @PathVariable Long tradeId, Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("수령이 확인되었습니다", tradeService.confirmDelivery(tradeId, memberId)));
    }

    /** 거래 완료 */
    @PutMapping("/{tradeId}/complete")
    public ResponseEntity<ApiResponse<TradeDto.TradeDetail>> completeTrade(
            @PathVariable Long tradeId, Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("거래가 완료되었습니다", tradeService.completeTrade(tradeId, memberId)));
    }

    /** 내 판매 거래 목록 */
    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<TradeDto.PageResponse>> getMySales(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(tradeService.getMySales(memberId, page, size)));
    }

    /** 내 구매 거래 목록 */
    @GetMapping("/purchases")
    public ResponseEntity<ApiResponse<TradeDto.PageResponse>> getMyPurchases(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long memberId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(tradeService.getMyPurchases(memberId, page, size)));
    }
}
