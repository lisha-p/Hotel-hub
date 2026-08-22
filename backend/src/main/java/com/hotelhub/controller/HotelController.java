
package com.hotelhub.controller;

import com.hotelhub.model.Hotel;
import com.hotelhub.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {
    @Autowired
    private HotelService hotelService;
    
    @GetMapping
    public List<Hotel> getAllHotels() {
        return hotelService.getAllHotels();
    }
    
    @GetMapping("/search")
    public List<Hotel> searchHotels(@RequestParam String query) {
        return hotelService.searchHotels(query);
    }
    
    @GetMapping("/city/{city}")
    public List<Hotel> getHotelsByCity(@PathVariable String city) {
        return hotelService.getHotelsByCity(city);
    }
    
    @GetMapping("/rating/{minRating}")
    public List<Hotel> getHotelsByRating(@PathVariable Integer minRating) {
        return hotelService.getHotelsByRating(minRating);
    }
    
    @PostMapping
    public Hotel addHotel(@RequestBody Hotel hotel) {
        return hotelService.saveHotel(hotel);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable Long id) {
        Hotel hotel = hotelService.getHotelById(id);
        if (hotel != null) {
            return ResponseEntity.ok(hotel);
        }
        return ResponseEntity.notFound().build();
    }
}