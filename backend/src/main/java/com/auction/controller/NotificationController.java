package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.dto.NotificationDto;
import com.auction.entity.Notification;
import com.auction.repository.NotificationRepository;
import com.auction.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    /** 내 알림 목록 (페이징) */
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationDto.PageResponse>> getMyNotifications(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long memberId = (Long) auth.getPrincipal();
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notiPage = notificationRepository
                .findByMemberIdOrderByCreatedAtDesc(memberId, pageable);

        List<NotificationDto.NotificationItem> items = notiPage.getContent().stream()
                .map(n -> NotificationDto.NotificationItem.builder()
                        .id(n.getId())
                        .type(n.getType().name())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .referenceId(n.getReferenceId())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        long unreadCount = notificationService.getUnreadCount(memberId);

        return ResponseEntity.ok(ApiResponse.success(
                NotificationDto.PageResponse.builder()
                        .notifications(items)
                        .unreadCount(unreadCount)
                        .currentPage(notiPage.getNumber())
                        .totalPages(notiPage.getTotalPages())
                        .hasNext(notiPage.hasNext())
                        .build()));
    }

    /** 읽지 않은 알림 수 */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        long count = notificationService.getUnreadCount(memberId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    /** 알림 읽음 처리 */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long notificationId, Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        Notification noti = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다"));
        if (!noti.getMember().getId().equals(memberId)) {
            throw new SecurityException("권한이 없습니다");
        }
        noti.setIsRead(true);
        notificationRepository.save(noti);
        return ResponseEntity.ok(ApiResponse.success("읽음 처리되었습니다"));
    }

    /** 모든 알림 읽음 처리 */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication auth) {
        Long memberId = (Long) auth.getPrincipal();
        var pageable = PageRequest.of(0, 1000);
        Page<Notification> page = notificationRepository
                .findByMemberIdOrderByCreatedAtDesc(memberId, pageable);
        page.getContent().stream()
                .filter(n -> !n.getIsRead())
                .forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(page.getContent());
        return ResponseEntity.ok(ApiResponse.success("모든 알림을 읽음 처리했습니다"));
    }
}
