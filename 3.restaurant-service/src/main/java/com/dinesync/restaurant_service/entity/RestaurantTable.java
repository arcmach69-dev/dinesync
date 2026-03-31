package com.dinesync.restaurant_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "restaurant_tables")
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "table_id")
    private Long tableId;

    @Column(name = "row_name",nullable = false,length = 3)
    private String rowName;

    @Column(name = "table_number",nullable = false,unique = true,length = 5)
    private String tableNumber;

    @Column(name="capacity",nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",nullable = false)
    private TableStatus status;

    @Column(name = "current_order_id")
    private Long currentOrderId;
}
