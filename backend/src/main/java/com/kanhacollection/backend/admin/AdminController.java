package com.kanhacollection.backend.admin;

import com.kanhacollection.backend.admin.dto.AdminDashboardMetricsResponse;
import com.kanhacollection.backend.audit.AuditLog;
import com.kanhacollection.backend.common.ApiResponse;
import com.kanhacollection.backend.common.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Analytics & Operations Module", description = "Executive business metrics, sales analytics, low-stock tracking, and security audit logs")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard/metrics")
    @Operation(summary = "Get executive revenue, order status counts, and inventory alert metrics (Admin)")
    public ResponseEntity<ApiResponse<AdminDashboardMetricsResponse>> getDashboardMetrics() {
        AdminDashboardMetricsResponse metrics = adminService.getDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get security and administrative change audit logs (Admin)")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<AuditLog> logs = adminService.getAuditLogs(page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
