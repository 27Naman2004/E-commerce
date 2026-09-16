package com.kanhacollection.backend.coupon;

import com.kanhacollection.backend.coupon.dto.CouponResponse;
import com.kanhacollection.backend.coupon.dto.CouponValidationResponse;
import com.kanhacollection.backend.coupon.dto.CreateCouponRequest;
import com.kanhacollection.backend.coupon.dto.ValidateCouponRequest;
import com.kanhacollection.backend.exception.DuplicateResourceException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(UUID userId, ValidateCouponRequest request) {
        String code = request.getCode().toUpperCase();
        Coupon coupon = couponRepository.findByCode(code).orElse(null);

        if (coupon == null || !coupon.isActive()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalSubtotal(request.getCartSubtotal())
                    .message("Invalid or expired coupon code")
                    .build();
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(Instant.now())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalSubtotal(request.getCartSubtotal())
                    .message("Coupon has expired")
                    .build();
        }

        if (request.getCartSubtotal().compareTo(coupon.getMinOrderValue()) < 0) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalSubtotal(request.getCartSubtotal())
                    .message("Minimum cart value of ₹" + coupon.getMinOrderValue() + " required to use this coupon.")
                    .build();
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = request.getCartSubtotal().multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        discount = discount.min(request.getCartSubtotal());
        BigDecimal finalSubtotal = request.getCartSubtotal().subtract(discount);

        return CouponValidationResponse.builder()
                .valid(true)
                .code(code)
                .discountAmount(discount)
                .finalSubtotal(finalSubtotal)
                .message("Coupon applied successfully!")
                .build();
    }

    @Override
    @Transactional
    public CouponResponse createCoupon(CreateCouponRequest request) {
        String code = request.getCode().toUpperCase();
        if (couponRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Coupon code '" + code + "' already exists.");
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .perUserLimit(request.getPerUserLimit() != null ? request.getPerUserLimit() : 1)
                .currentUsage(0)
                .expiresAt(request.getExpiresAt())
                .isActive(true)
                .build();

        Coupon saved = couponRepository.save(coupon);
        return mapToCouponResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToCouponResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCoupon(UUID couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    private CouponResponse mapToCouponResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .usageLimit(coupon.getUsageLimit())
                .perUserLimit(coupon.getPerUserLimit())
                .currentUsage(coupon.getCurrentUsage())
                .expiresAt(coupon.getExpiresAt())
                .isActive(coupon.isActive())
                .build();
    }
}
