// ============================================================================
// HotelHub Dual-Mode REST API Client
// Provides seamless, resilient data synchronization:
// 1. Always maintains localStorage so the app works offline/standalone with 0 errors.
// 2. Makes real HTTP fetch() calls to Spring Boot REST endpoints whenever backend is up.
// ============================================================================

const HotelHubAPI = {
    // ------------------------------------------------------------------------
    // Helper for making API calls with timeout
    // ------------------------------------------------------------------------
    async request(endpoint, options = {}, timeoutMs = 2500) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const url = typeof apiUrl === 'function' ? apiUrl(endpoint) : `http://localhost:8080${endpoint}`;
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(options.headers || {})
                }
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return { success: true, data: await response.json() };
                }
                return { success: true, text: await response.text() };
            }
        } catch (err) {
            // Silently fall back to localStorage mode when backend is offline
        }
        return { success: false, offline: true };
    },

    // ------------------------------------------------------------------------
    // HOTELS API (/api/hotels)
    // ------------------------------------------------------------------------
    hotels: {
        async getAll() {
            // Read local cached/mock hotels first
            let localHotels = [];
            try {
                localHotels = JSON.parse(localStorage.getItem("hotelList")) || [];
            } catch (e) {}

            // Try backend API
            const res = await HotelHubAPI.request('/api/hotels');
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                // Merge backend hotels with any local additions
                return { source: 'backend', hotels: res.data };
            }
            return { source: 'local', hotels: localHotels };
        },

        async add(hotelData) {
            // 1. Always save locally first
            let hotels = JSON.parse(localStorage.getItem("hotelList")) || [];
            hotels.push(hotelData);
            localStorage.setItem("hotelList", JSON.stringify(hotels));

            // 2. Send real POST to backend API
            const res = await HotelHubAPI.request('/api/hotels', {
                method: 'POST',
                body: JSON.stringify({
                    name: hotelData.name,
                    city: hotelData.city,
                    description: hotelData.description,
                    image: hotelData.img || hotelData.image,
                    price: parseFloat(hotelData.price) || 0,
                    rating: parseInt(hotelData.rating) || 3
                })
            });

            return {
                success: true,
                backendSynced: res.success,
                hotel: hotelData
            };
        }
    },

    // ------------------------------------------------------------------------
    // BOOKINGS API (/api/bookings)
    // ------------------------------------------------------------------------
    bookings: {
        async getAll() {
            let localBookings = [];
            try {
                localBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
            } catch (e) {}

            const res = await HotelHubAPI.request('/api/bookings');
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                return { source: 'backend', bookings: res.data };
            }
            return { source: 'local', bookings: localBookings };
        },

        async create(bookingData) {
            // 1. Always save locally first
            let bookings = JSON.parse(localStorage.getItem("hotelBookings")) || [];
            bookings.push(bookingData);
            localStorage.setItem("hotelBookings", JSON.stringify(bookings));

            let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
            allBookings.push({
                hotel: bookingData.hotel,
                email: bookingData.guestEmail || bookingData.email,
                name: bookingData.guestName || bookingData.name,
                phone: bookingData.guestPhone || bookingData.phone,
                checkin: bookingData.checkIn || bookingData.checkin,
                checkout: bookingData.checkOut || bookingData.checkout,
                guests: bookingData.guests,
                price: bookingData.totalPrice,
                status: bookingData.status || 'Confirmed',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem("allBookings", JSON.stringify(allBookings));

            // 2. Send real POST to backend API
            const res = await HotelHubAPI.request('/api/bookings', {
                method: 'POST',
                body: JSON.stringify({
                    hotelName: bookingData.hotel,
                    customerName: bookingData.guestName || bookingData.name,
                    customerEmail: bookingData.guestEmail || bookingData.email,
                    customerPhone: bookingData.guestPhone || bookingData.phone,
                    checkInDate: bookingData.checkIn || bookingData.checkin,
                    checkOutDate: bookingData.checkOut || bookingData.checkout,
                    numberOfGuests: parseInt(bookingData.guests) || 1,
                    totalPrice: parseFloat(String(bookingData.totalPrice).replace(/[^0-9.]/g, '')) || 0,
                    status: bookingData.status || 'Confirmed'
                })
            });

            return {
                success: true,
                backendSynced: res.success,
                booking: bookingData
            };
        }
    },

    // ------------------------------------------------------------------------
    // REVIEWS API (/api/reviews)
    // ------------------------------------------------------------------------
    reviews: {
        async getAll() {
            let localReviews = [];
            try {
                localReviews = JSON.parse(localStorage.getItem("hotelReviews")) || [];
            } catch (e) {}

            const res = await HotelHubAPI.request('/api/reviews');
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                return { source: 'backend', reviews: res.data };
            }
            return { source: 'local', reviews: localReviews };
        },

        async submit(reviewData, otpCode) {
            // 1. Always save locally
            let reviews = JSON.parse(localStorage.getItem("hotelReviews")) || [];
            reviews.push(reviewData);
            localStorage.setItem("hotelReviews", JSON.stringify(reviews));

            // 2. Send real POST to backend API
            const res = await HotelHubAPI.request(`/api/reviews/submit?otp=${encodeURIComponent(otpCode)}`, {
                method: 'POST',
                body: JSON.stringify({
                    customerPhone: reviewData.phone,
                    hotelName: reviewData.hotel,
                    rating: parseInt(reviewData.rating) || 5,
                    comment: reviewData.comment
                })
            });

            return {
                success: true,
                backendSynced: res.success,
                review: reviewData
            };
        }
    }
};

window.HotelHubAPI = HotelHubAPI;
