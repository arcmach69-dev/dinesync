package com.dinesync.restaurant_service.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;

    @Column(name = "ingredient_name",nullable = false,unique = true,length = 50)
    private String ingredientName;

    @Column(name = "unit",nullable = false,length = 20)
    private String unit;

    @Column(name = "quantity_available",nullable = false)
    private BigDecimal quantityAvailable;

    @Column(name = "quantity_used",nullable = false)
    private BigDecimal quantityUsed;

    @Column(name = "minimum_threshold",nullable = false)
    private BigDecimal minimumThreshold;

    @Column(name = "alert_sent",nullable = false)
    private Boolean alertSent;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}

