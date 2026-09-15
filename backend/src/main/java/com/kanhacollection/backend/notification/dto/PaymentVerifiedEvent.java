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
public class PaymentVerifiedEvent implements Serializable {

    private UUID paymentId;
    private UUID orderId;
    private String orderNumber;
    private String razorpayPaymentId;
    private BigDecimal amount;
    private String customerEmail;
}
