package com.hotelhub.repository;

import com.hotelhub.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByGuestEmail(String email);
    List<Booking> findBySyncedFalse();
}
