package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.entity.Product.AuctionStatus;
import com.auction.entity.Trade.TradeStatus;
import com.auction.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final TradeRepository tradeRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        Map<String, String> data = Map.of(
                "status", "UP",
                "time", LocalDateTime.now().toString(),
                "service", "Auction Platform API"
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * 메인화면 공개 통계 (로그인 불필요)
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        // 등록된 상품 수
        long totalProducts = productRepository.count();
        stats.put("totalProducts", totalProducts);

        // 회원 수
        long totalMembers = memberRepository.count();
        stats.put("totalMembers", totalMembers);

        // 진행중 경매 수
        long activeAuctions = productRepository.findByStatus(AuctionStatus.ACTIVE,
                PageRequest.of(0, 1)).getTotalElements();
        stats.put("activeAuctions", activeAuctions);

        // 완료된 거래 수
        long completedTrades = tradeRepository.countByStatus(TradeStatus.COMPLETED);
        stats.put("completedTrades", completedTrades);

        // 평균 평점 (DB에서 직접 계산 — 엔티티 로드 없이)
        long totalReviews = reviewRepository.countAllReviews();
        Double avgRating = reviewRepository.findAverageRating();
        double rating = (avgRating != null) ? avgRating : 0.0;
        int satisfactionPercent = totalReviews > 0 ? (int) Math.round(rating / 5.0 * 100) : 0;

        stats.put("avgRating", Math.round(rating * 10) / 10.0);
        stats.put("satisfactionPercent", satisfactionPercent);
        stats.put("totalReviews", totalReviews);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
