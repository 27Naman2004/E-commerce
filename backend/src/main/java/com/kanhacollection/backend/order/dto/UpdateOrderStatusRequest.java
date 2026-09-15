package com.kanhacollection.backend.order.dto;

import com.kanhacollection.backend.order.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus orderStatus;

    private String trackingNumber;
    private String awbCode;
}
