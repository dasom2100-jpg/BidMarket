package com.auction.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private Member seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({"children", "parent", "hibernateLazyInitializer", "handler"})
    private Category category;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_condition", nullable = false)
    @Builder.Default
    private ItemCondition itemCondition = ItemCondition.GOOD;

    @Column(name = "start_price", nullable = false)
    private Integer startPrice;

    @Column(name = "current_price", nullable = false)
    private Integer currentPrice;

    @Column(name = "buy_now_price")
    private Integer buyNowPrice;

    @Column(name = "bid_count", nullable = false)
    @Builder.Default
    private Integer bidCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "top_bidder_id")
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private Member topBidder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuctionStatus status = AuctionStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false)
    @Builder.Default
    private DeliveryType deliveryType = DeliveryType.PARCEL;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("imageOrder ASC")
    @Builder.Default
    @JsonIgnoreProperties({"product", "hibernateLazyInitializer", "handler"})
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // === Enum 정의 ===

    public enum ItemCondition {
        BEST, GOOD, FAIR
    }

    public enum AuctionStatus {
        ACTIVE, SOLD, FAILED, TRADING, COMPLETED, CANCELLED
    }

    public enum DeliveryType {
        PARCEL, DIRECT, BOTH
    }

    // === 편의 메서드 ===

    public void addImage(ProductImage image) {
        this.images.add(image);
        image.setProduct(this);
    }

    public boolean isAuctionActive() {
        return this.status == AuctionStatus.ACTIVE
                && this.endTime.isAfter(LocalDateTime.now());
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
