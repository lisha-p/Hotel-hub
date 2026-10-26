describe("HotelHub frontend", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("renders the home page and popular hotel cards", () => {
    cy.visit("/index.html");

    cy.contains("h1", "Your Smart Hotel Booking Assistant").should("be.visible");
    cy.get("#popularHotels .hotel-card").should("have.length", 3);
  });

  it("filters hotels by city and guest capacity and resets the filters", () => {
    cy.visit("/search.html");

    cy.get("#hotelGrid .hotel-card").should("have.length", 6);
    cy.get("#location").type("miami");
    cy.get("#hotelGrid .hotel-card").should("have.length", 1)
      .and("contain.text", "Ocean View Resort");

    cy.get("#location").clear();
    cy.get("#guests").select("4");
    cy.get("#hotelGrid .hotel-card").should("have.length", 4);

    cy.contains("button", "Reset").click();
    cy.get("#hotelGrid .hotel-card").should("have.length", 6);
    cy.get("#pagination button").should("have.length", 4);
  });

  it("shows an empty state when no hotel matches", () => {
    cy.visit("/search.html");
    cy.get("#location").type("no-such-hotel");

    cy.get("#noResults").should("be.visible").and("contain.text", "No hotels found");
    cy.get("#pagination").should("not.be.visible");
  });

  it("rejects invalid login credentials", () => {
    cy.visit("/login.html");
    cy.on("window:alert", (message) => {
      expect(message).to.contain("Invalid credentials");
    });
    cy.get("#email").type("user@example.com");
    cy.get("#password").type("wrong-password");
    cy.get("#loginBtn").click();
  });

  it("accepts the configured demo login credentials", () => {
    cy.visit("/login.html");
    cy.on("window:alert", (message) => {
      expect(message).to.contain("Login Successful");
    });
    cy.get("#email").type("user@example.com");
    cy.get("#password").type("1234");
    cy.get("#loginBtn").click();

    cy.location("pathname").should("include", "search.html");
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem("hotelUsers"))).to.have.length(1);
    });
  });

  it("validates and stores an online booking before opening payment", () => {
    cy.visit("/booking.html?hotel=Ocean%20View%20Resort&price=120");

    cy.get("#hotel").should("have.value", "Ocean View Resort");
    cy.get("#totalPrice").should("have.value", "$120");
    cy.on("window:alert", (message) => {
      expect(message).to.contain("Please fill all fields");
    });
    cy.contains("button", "Confirm Booking").click();

    cy.get("#name").type("Test Guest");
    cy.get("#email").type("guest@example.com");
    cy.get("#phone").type("5551234567");
    cy.get("#checkin").type("2027-01-10");
    cy.get("#checkout").type("2027-01-12");
    cy.contains("button", "Confirm Booking").click();

    cy.get("#successMsg").should("be.visible");
    cy.window().then((win) => {
      const bookings = JSON.parse(win.localStorage.getItem("hotelBookings"));
      expect(bookings).to.have.length(1);
      expect(bookings[0]).to.include({
        guestName: "Test Guest",
        guestEmail: "guest@example.com",
        hotel: "Ocean View Resort"
      });
    });

    cy.location("pathname").should("include", "payment.html");
  });

  it("sends and verifies the demo OTP, then saves a review", () => {
    let generatedOtp;
    const alerts = [];
    cy.on("window:alert", (message) => {
      alerts.push(message);
      const match = message.match(/Your OTP is: (\d{4})/);
      if (match) generatedOtp = match[1];
    });
    cy.visit("/index.html");

    cy.get("#customerName").type("Test Reviewer");
    cy.get("#customerEmail").type("reviewer@example.com");
    cy.get("#phone").type("5551234567");
    cy.contains("button", "Send OTP").click();
    cy.get("#step2").should("be.visible");

    cy.then(() => {
      expect(generatedOtp).to.match(/^\d{4}$/);
      cy.get("#otp").type(generatedOtp);
    });
    cy.contains("button", "Verify OTP").click();
    cy.get("#otpStatus").should("contain.text", "OTP verified");
    cy.get("#step3").should("be.visible");

    cy.get("#reviewHotel").select("Ocean View Resort - Miami");
    cy.get('.star[data-rating="5"]').click();
    cy.get("#comment").type("A comfortable stay.");
    cy.contains("button", "Submit Review").click();
    cy.then(() => {
      expect(alerts.join("\n")).to.contain("review has been submitted successfully");
    });

    cy.window().then((win) => {
      const reviews = JSON.parse(win.localStorage.getItem("hotelReviews"));
      expect(reviews).to.have.length(1);
      expect(reviews[0]).to.include({
        customerName: "Test Reviewer",
        customerEmail: "reviewer@example.com",
        rating: 5,
        comment: "A comfortable stay.",
        verified: true
      });
    });
  });
});
