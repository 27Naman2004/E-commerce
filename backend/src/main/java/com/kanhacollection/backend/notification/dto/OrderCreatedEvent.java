package com.kanhacollection.backend.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEvent implements Serializable {

    private UUID orderId;
    private String orderNumber;
    private UUID userId;
    private String customerEmail;
    private String customerName;
    private BigDecimal netAmount;
}
