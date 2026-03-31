package com.dinesync.restaurant_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dinesync.restaurant_service.entity.RestaurantTable;

@Repository
public interface RestaurantTableRepository 
                        extends JpaRepository<RestaurantTable,Long> {

}
