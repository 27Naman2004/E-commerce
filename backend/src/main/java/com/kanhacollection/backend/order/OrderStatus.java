package com.kanhacollection.backend.order;

public enum OrderStatus {
    PENDING_PAYMENT,
    PLACED,
    CONFIRMED,
    PROCESSING,
    PACKED,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    REFUND_PENDING,
    REFUNDED
}
