package com.dinesync.user_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;

@Service
public class ScheduledReportService {

    @Autowired
    private EmailService emailService;

    // Runs every day at 11 PM
    @Scheduled(cron = "0 0 23 * * ?")
    public void sendDailyReport() {
        try {
            String today = LocalDate.now().toString();

            // Fetch today's sales from restaurant-service
            RestTemplate restTemplate = new RestTemplate();
            String salesUrl =
                "http://localhost:1969/api/sales";

            // Get sales data
            Object[] sales = restTemplate.getForObject(
                salesUrl, Object[].class);

            // Send report to admin and manager
            emailService.sendDailySalesReport(
                "admin@dinesync.com",
                today,
                15,
                450.00,
                180.00
            );

            emailService.sendDailySalesReport(
                "manager@dinesync.com",
                today,
                15,
                450.00,
                180.00
            );

            System.out.println(
                "Daily report sent for " + today
            );
        } catch (Exception e) {
            System.err.println(
                "Daily report failed: " + e.getMessage()
            );
        }
    }

    // Also runs every day at 9 AM as morning summary
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendMorningSummary() {
        try {
            String today = LocalDate.now().toString();
            emailService.sendEmail(
                "admin@dinesync.com",
                "🌅 DineSync - Good Morning!",
                "<h2>Good Morning!</h2>" +
                "<p>Today is " + today + "</p>" +
                "<p>DineSync Restaurant System is running.</p>" +
                "<p>Have a great day! 🍽️</p>"
            );
            System.out.println("Morning summary sent");
        } catch (Exception e) {
            System.err.println(
                "Morning summary failed: " + e.getMessage()
            );
        }
    }
}