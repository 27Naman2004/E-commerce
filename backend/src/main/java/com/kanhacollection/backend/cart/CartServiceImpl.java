package com.kanhacollection.backend.cart;

import com.kanhacollection.backend.cart.dto.AddToCartRequest;
import com.kanhacollection.backend.cart.dto.CartItemResponse;
import com.kanhacollection.backend.cart.dto.CartResponse;
import com.kanhacollection.backend.cart.dto.UpdateCartItemRequest;
import com.kanhacollection.backend.exception.BadRequestException;
import com.kanhacollection.backend.exception.InsufficientStockException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.product.ProductVariant;
import com.kanhacollection.backend.product.ProductVariantRepository;
import com.kanhacollection.backend.user.User;
import com.kanhacollection.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartForUser(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(UUID userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getVariantId()));

        if (!variant.isActive() || !variant.getProduct().isActive()) {
            throw new BadRequestException("Selected product or variant is currently unavailable.");
        }

        int availableStock = variant.getInventory() != null ? variant.getInventory().getAvailableQuantity() : 0;

        CartItem existingItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId())
                .orElse(null);

        int newQuantity = request.getQuantity();
        if (existingItem != null) {
            newQuantity += existingItem.getQuantity();
        }

        if (newQuantity > availableStock) {
            throw new InsufficientStockException("Cannot add requested quantity. Only " + availableStock + " units available.");
        }

        if (existingItem != null) {
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItemQuantity(UUID userId, UUID cartItemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user's active cart.");
        }

        ProductVariant variant = cartItem.getVariant();
        int availableStock = variant.getInventory() != null ? variant.getInventory().getAvailableQuantity() : 0;

        if (request.getQuantity() > availableStock) {
            throw new InsufficientStockException("Requested quantity exceeds available stock (" + availableStock + ").");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(UUID userId, UUID cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user's active cart.");
        }

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
    }

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal subTotal = BigDecimal.ZERO;
        int totalItemCount = 0;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                ProductVariant variant = item.getVariant();
                int availableStock = variant.getInventory() != null ? variant.getInventory().getAvailableQuantity() : 0;
                boolean isAvailable = variant.isActive() && variant.getProduct().isActive() && availableStock >= item.getQuantity();

                BigDecimal unitPrice = variant.getPrice();
                BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

                if (isAvailable) {
                    subTotal = subTotal.add(itemTotal);
                    totalItemCount += item.getQuantity();
                }

                String primaryImg = variant.getProduct().getImages() != null && !variant.getProduct().getImages().isEmpty()
                        ? variant.getProduct().getImages().get(0).getUrl()
                        : null;

                itemResponses.add(CartItemResponse.builder()
                        .id(item.getId())
                        .variantId(variant.getId())
                        .productTitle(variant.getProduct().getTitle())
                        .productSlug(variant.getProduct().getSlug())
                        .sku(variant.getSku())
                        .size(variant.getSize())
                        .color(variant.getColor())
                        .imageUrl(primaryImg)
                        .unitPrice(unitPrice)
                        .quantity(item.getQuantity())
                        .totalPrice(itemTotal)
                        .availableStock(availableStock)
                        .isAvailable(isAvailable)
                        .build());
            }
        }

        BigDecimal shippingFee = subTotal.compareTo(BigDecimal.valueOf(999)) >= 0 || subTotal.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(99);

        BigDecimal estimatedTotal = subTotal.add(shippingFee);

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(itemResponses)
                .totalItemCount(totalItemCount)
                .subTotal(subTotal)
                .estimatedShippingFee(shippingFee)
                .estimatedTotal(estimatedTotal)
                .build();
    }
}
