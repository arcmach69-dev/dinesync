package com.dinesync.restaurant_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dinesync.restaurant_service.entity.OrderItem;
import com.dinesync.restaurant_service.service.OrderItemService;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    //GET ALL
    @GetMapping
    public List<OrderItem> getAll(){
        return orderItemService.getAll();
    }

    //GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity <OrderItem> getById(
        @PathVariable Long id){
            return orderItemService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
        }

    //CREATE
    @PostMapping
    public OrderItem create(@RequestBody OrderItem orderItem){
        return orderItemService.save(orderItem);
    }

    //UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<OrderItem> update (
        @PathVariable Long id,
        @RequestBody OrderItem orderItem) {
            return orderItemService.getById(id)
                .map(existing -> {
                    orderItem.setOrderItemId(id);
                    return ResponseEntity.ok(
                        orderItemService.update(orderItem));
                })
                .orElse(ResponseEntity.notFound().build());
        }

    //DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable Long id ){
            return orderItemService.getById(id)
                .map(existing -> {
                    orderItemService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
        }

}
