package com.dinesync.restaurant_service.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="item_id")
    private Long itemId;

    @Column(name = "dish_name",nullable = false,unique = true,length = 100)
    private String dishName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category",nullable = false)
    private Category category;

    @Column(name = "variant",length = 50)
    private String variant;

    @Enumerated(EnumType.STRING)
    @Column(name = "spice_level",nullable = false)
    private SpiceLevel spiceLevel;

    @Column(name = "price",nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability",nullable = false)
    private Availability availability;

    @Column(name = "image_url",length = 255)
    private String imageUrl;

    @Column(name = "stock_quantity",nullable = false)
    private Integer stockQuantity;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

