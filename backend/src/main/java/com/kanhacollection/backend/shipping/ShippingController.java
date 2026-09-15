package com.kanhacollection.backend.shipping;

import com.kanhacollection.backend.common.ApiResponse;
import com.kanhacollection.backend.shipping.dto.ShipmentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Shipping & Logistics Module", description = "Shipment dispatch label creation and AWB live tracking endpoints")
public class ShippingController {

    private final ShippingService shippingService;

    @GetMapping("/shipping/track/{orderId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get shipment tracking status for an order")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getShipmentForOrder(@PathVariable UUID orderId) {
        ShipmentResponse response = shippingService.getShipmentForOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/admin/shipping/dispatch/{orderId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Dispatch order and generate carrier AWB tracking label (Admin)")
    public ResponseEntity<ApiResponse<ShipmentResponse>> dispatchOrder(@PathVariable UUID orderId) {
        ShipmentResponse response = shippingService.dispatchOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order dispatched and shipment label generated", response));
    }
}
