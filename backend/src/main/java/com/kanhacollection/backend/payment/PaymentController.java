package com.kanhacollection.backend.payment;

import com.kanhacollection.backend.auth.UserPrincipal;
import com.kanhacollection.backend.common.ApiResponse;
import com.kanhacollection.backend.payment.dto.PaymentResponse;
import com.kanhacollection.backend.payment.dto.PaymentVerificationRequest;
import com.kanhacollection.backend.payment.dto.RazorpayOrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Payment Gateway Module", description = "Razorpay order creation, signature verification, webhooks, and refund management")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/payments/create-razorpay-order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Initiate server-side Razorpay order for an existing pending order")
    public ResponseEntity<ApiResponse<RazorpayOrderResponse>> createRazorpayOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID orderId) {
        RazorpayOrderResponse response = paymentService.createRazorpayOrder(currentUser.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success("Razorpay payment order created", response));
    }

    @PostMapping("/payments/verify")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Verify Razorpay HMAC payment signature after customer payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPaymentSignature(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody PaymentVerificationRequest request) {
        PaymentResponse response = paymentService.verifyPaymentSignature(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
    }

    @PostMapping("/webhooks/razorpay")
    @Operation(summary = "Public asynchronous webhook listener for Razorpay payment events")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        paymentService.handleRazorpayWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/admin/payments/{paymentId}/refund")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Initiate full or partial refund for a transaction (Admin)")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
            @PathVariable UUID paymentId,
            @RequestParam(defaultValue = "Customer requested cancellation") String reason) {
        PaymentResponse response = paymentService.refundPayment(paymentId, reason);
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully", response));
    }
}
