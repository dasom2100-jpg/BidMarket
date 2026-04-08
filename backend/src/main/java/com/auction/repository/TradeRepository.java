package com.auction.repository;

import com.auction.entity.Trade;
import com.auction.entity.Trade.TradeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    Optional<Trade> findByProductId(Long productId);

    Page<Trade> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);

    Page<Trade> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    long countByStatus(TradeStatus status);
}
