package com.dinesync.restaurant_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dinesync.restaurant_service.entity.MenuItem;
import com.dinesync.restaurant_service.repository.MenuItemRepository;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    public MenuItem save(MenuItem menuItem){
        return menuItemRepository.save(menuItem);
    }
    public List<MenuItem> getAll(){
        return menuItemRepository.findAll();
    }
    public Optional<MenuItem> getById(Long id){
        return menuItemRepository.findById(id);
    }
    public MenuItem update (MenuItem menuItem){
        return menuItemRepository.save(menuItem);
    }
    public void delete(Long id){
        menuItemRepository.deleteById(id);
    }
}

