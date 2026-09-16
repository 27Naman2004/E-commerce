package com.kanhacollection.backend.shipping.provider;

import com.kanhacollection.backend.order.Order;
import com.kanhacollection.backend.shipping.Shipment;
import com.kanhacollection.backend.shipping.ShipmentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ShiprocketShippingProvider implements ShippingProvider {

    private static final Logger log = LoggerFactory.getLogger(ShiprocketShippingProvider.class);

    @Override
    public Shipment createShipment(Order order) {
        String mockAwb = "SR-AWB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String mockTrackingUrl = "https://shiprocket.co/tracking/" + mockAwb;

        log.info("Shiprocket API: Created shipment AWB {} for order {}", mockAwb, order.getOrderNumber());

        return Shipment.builder()
                .order(order)
                .carrier("Shiprocket")
                .awbCode(mockAwb)
                .trackingNumber(mockAwb)
                .status(ShipmentStatus.DISPATCHED)
                .trackingUrl(mockTrackingUrl)
                .build();
    }

    @Override
    public Shipment trackShipment(String trackingNumber) {
        log.info("Shiprocket API: Polled tracking for AWB {}", trackingNumber);
        return Shipment.builder()
                .trackingNumber(trackingNumber)
                .status(ShipmentStatus.IN_TRANSIT)
                .trackingUrl("https://shiprocket.co/tracking/" + trackingNumber)
                .build();
    }

    @Override
    public boolean cancelShipment(String awbCode) {
        log.info("Shiprocket API: Cancelled shipment AWB {}", awbCode);
        return true;
    }
}
