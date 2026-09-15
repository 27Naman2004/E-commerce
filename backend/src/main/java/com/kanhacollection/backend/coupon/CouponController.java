package com.kanhacollection.backend.coupon;

import com.kanhacollection.backend.auth.UserPrincipal;
import com.kanhacollection.backend.common.ApiResponse;
import com.kanhacollection.backend.coupon.dto.CouponResponse;
import com.kanhacollection.backend.coupon.dto.CouponValidationResponse;
import com.kanhacollection.backend.coupon.dto.CreateCouponRequest;
import com.kanhacollection.backend.coupon.dto.ValidateCouponRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Coupon & Discount Module", description = "Coupon validation on checkout and Admin discount coupon management")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/coupons/validate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Validate promotional coupon code against active cart total")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ValidateCouponRequest request) {
        CouponValidationResponse response = couponService.validateCoupon(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/admin/coupons")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create a new discount coupon (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@Valid @RequestBody CreateCouponRequest request) {
        CouponResponse response = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", response));
    }

    @GetMapping("/admin/coupons")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get list of all coupons (Admin)")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        List<CouponResponse> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Deactivate a coupon (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deactivated successfully", null));
    }
}
