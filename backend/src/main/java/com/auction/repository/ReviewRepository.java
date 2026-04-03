package com.auction.repository;

import com.auction.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTargetIdOrderByCreatedAtDesc(Long targetId);

    Optional<Review> findByTradeIdAndWriterId(Long tradeId, Long writerId);

    boolean existsByTradeIdAndWriterId(Long tradeId, Long writerId);
}
