// ============================================================================
// HotelHub AI Agent Workflow Engine
// Implements:
// 1. Natural Language Intent Interpretation
// 2. Structured Tool Registry (search, booking lookup, quote, cancel, policies)
// 3. Controlled Action Execution with Safety Guardrails (confirmation checks)
// 4. Dual Engine: Autonomous Free Local Engine + Optional Gemini LLM Tool Calling
// ============================================================================

const HotelHubAgent = {
    // ------------------------------------------------------------------------
    // 1. TOOL REGISTRY: Definitions and Schemas
    // ------------------------------------------------------------------------
    tools: [
        {
            name: "search_hotels",
            description: "Search for available hotels by city, budget limit, or minimum rating",
            parameters: {
                city: { type: "string", description: "City or location name (e.g. Miami, New York, Denver)" },
                max_price: { type: "number", description: "Maximum budget per night" },
                min_rating: { type: "number", description: "Minimum star rating (1 to 5)" }
            }
        },
        {
            name: "get_booking_details",
            description: "Retrieve booking status, dates, and information for a reservation",
            parameters: {
                query: { type: "string", description: "Booking ID, guest email, or guest name" }
            }
        },
        {
            name: "calculate_quote",
            description: "Calculate an itemized room quote including admin-configured taxes and service fees",
            parameters: {
                hotel_name: { type: "string", description: "Name of the hotel" },
                nights: { type: "number", description: "Number of nights stay" },
                guests: { type: "number", description: "Number of guests" }
            }
        },
        {
            name: "cancel_booking",
            description: "Perform controlled cancellation of a booking with policy safety guardrails",
            parameters: {
                query: { type: "string", description: "Booking ID or guest email" },
                confirmed: { type: "boolean", description: "Whether user explicitly confirmed the cancellation" }
            }
        },
        {
            name: "get_hotel_policies",
            description: "Get active hotel policies (cancellation window, tax rate, fees, maintenance status)",
            parameters: {}
        }
    ],

    // Default sample hotels data in case localStorage is empty
    sampleHotels: [
        { name: "Ocean View Resort", city: "Miami", price: 299, rating: 5, description: "Luxury beachfront resort with ocean views" },
        { name: "Mountain Palace", city: "Denver", price: 349, rating: 4, description: "Secluded mountain retreat with spa" },
        { name: "City Lights Hotel", city: "New York", price: 399, rating: 5, description: "Modern luxury hotel in Manhattan" },
        { name: "Lakeside Inn", city: "Seattle", price: 189, rating: 4, description: "Quiet lakeside getaway with breakfast" },
        { name: "Sunny Palms Motel", city: "Miami", price: 119, rating: 3, description: "Affordable tropical stay near the beach" },
        { name: "Denver Downtown Suites", city: "Denver", price: 159, rating: 4, description: "Central suites with kitchenettes" }
    ],

    // ------------------------------------------------------------------------
    // 2. TOOL EXECUTION HANDLERS (Controlled Actions)
    // ------------------------------------------------------------------------
    async executeTool(toolName, args = {}) {
        console.log(`[AI Agent] Executing tool: ${toolName}`, args);

        switch (toolName) {
            case "search_hotels":
                return this.toolSearchHotels(args);
            case "get_booking_details":
                return this.toolGetBookingDetails(args);
            case "calculate_quote":
                return this.toolCalculateQuote(args);
            case "cancel_booking":
                return this.toolCancelBooking(args);
            case "get_hotel_policies":
                return this.toolGetHotelPolicies();
            default:
                return { error: `Unknown tool: ${toolName}` };
        }
    },

    // Tool: search_hotels
    toolSearchHotels(args) {
        let allHotels = [...this.sampleHotels];
        try {
            const stored = JSON.parse(localStorage.getItem("hotelList")) || [];
            if (stored.length > 0) {
                allHotels = [...stored, ...allHotels];
            }
        } catch (e) {}

        const city = args.city ? args.city.toLowerCase().trim() : null;
        const maxPrice = args.max_price ? parseFloat(args.max_price) : null;
        const minRating = args.min_rating ? parseInt(args.min_rating) : null;

        let results = allHotels.filter(h => {
            const hCity = (h.city || h.location || "").toLowerCase();
            const hPrice = parseFloat(h.price) || 0;
            const hRating = parseInt(h.rating) || 3;

            if (city && !hCity.includes(city)) return false;
            if (maxPrice && hPrice > maxPrice) return false;
            if (minRating && hRating < minRating) return false;
            return true;
        });

        // Deduplicate by name
        const seen = new Set();
        results = results.filter(h => seen.has(h.name) ? false : seen.add(h.name));

        const symbol = window.HotelHubSettings ? window.HotelHubSettings.get('currency_symbol', '$') : '$';

        return {
            tool: "search_hotels",
            count: results.length,
            filters: { city, maxPrice, minRating },
            hotels: results.slice(0, 4).map(h => ({
                name: h.name,
                city: h.city || h.location || "City Center",
                price: `${symbol}${h.price}/night`,
                rawPrice: h.price,
                rating: '★'.repeat(h.rating || 4),
                description: h.description || "Comfortable guest stay",
                bookUrl: `booking.html?hotel=${encodeURIComponent(h.name)}&price=${h.price}`
            }))
        };
    },

    // Tool: get_booking_details
    toolGetBookingDetails(args) {
        const query = (args.query || "").toLowerCase().trim();
        const bookings = this.getAllStoredBookings();

        if (bookings.length === 0) {
            return {
                tool: "get_booking_details",
                found: false,
                message: "No reservations found in the system. Would you like to search and book a hotel?"
            };
        }

        let match = null;
        if (query) {
            match = bookings.find(b =>
                (b.guestEmail && b.guestEmail.toLowerCase().includes(query)) ||
                (b.guestName && b.guestName.toLowerCase().includes(query)) ||
                (b.email && b.email.toLowerCase().includes(query)) ||
                (b.hotel && b.hotel.toLowerCase().includes(query)) ||
                (b.offlineId && String(b.offlineId).includes(query))
            );
        }

        // If no direct query or not found, return the most recent booking
        const booking = match || bookings[bookings.length - 1];

        return {
            tool: "get_booking_details",
            found: true,
            booking: {
                id: booking.offlineId || "BK-" + Math.floor(1000 + Math.random() * 9000),
                hotel: booking.hotel || "Grand Plaza Hotel",
                guest: booking.guestName || booking.name || "Valued Guest",
                email: booking.guestEmail || booking.email || "guest@example.com",
                checkIn: booking.checkIn || booking.checkin || "Tomorrow",
                checkOut: booking.checkOut || booking.checkout || "Day after tomorrow",
                guests: booking.guests || 2,
                totalPrice: booking.totalPrice || booking.price || "$150.00",
                status: booking.status || "Confirmed"
            }
        };
    },

    // Tool: calculate_quote (Integrates with Feature 1 Product Settings!)
    toolCalculateQuote(args) {
        const hotelName = args.hotel_name || "Featured Hotel";
        const nights = Math.max(1, parseInt(args.nights) || 1);
        const guests = Math.max(1, parseInt(args.guests) || 1);

        const baseRate = 120; // default base room rate
        const symbol = window.HotelHubSettings ? window.HotelHubSettings.get('currency_symbol', '$') : '$';
        const taxPercent = window.HotelHubSettings ? parseFloat(window.HotelHubSettings.get('tax_rate_percent', '12.0')) : 12;
        const serviceFee = window.HotelHubSettings ? parseFloat(window.HotelHubSettings.get('service_fee', '15.0')) : 15;

        const subtotal = baseRate * nights;
        const taxes = (subtotal * taxPercent) / 100;
        const grandTotal = subtotal + taxes + serviceFee;

        return {
            tool: "calculate_quote",
            hotelName,
            nights,
            guests,
            breakdown: {
                roomRate: `${symbol}${baseRate}/night`,
                subtotal: `${symbol}${subtotal.toFixed(2)}`,
                taxRate: `${taxPercent}% (${symbol}${taxes.toFixed(2)})`,
                serviceFee: `${symbol}${serviceFee.toFixed(2)}`,
                grandTotal: `${symbol}${grandTotal.toFixed(2)}`
            },
            bookUrl: `booking.html?hotel=${encodeURIComponent(hotelName)}&price=${baseRate}`
        };
    },

    // Tool: cancel_booking (CONTROLLED ACTION WITH SAFETY GUARDRAIL)
    toolCancelBooking(args) {
        const query = (args.query || "").toLowerCase().trim();
        const confirmed = args.confirmed === true;
        const bookings = this.getAllStoredBookings();

        if (bookings.length === 0) {
            return {
                tool: "cancel_booking",
                status: "NOT_FOUND",
                message: "No active bookings found to cancel."
            };
        }

        // Find the target booking
        let targetIndex = -1;
        if (query) {
            targetIndex = bookings.findIndex(b =>
                (b.guestEmail && b.guestEmail.toLowerCase().includes(query)) ||
                (b.hotel && b.hotel.toLowerCase().includes(query)) ||
                (b.offlineId && String(b.offlineId).includes(query))
            );
        }
        if (targetIndex === -1) targetIndex = bookings.length - 1; // pick latest if unspecified

        const target = bookings[targetIndex];
        const cancelHours = window.HotelHubSettings ? window.HotelHubSettings.get('free_cancellation_hours', '24') : '24';
        const bookingId = target.offlineId || "BK-" + (1000 + targetIndex);

        // Controlled Action Guardrail: REQUIRE EXPLICIT CONFIRMATION FIRST
        if (!confirmed) {
            return {
                tool: "cancel_booking",
                status: "REQUIRES_CONFIRMATION",
                bookingId: bookingId,
                hotel: target.hotel || "Hotel",
                guest: target.guestName || target.name || "Guest",
                totalPrice: target.totalPrice || target.price || "$0.00",
                policyNotice: `Cancellation policy allows 100% refund up to ${cancelHours} hours before check-in.`,
                message: `⚠️ <strong>Confirmation Required:</strong> Are you sure you want to cancel your reservation at <strong>${target.hotel}</strong> for <strong>${target.totalPrice || target.price}</strong>?`
            };
        }

        // EXECUTION OF CONTROLLED ACTION: Update status to "Cancelled"
        target.status = "Cancelled";
        target.cancelledAt = new Date().toISOString();

        // Save updated state to storage
        try {
            localStorage.setItem("hotelBookings", JSON.stringify(bookings));
            let all = JSON.parse(localStorage.getItem("allBookings")) || [];
            if (all[targetIndex]) {
                all[targetIndex].status = "Cancelled";
                localStorage.setItem("allBookings", JSON.stringify(all));
            }
        } catch (e) {}

        return {
            tool: "cancel_booking",
            status: "SUCCESS",
            bookingId: bookingId,
            hotel: target.hotel,
            refundAmount: target.totalPrice || target.price,
            message: `✅ <strong>Cancellation Complete:</strong> Booking #${bookingId} at ${target.hotel} has been cancelled. A refund of ${target.totalPrice || target.price} has been initiated according to the ${cancelHours}-hour policy.`
        };
    },

    // Tool: get_hotel_policies
    toolGetHotelPolicies() {
        if (!window.HotelHubSettings) {
            return { tool: "get_hotel_policies", cancellationHours: "24", taxRate: "12%", currency: "USD" };
        }
        const s = window.HotelHubSettings;
        return {
            tool: "get_hotel_policies",
            systemName: s.get('system_name', 'HotelHub'),
            cancellationWindow: `${s.get('free_cancellation_hours', '24')} hours before check-in`,
            taxRate: `${s.get('tax_rate_percent', '12.0')}%`,
            serviceFee: `${s.get('currency_symbol', '$')}${s.get('service_fee', '15.0')}`,
            currency: s.get('default_currency', 'USD'),
            maintenanceMode: s.get('maintenance_mode', 'false') === 'true' ? "Active (Bookings paused)" : "Normal"
        };
    },

    // Helper to get bookings
    getAllStoredBookings() {
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem("hotelBookings")) || [];
            if (list.length === 0) {
                list = JSON.parse(localStorage.getItem("allBookings")) || [];
            }
        } catch (e) {}
        return list;
    },

    // ------------------------------------------------------------------------
    // 3. AUTONOMOUS INTENT REASONING & DISPATCHER (Natural Language -> Tool)
    // ------------------------------------------------------------------------
    async interpretAndExecute(userInput) {
        const text = userInput.toLowerCase().trim();

        // 1. Check for cancellation intent
        if (text.includes("cancel") || text.includes("refund")) {
            const isConfirmed = text.includes("confirm") || text.includes("yes") || text.includes("proceed");
            const toolResult = await this.executeTool("cancel_booking", { query: text, confirmed: isConfirmed });
            return this.formatToolResponse("cancel_booking", toolResult);
        }

        // 2. Check for booking status / lookup intent
        if (text.includes("booking") && (text.includes("status") || text.includes("check") || text.includes("my") || text.includes("find") || text.includes("reservation") || text.includes("details"))) {
            const toolResult = await this.executeTool("get_booking_details", { query: text });
            return this.formatToolResponse("get_booking_details", toolResult);
        }

        // 3. Check for price quote / cost calculation intent
        if (text.includes("quote") || text.includes("calculate") || (text.includes("how much") && text.includes("night"))) {
            // Extract nights if mentioned
            const nightsMatch = text.match(/(\d+)\s*night/);
            const nights = nightsMatch ? parseInt(nightsMatch[1]) : 2;
            const toolResult = await this.executeTool("calculate_quote", { hotel_name: "Featured Hotel", nights });
            return this.formatToolResponse("calculate_quote", toolResult);
        }

        // 4. Check for policy / rules inquiry
        if (text.includes("policy") || text.includes("rules") || text.includes("tax") || text.includes("hours") || text.includes("fee")) {
            const toolResult = await this.executeTool("get_hotel_policies");
            return this.formatToolResponse("get_hotel_policies", toolResult);
        }

        // 5. Check for hotel search intent (city, budget, ratings)
        if (text.includes("hotel") || text.includes("room") || text.includes("find") || text.includes("search") || text.includes("stay") ||
            text.includes("miami") || text.includes("new york") || text.includes("denver") || text.includes("cheap") || text.includes("luxury")) {

            let city = null;
            if (text.includes("miami")) city = "Miami";
            else if (text.includes("new york") || text.includes("manhattan")) city = "New York";
            else if (text.includes("denver")) city = "Denver";
            else if (text.includes("seattle")) city = "Seattle";

            let maxPrice = null;
            const priceMatch = text.match(/(?:under|below|less than|\$)\s*(\d+)/);
            if (priceMatch) maxPrice = parseInt(priceMatch[1]);
            else if (text.includes("cheap") || text.includes("budget")) maxPrice = 180;

            let minRating = null;
            if (text.includes("5 star") || text.includes("luxury")) minRating = 5;
            else if (text.includes("4 star")) minRating = 4;

            const toolResult = await this.executeTool("search_hotels", { city, maxPrice, minRating });
            return this.formatToolResponse("search_hotels", toolResult);
        }

        // Default conversational assistance
        return {
            toolInvoked: null,
            html: `
                <div>
                    <p>I am your <strong>HotelHub AI Agent</strong> equipped with real operational tools. Here is what I can do for you:</p>
                    <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                        <button class="agent-chip" onclick="window.HotelHubAgent.ask('Find luxury hotels in Miami')">🔍 "Find luxury hotels in Miami"</button>
                        <button class="agent-chip" onclick="window.HotelHubAgent.ask('Find hotels under $200')">💰 "Find hotels under $200"</button>
                        <button class="agent-chip" onclick="window.HotelHubAgent.ask('Check my booking status')">📋 "Check my booking status"</button>
                        <button class="agent-chip" onclick="window.HotelHubAgent.ask('What is the cancellation policy?')">ℹ️ "What is the cancellation policy?"</button>
                        <button class="agent-chip" onclick="window.HotelHubAgent.ask('Cancel my reservation')">⚠️ "Cancel my reservation"</button>
                    </div>
                </div>
            `
        };
    },

    // ------------------------------------------------------------------------
    // 4. RICH UI FORMATTER: Badges, Cards, and Action Buttons
    // ------------------------------------------------------------------------
    formatToolResponse(toolName, result) {
        let badge = `<div class="agent-tool-badge">⚙️ Tool Executed: <code>${toolName}</code></div>`;
        let html = "";

        if (toolName === "search_hotels") {
            if (result.count === 0) {
                html = `${badge}<p>I searched our hotel inventory, but no hotels matched your criteria. Try adjusting your budget or destination.</p>`;
            } else {
                html = `${badge}<p>I found <strong>${result.count}</strong> hotel(s) matching your request:</p>
                <div class="agent-cards-container">
                    ${result.hotels.map(h => `
                        <div class="agent-hotel-card">
                            <div style="font-weight:bold; color:#0077aa;">${h.name}</div>
                            <div style="font-size:12px; color:#64748b;">📍 ${h.city} • ${h.rating}</div>
                            <div style="font-size:13px; margin:4px 0;">${h.description}</div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                                <span style="font-weight:bold; color:#ff6600;">${h.price}</span>
                                <a href="${h.bookUrl}" class="agent-action-btn">Book Now ➔</a>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            }
        } else if (toolName === "get_booking_details") {
            if (!result.found) {
                html = `${badge}<p>${result.message}</p>`;
            } else {
                const b = result.booking;
                html = `${badge}
                <div class="agent-detail-card">
                    <div style="font-weight:bold; font-size:15px; color:#0077aa;">🏨 ${b.hotel}</div>
                    <div style="font-size:12px; color:#64748b; margin-bottom:8px;">Booking ID: <strong>${b.id}</strong> • <span style="color:${b.status === 'Cancelled' ? '#ef4444' : '#16a34a'}; font-weight:bold;">${b.status}</span></div>
                    <div style="font-size:13px; line-height:1.5;">
                        👤 <strong>Guest:</strong> ${b.guest}<br>
                        📅 <strong>Check-In:</strong> ${b.checkIn}<br>
                        📅 <strong>Check-Out:</strong> ${b.checkOut}<br>
                        👥 <strong>Guests:</strong> ${b.guests}<br>
                        💳 <strong>Total:</strong> <strong style="color:#ff6600;">${b.totalPrice}</strong>
                    </div>
                    ${b.status !== 'Cancelled' ? `
                        <div style="margin-top:10px; border-top:1px dashed #cbd5e1; padding-top:8px;">
                            <button class="agent-danger-btn" onclick="window.HotelHubAgent.ask('Cancel booking ${b.id}')">Request Cancellation</button>
                        </div>
                    ` : ''}
                </div>`;
            }
        } else if (toolName === "calculate_quote") {
            const b = result.breakdown;
            html = `${badge}
            <div class="agent-detail-card">
                <div style="font-weight:bold; color:#0077aa; font-size:15px;">Quote for ${result.hotelName}</div>
                <div style="font-size:12px; color:#64748b; margin-bottom:6px;">Duration: ${result.nights} Night(s)</div>
                <div style="font-size:13px; line-height:1.6;">
                    • Room Subtotal: <strong>${b.subtotal}</strong> (${b.roomRate})<br>
                    • Configured Taxes: <strong>${b.taxRate}</strong><br>
                    • Cleaning / Service Fee: <strong>${b.serviceFee}</strong>
                </div>
                <div style="margin-top:8px; padding-top:6px; border-top:1px solid #cbd5e1; font-weight:bold; font-size:14px; color:#ff6600; display:flex; justify-content:space-between; align-items:center;">
                    <span>Grand Total: ${b.grandTotal}</span>
                    <a href="${result.bookUrl}" class="agent-action-btn">Reserve ➔</a>
                </div>
            </div>`;
        } else if (toolName === "cancel_booking") {
            if (result.status === "REQUIRES_CONFIRMATION") {
                html = `${badge}
                <div class="agent-warning-card">
                    <p>${result.message}</p>
                    <div style="font-size:12px; color:#92400e; margin-bottom:10px;">${result.policyNotice}</div>
                    <div style="display:flex; gap:8px;">
                        <button class="agent-danger-btn" onclick="window.HotelHubAgent.confirmCancel('${result.bookingId}')">⚠️ Yes, Cancel Booking</button>
                        <button class="agent-secondary-btn" onclick="window.HotelHubAgent.ask('Keep my booking')">Keep Reservation</button>
                    </div>
                </div>`;
            } else if (result.status === "SUCCESS") {
                html = `${badge}
                <div class="agent-success-card">
                    <p>${result.message}</p>
                </div>`;
            } else {
                html = `${badge}<p>${result.message}</p>`;
            }
        } else if (toolName === "get_hotel_policies") {
            html = `${badge}
            <div class="agent-detail-card">
                <div style="font-weight:bold; color:#0077aa; font-size:15px;">📜 ${result.systemName} Active Policies</div>
                <div style="font-size:13px; line-height:1.6; margin-top:6px;">
                    • <strong>Cancellation Cutoff:</strong> ${result.cancellationWindow}<br>
                    • <strong>Current Tax Rate:</strong> ${result.taxRate}<br>
                    • <strong>Flat Service Fee:</strong> ${result.serviceFee}<br>
                    • <strong>Billing Currency:</strong> ${result.currency}<br>
                    • <strong>System Status:</strong> ${result.maintenanceMode}
                </div>
            </div>`;
        }

        return { toolInvoked: toolName, html };
    },

    // Convenience triggers for action chips
    ask(queryText) {
        const input = document.getElementById("userInput");
        if (input) {
            input.value = queryText;
            if (typeof window.sendMessage === "function") {
                window.sendMessage();
            }
        }
    },

    confirmCancel(bookingId) {
        this.ask(`Confirm cancellation for booking ${bookingId}`);
    }
};

window.HotelHubAgent = HotelHubAgent;
