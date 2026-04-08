package com.auction.service;

import com.auction.dto.BidDto;
import com.auction.entity.*;
import com.auction.entity.Product.AuctionStatus;
import com.auction.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {

    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final MemberRepository memberRepository;
    private final TradeRepository tradeRepository;
    private final NotificationService notificationService;

    // 최소 입찰 단위 (현재가 대비 이 금액 이상 높아야 함)
    private static final int MIN_BID_INCREMENT = 1000;

    /**
     * 입찰하기 (비관적 잠금으로 동시성 제어)
     */
    @Transactional
    public BidDto.BidResponse placeBid(Long bidderId, BidDto.BidRequest request) {

        // 1) 비관적 잠금으로 상품 조회 (동시 입찰 방지)
        Product product = productRepository.findByIdWithLock(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));

        Member bidder = memberRepository.findById(bidderId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다"));

        // 2) 검증
        validateBid(product, bidder, request.getBidAmount());

        // 3) 이전 최고 입찰자 기록 (알림용)
        Member previousTopBidder = product.getTopBidder();

        // 4) 입찰 기록 저장
        Bid bid = Bid.builder()
                .product(product)
                .bidder(bidder)
                .bidAmount(request.getBidAmount())
                .bidTime(LocalDateTime.now())
                .build();
        bidRepository.save(bid);

        // 5) 상품 현재가 갱신
        product.setCurrentPrice(request.getBidAmount());
        product.setTopBidder(bidder);
        product.setBidCount(product.getBidCount() + 1);

        // 6) 알림 발송
        // 판매자에게: 새 입찰 알림
        notificationService.notifyNewBid(
                product.getSeller(), product.getId(),
                product.getTitle(), request.getBidAmount());

        // 이전 최고 입찰자에게: 더 높은 입찰 알림
        if (previousTopBidder != null && !previousTopBidder.getId().equals(bidderId)) {
            notificationService.notifyOutbid(
                    previousTopBidder, product.getId(),
                    product.getTitle(), request.getBidAmount());
        }

        return BidDto.BidResponse.builder()
                .bidId(bid.getId())
                .productId(product.getId())
                .bidAmount(request.getBidAmount())
                .currentPrice(product.getCurrentPrice())
                .bidCount(product.getBidCount())
                .bidTime(bid.getBidTime().toString())
                .bidderNickname(bidder.getNickname())
                .build();
    }

    /**
     * 즉시구매
     */
    @Transactional
    public BidDto.BidResponse buyNow(Long buyerId, BidDto.BuyNowRequest request) {

        Product product = productRepository.findByIdWithLock(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));

        Member buyer = memberRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다"));

        // 검증
        if (product.getBuyNowPrice() == null) {
            throw new IllegalArgumentException("즉시구매가 설정되지 않은 상품입니다");
        }
        if (product.getStatus() != AuctionStatus.ACTIVE) {
            throw new IllegalArgumentException("경매가 진행중인 상품만 즉시구매할 수 있습니다");
        }
        if (product.getEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("경매 마감 시간이 지났습니다");
        }
        if (product.getSeller().getId().equals(buyerId)) {
            throw new IllegalArgumentException("본인 상품은 즉시구매할 수 없습니다");
        }

        int buyNowPrice = product.getBuyNowPrice();

        // 입찰 기록 (즉시구매도 입찰로 기록)
        Bid bid = Bid.builder()
                .product(product)
                .bidder(buyer)
                .bidAmount(buyNowPrice)
                .bidTime(LocalDateTime.now())
                .build();
        bidRepository.save(bid);

        // 상품 상태 변경 → 즉시 낙찰
        product.setCurrentPrice(buyNowPrice);
        product.setTopBidder(buyer);
        product.setBidCount(product.getBidCount() + 1);
        product.setStatus(AuctionStatus.SOLD);

        // 거래 자동 생성
        Trade trade = Trade.builder()
                .product(product)
                .seller(product.getSeller())
                .buyer(buyer)
                .finalPrice(buyNowPrice)
                .build();
        tradeRepository.save(trade);

        // 알림
        notificationService.notifyAuctionWon(buyer, product.getId(),
                product.getTitle(), buyNowPrice);
        notificationService.notifyAuctionEnded(product.getSeller(), product.getId(),
                product.getTitle(), true);

        return BidDto.BidResponse.builder()
                .bidId(bid.getId())
                .productId(product.getId())
                .bidAmount(buyNowPrice)
                .currentPrice(buyNowPrice)
                .bidCount(product.getBidCount())
                .bidTime(bid.getBidTime().toString())
                .bidderNickname(buyer.getNickname())
                .build();
    }

    /**
     * 상품의 입찰 내역 조회
     */
    @Transactional(readOnly = true)
    public BidDto.BidHistoryResponse getBidHistory(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));

        List<Bid> bids = bidRepository.findByProductIdOrderByBidAmountDesc(productId);

        List<BidDto.BidItem> bidItems = bids.stream()
                .map(bid -> BidDto.BidItem.builder()
                        .bidId(bid.getId())
                        .bidAmount(bid.getBidAmount())
                        .bidTime(bid.getBidTime().toString())
                        .bidderNickname(maskNickname(bid.getBidder().getNickname()))
                        .isTopBid(product.getTopBidder() != null
                                && product.getTopBidder().getId().equals(bid.getBidder().getId())
                                && bid.getBidAmount().equals(product.getCurrentPrice()))
                        .build())
                .collect(Collectors.toList());

        return BidDto.BidHistoryResponse.builder()
                .productId(productId)
                .currentPrice(product.getCurrentPrice())
                .bidCount(product.getBidCount())
                .status(product.getStatus().name())
                .bids(bidItems)
                .build();
    }

    /**
     * 내 입찰 내역 (마이페이지용)
     */
    @Transactional(readOnly = true)
    public List<BidDto.MyBidItem> getMyBids(Long memberId) {
        List<Bid> bids = bidRepository.findByProductIdOrderByBidAmountDesc(memberId);

        // bidder 기준으로 다시 조회
        var page = bidRepository.findByBidderIdOrderByBidTimeDesc(memberId,
                org.springframework.data.domain.PageRequest.of(0, 50));

        return page.getContent().stream()
                .map(bid -> {
                    Product p = bid.getProduct();
                    String thumbnail = p.getImages().stream()
                            .filter(ProductImage::getIsThumbnail)
                            .findFirst()
                            .map(ProductImage::getImageUrl)
                            .orElse(null);

                    return BidDto.MyBidItem.builder()
                            .bidId(bid.getId())
                            .productId(p.getId())
                            .productTitle(p.getTitle())
                            .productThumbnail(thumbnail)
                            .productStatus(p.getStatus().name())
                            .bidAmount(bid.getBidAmount())
                            .currentPrice(p.getCurrentPrice())
                            .bidTime(bid.getBidTime().toString())
                            .isTopBidder(p.getTopBidder() != null
                                    && p.getTopBidder().getId().equals(memberId))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ============ Private Helpers ============

    /**
     * 입찰 검증 (모든 비즈니스 규칙)
     */
    private void validateBid(Product product, Member bidder, int bidAmount) {
        // 경매 진행중인지
        if (product.getStatus() != AuctionStatus.ACTIVE) {
            throw new IllegalArgumentException("경매가 종료된 상품입니다");
        }

        // 마감 시간 지났는지
        if (product.getEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("경매 마감 시간이 지났습니다");
        }

        // 본인 상품 입찰 금지
        if (product.getSeller().getId().equals(bidder.getId())) {
            throw new IllegalArgumentException("본인 상품에는 입찰할 수 없습니다");
        }

        // 현재 최고 입찰자가 다시 입찰하는 것 방지
        if (product.getTopBidder() != null
                && product.getTopBidder().getId().equals(bidder.getId())) {
            throw new IllegalArgumentException("이미 최고 입찰자입니다");
        }

        // 최소 입찰 단위 검증
        int minBidAmount = product.getCurrentPrice() + MIN_BID_INCREMENT;
        if (bidAmount < minBidAmount) {
            throw new IllegalArgumentException(
                    String.format("입찰 금액은 %,d원 이상이어야 합니다 (현재가 + %,d원)",
                            minBidAmount, MIN_BID_INCREMENT));
        }

        // 즉시구매가를 넘지 않는지 (넘으면 즉시구매 안내)
        if (product.getBuyNowPrice() != null && bidAmount >= product.getBuyNowPrice()) {
            throw new IllegalArgumentException(
                    String.format("입찰 금액이 즉시구매가(%,d원) 이상입니다. 즉시구매를 이용하세요",
                            product.getBuyNowPrice()));
        }
    }

    /**
     * 닉네임 마스킹 (개인정보 보호)
     * "테스트유저1" → "테스***"
     */
    private String maskNickname(String nickname) {
        if (nickname == null || nickname.length() <= 2) return "***";
        return nickname.substring(0, 2) + "***";
    }
}
