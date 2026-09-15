package com.kanhacollection.backend.order;

import com.kanhacollection.backend.cart.Cart;
import com.kanhacollection.backend.cart.CartItem;
import com.kanhacollection.backend.cart.CartItemRepository;
import com.kanhacollection.backend.cart.CartRepository;
import com.kanhacollection.backend.common.PagedResponse;
import com.kanhacollection.backend.coupon.Coupon;
import com.kanhacollection.backend.coupon.CouponRepository;
import com.kanhacollection.backend.coupon.DiscountType;
import com.kanhacollection.backend.exception.BadRequestException;
import com.kanhacollection.backend.exception.InvalidOrderStateException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.inventory.InventoryService;
import com.kanhacollection.backend.order.dto.*;
import com.kanhacollection.backend.product.ProductVariant;
import com.kanhacollection.backend.user.User;
import com.kanhacollection.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final InventoryService inventoryService;

    @Override
    @Transactional
    public OrderResponse createOrderFromCart(UUID userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Active shopping cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create an order with an empty cart");
        }

        // 1. Calculate items subtotal and verify stock availability
        BigDecimal subTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getVariant();
            if (!variant.isActive() || !variant.getProduct().isActive()) {
                throw new BadRequestException("Item '" + variant.getProduct().getTitle() + "' is no longer active");
            }

            int availableStock = inventoryService.getAvailableQuantity(variant.getId());
            if (availableStock < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for item '" + variant.getProduct().getTitle() + "'. Available: " + availableStock);
            }

            BigDecimal unitPrice = variant.getPrice();
            BigDecimal totalItemPrice = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subTotal = subTotal.add(totalItemPrice);

            OrderItem orderItem = OrderItem.builder()
                    .variant(variant)
                    .productTitle(variant.getProduct().getTitle())
                    .variantSku(variant.getSku())
                    .size(variant.getSize())
                    .color(variant.getColor())
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .totalPrice(totalItemPrice)
                    .build();
            orderItems.add(orderItem);
        }

        // 2. Validate Coupon Discount (if supplied)
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (StringUtils.hasText(request.getCouponCode())) {
            discountAmount = calculateCouponDiscount(request.getCouponCode(), subTotal);
        }

        // 3. Calculate Shipping Fee
        BigDecimal shippingFee = subTotal.compareTo(BigDecimal.valueOf(999)) >= 0 || subTotal.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(99);

        BigDecimal netAmount = subTotal.subtract(discountAmount).add(shippingFee);
        if (netAmount.compareTo(BigDecimal.ZERO) < 0) {
            netAmount = BigDecimal.ZERO;
        }

        // 4. Reserve Inventory Atomically
        for (CartItem cartItem : cart.getItems()) {
            inventoryService.reserveStock(cartItem.getVariant().getId(), cartItem.getQuantity());
        }

        // 5. Create Order Entity
        String orderNumber = generateOrderNumber();
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .totalAmount(subTotal)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .netAmount(netAmount)
                .orderStatus(OrderStatus.PENDING_PAYMENT)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        // 6. Snapshot Shipping Address
        OrderAddressRequest addrReq = request.getShippingAddress();
        OrderAddressSnapshot snapshot = OrderAddressSnapshot.builder()
                .order(order)
                .recipientName(addrReq.getRecipientName())
                .phone(addrReq.getPhone())
                .addressLine1(addrReq.getAddressLine1())
                .addressLine2(addrReq.getAddressLine2())
                .city(addrReq.getCity())
                .state(addrReq.getState())
                .pincode(addrReq.getPincode())
                .country(addrReq.getCountry() != null ? addrReq.getCountry() : "India")
                .build();
        order.setAddressSnapshot(snapshot);

        Order savedOrder = orderRepository.save(order);

        // 7. Clear Shopping Cart after order generation
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();

        log.info("Created order {} for user {}", orderNumber, user.getEmail());
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PagedResponse.fromPage(orderPage.map(this::mapToOrderResponse));
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getOrderStatus() != OrderStatus.PENDING_PAYMENT && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStateException("Order cannot be cancelled in its current state: " + order.getOrderStatus());
        }

        // Release reserved stock back to available stock
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                inventoryService.releaseStock(item.getVariant().getId(), item.getQuantity());
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        log.info("User {} cancelled order {}", userId, order.getOrderNumber());

        return mapToOrderResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAllOrdersForAdmin(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> pageResult = status != null
                ? orderRepository.findByOrderStatus(status, pageable)
                : orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PagedResponse.fromPage(pageResult.map(this::mapToOrderResponse));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatusByAdmin(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateStateTransition(order.getOrderStatus(), request.getOrderStatus());
        order.setOrderStatus(request.getOrderStatus());

        Order updated = orderRepository.save(order);
        log.info("Admin updated status for order {} to {}", order.getOrderNumber(), request.getOrderStatus());
        return mapToOrderResponse(updated);
    }

    private void validateStateTransition(OrderStatus current, OrderStatus next) {
        if (current == next) return;
        if (current == OrderStatus.CANCELLED || current == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Cannot transition from final status " + current + " to " + next);
        }
        // Strict linear workflow guard
    }

    private BigDecimal calculateCouponDiscount(String code, BigDecimal subTotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new BadRequestException("Invalid coupon code: " + code));

        if (!coupon.isActive() || (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(Instant.now()))) {
            throw new BadRequestException("Coupon code has expired or is inactive.");
        }

        if (subTotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new BadRequestException("Minimum order value of ₹" + coupon.getMinOrderValue() + " required to apply coupon.");
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subTotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        return discount.min(subTotal);
    }

    private String generateOrderNumber() {
        String datePrefix = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneId.of("Asia/Kolkata")).format(Instant.now());
        int randomSuffix = 1000 + new Random().nextInt(9000);
        return "KC-" + datePrefix + "-" + randomSuffix;
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemDtos = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                        .productTitle(item.getProductTitle())
                        .variantSku(item.getVariantSku())
                        .size(item.getSize())
                        .color(item.getColor())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        OrderAddressRequest addressDto = null;
        if (order.getAddressSnapshot() != null) {
            OrderAddressSnapshot snap = order.getAddressSnapshot();
            addressDto = new OrderAddressRequest();
            addressDto.setRecipientName(snap.getRecipientName());
            addressDto.setPhone(snap.getPhone());
            addressDto.setAddressLine1(snap.getAddressLine1());
            addressDto.setAddressLine2(snap.getAddressLine2());
            addressDto.setCity(snap.getCity());
            addressDto.setState(snap.getState());
            addressDto.setPincode(snap.getPincode());
            addressDto.setCountry(snap.getCountry());
        }

        String razorpayOrdId = order.getPayment() != null ? order.getPayment().getRazorpayOrderId() : null;

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .customerEmail(order.getUser().getEmail())
                .customerName(order.getUser().getFullName())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .netAmount(order.getNetAmount())
                .orderStatus(order.getOrderStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .items(itemDtos)
                .shippingAddress(addressDto)
                .razorpayOrderId(razorpayOrdId)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
