package com.kanhacollection.backend.product.dto;

import com.kanhacollection.backend.category.dto.CategoryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private UUID id;
    private String title;
    private String slug;
    private String description;
    private CategoryResponse category;
    private boolean isActive;
    private List<ProductVariantResponse> variants;
    private List<ProductImageDto> images;
    private Instant createdAt;
}
