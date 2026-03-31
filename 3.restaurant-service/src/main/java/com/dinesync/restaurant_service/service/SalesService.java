package com.dinesync.restaurant_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dinesync.restaurant_service.entity.Sales;
import com.dinesync.restaurant_service.repository.SalesRepository;

@Service
public class SalesService {

    @Autowired
    private SalesRepository salesRepository;

    public Sales save(Sales sales){
        return salesRepository.save(sales);
    }
    public List<Sales> getAll(){
        return salesRepository.findAll();
    }
    public Optional<Sales> getById(Long id){
        return salesRepository.findById(id);
    }
    public Sales update(Sales sales){
        return salesRepository.save(sales);
    }
    public void delete(Long id){
        salesRepository.deleteById(id);
    }
}
