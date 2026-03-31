package com.dinesync.user_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dinesync.user_service.service.SmsService;
import java.util.Map;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

    @Autowired
    private SmsService smsService;

    @PostMapping("/test")
    public ResponseEntity<String> sendTest(
            @RequestBody Map<String, String> request) {
        smsService.sendSms(
            request.get("to"),
            "🍽️ DineSync SMS is working! Test message."
        );
        return ResponseEntity.ok("Test SMS sent");
    }

    @PostMapping("/order-ready")
public ResponseEntity<String> orderReady(@RequestBody Map<String, Object> body) {
    String to = (String) body.get("to");
    String orderId = body.get("orderId").toString();
    String customerName = (String) body.get("customerName");

    String message = "Hi " + customerName + "! Your DineSync Order #"
        + orderId + " is READY! Our waiter is bringing it to you now. "
        + "Thank you for dining with us! 🍽️";

    smsService.sendSms(to, message);
    return ResponseEntity.ok("SMS sent");
}
    @PostMapping("/order-confirmation")
    public ResponseEntity<String> sendOrderConfirmation(
            @RequestBody Map<String, Object> request) {
        smsService.sendOrderConfirmation(
            (String) request.get("to"),
            Long.valueOf(request.get("orderId").toString()),
            (String) request.get("orderType"),
            Double.valueOf(request.get("amount").toString())
        );
        return ResponseEntity.ok("Order confirmation SMS sent");
    }

    @PostMapping("/low-stock")
    public ResponseEntity<String> sendLowStockAlert(
            @RequestBody Map<String, Object> request) {
        smsService.sendLowStockAlert(
            (String) request.get("to"),
            (String) request.get("ingredientName"),
            Double.valueOf(request.get("quantity").toString()),
            (String) request.get("unit")
        );
        return ResponseEntity.ok("Low stock SMS sent");
    }

    @PostMapping("/payment-confirmation")
    public ResponseEntity<String> sendPaymentConfirmation(
            @RequestBody Map<String, Object> request) {
        smsService.sendPaymentConfirmation(
            (String) request.get("to"),
            Long.valueOf(request.get("orderId").toString()),
            Double.valueOf(request.get("amount").toString()),
            (String) request.get("paymentMethod")
        );
        return ResponseEntity.ok("Payment SMS sent");
    }

    @PostMapping("/daily-report")
    public ResponseEntity<String> sendDailyReport(
            @RequestBody Map<String, Object> request) {
        smsService.sendDailyReport(
            (String) request.get("to"),
            (String) request.get("date"),
            Integer.valueOf(request.get("totalOrders").toString()),
            Double.valueOf(request.get("totalRevenue").toString())
        );
        return ResponseEntity.ok("Daily report SMS sent");
    }
}