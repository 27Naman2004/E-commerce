package com.kanhacollection.backend.product;

import com.kanhacollection.backend.common.ApiResponse;
import com.kanhacollection.backend.common.PagedResponse;
import com.kanhacollection.backend.product.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Product Catalog Module", description = "Public product browsing, search, filtering, and Admin product management")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/products")
    @Operation(summary = "Search and filter products with pagination and multi-attribute criteria")
    public ResponseEntity<ApiResponse<PagedResponse<ProductSummaryResponse>>> searchAndFilterProducts(
            @ModelAttribute ProductFilterRequest filterRequest) {
        PagedResponse<ProductSummaryResponse> response = productService.searchAndFilterProducts(filterRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/products/{slug}")
    @Operation(summary = "Get detailed product specifications by slug")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        ProductResponse response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/products/id/{id}")
    @Operation(summary = "Get detailed product specifications by UUID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/admin/products")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create a new product with variants (Admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", response));
    }

    @PutMapping("/admin/products/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update product details (Admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @PostMapping("/admin/products/{id}/variants")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Add a new variant to existing product (Admin)")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> addVariant(
            @PathVariable UUID id,
            @Valid @RequestBody CreateVariantRequest request) {
        ProductVariantResponse response = productService.addVariantToProduct(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Variant added successfully", response));
    }

    @PatchMapping("/admin/products/variants/{variantId}/stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update variant stock quantity (Admin)")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateStock(
            @PathVariable UUID variantId,
            @RequestParam int stockQuantity) {
        ProductVariantResponse response = productService.updateVariantStock(variantId, stockQuantity);
        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully", response));
    }

    @DeleteMapping("/admin/products/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Soft-delete a product (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully", null));
    }
}
