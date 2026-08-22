// Theme and Font Size Controls
const themeToggle = document.getElementById("themeToggle");
const decreaseBtn = document.getElementById("decreaseBtn");
const increaseBtn = document.getElementById("increaseBtn");

let size = localStorage.getItem("fontSize") ? parseInt(localStorage.getItem("fontSize")) : 16;
document.body.style.fontSize = size + "px";

// Initialize theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
}

// Theme toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Font size controls
increaseBtn.addEventListener("click", () => {
    if (size < 40) {
        size++;
        document.body.style.fontSize = size + "px";
        localStorage.setItem("fontSize", size);
    }
});

decreaseBtn.addEventListener("click", () => {
    if (size > 10) {
        size--;
        document.body.style.fontSize = size + "px";
        localStorage.setItem("fontSize", size);
    }
});

// Load popular hotels
function loadPopularHotels() {
    const hotels = [
        {
            name: "Ocean View Resort",
            location: "Miami",
            description: "Luxury beachfront resort with stunning ocean views",
            price: 299,
            rating: 5,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        },
        {
            name: "Mountain Palace",
            location: "Denver",
            description: "Secluded mountain retreat with spa and fine dining",
            price: 349,
            rating: 4,
            image: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        },
        {
            name: "City Lights Hotel",
            location: "New York",
            description: "Modern hotel in the heart of Manhattan",
            price: 399,
            rating: 5,
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        }
    ];

    const hotelGrid = document.getElementById("popularHotels");
    hotelGrid.innerHTML = "";

    hotels.forEach(hotel => {
        const hotelCard = document.createElement("div");
        hotelCard.className = "hotel-card";
        hotelCard.innerHTML = `
            <img src="${hotel.image}" alt="${hotel.name}">
            <div class="hotel-card-content">
                <h3>${hotel.name}</h3>
                <p><strong>Location:</strong> ${hotel.location}</p>
                <p>${hotel.description}</p>
                <p><strong>Price:</strong> $${hotel.price}/night</p>
                <p><strong>Rating:</strong> ${'★'.repeat(hotel.rating)}</p>
                <button class="btn" onclick="window.location.href='booking.html'">Book Now</button>
            </div>
        `;
        hotelGrid.appendChild(hotelCard);
    });
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    loadPopularHotels();
    
    // Initialize star rating
    initializeStarRating();
    
    // Load hotels for review dropdown
    loadHotelsForReview();
});

// Star rating functionality
function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            ratingInput.value = rating;
            
            // Update star display
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
}

// Load hotels for review dropdown
function loadHotelsForReview() {
    const hotels = [
        "Ocean View Resort - Miami",
        "Mountain Palace - Denver", 
        "City Lights Hotel - New York",
        "Lakeside Inn - Seattle",
        "Royal Garden - Los Angeles",
        "Beachfront Retreat - San Diego"
    ];
    
    const select = document.getElementById('reviewHotel');
    hotels.forEach(hotel => {
        const option = document.createElement('option');
        option.value = hotel;
        option.textContent = hotel;
        select.appendChild(option);
    });
}