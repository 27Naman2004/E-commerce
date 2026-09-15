package com.kanhacollection.backend.payment;

import com.kanhacollection.backend.exception.BadRequestException;
import com.kanhacollection.backend.exception.PaymentVerificationException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.inventory.InventoryService;
import com.kanhacollection.backend.order.*;
import com.kanhacollection.backend.payment.dto.PaymentResponse;
import com.kanhacollection.backend.payment.dto.PaymentVerificationRequest;
import com.kanhacollection.backend.payment.dto.RazorpayOrderResponse;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private static final String WEBHOOK_EVENT_PREFIX = "payment:webhook:event:";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final StringRedisTemplate redisTemplate;

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getOrderStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Order is not in PENDING_PAYMENT state");
        }

        // Check if Razorpay order already exists for this order (Idempotency)
        Payment existingPayment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (existingPayment != null) {
            return RazorpayOrderResponse.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .razorpayOrderId(existingPayment.getRazorpayOrderId())
                    .amount(order.getNetAmount())
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .customerName(order.getUser().getFullName())
                    .customerEmail(order.getUser().getEmail())
                    .customerPhone(order.getUser().getPhone())
                    .build();
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Amount in paise (1 INR = 100 Paise)
            long amountInPaise = order.getNetAmount().multiply(BigDecimal.valueOf(100)).longValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", order.getOrderNumber());

            JSONObject notes = new JSONObject();
            notes.put("orderId", order.getId().toString());
            notes.put("userId", userId.toString());
            orderRequest.put("notes", notes);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            Payment payment = Payment.builder()
                    .order(order)
            .razorpayOrderId(razorpayOrderId)
            .amount(order.getNetAmount())
            .currency("INR")
            .status(PaymentStatus.PENDING)
            .build();

            paymentRepository.save(payment);
            order.setPayment(payment);
            orderRepository.save(order);

            log.info("Created Razorpay Order {} for DB Order {}", razorpayOrderId, order.getOrderNumber());

            return RazorpayOrderResponse.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .razorpayOrderId(razorpayOrderId)
                    .amount(order.getNetAmount())
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .customerName(order.getUser().getFullName())
                    .customerEmail(order.getUser().getEmail())
                    .customerPhone(order.getUser().getPhone())
                    .build();

        } catch (RazorpayException ex) {
            log.error("Failed to create Razorpay Order for Order {}", order.getOrderNumber(), ex);
            throw new BadRequestException("Failed to initiate payment gateway order: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentResponse verifyPaymentSignature(UUID userId, PaymentVerificationRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "razorpayOrderId", request.getRazorpayOrderId()));

        Order order = payment.getOrder();
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to authenticated user");
        }

        if (payment.getStatus() == PaymentStatus.PAID) {
            log.info("Payment {} already verified as PAID", payment.getRazorpayOrderId());
            return mapToPaymentResponse(payment);
        }

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValidSignature = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
            if (!isValidSignature) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new PaymentVerificationException("Razorpay payment signature verification failed.");
            }

            // Update Payment Record
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.PAID);
            paymentRepository.save(payment);

            // Update Order Record & State Machine
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // Commit reserved stock into sold stock
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null) {
                    inventoryService.commitStock(item.getVariant().getId(), item.getQuantity());
                }
            }

            log.info("Successfully verified and marked order {} as PAID & CONFIRMED", order.getOrderNumber());
            return mapToPaymentResponse(payment);

        } catch (RazorpayException ex) {
            log.error("Error during Razorpay signature verification", ex);
            throw new PaymentVerificationException("Payment signature verification failed: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void handleRazorpayWebhook(String webhookPayload, String webhookSignature) {
        try {
            boolean isValidWebhook = Utils.verifyWebhookSignature(webhookPayload, webhookSignature, razorpayKeySecret);
            if (!isValidWebhook) {
                log.error("Invalid Razorpay webhook signature");
                throw new PaymentVerificationException("Invalid webhook signature");
            }

            JSONObject jsonObject = new JSONObject(webhookPayload);
            String eventId = jsonObject.optString("event_id");

            // Webhook Idempotency Check in Redis
            if (redisTemplate.hasKey(WEBHOOK_EVENT_PREFIX + eventId)) {
                log.info("Duplicate webhook event {} ignored", eventId);
                return;
            }
            redisTemplate.opsForValue().set(WEBHOOK_EVENT_PREFIX + eventId, "PROCESSED", Duration.ofDays(7));

            String eventType = jsonObject.getString("event");
            JSONObject payload = jsonObject.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String razorpayOrderId = payload.getString("order_id");
            String razorpayPaymentId = payload.getString("id");

            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
            if (payment == null) {
                log.warn("Webhook received for unknown Razorpay order {}", razorpayOrderId);
                return;
            }

            if ("payment.captured".equals(eventType) && payment.getStatus() != PaymentStatus.PAID) {
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setStatus(PaymentStatus.PAID);
                paymentRepository.save(payment);

                Order order = payment.getOrder();
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setOrderStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);

                for (OrderItem item : order.getItems()) {
                    if (item.getVariant() != null) {
                        inventoryService.commitStock(item.getVariant().getId(), item.getQuantity());
                    }
                }
                log.info("Webhook asynchronously marked order {} as PAID", order.getOrderNumber());
            } else if ("payment.failed".equals(eventType)) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }

        } catch (RazorpayException ex) {
            log.error("Error processing Razorpay webhook", ex);
        }
    }

    @Override
    @Transactional
    public PaymentResponse refundPayment(UUID paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Only PAID transactions can be refunded.");
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject refundRequest = new JSONObject();
            refundRequest.put("payment_id", payment.getRazorpayPaymentId());
            refundRequest.put("notes", new JSONObject().put("reason", reason));

            razorpayClient.payments.refund(refundRequest);

            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            order.setOrderStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);

            log.info("Refund initiated for Payment {} on Order {}", payment.getRazorpayPaymentId(), order.getOrderNumber());
            return mapToPaymentResponse(payment);

        } catch (RazorpayException ex) {
            log.error("Failed to process Razorpay refund", ex);
            throw new BadRequestException("Refund failure: " + ex.getMessage());
        }
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .paymentMethod(payment.getPaymentMethod())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
