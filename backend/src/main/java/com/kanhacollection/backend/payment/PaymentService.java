package com.kanhacollection.backend.payment;

import com.kanhacollection.backend.payment.dto.PaymentResponse;
import com.kanhacollection.backend.payment.dto.PaymentVerificationRequest;
import com.kanhacollection.backend.payment.dto.RazorpayOrderResponse;

import java.util.UUID;

public interface PaymentService {
    RazorpayOrderResponse createRazorpayOrder(UUID userId, UUID orderId);
    PaymentResponse verifyPaymentSignature(UUID userId, PaymentVerificationRequest request);
    void handleRazorpayWebhook(String webhookPayload, String webhookSignature);
    PaymentResponse refundPayment(UUID paymentId, String reason);
}
