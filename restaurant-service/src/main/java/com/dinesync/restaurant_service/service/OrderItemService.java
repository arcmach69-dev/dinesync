package com.dinesync.restaurant_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dinesync.restaurant_service.entity.OrderItem;
import com.dinesync.restaurant_service.repository.OrderItemRepository;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    public OrderItem save(OrderItem orderItem){
        return orderItemRepository.save(orderItem);
    }
    public List<OrderItem> getAll(){
        return orderItemRepository.findAll();
    }
    public Optional<OrderItem> getById(Long id){
        return orderItemRepository.findById(id);
    }
    public OrderItem update (OrderItem orderItem){
        return orderItemRepository.save(orderItem);
    }
    public void delete(Long id){
        orderItemRepository.deleteById(id);
    }
}

