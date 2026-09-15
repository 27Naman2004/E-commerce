package com.kanhacollection.backend.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateProductRequest {

    @NotBlank(message = "Product title is required")
    private String title;

    private String description;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    private Boolean isActive;
}
