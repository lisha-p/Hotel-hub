package com.hotelhub.service;

import com.hotelhub.model.Hotel;
import com.hotelhub.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HotelService {
    @Autowired
    private HotelRepository hotelRepository;
    
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }
    
    public List<Hotel> searchHotels(String query) {
        return hotelRepository.searchHotels(query);
    }
    
    public List<Hotel> getHotelsByCity(String city) {
        return hotelRepository.findByCityContainingIgnoreCase(city);
    }
    
    public List<Hotel> getHotelsByRating(Integer minRating) {
        return hotelRepository.findByRatingGreaterThanEqual(minRating);
    }
    
    public Hotel saveHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }
    
    public Hotel getHotelById(Long id) {
        return hotelRepository.findById(id).orElse(null);
    }
}