package com.kanhacollection.backend.review;

import com.kanhacollection.backend.review.dto.CreateReviewRequest;
import com.kanhacollection.backend.review.dto.ProductReviewSummaryResponse;
import com.kanhacollection.backend.review.dto.ReviewResponse;

import java.util.UUID;

public interface ReviewService {
    ProductReviewSummaryResponse getReviewsForProduct(UUID productId, int page, int size);
    ReviewResponse createReview(UUID userId, UUID productId, CreateReviewRequest request);
}
