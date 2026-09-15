package com.kanhacollection.backend.review;

import com.kanhacollection.backend.auth.UserPrincipal;
import com.kanhacollection.backend.common.ApiResponse;
import com.kanhacollection.backend.review.dto.CreateReviewRequest;
import com.kanhacollection.backend.review.dto.ProductReviewSummaryResponse;
import com.kanhacollection.backend.review.dto.ReviewResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Product Review Module", description = "Customer product reviews and average star rating aggregation")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/reviews/products/{productId}")
    @Operation(summary = "Get aggregated star ratings and paginated customer reviews for a product")
    public ResponseEntity<ApiResponse<ProductReviewSummaryResponse>> getReviewsForProduct(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ProductReviewSummaryResponse response = reviewService.getReviewsForProduct(productId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/reviews/products/{productId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit a rating review for a product")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID productId,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse response = reviewService.createReview(currentUser.getId(), productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", response));
    }
}
