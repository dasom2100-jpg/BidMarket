package com.auction.repository;

import com.auction.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** 대분류 카테고리 조회 (parent가 null인 것) */
    List<Category> findByParentIsNullOrderBySortOrderAsc();

    /** 특정 부모의 하위 카테고리 조회 */
    List<Category> findByParentIdOrderBySortOrderAsc(Long parentId);
}
