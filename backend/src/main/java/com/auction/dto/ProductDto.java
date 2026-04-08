package com.auction.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

public class ProductDto {

    // ============ 요청 DTO ============

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "상품명은 필수입니다")
        @Size(max = 100)
        private String title;

        @NotBlank(message = "상품 설명은 필수입니다")
        private String description;

        @NotNull(message = "카테고리를 선택하세요")
        private Long categoryId;

        @NotNull(message = "상품 상태를 선택하세요")
        private String itemCondition;   // BEST, GOOD, FAIR

        @NotNull(message = "시작가를 입력하세요")
        @Min(value = 1000, message = "시작가는 1,000원 이상이어야 합니다")
        private Integer startPrice;

        private Integer buyNowPrice;    // 즉시구매가 (선택)

        @NotNull(message = "경매 기간을 선택하세요")
        private Integer auctionDays;    // 1, 3, 5, 7일

        @NotNull(message = "배송 방법을 선택하세요")
        private String deliveryType;    // PARCEL, DIRECT, BOTH
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private String itemCondition;
        private Integer buyNowPrice;
        private String deliveryType;
    }

    // ============ 응답 DTO ============

    /** 목록용 (간단한 정보) */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ListItem {
        private Long id;
        private String title;
        private String thumbnailUrl;
        private String itemCondition;
        private Integer startPrice;
        private Integer currentPrice;
        private Integer buyNowPrice;
        private Integer bidCount;
        private String status;
        private String endTime;
        private String sellerNickname;
        private String categoryName;
        private Integer viewCount;
    }

    /** 상세용 (전체 정보) */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class Detail {
        private Long id;
        private String title;
        private String description;
        private String itemCondition;
        private Integer startPrice;
        private Integer currentPrice;
        private Integer buyNowPrice;
        private Integer bidCount;
        private String status;
        private String deliveryType;
        private String startTime;
        private String endTime;
        private Integer viewCount;

        // 판매자 정보
        private Long sellerId;
        private String sellerNickname;
        private String sellerProfileImage;

        // 현재 최고 입찰자
        private Long topBidderId;
        private String topBidderNickname;

        // 카테고리
        private Long categoryId;
        private String categoryName;
        private Long parentCategoryId;
        private String parentCategoryName;

        // 이미지 목록
        private List<ImageInfo> images;
    }

    /** 이미지 정보 */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ImageInfo {
        private Long id;
        private String imageUrl;
        private Integer imageOrder;
        private Boolean isThumbnail;
    }

    /** 페이징 응답 */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class PageResponse {
        private List<ListItem> products;
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}
