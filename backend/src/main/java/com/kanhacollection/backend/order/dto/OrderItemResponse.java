package com.kanhacollection.backend.order.dto;

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
public class OrderItemResponse {

    private UUID id;
    private UUID variantId;
    private String productTitle;
    private String variantSku;
    private String size;
    private String color;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal totalPrice;
}
