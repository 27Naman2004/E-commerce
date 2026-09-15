package com.kanhacollection.backend.product;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kanhacollection.backend.common.BaseEntity;
import com.kanhacollection.backend.inventory.Inventory;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "product_variants")
public class ProductVariant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(length = 50)
    private String size;

    @Column(length = 50)
    private String color;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "compare_at_price", precision = 12, scale = 2)
    private BigDecimal compareAtPrice;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @OneToOne(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Inventory inventory;
}
