package com.dinesync.restaurant_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dinesync.restaurant_service.entity.Order;

@Repository
public interface OrderRepository 
                        extends JpaRepository<Order,Long> {

}
