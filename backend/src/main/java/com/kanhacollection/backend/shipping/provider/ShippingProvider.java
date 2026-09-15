package com.kanhacollection.backend.shipping.provider;

import com.kanhacollection.backend.order.Order;
import com.kanhacollection.backend.shipping.Shipment;

public interface ShippingProvider {
    Shipment createShipment(Order order);
    Shipment trackShipment(String trackingNumber);
    boolean cancelShipment(String awbCode);
}
