package com.kanhacollection.backend.wishlist;

import com.kanhacollection.backend.auth.UserPrincipal;
import com.kanhacollection.backend.common.ApiResponse;
import com.kanhacollection.backend.wishlist.dto.WishlistItemResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Wishlist Module", description = "Customer wishlist management APIs")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get user's saved wishlist items")
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> getWishlist(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<WishlistItemResponse> items = wishlistService.getUserWishlist(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Add a product to user's wishlist")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> addWishlistItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID productId) {
        WishlistItemResponse response = wishlistService.addProductToWishlist(currentUser.getId(), productId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product saved to wishlist", response));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove a product from user's wishlist")
    public ResponseEntity<ApiResponse<Void>> removeWishlistItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID productId) {
        wishlistService.removeProductFromWishlist(currentUser.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Product removed from wishlist", null));
    }
}
