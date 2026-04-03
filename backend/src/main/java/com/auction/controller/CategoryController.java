package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.dto.CategoryDto;
import com.auction.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 전체 카테고리 트리 조회 (대분류 + 중분류)
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * 하위 카테고리 조회
     * GET /api/categories/{parentId}/children
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getSubCategories(
            @PathVariable Long parentId) {
        List<CategoryDto> children = categoryService.getSubCategories(parentId);
        return ResponseEntity.ok(ApiResponse.success(children));
    }
}
