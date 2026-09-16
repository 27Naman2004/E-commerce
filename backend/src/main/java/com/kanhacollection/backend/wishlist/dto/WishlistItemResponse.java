package com.kanhacollection.backend.wishlist.dto;

import com.kanhacollection.backend.product.dto.ProductSummaryResponse;
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
public class WishlistItemResponse {

    private UUID wishlistId;
    private ProductSummaryResponse product;
    private Instant addedAt;
}
