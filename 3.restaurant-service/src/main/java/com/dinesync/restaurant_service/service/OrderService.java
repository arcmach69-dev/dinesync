package com.dinesync.restaurant_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dinesync.restaurant_service.entity.Order;
import com.dinesync.restaurant_service.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Order save(Order order){
        return orderRepository.save(order);
    }
    public List<Order> getAll(){
        return orderRepository.findAll();
    }
    public Optional<Order> getById(Long id){
        return orderRepository.findById(id);
    }
    public Order update(Order order){
        return orderRepository.save(order);
    }
    public void delete(Long id){
        orderRepository.deleteById(id);
    }
}

