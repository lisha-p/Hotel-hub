package com.hotelhub.config;

import com.twilio.Twilio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class TwilioConfig {

    private static final Logger logger = LoggerFactory.getLogger(TwilioConfig.class);

    @Value("${twilio.account-sid:demo}")
    private String accountSid;

    @Value("${twilio.auth-token:demo}")
    private String authToken;

    @Value("${twilio.phone-number:demo}")
    private String phoneNumber;

    @PostConstruct
    public void init() {
        // Only initialize Twilio if we have real credentials (not "demo")
        if (!"demo".equals(accountSid) && !"demo".equals(authToken)) {
            try {
                Twilio.init(accountSid, authToken);
                logger.info("Twilio initialized successfully with Account SID: {}", accountSid);
            } catch (Exception e) {
                logger.error("Failed to initialize Twilio: {}", e.getMessage());
            }
        } else {
            logger.info("Twilio running in DEMO mode - OTPs will be logged to console instead of SMS");
        }
    }

    // Getters for the properties
    public String getAccountSid() {
        return accountSid;
    }

    public String getAuthToken() {
        return authToken;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public boolean isDemoMode() {
        return "demo".equals(accountSid) || "demo".equals(authToken);
    }
}