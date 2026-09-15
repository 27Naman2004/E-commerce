package com.kanhacollection.backend.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {

    private UUID id;
    private String sku;
    private String size;
    private String color;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private boolean isActive;
    private int availableQuantity;
}
