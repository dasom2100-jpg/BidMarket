package com.auction.repository;

import com.auction.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTargetIdOrderByCreatedAtDesc(Long targetId);

    Optional<Review> findByTradeIdAndWriterId(Long tradeId, Long writerId);

    boolean existsByTradeIdAndWriterId(Long tradeId, Long writerId);

    /** DB에서 직접 평균 평점 계산 (엔티티 로드 없이) */
    @Query("SELECT AVG(r.rating) FROM Review r")
    Double findAverageRating();

    /** DB에서 직접 리뷰 수 카운트 */
    @Query("SELECT COUNT(r) FROM Review r")
    long countAllReviews();
}
