package com.kanhacollection.backend.inventory;

import com.kanhacollection.backend.exception.InsufficientStockException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public void reserveStock(UUID variantId, int quantity) {
        int updatedRows = inventoryRepository.reserveStockAtomically(variantId, quantity);
        if (updatedRows == 0) {
            log.warn("Failed atomic stock reservation for variant {}. Insufficient available quantity.", variantId);
            throw new InsufficientStockException("Insufficient stock available to satisfy reservation of quantity: " + quantity);
        }
        log.info("Successfully reserved {} stock units for variant {}", quantity, variantId);
    }

    @Override
    @Transactional
    public void commitStock(UUID variantId, int quantity) {
        int updatedRows = inventoryRepository.commitStockAtomically(variantId, quantity);
        if (updatedRows == 0) {
            log.error("Failed atomic stock commit for variant {}. Reserved quantity was insufficient.", variantId);
            throw new InsufficientStockException("Cannot commit stock: reserved quantity was insufficient.");
        }
        log.info("Successfully committed {} stock units for variant {}", quantity, variantId);
    }

    @Override
    @Transactional
    public void releaseStock(UUID variantId, int quantity) {
        int updatedRows = inventoryRepository.releaseStockAtomically(variantId, quantity);
        if (updatedRows == 0) {
            log.warn("Failed atomic stock release for variant {}. Reserved quantity was 0.", variantId);
        } else {
            log.info("Successfully released {} stock units back to available pool for variant {}", quantity, variantId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public int getAvailableQuantity(UUID variantId) {
        Inventory inventory = inventoryRepository.findByVariantId(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "variantId", variantId));
        return inventory.getAvailableQuantity();
    }
}
