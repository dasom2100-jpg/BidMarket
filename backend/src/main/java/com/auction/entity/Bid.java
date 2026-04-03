package com.auction.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bid")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bid_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bidder_id", nullable = false)
    private Member bidder;

    @Column(name = "bid_amount", nullable = false)
    private Integer bidAmount;

    @Column(name = "bid_time", nullable = false)
    @Builder.Default
    private LocalDateTime bidTime = LocalDateTime.now();
}
