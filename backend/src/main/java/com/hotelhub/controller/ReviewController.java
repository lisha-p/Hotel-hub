package com.hotelhub.controller;

import com.hotelhub.model.Review;
import com.hotelhub.service.OTPService;
import com.hotelhub.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private OTPService otpService;
    
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPhone(@RequestParam String phoneNumber) {
        try {
            String otp = otpService.generateOTP(phoneNumber);
            return ResponseEntity.ok("OTP sent to " + phoneNumber + ". Demo OTP: " + otp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to generate OTP: " + e.getMessage());
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<String> submitReview(@RequestBody Review review, 
                                              @RequestParam String otp) {
        try {
            if (otpService.verifyOTP(review.getCustomerPhone(), otp)) {
                review.setVerified(true);
                reviewService.saveReview(review);
                otpService.clearOTP(review.getCustomerPhone());
                return ResponseEntity.ok("Review submitted successfully");
            } else {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to submit review: " + e.getMessage());
        }
    }
    
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }
    
    @GetMapping("/hotel/{hotelId}")
    public List<Review> getReviewsByHotel(@PathVariable Long hotelId) {
        return reviewService.getReviewsByHotel(hotelId);
    }
    
    @GetMapping("/verified")
    public List<Review> getVerifiedReviews() {
        return reviewService.getVerifiedReviews();
    }
    
    @GetMapping("/pending")
    public List<Review> getPendingReviews() {
        return reviewService.getPendingReviews();
    }
    
    @GetMapping("/customer/{email}")
    public List<Review> getReviewsByCustomer(@PathVariable String email) {
        return reviewService.getReviewsByCustomerEmail(email);
    }
    
    @GetMapping("/rating/{minRating}")
    public List<Review> getReviewsByRating(@PathVariable Integer minRating) {
        return reviewService.getReviewsByRating(minRating);
    }
    
    @GetMapping("/stats")
    public Map<String, Object> getReviewStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReviews", reviewService.getTotalReviews());
        stats.put("verifiedReviews", reviewService.getVerifiedReviewsCount());
        stats.put("averageRating", reviewService.getAverageRating());
        stats.put("pendingReviews", reviewService.getPendingReviews().size());
        return stats;
    }
    
    @PutMapping("/{reviewId}/verify")
    public ResponseEntity<Review> verifyReview(@PathVariable Long reviewId, 
                                              @RequestBody Map<String, String> request) {
        String adminNotes = request.get("adminNotes");
        Review verifiedReview = reviewService.verifyReview(reviewId, adminNotes);
        if (verifiedReview != null) {
            return ResponseEntity.ok(verifiedReview);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<String> deleteReview(@PathVariable Long reviewId) {
        try {
            reviewService.deleteReview(reviewId);
            return ResponseEntity.ok("Review deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete review: " + e.getMessage());
        }
    }
}