package com.kanhacollection.backend.coupon;

import com.kanhacollection.backend.coupon.dto.CouponResponse;
import com.kanhacollection.backend.coupon.dto.CouponValidationResponse;
import com.kanhacollection.backend.coupon.dto.CreateCouponRequest;
import com.kanhacollection.backend.coupon.dto.ValidateCouponRequest;

import java.util.List;
import java.util.UUID;

public interface CouponService {
    CouponValidationResponse validateCoupon(UUID userId, ValidateCouponRequest request);
    CouponResponse createCoupon(CreateCouponRequest request);
    List<CouponResponse> getAllCoupons();
    void deleteCoupon(UUID couponId);
}
