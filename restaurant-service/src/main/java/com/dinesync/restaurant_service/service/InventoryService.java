package com.dinesync.restaurant_service.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dinesync.restaurant_service.entity.Inventory;
import com.dinesync.restaurant_service.repository.InventoryRepository;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public Inventory save(Inventory inventory){
        return inventoryRepository.save(inventory);
    }
    public List<Inventory> getAll(){
        return inventoryRepository.findAll();
    }
    public Optional<Inventory> getById(Long id){
        return inventoryRepository.findById(id);
    }
    public Inventory update(Inventory order){
        return inventoryRepository.save(order);
    }
    public void delete(Long id){
        inventoryRepository.deleteById(id);
    }
}

