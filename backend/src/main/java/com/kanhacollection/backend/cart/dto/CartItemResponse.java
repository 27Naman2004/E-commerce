package com.kanhacollection.backend.cart.dto;

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
public class CartItemResponse {

    private UUID id;
    private UUID variantId;
    private String productTitle;
    private String productSlug;
    private String sku;
    private String size;
    private String color;
    private String imageUrl;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal totalPrice;
    private int availableStock;
    private boolean isAvailable;
}
