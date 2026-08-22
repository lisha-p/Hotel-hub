package com.hotelhub.repository;

import com.hotelhub.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByCityContainingIgnoreCase(String city);
    List<Hotel> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT h FROM Hotel h WHERE LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Hotel> searchHotels(@Param("query") String query);
    
    List<Hotel> findByRatingGreaterThanEqual(Integer rating);
}