package com.auction.scheduler;

import com.auction.entity.Product;
import com.auction.entity.Product.AuctionStatus;
import com.auction.entity.Trade;
import com.auction.repository.ProductRepository;
import com.auction.repository.TradeRepository;
import com.auction.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionScheduler {

    private final ProductRepository productRepository;
    private final TradeRepository tradeRepository;
    private final NotificationService notificationService;

    /**
     * 1분마다 경매 마감 처리
     * - 마감 시간이 지난 ACTIVE 상품을 자동으로 SOLD(낙찰) 또는 FAILED(유찰) 처리
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void closeExpiredAuctions() {
        List<Product> expiredProducts = productRepository
                .findByStatusAndEndTimeBefore(AuctionStatus.ACTIVE, LocalDateTime.now());

        if (expiredProducts.isEmpty()) return;

        log.info("=== 경매 마감 처리 시작: {}건 ===", expiredProducts.size());

        for (Product product : expiredProducts) {
            try {
                if (product.getBidCount() > 0 && product.getTopBidder() != null) {
                    // === 낙찰 처리 ===
                    product.setStatus(AuctionStatus.SOLD);

                    // Trade(거래) 레코드 자동 생성
                    Trade trade = Trade.builder()
                            .product(product)
                            .seller(product.getSeller())
                            .buyer(product.getTopBidder())
                            .finalPrice(product.getCurrentPrice())
                            .build();
                    tradeRepository.save(trade);

                    // 알림: 낙찰자에게
                    notificationService.notifyAuctionWon(
                            product.getTopBidder(),
                            product.getId(),
                            product.getTitle(),
                            product.getCurrentPrice());

                    // 알림: 판매자에게
                    notificationService.notifyAuctionEnded(
                            product.getSeller(),
                            product.getId(),
                            product.getTitle(),
                            true);

                    log.info("  낙찰: [{}] {} → {}원 (구매자: {})",
                            product.getId(), product.getTitle(),
                            product.getCurrentPrice(),
                            product.getTopBidder().getNickname());

                } else {
                    // === 유찰 처리 ===
                    product.setStatus(AuctionStatus.FAILED);

                    // 알림: 판매자에게
                    notificationService.notifyAuctionEnded(
                            product.getSeller(),
                            product.getId(),
                            product.getTitle(),
                            false);

                    log.info("  유찰: [{}] {}", product.getId(), product.getTitle());
                }
            } catch (Exception e) {
                log.error("  경매 마감 처리 실패: [{}] {} - {}",
                        product.getId(), product.getTitle(), e.getMessage());
            }
        }

        log.info("=== 경매 마감 처리 완료 ===");
    }
}
