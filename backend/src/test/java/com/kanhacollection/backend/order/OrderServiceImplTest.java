package com.kanhacollection.backend.order;

import com.kanhacollection.backend.cart.Cart;
import com.kanhacollection.backend.cart.CartItem;
import com.kanhacollection.backend.cart.CartItemRepository;
import com.kanhacollection.backend.cart.CartRepository;
import com.kanhacollection.backend.coupon.Coupon;
import com.kanhacollection.backend.coupon.CouponRepository;
import com.kanhacollection.backend.coupon.DiscountType;
import com.kanhacollection.backend.exception.BadRequestException;
import com.kanhacollection.backend.exception.InvalidOrderStateException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.inventory.InventoryService;
import com.kanhacollection.backend.order.dto.CreateOrderRequest;
import com.kanhacollection.backend.order.dto.OrderAddressRequest;
import com.kanhacollection.backend.order.dto.OrderResponse;
import com.kanhacollection.backend.order.dto.UpdateOrderStatusRequest;
import com.kanhacollection.backend.product.Product;
import com.kanhacollection.backend.product.ProductVariant;
import com.kanhacollection.backend.user.User;
import com.kanhacollection.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderServiceImpl Unit Tests")
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private CouponRepository couponRepository;
    @Mock private InventoryService inventoryService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User testUser;
    private UUID userId;
    private Product testProduct;
    private ProductVariant testVariant;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder()
                .id(userId)
                .email("test@kanha.com")
                .fullName("Test User")
                .phone("9876543210")
                .build();

        testProduct = Product.builder()
                .id(UUID.randomUUID())
                .title("Krishna Idol")
                .slug("krishna-idol")
                .isActive(true)
                .build();

        testVariant = ProductVariant.builder()
                .id(UUID.randomUUID())
                .product(testProduct)
                .sku("KI-GOLD-M")
                .size("Medium")
                .color("Gold")
                .price(BigDecimal.valueOf(1499))
                .isActive(true)
                .build();
    }

    private CreateOrderRequest buildCreateOrderRequest(String couponCode) {
        OrderAddressRequest addr = new OrderAddressRequest();
        addr.setRecipientName("Test User");
        addr.setPhone("9876543210");
        addr.setAddressLine1("123 Temple Road");
        addr.setCity("Mathura");
        addr.setState("Uttar Pradesh");
        addr.setPincode("281001");
        addr.setCountry("India");

        CreateOrderRequest request = new CreateOrderRequest();
        request.setShippingAddress(addr);
        request.setCouponCode(couponCode);
        return request;
    }

    private Cart buildCartWithItems(int quantity) {
        CartItem cartItem = CartItem.builder()
                .id(UUID.randomUUID())
                .variant(testVariant)
                .quantity(quantity)
                .build();

        Cart cart = Cart.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .items(new ArrayList<>(List.of(cartItem)))
                .build();
        cartItem.setCart(cart);
        return cart;
    }

    @Nested
    @DisplayName("createOrderFromCart()")
    class CreateOrderTests {

        @Test
        @DisplayName("Should successfully create order from cart with free shipping (above ₹999)")
        void shouldCreateOrderSuccessfully_WithFreeShipping() {
            Cart cart = buildCartWithItems(2);
            CreateOrderRequest request = buildCreateOrderRequest(null);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
            when(inventoryService.getAvailableQuantity(testVariant.getId())).thenReturn(10);
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order order = inv.getArgument(0);
                order.setId(UUID.randomUUID());
                return order;
            });

            OrderResponse response = orderService.createOrderFromCart(userId, request);

            assertThat(response).isNotNull();
            assertThat(response.getOrderNumber()).startsWith("KC-");
            // 1499 * 2 = 2998. Free shipping because > 999
            assertThat(response.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(2998));
            assertThat(response.getShippingFee()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(response.getNetAmount()).isEqualByComparingTo(BigDecimal.valueOf(2998));
            assertThat(response.getOrderStatus()).isEqualTo("PENDING_PAYMENT");
            assertThat(response.getPaymentStatus()).isEqualTo("PENDING");

            verify(inventoryService, times(1)).reserveStock(testVariant.getId(), 2);
            verify(cartItemRepository, times(1)).deleteByCartId(cart.getId());
        }

        @Test
        @DisplayName("Should throw BadRequestException when cart is empty")
        void shouldThrowException_WhenCartIsEmpty() {
            Cart emptyCart = Cart.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .items(new ArrayList<>())
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(emptyCart));

            CreateOrderRequest request = buildCreateOrderRequest(null);

            assertThatThrownBy(() -> orderService.createOrderFromCart(userId, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("empty");
        }

        @Test
        @DisplayName("Should throw BadRequestException when stock is insufficient")
        void shouldThrowException_WhenStockInsufficient() {
            Cart cart = buildCartWithItems(5);
            CreateOrderRequest request = buildCreateOrderRequest(null);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
            when(inventoryService.getAvailableQuantity(testVariant.getId())).thenReturn(2); // only 2 available

            assertThatThrownBy(() -> orderService.createOrderFromCart(userId, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Insufficient stock");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user does not exist")
        void shouldThrowException_WhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            CreateOrderRequest request = buildCreateOrderRequest(null);

            assertThatThrownBy(() -> orderService.createOrderFromCart(userId, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should apply coupon discount correctly to order")
        void shouldApplyCouponDiscountToOrder() {
            Cart cart = buildCartWithItems(2);
            CreateOrderRequest request = buildCreateOrderRequest("DIWALI20");

            Coupon coupon = Coupon.builder()
                    .code("DIWALI20")
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(BigDecimal.valueOf(10))
                    .minOrderValue(BigDecimal.ZERO)
                    .maxDiscountAmount(BigDecimal.valueOf(500))
                    .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                    .isActive(true)
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
            when(inventoryService.getAvailableQuantity(testVariant.getId())).thenReturn(50);
            when(couponRepository.findByCode("DIWALI20")).thenReturn(Optional.of(coupon));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order order = inv.getArgument(0);
                order.setId(UUID.randomUUID());
                return order;
            });

            OrderResponse response = orderService.createOrderFromCart(userId, request);

            // subtotal = 2998, 10% discount = 299.80, free shipping
            assertThat(response.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(2998));
            assertThat(response.getDiscountAmount()).isPositive();
            assertThat(response.getNetAmount()).isLessThan(response.getTotalAmount());
        }
    }

    @Nested
    @DisplayName("cancelOrder()")
    class CancelOrderTests {

        @Test
        @DisplayName("Should cancel order in PENDING_PAYMENT state and release stock")
        void shouldCancelPendingOrder() {
            UUID orderId = UUID.randomUUID();
            OrderItem orderItem = OrderItem.builder()
                    .variant(testVariant)
                    .quantity(2)
                    .build();

            Order order = Order.builder()
                    .id(orderId)
                    .orderNumber("KC-20260915-1234")
                    .user(testUser)
                    .orderStatus(OrderStatus.PENDING_PAYMENT)
                    .paymentStatus(PaymentStatus.PENDING)
                    .totalAmount(BigDecimal.valueOf(2998))
                    .discountAmount(BigDecimal.ZERO)
                    .shippingFee(BigDecimal.ZERO)
                    .netAmount(BigDecimal.valueOf(2998))
                    .items(new ArrayList<>(List.of(orderItem)))
                    .build();

            when(orderRepository.findByIdAndUserId(orderId, userId)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

            OrderResponse response = orderService.cancelOrder(userId, orderId);

            assertThat(response.getOrderStatus()).isEqualTo("CANCELLED");
            verify(inventoryService, times(1)).releaseStock(testVariant.getId(), 2);
        }

        @Test
        @DisplayName("Should throw InvalidOrderStateException when trying to cancel DELIVERED order")
        void shouldThrowException_WhenCancellingDeliveredOrder() {
            UUID orderId = UUID.randomUUID();
            Order order = Order.builder()
                    .id(orderId)
                    .orderNumber("KC-20260915-5678")
                    .user(testUser)
                    .orderStatus(OrderStatus.DELIVERED)
                    .build();

            when(orderRepository.findByIdAndUserId(orderId, userId)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.cancelOrder(userId, orderId))
                    .isInstanceOf(InvalidOrderStateException.class)
                    .hasMessageContaining("cannot be cancelled");
        }
    }

    @Nested
    @DisplayName("updateOrderStatusByAdmin()")
    class UpdateOrderStatusTests {

        @Test
        @DisplayName("Should successfully update order status by admin")
        void shouldUpdateOrderStatusSuccessfully() {
            UUID orderId = UUID.randomUUID();
            Order order = Order.builder()
                    .id(orderId)
                    .orderNumber("KC-20260915-9012")
                    .user(testUser)
                    .orderStatus(OrderStatus.CONFIRMED)
                    .paymentStatus(PaymentStatus.PAID)
                    .totalAmount(BigDecimal.valueOf(2998))
                    .discountAmount(BigDecimal.ZERO)
                    .shippingFee(BigDecimal.ZERO)
                    .netAmount(BigDecimal.valueOf(2998))
                    .items(new ArrayList<>())
                    .build();

            UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
            request.setOrderStatus(OrderStatus.SHIPPED);

            when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

            OrderResponse response = orderService.updateOrderStatusByAdmin(orderId, request);

            assertThat(response.getOrderStatus()).isEqualTo("SHIPPED");
        }

        @Test
        @DisplayName("Should throw InvalidOrderStateException when transitioning from CANCELLED state")
        void shouldThrowException_WhenTransitionFromCancelled() {
            UUID orderId = UUID.randomUUID();
            Order order = Order.builder()
                    .id(orderId)
                    .orderNumber("KC-20260915-3456")
                    .user(testUser)
                    .orderStatus(OrderStatus.CANCELLED)
                    .build();

            UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
            request.setOrderStatus(OrderStatus.CONFIRMED);

            when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.updateOrderStatusByAdmin(orderId, request))
                    .isInstanceOf(InvalidOrderStateException.class)
                    .hasMessageContaining("Cannot transition from final status");
        }
    }
}
