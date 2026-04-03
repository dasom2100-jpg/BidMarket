package com.auction.service;

import com.auction.dto.ReviewDto;
import com.auction.entity.*;
import com.auction.entity.Trade.TradeStatus;
import com.auction.repository.ReviewRepository;
import com.auction.repository.TradeRepository;
import com.auction.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TradeRepository tradeRepository;
    private final MemberRepository memberRepository;

    /**
     * 리뷰 작성
     */
    @Transactional
    public ReviewDto.ReviewItem createReview(Long writerId, ReviewDto.CreateRequest request) {
        Trade trade = tradeRepository.findById(request.getTradeId())
                .orElseThrow(() -> new IllegalArgumentException("거래를 찾을 수 없습니다"));

        // 거래 완료 상태인지 확인
        if (trade.getStatus() != TradeStatus.COMPLETED) {
            throw new IllegalArgumentException("거래가 완료된 후에만 리뷰를 작성할 수 있습니다");
        }

        // 거래 당사자인지 확인
        boolean isSeller = trade.getSeller().getId().equals(writerId);
        boolean isBuyer = trade.getBuyer().getId().equals(writerId);
        if (!isSeller && !isBuyer) {
            throw new SecurityException("거래 당사자만 리뷰를 작성할 수 있습니다");
        }

        // 이미 리뷰를 작성했는지 확인
        if (reviewRepository.existsByTradeIdAndWriterId(request.getTradeId(), writerId)) {
            throw new IllegalArgumentException("이미 이 거래에 대한 리뷰를 작성했습니다");
        }

        // 리뷰 대상 결정 (판매자가 쓰면 구매자에게, 구매자가 쓰면 판매자에게)
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다"));
        Member target = isSeller ? trade.getBuyer() : trade.getSeller();

        Review review = Review.builder()
                .trade(trade)
                .writer(writer)
                .target(target)
                .rating(request.getRating())
                .content(request.getContent())
                .build();

        reviewRepository.save(review);

        return toItem(review, trade.getProduct().getTitle());
    }

    /**
     * 특정 회원이 받은 리뷰 목록
     */
    public List<ReviewDto.ReviewItem> getReviewsForMember(Long memberId) {
        return reviewRepository.findByTargetIdOrderByCreatedAtDesc(memberId).stream()
                .map(r -> toItem(r, r.getTrade().getProduct().getTitle()))
                .collect(Collectors.toList());
    }

    /**
     * 거래에 대한 내 리뷰 확인
     */
    public boolean hasReviewed(Long tradeId, Long writerId) {
        return reviewRepository.existsByTradeIdAndWriterId(tradeId, writerId);
    }

    private ReviewDto.ReviewItem toItem(Review r, String productTitle) {
        return ReviewDto.ReviewItem.builder()
                .reviewId(r.getId())
                .tradeId(r.getTrade().getId())
                .writerNickname(r.getWriter().getNickname())
                .targetNickname(r.getTarget().getNickname())
                .rating(r.getRating())
                .content(r.getContent())
                .createdAt(r.getCreatedAt().toString())
                .productTitle(productTitle)
                .build();
    }
}
