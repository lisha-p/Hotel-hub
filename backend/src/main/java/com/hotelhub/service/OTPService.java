package com.hotelhub.service;

import com.hotelhub.config.TwilioConfig;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OTPService {
    
    @Autowired
    private TwilioConfig twilioConfig;
    
    private Map<String, String> otpStorage = new HashMap<>();
    private Random random = new Random();
    
    public String generateOTP(String phoneNumber) {
        String otp = String.format("%04d", random.nextInt(10000));
        otpStorage.put(phoneNumber, otp);
        
        if (twilioConfig.isDemoMode()) {
            // DEMO MODE: Show OTP in console
            System.out.println("=== DEMO OTP ===");
            System.out.println("Phone: " + phoneNumber);
            System.out.println("OTP: " + otp);
            System.out.println("=== In production, this would be sent via SMS ===");
        } else {
            // PRODUCTION: Send actual SMS via Twilio
            try {
                Message message = Message.creator(
                    new PhoneNumber(phoneNumber),
                    new PhoneNumber(twilioConfig.getPhoneNumber()),
                    "Your HotelHub verification code is: " + otp
                ).create();
                
                System.out.println("OTP sent via SMS to " + phoneNumber + ", Message SID: " + message.getSid());
            } catch (Exception e) {
                System.err.println("Failed to send SMS via Twilio: " + e.getMessage());
                throw new RuntimeException("Failed to send OTP via SMS");
            }
        }
        
        return otp;
    }
    
    public boolean verifyOTP(String phoneNumber, String otp) {
        String storedOTP = otpStorage.get(phoneNumber);
        boolean verified = otp.equals(storedOTP);
        
        if (verified) {
            otpStorage.remove(phoneNumber);
            System.out.println("OTP verified successfully for: " + phoneNumber);
        } else {
            System.out.println("OTP verification failed for: " + phoneNumber);
        }
        
        return verified;
    }
    
    public void clearOTP(String phoneNumber) {
        otpStorage.remove(phoneNumber);
        System.out.println("OTP cleared for: " + phoneNumber);
    }
    
    public boolean hasOTP(String phoneNumber) {
        return otpStorage.containsKey(phoneNumber);
    }
}