package com.kanhacollection.backend.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReviewRequest {

    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    private int rating;

    @NotBlank(message = "Review comment is required")
    private String comment;
}
