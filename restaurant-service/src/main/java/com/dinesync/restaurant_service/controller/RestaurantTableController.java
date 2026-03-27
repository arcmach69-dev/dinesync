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
import com.dinesync.restaurant_service.entity.RestaurantTable;
import com.dinesync.restaurant_service.service.RestaurantTableService;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "*")
public class RestaurantTableController {

    @Autowired
    private RestaurantTableService restaurantTableService;

    // GET ALL
    @GetMapping
    public List<RestaurantTable> getAll(){
        return restaurantTableService.getAll();
    }

    //GET ID
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getById(
        @PathVariable Long id) {
            return restaurantTableService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
        }

    //CREATE
    @PostMapping
    public RestaurantTable create(@RequestBody RestaurantTable restaurantTable){
        return restaurantTableService.save(restaurantTable);
    }

    //UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> update(
        @PathVariable Long id,
        @RequestBody RestaurantTable restaurantTable){
            return restaurantTableService.getById(id)
            .map(existing -> {
                restaurantTable.setTableId(id);
                return ResponseEntity.ok(
                    restaurantTableService.update(restaurantTable));
            })
            .orElse(ResponseEntity.notFound().build());
        }

    //DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable Long id){
            return restaurantTableService.getById(id)
            .map(existing ->{
                restaurantTableService.delete(id);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
        }
    

         
}
