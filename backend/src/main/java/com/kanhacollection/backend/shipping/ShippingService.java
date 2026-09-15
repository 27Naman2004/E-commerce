package com.kanhacollection.backend.shipping;

import com.kanhacollection.backend.shipping.dto.ShipmentResponse;

import java.util.UUID;

public interface ShippingService {
    ShipmentResponse getShipmentForOrder(UUID orderId);
    ShipmentResponse dispatchOrder(UUID orderId);
}
