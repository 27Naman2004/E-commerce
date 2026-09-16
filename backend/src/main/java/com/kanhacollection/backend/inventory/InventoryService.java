package com.kanhacollection.backend.inventory;

import java.util.UUID;

public interface InventoryService {
    void reserveStock(UUID variantId, int quantity);
    void commitStock(UUID variantId, int quantity);
    void releaseStock(UUID variantId, int quantity);
    int getAvailableQuantity(UUID variantId);
}
