package com.auction.repository;

import com.auction.entity.Bid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {

    /** 상품의 입찰 내역 (최신순) */
    List<Bid> findByProductIdOrderByBidAmountDesc(Long productId);

    /** 내가 입찰한 내역 */
    Page<Bid> findByBidderIdOrderByBidTimeDesc(Long bidderId, Pageable pageable);

    /** 상품별 입찰 수 */
    long countByProductId(Long productId);
}
