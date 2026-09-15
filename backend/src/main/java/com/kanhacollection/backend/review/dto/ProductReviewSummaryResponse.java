package com.kanhacollection.backend.review.dto;

import com.kanhacollection.backend.common.PagedResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewSummaryResponse {

    private double averageRating;
    private long totalReviews;
    private PagedResponse<ReviewResponse> reviews;
}
