package com.auction.service;

import com.auction.dto.CategoryDto;
import com.auction.entity.Category;
import com.auction.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * 전체 카테고리 트리 조회 (대분류 + 하위 카테고리 포함)
     */
    public List<CategoryDto> getAllCategories() {
        List<Category> rootCategories = categoryRepository
                .findByParentIsNullOrderBySortOrderAsc();

        return rootCategories.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 특정 카테고리의 하위 목록 조회
     */
    public List<CategoryDto> getSubCategories(Long parentId) {
        List<Category> children = categoryRepository
                .findByParentIdOrderBySortOrderAsc(parentId);

        return children.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private CategoryDto toDto(Category category) {
        List<CategoryDto> children = category.getChildren().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .depth(category.getDepth())
                .children(children)
                .build();
    }
}
