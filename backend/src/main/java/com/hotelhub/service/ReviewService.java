package com.hotelhub.service;

import com.hotelhub.model.Review;
import com.hotelhub.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;
    
    public Review saveReview(Review review) {
        return reviewRepository.save(review);
    }
    
    public List<Review> getAllReviews() {
        return reviewRepository.findAllOrderByDateDesc();
    }
    
    public List<Review> getReviewsByHotel(Long hotelId) {
        return reviewRepository.findByHotelId(hotelId);
    }
    
    public List<Review> getVerifiedReviews() {
        return reviewRepository.findByVerifiedTrue();
    }
    
    public List<Review> getPendingReviews() {
        return reviewRepository.findByVerifiedFalse();
    }
    
    public List<Review> getReviewsByCustomerEmail(String email) {
        return reviewRepository.findByCustomerEmail(email);
    }
    
    public List<Review> getReviewsByRating(Integer minRating) {
        return reviewRepository.findByRatingGreaterThanEqual(minRating);
    }
    
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }
    
    public Review verifyReview(Long reviewId, String adminNotes) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setVerified(true);
            review.setAdminNotes(adminNotes);
            return reviewRepository.save(review);
        }
        return null;
    }
    
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }
    
    public long getTotalReviews() {
        return reviewRepository.count();
    }
    
    public long getVerifiedReviewsCount() {
        return reviewRepository.findByVerifiedTrue().size();
    }
    
    public double getAverageRating() {
        List<Review> reviews = reviewRepository.findAll();
        if (reviews.isEmpty()) return 0.0;
        
        double sum = reviews.stream().mapToInt(Review::getRating).sum();
        return sum / reviews.size();
    }
}
