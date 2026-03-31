package com.dinesync.restaurant_service.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dinesync.restaurant_service.entity.Payment;

@Repository
public interface PaymentRepository 
        extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    List<Payment> findByPaymentStatus(
        com.dinesync.restaurant_service.entity.PaymentStatus status);
}