// Offline Booking and Sync System
let offlineBookings = JSON.parse(localStorage.getItem("offlineBookings")) || [];
let isOnline = navigator.onLine;

// Initialize offline functionality
document.addEventListener("DOMContentLoaded", function() {
    // Check online status
    updateOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Try to sync any pending offline bookings
    if (isOnline) {
        syncOfflineBookings();
    }
});

// Update online status indicator
function updateOnlineStatus() {
    const indicator = document.getElementById("offlineIndicator");
    
    if (isOnline) {
        indicator.style.display = "none";
    } else {
        indicator.style.display = "block";
    }
}

// Handle going online
function handleOnline() {
    isOnline = true;
    updateOnlineStatus();
    
    // Show sync message
    showSyncMessage("Connection restored. Syncing offline bookings...");
    
    // Sync offline bookings
    syncOfflineBookings();
}

// Handle going offline
function handleOffline() {
    isOnline = false;
    updateOnlineStatus();
    
    // Show offline message
    showSyncMessage("You are now offline. Bookings will be saved locally.");
}

// Show sync status message
function showSyncMessage(message) {
    // Create or update sync message element
    let syncMessage = document.getElementById("syncMessage");
    if (!syncMessage) {
        syncMessage = document.createElement("div");
        syncMessage.id = "syncMessage";
        syncMessage.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1003;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(syncMessage);
    }
    
    syncMessage.textContent = message;
    syncMessage.style.display = "block";
    
    // Hide after 3 seconds
    setTimeout(() => {
        syncMessage.style.display = "none";
    }, 3000);
}

// Save booking offline
function saveBookingOffline(bookingData) {
    // Add offline ID and timestamp
    const offlineBooking = {
        ...bookingData,
        offlineId: Date.now().toString(),
        createdAt: new Date().toISOString(),
        synced: false
    };
    
    // Add to offline bookings
    offlineBookings.push(offlineBooking);
    localStorage.setItem("offlineBookings", JSON.stringify(offlineBookings));
    
    return offlineBooking.offlineId;
}

// Sync offline bookings with server
async function syncOfflineBookings() {
    if (!isOnline || offlineBookings.length === 0) return;
    
    const unsyncedBookings = offlineBookings.filter(booking => !booking.synced);
    
    if (unsyncedBookings.length === 0) return;
    
    try {
        // Show syncing indicator
        showSyncMessage(`Syncing ${unsyncedBookings.length} offline booking(s)...`);
        
        // In a real app, you would send these to your backend
        // For demo, we'll simulate API calls
        for (const booking of unsyncedBookings) {
            // Simulate API call
            await simulateApiCall(booking);
            
            // Mark as synced
            booking.synced = true;
        }
        
        // Update localStorage
        localStorage.setItem("offlineBookings", JSON.stringify(offlineBookings));
        
        // Show success message
        showSyncMessage("All offline bookings synced successfully!");
        
    } catch (error) {
        console.error("Failed to sync offline bookings:", error);
        showSyncMessage("Failed to sync some bookings. They will be retried later.");
    }
}

// Simulate API call (replace with actual backend call)
function simulateApiCall(booking) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random failures (10% chance)
            if (Math.random() < 0.1) {
                reject(new Error("Network error"));
            } else {
                console.log("Booking synced:", booking);
                resolve(booking);
            }
        }, 1000);
    });
}

// Create offline booking
function createOfflineBooking(bookingData) {
    if (isOnline) {
        // If online, try to send directly to server
        return createOnlineBooking(bookingData);
    } else {
        // If offline, save locally
        const offlineId = saveBookingOffline(bookingData);
        showSyncMessage("Booking saved offline. It will sync when connection is restored.");
        return Promise.resolve({ offlineId, synced: false });
    }
}

// Create online booking (simulated)
function createOnlineBooking(bookingData) {
    return new Promise((resolve, reject) => {
        // Simulate API call
        setTimeout(() => {
            if (Math.random() < 0.05) { // 5% failure rate for demo
                reject(new Error("Booking failed. Please try again."));
            } else {
                const response = {
                    id: Math.floor(Math.random() * 10000),
                    ...bookingData,
                    synced: true
                };
                resolve(response);
            }
        }, 1500);
    });
}

// Get offline bookings count
function getOfflineBookingsCount() {
    return offlineBookings.filter(booking => !booking.synced).length;
}

// Example usage in booking form
function submitBookingForm() {
    const bookingData = {
        guestName: document.getElementById("name").value,
        guestEmail: document.getElementById("email").value,
        guestPhone: document.getElementById("phone").value,
        checkIn: document.getElementById("checkin").value,
        checkOut: document.getElementById("checkout").value,
        guests: document.getElementById("guests").value,
        hotel: document.getElementById("hotel").value,
        totalPrice: calculateTotalPrice()
    };
    
    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;
    
    createOfflineBooking(bookingData)
        .then(result => {
            if (result.synced) {
                alert("Booking confirmed! You will receive a confirmation email.");
            } else {
                alert("Booking saved offline! It will be confirmed when connection is restored.");
            }
            // Redirect or clear form
            window.location.href = "confirmation.html";
        })
        .catch(error => {
            alert("Booking failed: " + error.message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Calculate total price (example function)
function calculateTotalPrice() {
    // This would calculate based on dates and hotel price
    return 299; // Example fixed price
}