package com.kanhacollection.backend.inventory;

import com.kanhacollection.backend.exception.InsufficientStockException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryServiceImpl Unit Tests")
class InventoryServiceImplTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    @Nested
    @DisplayName("reserveStock()")
    class ReserveStockTests {

        @Test
        @DisplayName("Should successfully reserve stock when sufficient available quantity exists")
        void shouldReserveStock_WhenSufficientQuantityAvailable() {
            UUID variantId = UUID.randomUUID();
            int quantity = 5;
            when(inventoryRepository.reserveStockAtomically(variantId, quantity)).thenReturn(1);

            assertThatCode(() -> inventoryService.reserveStock(variantId, quantity))
                    .doesNotThrowAnyException();

            verify(inventoryRepository, times(1)).reserveStockAtomically(variantId, quantity);
        }

        @Test
        @DisplayName("Should throw InsufficientStockException when stock is insufficient")
        void shouldThrowException_WhenInsufficientStock() {
            UUID variantId = UUID.randomUUID();
            int quantity = 100;
            when(inventoryRepository.reserveStockAtomically(variantId, quantity)).thenReturn(0);

            assertThatThrownBy(() -> inventoryService.reserveStock(variantId, quantity))
                    .isInstanceOf(InsufficientStockException.class)
                    .hasMessageContaining("Insufficient stock");

            verify(inventoryRepository, times(1)).reserveStockAtomically(variantId, quantity);
        }
    }

    @Nested
    @DisplayName("commitStock()")
    class CommitStockTests {

        @Test
        @DisplayName("Should successfully commit reserved stock to sold")
        void shouldCommitStock_WhenReservedQuantitySufficient() {
            UUID variantId = UUID.randomUUID();
            int quantity = 3;
            when(inventoryRepository.commitStockAtomically(variantId, quantity)).thenReturn(1);

            assertThatCode(() -> inventoryService.commitStock(variantId, quantity))
                    .doesNotThrowAnyException();

            verify(inventoryRepository, times(1)).commitStockAtomically(variantId, quantity);
        }

        @Test
        @DisplayName("Should throw InsufficientStockException when reserved quantity is insufficient for commit")
        void shouldThrowException_WhenCommitFails() {
            UUID variantId = UUID.randomUUID();
            int quantity = 10;
            when(inventoryRepository.commitStockAtomically(variantId, quantity)).thenReturn(0);

            assertThatThrownBy(() -> inventoryService.commitStock(variantId, quantity))
                    .isInstanceOf(InsufficientStockException.class)
                    .hasMessageContaining("Cannot commit stock");
        }
    }

    @Nested
    @DisplayName("releaseStock()")
    class ReleaseStockTests {

        @Test
        @DisplayName("Should successfully release reserved stock back to available pool")
        void shouldReleaseStock_WhenReservedQuantityExists() {
            UUID variantId = UUID.randomUUID();
            int quantity = 2;
            when(inventoryRepository.releaseStockAtomically(variantId, quantity)).thenReturn(1);

            assertThatCode(() -> inventoryService.releaseStock(variantId, quantity))
                    .doesNotThrowAnyException();

            verify(inventoryRepository, times(1)).releaseStockAtomically(variantId, quantity);
        }

        @Test
        @DisplayName("Should not throw exception when release fails (no reserved stock)")
        void shouldNotThrow_WhenReleaseFails() {
            UUID variantId = UUID.randomUUID();
            int quantity = 5;
            when(inventoryRepository.releaseStockAtomically(variantId, quantity)).thenReturn(0);

            // releaseStock logs a warning but doesn't throw
            assertThatCode(() -> inventoryService.releaseStock(variantId, quantity))
                    .doesNotThrowAnyException();
        }
    }

    @Nested
    @DisplayName("getAvailableQuantity()")
    class GetAvailableQuantityTests {

        @Test
        @DisplayName("Should return correct available quantity for a variant")
        void shouldReturnAvailableQuantity() {
            UUID variantId = UUID.randomUUID();
            Inventory inventory = Inventory.builder()
                    .availableQuantity(50)
                    .reservedQuantity(10)
                    .soldQuantity(40)
                    .build();
            when(inventoryRepository.findByVariantId(variantId)).thenReturn(Optional.of(inventory));

            int result = inventoryService.getAvailableQuantity(variantId);

            assertThat(result).isEqualTo(50);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when inventory record does not exist")
        void shouldThrowException_WhenInventoryNotFound() {
            UUID variantId = UUID.randomUUID();
            when(inventoryRepository.findByVariantId(variantId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> inventoryService.getAvailableQuantity(variantId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
