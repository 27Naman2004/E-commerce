package com.kanhacollection.backend.admin;

import com.kanhacollection.backend.admin.dto.AdminDashboardMetricsResponse;
import com.kanhacollection.backend.audit.AuditLog;
import com.kanhacollection.backend.audit.AuditLogRepository;
import com.kanhacollection.backend.common.PagedResponse;
import com.kanhacollection.backend.inventory.InventoryRepository;
import com.kanhacollection.backend.order.Order;
import com.kanhacollection.backend.order.OrderRepository;
import com.kanhacollection.backend.order.OrderStatus;
import com.kanhacollection.backend.order.PaymentStatus;
import com.kanhacollection.backend.payment.PaymentRepository;
import com.kanhacollection.backend.product.ProductRepository;
import com.kanhacollection.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryRepository inventoryRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardMetricsResponse getDashboardMetrics() {
        List<Order> allOrders = orderRepository.findAll();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .map(Order::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Instant startOfToday = Instant.now().truncatedTo(ChronoUnit.DAYS);
        BigDecimal todayRevenue = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID && o.getCreatedAt().isAfter(startOfToday))
                .map(Order::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allOrders.size();
        long pendingOrders = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.PENDING_PAYMENT || o.getOrderStatus() == OrderStatus.CONFIRMED).count();
        long deliveredOrders = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED).count();

        long totalCustomers = userRepository.count();
        long totalProducts = productRepository.count();

        long lowStockProducts = inventoryRepository.findAll().stream()
                .filter(i -> i.getAvailableQuantity() <= 5)
                .count();

        long totalPayments = paymentRepository.count();
        long paidPayments = allOrders.stream().filter(o -> o.getPaymentStatus() == PaymentStatus.PAID).count();
        double successRate = totalPayments > 0 ? ((double) paidPayments / totalPayments) * 100.0 : 100.0;

        return AdminDashboardMetricsResponse.builder()
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .lowStockProducts(lowStockProducts)
                .paymentSuccessRatePercentage(Math.round(successRate * 10.0) / 10.0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AuditLog> getAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> auditPage = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PagedResponse.fromPage(auditPage);
    }
}
