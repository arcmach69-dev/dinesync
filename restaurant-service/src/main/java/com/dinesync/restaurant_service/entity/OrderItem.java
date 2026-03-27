package com.dinesync.restaurant_service.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long orderItemId;

    @Column(name = "order_id",nullable = false)
    private Long orderId;

    @Column(name = "item_id",nullable = false)
    private Long itemId;

    @Column(name = "quantity",nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "spice_level",nullable = false)
    private SpiceLevel spiceLevel;

    @Column(name = "modifications",length = 300)
    private String modifications;

    @Column(name = "item_price",nullable = false)
    private BigDecimal itemPrice;
}

