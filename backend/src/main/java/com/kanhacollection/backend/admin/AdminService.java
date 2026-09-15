package com.kanhacollection.backend.admin;

import com.kanhacollection.backend.admin.dto.AdminDashboardMetricsResponse;
import com.kanhacollection.backend.audit.AuditLog;
import com.kanhacollection.backend.common.PagedResponse;

public interface AdminService {
    AdminDashboardMetricsResponse getDashboardMetrics();
    PagedResponse<AuditLog> getAuditLogs(int page, int size);
}
