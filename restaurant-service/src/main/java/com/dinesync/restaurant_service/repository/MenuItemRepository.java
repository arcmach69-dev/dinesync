package com.dinesync.restaurant_service.repository;

import java.util.List;
import com.dinesync.restaurant_service.entity.Category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dinesync.restaurant_service.entity.Availability;
import com.dinesync.restaurant_service.entity.MenuItem;

@Repository
public interface MenuItemRepository 
                        extends JpaRepository<MenuItem,Long> {

    // Search by dish name containing keyword 
    List<MenuItem> findByDishNameContainingIgnoreCase(String name);

    // Get by category
    List<MenuItem> findByCategory(Category category);

    // Get by availability
    List<MenuItem> findByAvailability(Availability availability);

    // Get recently added (last 10)
    List<MenuItem> findTop10ByOrderByCreatedAtDesc();

}