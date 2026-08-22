
package com.hotelhub.controller;

import com.hotelhub.model.Booking;
import com.hotelhub.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    @Autowired
    private BookingService bookingService;
    
    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }
    
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
    
    @GetMapping("/email/{email}")
    public List<Booking> getBookingsByEmail(@PathVariable String email) {
        return bookingService.getBookingsByEmail(email);
    }
    
    @PostMapping("/sync")
    public ResponseEntity<String> syncOfflineBookings(@RequestBody List<Booking> offlineBookings) {
        bookingService.syncOfflineBookings(offlineBookings);
        return ResponseEntity.ok("Bookings synced successfully");
    }
}