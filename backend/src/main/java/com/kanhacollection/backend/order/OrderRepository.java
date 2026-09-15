package com.kanhacollection.backend.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndUserId(UUID id, UUID userId);
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Order> findByOrderStatus(OrderStatus orderStatus, Pageable pageable);
}
