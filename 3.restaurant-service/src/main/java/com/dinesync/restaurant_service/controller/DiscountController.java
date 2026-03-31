package com.dinesync.restaurant_service.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dinesync.restaurant_service.entity.Discount;
import com.dinesync.restaurant_service.service.DiscountService;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    @GetMapping
    public List<Discount> getAll() {
        return discountService.getAll();
    }

    @GetMapping("/active")
    public List<Discount> getActive() {
        return discountService.getActive();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Discount> getById(
            @PathVariable Long id) {
        return discountService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/coupon/{code}")
    public ResponseEntity<Discount> getByCouponCode(
            @PathVariable String code) {
        return discountService.getByCouponCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Discount create(@RequestBody Discount discount) {
        if (discount.getUsageCount() == null)
            discount.setUsageCount(0);
        return discountService.save(discount);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Discount> update(
            @PathVariable Long id,
            @RequestBody Discount discount) {
        return discountService.getById(id)
                .map(existing -> {
                    discount.setDiscountId(id);
                    return ResponseEntity.ok(
                        discountService.update(discount));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {
        return discountService.getById(id)
                .map(existing -> {
                    discountService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}