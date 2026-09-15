package com.kanhacollection.backend.product;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kanhacollection.backend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "product_images")
public class ProductImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(name = "public_id", nullable = false, length = 255)
    private String publicId;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
