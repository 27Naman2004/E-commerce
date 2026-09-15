package com.kanhacollection.backend.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Product title is required")
    private String title;

    private String description;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotEmpty(message = "At least one product variant is required")
    @Valid
    private List<CreateVariantRequest> variants;

    private List<ProductImageDto> images;
}
