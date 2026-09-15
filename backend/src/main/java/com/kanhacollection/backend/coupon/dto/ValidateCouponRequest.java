package com.kanhacollection.backend.coupon.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ValidateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Cart subtotal is required")
    @DecimalMin(value = "0.00", message = "Cart subtotal cannot be negative")
    private BigDecimal cartSubtotal;
}
