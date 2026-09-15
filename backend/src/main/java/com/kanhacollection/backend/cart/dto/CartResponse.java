package com.kanhacollection.backend.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private UUID cartId;
    private List<CartItemResponse> items;
    private int totalItemCount;
    private BigDecimal subTotal;
    private BigDecimal estimatedShippingFee;
    private BigDecimal estimatedTotal;
}
