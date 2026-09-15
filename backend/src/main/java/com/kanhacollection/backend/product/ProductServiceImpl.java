package com.kanhacollection.backend.product;

import com.kanhacollection.backend.category.CategoryRepository;
import com.kanhacollection.backend.category.dto.CategoryResponse;
import com.kanhacollection.backend.common.PagedResponse;
import com.kanhacollection.backend.exception.DuplicateResourceException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.inventory.Inventory;
import com.kanhacollection.backend.inventory.InventoryRepository;
import com.kanhacollection.backend.product.dto.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> searchAndFilterProducts(ProductFilterRequest filter) {
        Sort sort = Sort.by(
                "ASC".equalsIgnoreCase(filter.getSortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC,
                filter.getSortBy()
        );
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isActive"), true));

            if (StringUtils.hasText(filter.getQuery())) {
                String searchPattern = "%" + filter.getQuery().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
            }

            if (filter.getMinPrice() != null || filter.getMaxPrice() != null) {
                Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
                if (filter.getMinPrice() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(variantJoin.get("price"), filter.getMinPrice()));
                }
                if (filter.getMaxPrice() != null) {
                    predicates.add(cb.lessThanOrEqualTo(variantJoin.get("price"), filter.getMaxPrice()));
                }
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> page = productRepository.findAll(spec, pageable);
        Page<ProductSummaryResponse> summaryPage = page.map(this::mapToSummaryResponse);
        return PagedResponse.fromPage(summaryPage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "product_slug", key = "#slug")
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return mapToProductResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        String slug = generateSlug(request.getTitle());
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Product product = Product.builder()
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .category(category)
                .isActive(true)
                .build();

        Product savedProduct = productRepository.save(product);

        // Attach Variants and initialize Inventory for each variant
        for (CreateVariantRequest variantReq : request.getVariants()) {
            if (variantRepository.existsBySku(variantReq.getSku())) {
                throw new DuplicateResourceException("Variant SKU '" + variantReq.getSku() + "' already exists.");
            }

            ProductVariant variant = ProductVariant.builder()
                    .product(savedProduct)
                    .sku(variantReq.getSku())
                    .size(variantReq.getSize())
                    .color(variantReq.getColor())
                    .price(variantReq.getPrice())
                    .compareAtPrice(variantReq.getCompareAtPrice())
                    .isActive(true)
                    .build();

            ProductVariant savedVariant = variantRepository.save(variant);

            Inventory inventory = Inventory.builder()
                    .variant(savedVariant)
                    .availableQuantity(variantReq.getInitialStock())
                    .reservedQuantity(0)
                    .soldQuantity(0)
                    .build();
            inventoryRepository.save(inventory);

            savedProduct.getVariants().add(savedVariant);
        }

        // Attach Images
        if (request.getImages() != null) {
            for (ProductImageDto imgDto : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .product(savedProduct)
                        .publicId(imgDto.getPublicId())
                        .url(imgDto.getUrl())
                        .sortOrder(imgDto.getSortOrder())
                        .build();
                savedProduct.getImages().add(image);
            }
            productRepository.save(savedProduct);
        }

        return mapToProductResponse(savedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = "product_slug", key = "#result.slug")
    public ProductResponse updateProduct(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        if (request.getIsActive() != null) {
            product.setActive(request.getIsActive());
        }

        Product updated = productRepository.save(product);
        return mapToProductResponse(updated);
    }

    @Override
    @Transactional
    public ProductVariantResponse addVariantToProduct(UUID productId, CreateVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (variantRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Variant SKU '" + request.getSku() + "' already exists.");
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.getSku())
                .size(request.getSize())
                .color(request.getColor())
                .price(request.getPrice())
                .compareAtPrice(request.getCompareAtPrice())
                .isActive(true)
                .build();

        ProductVariant savedVariant = variantRepository.save(variant);

        Inventory inventory = Inventory.builder()
                .variant(savedVariant)
                .availableQuantity(request.getInitialStock())
                .reservedQuantity(0)
                .soldQuantity(0)
                .build();
        inventoryRepository.save(inventory);

        return mapToVariantResponse(savedVariant, inventory.getAvailableQuantity());
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariantStock(UUID variantId, int newStockQuantity) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", variantId));

        Inventory inventory = inventoryRepository.findByVariantId(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "variantId", variantId));

        inventory.setAvailableQuantity(newStockQuantity);
        inventoryRepository.save(inventory);

        return mapToVariantResponse(variant, newStockQuantity);
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setActive(false); // Soft deletion preserves order history integrity
        productRepository.save(product);
    }

    private ProductSummaryResponse mapToSummaryResponse(Product product) {
        List<ProductVariant> activeVariants = product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .collect(Collectors.toList());

        BigDecimal minPrice = activeVariants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal maxPrice = activeVariants.stream()
                .map(ProductVariant::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        boolean inStock = activeVariants.stream()
                .anyMatch(v -> v.getInventory() != null && v.getInventory().getAvailableQuantity() > 0);

        String primaryImageUrl = product.getImages() != null && !product.getImages().isEmpty()
                ? product.getImages().get(0).getUrl()
                : null;

        return ProductSummaryResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .categoryName(product.getCategory().getName())
                .primaryImageUrl(primaryImageUrl)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .inStock(inStock)
                .build();
    }

    private ProductResponse mapToProductResponse(Product product) {
        List<ProductVariantResponse> variantResponses = product.getVariants().stream()
                .map(v -> {
                    int stock = v.getInventory() != null ? v.getInventory().getAvailableQuantity() : 0;
                    return mapToVariantResponse(v, stock);
                })
                .collect(Collectors.toList());

        List<ProductImageDto> imageDtos = product.getImages().stream()
                .map(img -> ProductImageDto.builder()
                        .id(img.getId())
                        .publicId(img.getPublicId())
                        .url(img.getUrl())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .slug(product.getCategory().getSlug())
                .build();

        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .description(product.getDescription())
                .category(categoryResponse)
                .isActive(product.isActive())
                .variants(variantResponses)
                .images(imageDtos)
                .createdAt(product.getCreatedAt())
                .build();
    }

    private ProductVariantResponse mapToVariantResponse(ProductVariant variant, int availableQuantity) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .size(variant.getSize())
                .color(variant.getColor())
                .price(variant.getPrice())
                .compareAtPrice(variant.getCompareAtPrice())
                .isActive(variant.isActive())
                .availableQuantity(availableQuantity)
                .build();
    }

    private String generateSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
