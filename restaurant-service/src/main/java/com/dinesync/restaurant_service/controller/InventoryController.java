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

import com.dinesync.restaurant_service.entity.Inventory;
import com.dinesync.restaurant_service.service.InventoryService;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins="*")
public class InventoryController {
    
    @Autowired
    private InventoryService inventoryService;

    //GET ALL
    @GetMapping
    public List<Inventory> getAll(){
        return inventoryService.getAll();
    }

    //GET BY ID
     @GetMapping("/{id}")
    public ResponseEntity <Inventory> getById(
        @PathVariable Long id){
            return inventoryService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
        }

    //CREATE
    @PostMapping
    public Inventory create(@RequestBody Inventory inventory){
        return inventoryService.save(inventory);
    }

    //UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Inventory> update (
        @PathVariable Long id,
        @RequestBody Inventory inventory) {
            return inventoryService.getById(id)
                .map(existing -> {
                    inventory.setInventoryId(id);
                    return ResponseEntity.ok(
                        inventoryService.update(inventory));
                })
                .orElse(ResponseEntity.notFound().build());
        }

    //DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable Long id ){
            return inventoryService.getById(id)
                .map(existing -> {
                    inventoryService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
        }
}
