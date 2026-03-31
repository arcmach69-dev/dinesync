package com.dinesync.restaurant_service.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dinesync.restaurant_service.entity.Discount;
import com.dinesync.restaurant_service.entity.DiscountType;

@Repository
public interface DiscountRepository
        extends JpaRepository<Discount, Long> {
    List<Discount> findByIsActive(Boolean isActive);
    List<Discount> findByType(DiscountType type);
    Optional<Discount> findByCouponCode(String couponCode);
}