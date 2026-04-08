package com.auction.service;

import com.auction.dto.TradeDto;
import com.auction.entity.*;
import com.auction.entity.Trade.TradeStatus;
import com.auction.repository.TradeRepository;
import com.auction.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TradeService {

    private final TradeRepository tradeRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    /**
     * 거래 상세 조회
     */
    public TradeDto.TradeDetail getTradeDetail(Long tradeId, Long memberId) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("거래를 찾을 수 없습니다"));

        // 판매자 또는 구매자만 조회 가능
        if (!trade.getSeller().getId().equals(memberId)
                && !trade.getBuyer().getId().equals(memberId)) {
            throw new SecurityException("이 거래에 대한 권한이 없습니다");
        }

        return toDetail(trade);
    }

    /**
     * 상품 ID로 거래 조회
     */
    public TradeDto.TradeDetail getTradeByProduct(Long productId, Long memberId) {
        Trade trade = tradeRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("거래를 찾을 수 없습니다"));

        if (!trade.getSeller().getId().equals(memberId)
                && !trade.getBuyer().getId().equals(memberId)) {
            throw new SecurityException("이 거래에 대한 권한이 없습니다");
        }

        return toDetail(trade);
    }

    /**
     * 결제 확인 (구매자)
     */
    @Transactional
    public TradeDto.TradeDetail confirmPayment(Long tradeId, Long buyerId) {
        Trade trade = getTrade(tradeId);
        validateBuyer(trade, buyerId);
        validateStatus(trade, TradeStatus.AWAITING_PAYMENT);

        trade.setStatus(TradeStatus.PAID);
        trade.setPaidAt(LocalDateTime.now());

        // 상품 상태 변경
        trade.getProduct().setStatus(Product.AuctionStatus.TRADING);

        // 알림: 판매자에게
        notificationService.send(trade.getSeller(),
                Notification.NotificationType.PAYMENT,
                "결제 완료",
                String.format("[%s] 구매자가 결제를 완료했습니다. 배송을 준비해주세요.",
                        trade.getProduct().getTitle()),
                trade.getProduct().getId());

        return toDetail(trade);
    }

    /**
     * 배송 시작 — 송장번호 입력 (판매자)
     */
    @Transactional
    public TradeDto.TradeDetail shipOrder(Long tradeId, Long sellerId, TradeDto.ShipRequest request) {
        Trade trade = getTrade(tradeId);
        validateSeller(trade, sellerId);
        validateStatus(trade, TradeStatus.PAID);

        if (request.getTrackingNumber() == null || request.getTrackingNumber().isBlank()) {
            throw new IllegalArgumentException("송장번호를 입력하세요");
        }

        trade.setStatus(TradeStatus.SHIPPING);
        trade.setShippingCompany(request.getShippingCompany());
        trade.setTrackingNumber(request.getTrackingNumber());
        trade.setShippedAt(LocalDateTime.now());

        // 알림: 구매자에게
        notificationService.send(trade.getBuyer(),
                Notification.NotificationType.SHIPPING,
                "배송 시작",
                String.format("[%s] 판매자가 상품을 발송했습니다. 운송장: %s",
                        trade.getProduct().getTitle(), request.getTrackingNumber()),
                trade.getProduct().getId());

        return toDetail(trade);
    }

    /**
     * 수령 확인 (구매자)
     */
    @Transactional
    public TradeDto.TradeDetail confirmDelivery(Long tradeId, Long buyerId) {
        Trade trade = getTrade(tradeId);
        validateBuyer(trade, buyerId);
        validateStatus(trade, TradeStatus.SHIPPING);

        trade.setStatus(TradeStatus.DELIVERED);
        trade.setDeliveredAt(LocalDateTime.now());

        // 알림: 판매자에게
        notificationService.send(trade.getSeller(),
                Notification.NotificationType.DELIVERED,
                "수령 확인",
                String.format("[%s] 구매자가 상품 수령을 확인했습니다.",
                        trade.getProduct().getTitle()),
                trade.getProduct().getId());

        return toDetail(trade);
    }

    /**
     * 거래 완료 (판매자 또는 구매자)
     */
    @Transactional
    public TradeDto.TradeDetail completeTrade(Long tradeId, Long memberId) {
        Trade trade = getTrade(tradeId);

        if (!trade.getSeller().getId().equals(memberId)
                && !trade.getBuyer().getId().equals(memberId)) {
            throw new SecurityException("이 거래에 대한 권한이 없습니다");
        }
        validateStatus(trade, TradeStatus.DELIVERED);

        trade.setStatus(TradeStatus.COMPLETED);
        trade.setCompletedAt(LocalDateTime.now());

        // 상품 상태 변경
        trade.getProduct().setStatus(Product.AuctionStatus.COMPLETED);

        // 알림: 양쪽 모두에게
        notificationService.send(trade.getSeller(),
                Notification.NotificationType.REVIEW,
                "거래 완료",
                String.format("[%s] 거래가 완료되었습니다. 리뷰를 남겨주세요!",
                        trade.getProduct().getTitle()),
                trade.getProduct().getId());

        notificationService.send(trade.getBuyer(),
                Notification.NotificationType.REVIEW,
                "거래 완료",
                String.format("[%s] 거래가 완료되었습니다. 리뷰를 남겨주세요!",
                        trade.getProduct().getTitle()),
                trade.getProduct().getId());

        return toDetail(trade);
    }

    /**
     * 내 판매 거래 목록
     */
    public TradeDto.PageResponse getMySales(Long sellerId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Trade> tradePage = tradeRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
        return toPageResponse(tradePage, "SELLER");
    }

    /**
     * 내 구매 거래 목록
     */
    public TradeDto.PageResponse getMyPurchases(Long buyerId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Trade> tradePage = tradeRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId, pageable);
        return toPageResponse(tradePage, "BUYER");
    }

    // ============ Private Helpers ============

    private Trade getTrade(Long tradeId) {
        return tradeRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("거래를 찾을 수 없습니다"));
    }

    private void validateSeller(Trade trade, Long sellerId) {
        if (!trade.getSeller().getId().equals(sellerId)) {
            throw new SecurityException("판매자만 수행할 수 있습니다");
        }
    }

    private void validateBuyer(Trade trade, Long buyerId) {
        if (!trade.getBuyer().getId().equals(buyerId)) {
            throw new SecurityException("구매자만 수행할 수 있습니다");
        }
    }

    private void validateStatus(Trade trade, TradeStatus expected) {
        if (trade.getStatus() != expected) {
            throw new IllegalArgumentException(
                    String.format("현재 상태(%s)에서는 이 작업을 수행할 수 없습니다", trade.getStatus()));
        }
    }

    private String getThumbnail(Product product) {
        return product.getImages().stream()
                .filter(ProductImage::getIsThumbnail)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(null);
    }

    private TradeDto.TradeDetail toDetail(Trade trade) {
        return TradeDto.TradeDetail.builder()
                .tradeId(trade.getId())
                .productId(trade.getProduct().getId())
                .productTitle(trade.getProduct().getTitle())
                .productThumbnail(getThumbnail(trade.getProduct()))
                .finalPrice(trade.getFinalPrice())
                .status(trade.getStatus().name())
                .sellerId(trade.getSeller().getId())
                .sellerNickname(trade.getSeller().getNickname())
                .buyerId(trade.getBuyer().getId())
                .buyerNickname(trade.getBuyer().getNickname())
                .shippingCompany(trade.getShippingCompany())
                .trackingNumber(trade.getTrackingNumber())
                .createdAt(trade.getCreatedAt().toString())
                .paidAt(trade.getPaidAt() != null ? trade.getPaidAt().toString() : null)
                .shippedAt(trade.getShippedAt() != null ? trade.getShippedAt().toString() : null)
                .deliveredAt(trade.getDeliveredAt() != null ? trade.getDeliveredAt().toString() : null)
                .completedAt(trade.getCompletedAt() != null ? trade.getCompletedAt().toString() : null)
                .build();
    }

    private TradeDto.PageResponse toPageResponse(Page<Trade> page, String role) {
        List<TradeDto.TradeListItem> items = page.getContent().stream()
                .map(t -> TradeDto.TradeListItem.builder()
                        .tradeId(t.getId())
                        .productId(t.getProduct().getId())
                        .productTitle(t.getProduct().getTitle())
                        .productThumbnail(getThumbnail(t.getProduct()))
                        .finalPrice(t.getFinalPrice())
                        .status(t.getStatus().name())
                        .counterpartNickname(role.equals("SELLER")
                                ? t.getBuyer().getNickname()
                                : t.getSeller().getNickname())
                        .createdAt(t.getCreatedAt().toString())
                        .role(role)
                        .build())
                .collect(Collectors.toList());

        return TradeDto.PageResponse.builder()
                .trades(items)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .build();
    }
}
