package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.dto.ProductDto;
import com.auction.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * 상품 등록 (이미지 포함 multipart)
     * POST /api/products
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDto.Detail>> createProduct(
            Authentication authentication,
            @Valid @RequestPart("product") ProductDto.CreateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images)
            throws IOException {

        Long memberId = (Long) authentication.getPrincipal();
        ProductDto.Detail product = productService.createProduct(memberId, request, images);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("상품이 등록되었습니다", product));
    }

    /**
     * 상품 상세 조회
     * GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto.Detail>> getProduct(@PathVariable Long id) {
        ProductDto.Detail product = productService.getProduct(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    /**
     * 경매중 상품 목록 (페이징 + 정렬 + 카테고리 필터 + 검색)
     * GET /api/products?page=0&size=12&sort=latest&category=1&keyword=아이폰
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ProductDto.PageResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String keyword) {

        ProductDto.PageResponse response;

        if (keyword != null && !keyword.isBlank()) {
            response = productService.searchProducts(keyword.trim(), page, size, sort);
        } else if (category != null) {
            response = productService.getProductsByCategory(category, page, size, sort);
        } else {
            response = productService.getActiveProducts(page, size, sort);
        }

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 내 판매 상품 목록
     * GET /api/products/my
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<ProductDto.PageResponse>> getMyProducts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long memberId = (Long) authentication.getPrincipal();
        ProductDto.PageResponse response = productService.getMyProducts(memberId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 현재가 조회 (Polling용)
     * GET /api/products/{id}/price
     */
    @GetMapping("/{id}/price")
    public ResponseEntity<ApiResponse<ProductDto.ListItem>> getCurrentPrice(@PathVariable Long id) {
        ProductDto.ListItem price = productService.getCurrentPrice(id);
        return ResponseEntity.ok(ApiResponse.success(price));
    }

    /**
     * 상품 수정
     * PUT /api/products/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto.Detail>> updateProduct(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody ProductDto.UpdateRequest request) {

        Long memberId = (Long) authentication.getPrincipal();
        ProductDto.Detail product = productService.updateProduct(id, memberId, request);
        return ResponseEntity.ok(ApiResponse.success("상품이 수정되었습니다", product));
    }

    /**
     * 상품 삭제 (취소)
     * DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {

        Long memberId = (Long) authentication.getPrincipal();
        productService.deleteProduct(id, memberId);
        return ResponseEntity.ok(ApiResponse.success("상품이 삭제되었습니다"));
    }
}
