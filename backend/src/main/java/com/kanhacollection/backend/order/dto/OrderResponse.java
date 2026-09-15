package com.kanhacollection.backend.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private UUID id;
    private String orderNumber;
    private UUID userId;
    private String customerEmail;
    private String customerName;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal netAmount;
    private String orderStatus;
    private String paymentStatus;
    private List<OrderItemResponse> items;
    private OrderAddressRequest shippingAddress;
    private String razorpayOrderId;
    private Instant createdAt;
}
