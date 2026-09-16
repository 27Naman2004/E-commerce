package com.kanhacollection.backend.shipping;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kanhacollection.backend.common.BaseEntity;
import com.kanhacollection.backend.order.Order;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "shipments")
public class Shipment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    @JsonIgnore
    private Order order;

    @Column(length = 100)
    @Builder.Default
    private String carrier = "Shiprocket";

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "awb_code", length = 100)
    private String awbCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.PENDING;

    @Column(name = "tracking_url", length = 500)
    private String trackingUrl;
}
