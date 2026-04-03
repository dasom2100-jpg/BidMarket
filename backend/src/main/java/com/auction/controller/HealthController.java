package com.auction.controller;

import com.auction.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        Map<String, String> data = Map.of(
                "status", "UP",
                "time", LocalDateTime.now().toString(),
                "service", "Auction Platform API"
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
