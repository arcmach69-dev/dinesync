package com.dinesync.user_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;

@Service
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    public void sendSms(String to, String message) {
        try {
            Message.creator(
                new PhoneNumber(to),
                new PhoneNumber(fromNumber),
                message
            ).create();
            System.out.println("SMS sent to: " + to);
        } catch (Exception e) {
            System.err.println("SMS failed: " + e.getMessage());
        }
    }

    public void sendOrderConfirmation(String to, Long orderId,
            String orderType, Double amount) {
        String message = String.format(
            "🍽️ DineSync - Order Confirmed!\n" +
            "Order #%d\nType: %s\nAmount: $%.2f\n" +
            "Status: RECEIVED\nThank you!",
            orderId, orderType, amount
        );
        sendSms(to, message);
    }

    public void sendLowStockAlert(String to,
            String ingredientName, Double quantity, String unit) {
        String message = String.format(
            "⚠️ DineSync Low Stock Alert!\n" +
            "Item: %s\nRemaining: %.2f %s\n" +
            "Please restock immediately!",
            ingredientName, quantity, unit
        );
        sendSms(to, message);
    }

    public void sendPaymentConfirmation(String to,
            Long orderId, Double amount, String method) {
        String message = String.format(
            "✅ DineSync Payment Confirmed!\n" +
            "Order #%d\nAmount: $%.2f\n" +
            "Method: %s\nThank you for dining with us!",
            orderId, amount, method
        );
        sendSms(to, message);
    }

    public void sendDailyReport(String to, String date,
            Integer orders, Double revenue) {
        String message = String.format(
            "📊 DineSync Daily Report\n" +
            "Date: %s\nTotal Orders: %d\n" +
            "Total Revenue: $%.2f",
            date, orders, revenue
        );
        sendSms(to, message);
    }
}