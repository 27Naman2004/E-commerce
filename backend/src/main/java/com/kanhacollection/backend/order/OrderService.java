package com.kanhacollection.backend.order;

import com.kanhacollection.backend.common.PagedResponse;
import com.kanhacollection.backend.order.dto.CreateOrderRequest;
import com.kanhacollection.backend.order.dto.OrderResponse;
import com.kanhacollection.backend.order.dto.UpdateOrderStatusRequest;

import java.util.UUID;

public interface OrderService {
    OrderResponse createOrderFromCart(UUID userId, CreateOrderRequest request);
    OrderResponse getOrderById(UUID userId, UUID orderId);
    PagedResponse<OrderResponse> getUserOrders(UUID userId, int page, int size);
    OrderResponse cancelOrder(UUID userId, UUID orderId);

    // Admin Operations
    PagedResponse<OrderResponse> getAllOrdersForAdmin(OrderStatus status, int page, int size);
    OrderResponse updateOrderStatusByAdmin(UUID orderId, UpdateOrderStatusRequest request);
}
