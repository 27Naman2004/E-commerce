package com.kanhacollection.backend.shipping;

import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.order.Order;
import com.kanhacollection.backend.order.OrderRepository;
import com.kanhacollection.backend.order.OrderStatus;
import com.kanhacollection.backend.shipping.dto.ShipmentResponse;
import com.kanhacollection.backend.shipping.provider.ShippingProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;
    private final ShippingProvider shippingProvider;

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentForOrder(UUID orderId) {
        Shipment shipment = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", "orderId", orderId));
        return mapToShipmentResponse(shipment);
    }

    @Override
    @Transactional
    public ShipmentResponse dispatchOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        Shipment existing = shippingRepository.findByOrderId(orderId).orElse(null);
        if (existing != null) {
            return mapToShipmentResponse(existing);
        }

        Shipment shipment = shippingProvider.createShipment(order);
        Shipment saved = shippingRepository.save(shipment);

        order.setOrderStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        return mapToShipmentResponse(saved);
    }

    private ShipmentResponse mapToShipmentResponse(Shipment shipment) {
        return ShipmentResponse.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrder().getId())
                .carrier(shipment.getCarrier())
                .trackingNumber(shipment.getTrackingNumber())
                .awbCode(shipment.getAwbCode())
                .status(shipment.getStatus().name())
                .trackingUrl(shipment.getTrackingUrl())
                .createdAt(shipment.getCreatedAt())
                .build();
    }
}
