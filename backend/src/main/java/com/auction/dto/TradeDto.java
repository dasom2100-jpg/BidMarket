package com.auction.dto;

import lombok.*;

import java.util.List;

public class TradeDto {

    // ============ 요청 DTO ============

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class ShipRequest {
        private String shippingCompany;
        private String trackingNumber;
    }

    // ============ 응답 DTO ============

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class TradeDetail {
        private Long tradeId;
        private Long productId;
        private String productTitle;
        private String productThumbnail;
        private Integer finalPrice;
        private String status;

        // 판매자
        private Long sellerId;
        private String sellerNickname;

        // 구매자
        private Long buyerId;
        private String buyerNickname;

        // 배송 정보
        private String shippingCompany;
        private String trackingNumber;

        // 타임라인
        private String createdAt;
        private String paidAt;
        private String shippedAt;
        private String deliveredAt;
        private String completedAt;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class TradeListItem {
        private Long tradeId;
        private Long productId;
        private String productTitle;
        private String productThumbnail;
        private Integer finalPrice;
        private String status;
        private String counterpartNickname;
        private String createdAt;
        private String role; // SELLER or BUYER
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class PageResponse {
        private List<TradeListItem> trades;
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private boolean hasNext;
    }
}
