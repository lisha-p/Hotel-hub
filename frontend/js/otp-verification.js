// OTP Verification System
let generatedOTP = "";
let verifiedPhone = "";

// Send OTP
function sendOTP() {
    const phoneInput = document.getElementById("phone");
    const phone = phoneInput.value.trim();
    
    if (!phone) {
        alert("Please enter your phone number");
        return;
    }
    
    // Validate phone format (simple validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        alert("Please enter a valid phone number");
        return;
    }
    
    // Generate random 4-digit OTP
    generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    
    // In a real application, you would send this via SMS
    // For demo purposes, we'll just show it
    console.log(`OTP for ${phone}: ${generatedOTP}`);
    alert(`Demo: OTP sent to ${phone}. In a real app, this would be sent via SMS.\nYour OTP is: ${generatedOTP}`);
    
    // Show next step
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    
    // Store the phone for verification
    verifiedPhone = phone;
}

// Verify OTP
function verifyOTP() {
    const otpInput = document.getElementById("otp");
    const enteredOTP = otpInput.value.trim();
    const statusElement = document.getElementById("otpStatus");
    
    if (!enteredOTP) {
        statusElement.textContent = "Please enter the OTP";
        statusElement.className = "error-message";
        return;
    }
    
    if (enteredOTP === generatedOTP) {
        statusElement.textContent = "✓ OTP verified successfully!";
        statusElement.className = "success-message";
        
        // Store verification in localStorage
        localStorage.setItem(`verified_${verifiedPhone}`, "true");
        
        // Show next step after delay
        setTimeout(() => {
            document.getElementById("step2").style.display = "none";
            document.getElementById("step3").style.display = "block";
        }, 1500);
    } else {
        statusElement.textContent = "✗ Invalid OTP. Please try again.";
        statusElement.className = "error-message";
        
        // Clear the input
        otpInput.value = "";
    }
}

// Submit review
function submitReview() {
    const hotelSelect = document.getElementById("reviewHotel");
    const ratingInput = document.getElementById("rating");
    const commentInput = document.getElementById("comment");
    
    const hotel = hotelSelect.value;
    const rating = ratingInput.value;
    const comment = commentInput.value.trim();
    
    // Validation
    if (!hotel) {
        alert("Please select a hotel");
        return;
    }
    
    if (rating === "0") {
        alert("Please provide a rating");
        return;
    }
    
    if (!comment) {
        alert("Please write a review comment");
        return;
    }
    
    // Create review object
    const review = {
        phone: verifiedPhone,
        hotel: hotel,
        rating: parseInt(rating),
        comment: comment,
        date: new Date().toISOString(),
        verified: true
    };
    
    // Save to localStorage & send real POST /api/reviews/submit to backend
    if (window.HotelHubAPI && window.HotelHubAPI.reviews) {
        window.HotelHubAPI.reviews.submit(review, generatedOTP);
    } else {
        let reviews = JSON.parse(localStorage.getItem("hotelReviews")) || [];
        reviews.push(review);
        localStorage.setItem("hotelReviews", JSON.stringify(reviews));
    }
    
    // Show success message
    alert("Thank you! Your review has been submitted successfully.");
    
    // Reset form
    resetReviewForm();
}

// Reset review form
function resetReviewForm() {
    document.getElementById("step3").style.display = "none";
    document.getElementById("step1").style.display = "block";
    
    // Clear inputs
    document.getElementById("phone").value = "";
    document.getElementById("otp").value = "";
    document.getElementById("reviewHotel").selectedIndex = 0;
    document.getElementById("rating").value = "0";
    document.getElementById("comment").value = "";
    
    // Reset stars
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
    
    // Clear OTP status
    document.getElementById("otpStatus").textContent = "";
    
    // Reset variables
    generatedOTP = "";
    verifiedPhone = "";
}

// Check if phone is already verified
function isPhoneVerified(phone) {
    return localStorage.getItem(`verified_${phone}`) === "true";
}