package com.kanhacollection.backend.review;

import com.kanhacollection.backend.common.PagedResponse;
import com.kanhacollection.backend.exception.DuplicateResourceException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.product.Product;
import com.kanhacollection.backend.product.ProductRepository;
import com.kanhacollection.backend.review.dto.CreateReviewRequest;
import com.kanhacollection.backend.review.dto.ProductReviewSummaryResponse;
import com.kanhacollection.backend.review.dto.ReviewResponse;
import com.kanhacollection.backend.user.User;
import com.kanhacollection.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public ProductReviewSummaryResponse getReviewsForProduct(UUID productId, int page, int size) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByProductIdAndIsApprovedTrueOrderByCreatedAtDesc(productId, pageable);

        Double avgRating = reviewRepository.getAverageRatingForProduct(productId);
        long totalCount = reviewRepository.countApprovedReviewsForProduct(productId);

        PagedResponse<ReviewResponse> pagedReviews = PagedResponse.fromPage(reviewPage.map(this::mapToReviewResponse));

        return ProductReviewSummaryResponse.builder()
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .totalReviews(totalCount)
                .reviews(pagedReviews)
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse createReview(UUID userId, UUID productId, CreateReviewRequest request) {
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new DuplicateResourceException("You have already submitted a review for this product.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .isApproved(true)
                .build();

        Review saved = reviewRepository.save(review);
        return mapToReviewResponse(saved);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .reviewerName(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
