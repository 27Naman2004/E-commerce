package com.kanhacollection.backend.cart;

import com.kanhacollection.backend.cart.dto.AddToCartRequest;
import com.kanhacollection.backend.cart.dto.CartResponse;
import com.kanhacollection.backend.cart.dto.UpdateCartItemRequest;

import java.util.UUID;

public interface CartService {
    CartResponse getCartForUser(UUID userId);
    CartResponse addItemToCart(UUID userId, AddToCartRequest request);
    CartResponse updateCartItemQuantity(UUID userId, UUID cartItemId, UpdateCartItemRequest request);
    CartResponse removeItemFromCart(UUID userId, UUID cartItemId);
    void clearCart(UUID userId);
}
