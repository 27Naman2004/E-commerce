package com.kanhacollection.backend.shipping.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {

    private UUID id;
    private UUID orderId;
    private String carrier;
    private String trackingNumber;
    private String awbCode;
    private String status;
    private String trackingUrl;
    private Instant createdAt;
}
