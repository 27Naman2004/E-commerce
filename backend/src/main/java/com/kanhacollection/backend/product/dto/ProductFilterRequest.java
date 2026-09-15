package com.kanhacollection.backend.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductFilterRequest {
    private String query;
    private UUID categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean inStockOnly;
    private String sortBy = "createdAt"; // createdAt, price, title
    private String sortDirection = "DESC"; // ASC, DESC
    private int page = 0;
    private int size = 12;
}
