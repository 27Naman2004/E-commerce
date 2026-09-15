package com.kanhacollection.backend.inventory;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findByVariantId(UUID variantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.variant.id = :variantId")
    Optional<Inventory> findByVariantIdWithLock(@Param("variantId") UUID variantId);

    @Modifying
    @Query("UPDATE Inventory i SET i.availableQuantity = i.availableQuantity - :qty, i.reservedQuantity = i.reservedQuantity + :qty WHERE i.variant.id = :variantId AND i.availableQuantity >= :qty")
    int reserveStockAtomically(@Param("variantId") UUID variantId, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Inventory i SET i.reservedQuantity = i.reservedQuantity - :qty, i.soldQuantity = i.soldQuantity + :qty WHERE i.variant.id = :variantId AND i.reservedQuantity >= :qty")
    int commitStockAtomically(@Param("variantId") UUID variantId, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Inventory i SET i.availableQuantity = i.availableQuantity + :qty, i.reservedQuantity = i.reservedQuantity - :qty WHERE i.variant.id = :variantId AND i.reservedQuantity >= :qty")
    int releaseStockAtomically(@Param("variantId") UUID variantId, @Param("qty") int qty);
}
