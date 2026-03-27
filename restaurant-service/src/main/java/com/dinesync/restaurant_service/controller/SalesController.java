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
import com.dinesync.restaurant_service.entity.Sales;
import com.dinesync.restaurant_service.service.SalesService;

@RestController
@RequestMapping("/api/sales")
public class SalesController {

        @Autowired
    private SalesService salesService;

    //GET ALL
    @GetMapping
    public List<Sales> getAll(){
        return salesService.getAll();
    }

    //GET BY ID
     @GetMapping("/{id}")
    public ResponseEntity <Sales> getById(
        @PathVariable Long id){
            return salesService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
        }

    //CREATE
    @PostMapping
    public Sales create(@RequestBody Sales sales){
        return salesService.save(sales);
    }

    //UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Sales> update (
        @PathVariable Long id,
        @RequestBody Sales sales) {
            return salesService.getById(id)
                .map(existing -> {
                    sales.setSaleId(id);
                    return ResponseEntity.ok(
                        salesService.update(sales));
                })
                .orElse(ResponseEntity.notFound().build());
        }

    //DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable Long id ){
            return salesService.getById(id)
                .map(existing -> {
                    salesService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
        }
}
