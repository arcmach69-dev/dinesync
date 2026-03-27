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
import com.dinesync.restaurant_service.entity.MenuItem;
import com.dinesync.restaurant_service.service.MenuItemService;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = "*")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    //GET ALL
    @GetMapping
    public List<MenuItem> getAll(){
       return menuItemService.getAll(); 
    }

    //GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getById(
            @PathVariable Long id){
        return menuItemService.getById(id)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
        }
    
    //CREATE
    @PostMapping
    public MenuItem create(@RequestBody MenuItem menuItem){
        return menuItemService.save(menuItem);
    }

    //UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> update(
            @PathVariable Long id,
            @RequestBody MenuItem menuItem) {
        return menuItemService.getById(id)
                .map(existing -> {
                    menuItem.setItemId(id);
                    return ResponseEntity.ok(
                        menuItemService.update(menuItem));
                })
                .orElse(ResponseEntity.notFound().build());
        }

        //DELETE
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(
                @PathVariable Long id){
            return menuItemService.getById(id)
                    .map(existing -> {
                        menuItemService.delete(id);
                        return ResponseEntity.ok().<Void>build();
                    })
                    .orElse(ResponseEntity.notFound().build());
                }
}