package com.auction.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CategoryDto {
    private Long id;
    private String name;
    private Long parentId;
    private Integer depth;
    private List<CategoryDto> children;
}
