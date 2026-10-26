package com.hotelhub.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPService {
    
    // Thread-safe in-memory OTP storage
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();
    
    public String generateOTP(String phoneNumber) {
        String otp = String.format("%04d", random.nextInt(10000));
        otpStorage.put(phoneNumber, otp);
        
        System.out.println("=== HotelHub Verification Code ===");
        System.out.println("Phone: " + phoneNumber);
        System.out.println("OTP: " + otp);
        System.out.println("==================================");
        
        return otp;
    }
    
    public boolean verifyOTP(String phoneNumber, String otp) {
        String storedOTP = otpStorage.get(phoneNumber);
        boolean verified = otp != null && otp.equals(storedOTP);
        
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