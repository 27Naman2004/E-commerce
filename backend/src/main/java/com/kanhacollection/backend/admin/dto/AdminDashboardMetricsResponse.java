package com.kanhacollection.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardMetricsResponse {

    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private long totalOrders;
    private long pendingOrders;
    private long deliveredOrders;
    private long totalCustomers;
    private long totalProducts;
    private long lowStockProducts;
    private double paymentSuccessRatePercentage;
}
