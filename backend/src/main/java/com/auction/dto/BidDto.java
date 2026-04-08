package com.auction.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

public class BidDto {

    // ============ 요청 DTO ============

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class BidRequest {

        @NotNull(message = "상품 ID는 필수입니다")
        private Long productId;

        @NotNull(message = "입찰 금액은 필수입니다")
        @Min(value = 1000, message = "입찰 금액은 1,000원 이상이어야 합니다")
        private Integer bidAmount;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class BuyNowRequest {

        @NotNull(message = "상품 ID는 필수입니다")
        private Long productId;
    }

    // ============ 응답 DTO ============

    /** 입찰 결과 */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class BidResponse {
        private Long bidId;
        private Long productId;
        private Integer bidAmount;
        private Integer currentPrice;
        private Integer bidCount;
        private String bidTime;
        private String bidderNickname;
    }

    /** 입찰 내역 한 건 */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class BidItem {
        private Long bidId;
        private Integer bidAmount;
        private String bidTime;
        private String bidderNickname;
        private boolean isTopBid;
    }

    /** 상품의 입찰 내역 목록 */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class BidHistoryResponse {
        private Long productId;
        private Integer currentPrice;
        private Integer bidCount;
        private String status;
        private List<BidItem> bids;
    }

    /** 내 입찰 내역 (마이페이지용) */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class MyBidItem {
        private Long bidId;
        private Long productId;
        private String productTitle;
        private String productThumbnail;
        private String productStatus;
        private Integer bidAmount;
        private Integer currentPrice;
        private String bidTime;
        private boolean isTopBidder;
    }
}
