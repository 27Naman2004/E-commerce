package com.kanhacollection.backend.wishlist;

import com.kanhacollection.backend.exception.DuplicateResourceException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.product.Product;
import com.kanhacollection.backend.product.ProductRepository;
import com.kanhacollection.backend.product.ProductVariant;
import com.kanhacollection.backend.product.dto.ProductSummaryResponse;
import com.kanhacollection.backend.user.User;
import com.kanhacollection.backend.user.UserRepository;
import com.kanhacollection.backend.wishlist.dto.WishlistItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getUserWishlist(UUID userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToWishlistResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WishlistItemResponse addProductToWishlist(UUID userId, UUID productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new DuplicateResourceException("Product is already present in your wishlist.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Wishlist item = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        Wishlist saved = wishlistRepository.save(item);
        return mapToWishlistResponse(saved);
    }

    @Override
    @Transactional
    public void removeProductFromWishlist(UUID userId, UUID productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new ResourceNotFoundException("Wishlist item", "productId", productId);
        }
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    private WishlistItemResponse mapToWishlistResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        List<ProductVariant> activeVariants = product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .collect(Collectors.toList());

        BigDecimal minPrice = activeVariants.stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal maxPrice = activeVariants.stream().map(ProductVariant::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        boolean inStock = activeVariants.stream().anyMatch(v -> v.getInventory() != null && v.getInventory().getAvailableQuantity() > 0);

        String primaryImg = product.getImages() != null && !product.getImages().isEmpty()
                ? product.getImages().get(0).getUrl()
                : null;

        ProductSummaryResponse productSummary = ProductSummaryResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .categoryName(product.getCategory().getName())
                .primaryImageUrl(primaryImg)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .inStock(inStock)
                .build();

        return WishlistItemResponse.builder()
                .wishlistId(wishlist.getId())
                .product(productSummary)
                .addedAt(wishlist.getCreatedAt())
                .build();
    }
}
