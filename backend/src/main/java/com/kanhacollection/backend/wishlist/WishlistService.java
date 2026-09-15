package com.kanhacollection.backend.wishlist;

import com.kanhacollection.backend.wishlist.dto.WishlistItemResponse;

import java.util.List;
import java.util.UUID;

public interface WishlistService {
    List<WishlistItemResponse> getUserWishlist(UUID userId);
    WishlistItemResponse addProductToWishlist(UUID userId, UUID productId);
    void removeProductFromWishlist(UUID userId, UUID productId);
}
