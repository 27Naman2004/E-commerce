package com.kanhacollection.backend.order;

public enum PaymentStatus {
    PENDING,
    AUTHORIZED,
    PAID,
    FAILED,
    REFUND_PENDING,
    PARTIALLY_REFUNDED,
    REFUNDED
}
