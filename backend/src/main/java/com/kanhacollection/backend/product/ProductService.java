package com.kanhacollection.backend.product;

import com.kanhacollection.backend.common.PagedResponse;
import com.kanhacollection.backend.product.dto.*;

import java.util.UUID;

public interface ProductService {
    PagedResponse<ProductSummaryResponse> searchAndFilterProducts(ProductFilterRequest filterRequest);
    ProductResponse getProductBySlug(String slug);
    ProductResponse getProductById(UUID id);
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(UUID id, UpdateProductRequest request);
    ProductVariantResponse addVariantToProduct(UUID productId, CreateVariantRequest request);
    ProductVariantResponse updateVariantStock(UUID variantId, int newStockQuantity);
    void deleteProduct(UUID id);
}
