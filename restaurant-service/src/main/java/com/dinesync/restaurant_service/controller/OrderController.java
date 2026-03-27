package com.dinesync.restaurant_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dinesync.restaurant_service.entity.Order;
import com.dinesync.restaurant_service.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    //GETALL
    @GetMapping
    public List<Order> getAll(){
        return orderService.getAll();
    }

    //GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(
        @PathVariable Long id){
            return orderService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        }

    //CREATE
    @PostMapping
    public Order create(@RequestBody Order order){
        return orderService.save(order);
    }

    //UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Order> update(
                @PathVariable Long id,
                @RequestBody Order order) {
            return orderService.getById(id)
                    .map(existing -> {
                        order.setOrderId(id);
                        return ResponseEntity.ok(
                            orderService.update(order));
                    })
                    .orElse(ResponseEntity.notFound().build());
        }

    //DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
                @PathVariable Long id) {
            return orderService.getById(id)
                    .map(existing -> {
                        orderService.delete(id);
                        return ResponseEntity.ok().<Void>build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        }
}
