package com.auction.dto;

import lombok.*;

import java.util.List;

public class NotificationDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class NotificationItem {
        private Long id;
        private String type;
        private String title;
        private String message;
        private Long referenceId;
        private Boolean isRead;
        private String createdAt;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class PageResponse {
        private List<NotificationItem> notifications;
        private long unreadCount;
        private int currentPage;
        private int totalPages;
        private boolean hasNext;
    }
}
