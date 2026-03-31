package com.dinesync.restaurant_service.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dinesync.restaurant_service.entity.Discount;
import com.dinesync.restaurant_service.repository.DiscountRepository;

@Service
public class DiscountService {

    @Autowired
    private DiscountRepository discountRepository;

    public Discount save(Discount discount) {
        return discountRepository.save(discount);
    }

    public List<Discount> getAll() {
        return discountRepository.findAll();
    }

    public Optional<Discount> getById(Long id) {
        return discountRepository.findById(id);
    }

    public List<Discount> getActive() {
        return discountRepository.findByIsActive(true);
    }

    public Optional<Discount> getByCouponCode(String code) {
        return discountRepository.findByCouponCode(code);
    }

    public Discount update(Discount discount) {
        return discountRepository.save(discount);
    }

    public void delete(Long id) {
        discountRepository.deleteById(id);
    }
}