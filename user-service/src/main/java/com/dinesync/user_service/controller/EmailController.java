package com.dinesync.user_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dinesync.user_service.service.EmailService;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/order-confirmation")
    public ResponseEntity<String> sendOrderConfirmation(
            @RequestBody Map<String, Object> request) {
        emailService.sendOrderConfirmation(
            (String) request.get("to"),
            Long.valueOf(request.get("orderId").toString()),
            (String) request.get("orderType"),
            Double.valueOf(request.get("amount").toString())
        );
        return ResponseEntity.ok("Order confirmation sent");
    }

    @PostMapping("/low-stock")
    public ResponseEntity<String> sendLowStockAlert(
            @RequestBody Map<String, Object> request) {
        emailService.sendLowStockAlert(
            (String) request.get("to"),
            (String) request.get("ingredientName"),
            Double.valueOf(request.get("quantityLeft").toString()),
            (String) request.get("unit")
        );
        return ResponseEntity.ok("Low stock alert sent");
    }

    @PostMapping("/daily-report")
    public ResponseEntity<String> sendDailySalesReport(
            @RequestBody Map<String, Object> request) {
        emailService.sendDailySalesReport(
            (String) request.get("to"),
            (String) request.get("date"),
            Integer.valueOf(request.get("totalOrders").toString()),
            Double.valueOf(request.get("totalRevenue").toString()),
            Double.valueOf(request.get("netProfit").toString())
        );
        return ResponseEntity.ok("Daily report sent");
    }

    @PostMapping("/payment-confirmation")
    public ResponseEntity<String> sendPaymentConfirmation(
            @RequestBody Map<String, Object> request) {
        emailService.sendPaymentConfirmation(
            (String) request.get("to"),
            Long.valueOf(request.get("orderId").toString()),
            Double.valueOf(request.get("amount").toString()),
            (String) request.get("paymentMethod")
        );
        return ResponseEntity.ok("Payment confirmation sent");
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTest(
            @RequestBody Map<String, String> request) {
        emailService.sendEmail(
            request.get("to"),
            "🍽️ DineSync - Test Email",
            "<h1>DineSync Email is Working!</h1><p>Your email notifications are configured correctly.</p>"
        );
        return ResponseEntity.ok("Test email sent");
    }
}