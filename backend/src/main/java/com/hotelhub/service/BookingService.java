package com.hotelhub.service;

import com.hotelhub.model.Booking;
import com.hotelhub.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    
    public Booking createBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public List<Booking> getBookingsByEmail(String email) {
        return bookingRepository.findByGuestEmail(email);
    }
    
    public List<Booking> getUnsyncedBookings() {
        return bookingRepository.findBySyncedFalse();
    }
    
    public void syncOfflineBookings(List<Booking> offlineBookings) {
        for (Booking booking : offlineBookings) {
            booking.setSynced(true);
            bookingRepository.save(booking);
        }
    }
}