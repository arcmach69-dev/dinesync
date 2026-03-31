package com.dinesync.restaurant_service.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dinesync.restaurant_service.entity.Inventory;

@Repository
public interface InventoryRepository 
                        extends JpaRepository<Inventory,Long> {

    // Get items below minimum threshold
    List<Inventory> findByQuantityAvailableLessThanEqual(
        BigDecimal minimumThreshold);

}