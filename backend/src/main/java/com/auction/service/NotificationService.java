package com.auction.service;

import com.auction.entity.Member;
import com.auction.entity.Notification;
import com.auction.entity.Notification.NotificationType;
import com.auction.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * 알림 생성
     */
    @Transactional
    public void send(Member member, NotificationType type,
                     String title, String message, Long referenceId) {
        Notification notification = Notification.builder()
                .member(member)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);
    }

    /**
     * 입찰 알림 — 판매자에게 "새 입찰이 들어왔습니다"
     */
    public void notifyNewBid(Member seller, Long productId,
                             String productTitle, int bidAmount) {
        send(seller, NotificationType.BID,
                "새 입찰",
                String.format("[%s]에 %,d원 입찰이 들어왔습니다", productTitle, bidAmount),
                productId);
    }

    /**
     * 더 높은 입찰 알림 — 이전 최고 입찰자에게
     */
    public void notifyOutbid(Member previousBidder, Long productId,
                             String productTitle, int newBidAmount) {
        send(previousBidder, NotificationType.OUTBID,
                "입찰 경쟁",
                String.format("[%s]에 더 높은 입찰(%,d원)이 등록되었습니다", productTitle, newBidAmount),
                productId);
    }

    /**
     * 낙찰 알림 — 낙찰자에게
     */
    public void notifyAuctionWon(Member winner, Long productId,
                                 String productTitle, int finalPrice) {
        send(winner, NotificationType.AUCTION_WON,
                "낙찰 완료",
                String.format("[%s]을(를) %,d원에 낙찰받았습니다", productTitle, finalPrice),
                productId);
    }

    /**
     * 경매 종료 알림 — 판매자에게
     */
    public void notifyAuctionEnded(Member seller, Long productId,
                                   String productTitle, boolean hasBid) {
        String msg = hasBid
                ? String.format("[%s] 경매가 종료되어 낙찰되었습니다", productTitle)
                : String.format("[%s] 경매가 종료되었습니다 (유찰)", productTitle);
        send(seller, NotificationType.AUCTION_ENDED, "경매 종료", msg, productId);
    }

    /**
     * 읽지 않은 알림 수
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long memberId) {
        return notificationRepository.countByMemberIdAndIsReadFalse(memberId);
    }
}
