package com.kanhacollection.backend.review.dto;

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
public class ReviewResponse {

    private UUID id;
    private UUID productId;
    private String reviewerName;
    private int rating;
    private String comment;
    private Instant createdAt;
}
