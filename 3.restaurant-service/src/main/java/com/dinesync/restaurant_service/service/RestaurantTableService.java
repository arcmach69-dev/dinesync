package com.dinesync.restaurant_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dinesync.restaurant_service.entity.RestaurantTable;
import com.dinesync.restaurant_service.repository.RestaurantTableRepository;

@Service
public class RestaurantTableService {

    @Autowired
    private RestaurantTableRepository restaurantTableRepository;

    public RestaurantTable save(RestaurantTable restaurantTable){
        return restaurantTableRepository.save(restaurantTable);
    }
    public List<RestaurantTable> getAll(){
        return restaurantTableRepository.findAll();
    }
    public Optional<RestaurantTable> getById(Long id){
        return restaurantTableRepository.findById(id);
    }
    public RestaurantTable update (RestaurantTable restaurantTable){
        return restaurantTableRepository.save(restaurantTable);
    }
    public void delete(Long id){
        restaurantTableRepository.deleteById(id);
    }
}

