package com.hotelhub.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "guest_name", nullable = false)
    private String guestName;
    
    @Column(name = "guest_email", nullable = false)
    private String guestEmail;
    
    @Column(name = "guest_phone")
    private String guestPhone;
    
    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;
    
    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;
    
    private Integer guests;
    
    @Column(name = "total_price")
    private Double totalPrice;
    
    private String status;
    
    @Column(name = "booking_date")
    private LocalDateTime bookingDate;
    
    private Boolean synced = true;
    
    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;
    
    // Constructors
    public Booking() {}
    
    public Booking(String guestName, String guestEmail, String guestPhone, 
                   LocalDate checkIn, LocalDate checkOut, Integer guests, 
                   Double totalPrice, Hotel hotel) {
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.guestPhone = guestPhone;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.guests = guests;
        this.totalPrice = totalPrice;
        this.hotel = hotel;
        this.status = "CONFIRMED";
        this.bookingDate = LocalDateTime.now();
        this.synced = true;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    
    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }
    
    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }
    
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    
    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }
    
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
    
    public Hotel getHotel() { return hotel; }
    public void setHotel(Hotel hotel) { this.hotel = hotel; }
    
    public Boolean getSynced() { return synced; }
    public void setSynced(Boolean synced) { this.synced = synced; }
}
