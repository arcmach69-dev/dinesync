package com.dinesync.user_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${dinesync.mail.from}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            System.out.println("Email sent to: " + to);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendOrderConfirmation(String to, Long orderId,
            String orderType, Double amount) {
        String subject = "🍽️ DineSync - Order Confirmation #" + orderId;
        String body = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a1a2e; padding: 20px; text-align: center;">
                    <h1 style="color: #f5a623; margin: 0;">🍽️ DineSync</h1>
                    <p style="color: white; margin: 5px 0;">Restaurant Management System</p>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #1a1a2e;">Order Confirmed! ✅</h2>
                    <p>Thank you for your order. Here are your order details:</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> #%d</p>
                        <p><strong>Order Type:</strong> %s</p>
                        <p><strong>Total Amount:</strong> $%.2f</p>
                        <p><strong>Status:</strong> RECEIVED</p>
                    </div>
                    <p>We will notify you when your order is ready!</p>
                    <p style="color: #888; font-size: 12px;">
                        Thank you for dining with DineSync 🍽️
                    </p>
                </div>
            </div>
            """.formatted(orderId, orderType, amount);
        sendEmail(to, subject, body);
    }

    public void sendLowStockAlert(String to, String ingredientName,
            Double quantityLeft, String unit) {
        String subject = "⚠️ DineSync - Low Stock Alert: " + ingredientName;
        String body = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a1a2e; padding: 20px; text-align: center;">
                    <h1 style="color: #f5a623; margin: 0;">🍽️ DineSync</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #e74c3c;">⚠️ Low Stock Alert!</h2>
                    <div style="background: #ffe0e0; padding: 20px;
                        border-radius: 8px; border-left: 4px solid #e74c3c;">
                        <p><strong>Ingredient:</strong> %s</p>
                        <p><strong>Remaining:</strong> %.2f %s</p>
                        <p><strong>Action Required:</strong> Please restock immediately!</p>
                    </div>
                    <p>Please update inventory as soon as possible to avoid service disruption.</p>
                </div>
            </div>
            """.formatted(ingredientName, quantityLeft, unit);
        sendEmail(to, subject, body);
    }

    public void sendDailySalesReport(String to, String date,
            Integer totalOrders, Double totalRevenue, Double netProfit) {
        String subject = "📊 DineSync - Daily Sales Report: " + date;
        String body = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a1a2e; padding: 20px; text-align: center;">
                    <h1 style="color: #f5a623; margin: 0;">🍽️ DineSync</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #1a1a2e;">📊 Daily Sales Report</h2>
                    <p><strong>Date:</strong> %s</p>
                    <div style="background: white; padding: 20px;
                        border-radius: 8px; margin: 20px 0;">
                        <table style="width: 100%%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Total Orders</td>
                                <td style="padding: 10px; text-align: right;">
                                    <strong>%d</strong>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Total Revenue</td>
                                <td style="padding: 10px; text-align: right;
                                    color: #2ecc71;">
                                    <strong>$%.2f</strong>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px;">Net Profit</td>
                                <td style="padding: 10px; text-align: right;
                                    color: #3498db;">
                                    <strong>$%.2f</strong>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <p style="color: #888; font-size: 12px;">
                        This is an automated report from DineSync
                    </p>
                </div>
            </div>
            """.formatted(date, totalOrders, totalRevenue, netProfit);
        sendEmail(to, subject, body);
    }

    public void sendPaymentConfirmation(String to, Long orderId,
            Double amount, String paymentMethod) {
        String subject = "💳 DineSync - Payment Confirmed #" + orderId;
        String body = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a1a2e; padding: 20px; text-align: center;">
                    <h1 style="color: #f5a623; margin: 0;">🍽️ DineSync</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #2ecc71;">✅ Payment Confirmed!</h2>
                    <div style="background: white; padding: 20px;
                        border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> #%d</p>
                        <p><strong>Amount Paid:</strong> $%.2f</p>
                        <p><strong>Payment Method:</strong> %s</p>
                        <p><strong>Status:</strong> PAID ✅</p>
                    </div>
                    <p>Thank you for dining with us! Visit us again soon.</p>
                </div>
            </div>
            """.formatted(orderId, amount, paymentMethod);
        sendEmail(to, subject, body);
    }
}