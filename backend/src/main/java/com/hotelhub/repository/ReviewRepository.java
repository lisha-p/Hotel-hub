package com.hotelhub.repository;

import com.hotelhub.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByHotelId(Long hotelId);
    List<Review> findByVerifiedTrue();
    List<Review> findByVerifiedFalse();
    List<Review> findByCustomerEmail(String customerEmail);
    List<Review> findByCustomerPhone(String customerPhone);
    
    @Query("SELECT r FROM Review r ORDER BY r.reviewDate DESC")
    List<Review> findAllOrderByDateDesc();
    
    @Query("SELECT r FROM Review r WHERE r.rating >= :minRating")
    List<Review> findByRatingGreaterThanEqual(@Param("minRating") Integer minRating);
    
    @Query("SELECT r FROM Review r WHERE r.hotel.name LIKE %:hotelName%")
    List<Review> findByHotelNameContaining(@Param("hotelName") String hotelName);
}