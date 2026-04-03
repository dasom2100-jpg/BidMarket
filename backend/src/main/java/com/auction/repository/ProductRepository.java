package com.auction.repository;

import com.auction.entity.Product;
import com.auction.entity.Product.AuctionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /** 입찰 시 비관적 잠금으로 상품 조회 (MariaDB 호환 native query) */
    @Query(value = "SELECT * FROM product WHERE product_id = :id FOR UPDATE", nativeQuery = true)
    Optional<Product> findByIdWithLock(@Param("id") Long id);

    /** 경매 마감 대상 조회 (스케줄러용) */
    List<Product> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime time);

    /** 상태별 상품 목록 (페이징) */
    Page<Product> findByStatus(AuctionStatus status, Pageable pageable);

    /** 카테고리별 경매중 상품 (정확히 해당 카테고리) */
    Page<Product> findByStatusAndCategoryId(AuctionStatus status, Long categoryId, Pageable pageable);

    /** 대분류 클릭 시 → 해당 카테고리 + 하위 카테고리 상품 모두 조회 */
    @Query("SELECT p FROM Product p WHERE p.status = :status " +
           "AND (p.category.id = :categoryId OR p.category.parent.id = :categoryId)")
    Page<Product> findByStatusAndCategoryOrParent(@Param("status") AuctionStatus status,
                                                   @Param("categoryId") Long categoryId,
                                                   Pageable pageable);

    /** 판매자의 상품 목록 */
    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    /** 제목 검색 */
    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.title LIKE %:keyword%")
    Page<Product> searchByTitle(@Param("status") AuctionStatus status,
                                @Param("keyword") String keyword,
                                Pageable pageable);
}
