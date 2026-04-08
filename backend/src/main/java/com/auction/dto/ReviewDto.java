package com.auction.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

public class ReviewDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "거래 ID는 필수입니다")
        private Long tradeId;

        @NotNull(message = "평점은 필수입니다")
        @Min(1) @Max(5)
        private Integer rating;

        @Size(max = 500)
        private String content;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ReviewItem {
        private Long reviewId;
        private Long tradeId;
        private String writerNickname;
        private String targetNickname;
        private Integer rating;
        private String content;
        private String createdAt;
        private String productTitle;
    }
}
