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

    @PostMapping("/order-ready")
public ResponseEntity<String> orderReady(@RequestBody Map<String, Object> body) {
    String to = (String) body.get("to");
    String orderId = body.get("orderId").toString();
    String customerName = (String) body.get("customerName");
    String orderType = (String) body.get("orderType");
    String amount = body.get("amount").toString();

    String subject = "🍽️ Your Order #" + orderId + " is Ready!";
    String html = "<div style='font-family:Arial;padding:20px;'>"
        + "<h2 style='color:#2ecc71;'>✅ Order Ready!</h2>"
        + "<p>Hi <strong>" + customerName + "</strong>,</p>"
        + "<p>Your order <strong>#" + orderId + "</strong> is ready!</p>"
        + "<table style='width:100%;border-collapse:collapse;'>"
        + "<tr><td style='padding:8px;border:1px solid #ddd;'><b>Order Type</b></td>"
        + "<td style='padding:8px;border:1px solid #ddd;'>" + orderType + "</td></tr>"
        + "<tr><td style='padding:8px;border:1px solid #ddd;'><b>Total</b></td>"
        + "<td style='padding:8px;border:1px solid #ddd;'>$" + amount + "</td></tr>"
        + "</table>"
        + "<p style='color:#888;margin-top:20px;'>Our waiter is on the way! 🚀</p>"
        + "<p style='color:#f5a623;font-weight:bold;'>Thank you for dining with DineSync!</p>"
        + "</div>";

    emailService.sendEmail(to, subject, html);
    return ResponseEntity.ok("Order ready email sent");
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