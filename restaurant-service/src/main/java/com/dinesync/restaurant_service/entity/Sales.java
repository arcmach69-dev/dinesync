package com.dinesync.restaurant_service.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "sales")
public class Sales {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id")
    private Long saleId;

    @Column(name = "sale_date",nullable = false,unique = true)
    private LocalDate saleDate;

    @Column(name = "total_orders",nullable = false)
    private Integer totalOrders;

    @Column(name = "total_revenue",nullable = false)
    private BigDecimal totalRevenue;

    @Column(name = "total_refunds",nullable = false)
    private BigDecimal totalRefunds;

    @Column(name = "cancellations",nullable = false)
    private Integer cancellations;

    @Column(name = "kitchen_cost",nullable = false)
    private BigDecimal kitchenCost;

    @Column(name = "gross_profit",nullable = false)
    private BigDecimal grossProfit;

    @Column(name = "net_profit",nullable = false)
    private BigDecimal netProfit;

    @Column(name = "total_investment",nullable = false)
    private BigDecimal totalInvestment;
}

