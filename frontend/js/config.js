// =============================================
// HotelHub API & System Configuration Manager
// =============================================

// Base URL for Spring Boot Backend.
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://hotelhub-backend-b2ei.onrender.com';

/**
 * Helper to build full API endpoint URLs.
 */
function apiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

/**
 * System Settings Manager
 * Provides dual-mode operation:
 * 1. Syncs with backend API (/api/settings) when backend is running.
 * 2. Seamlessly falls back to localStorage when running offline/standalone.
 */
const HotelHubSettings = {
    // Default baseline system configuration
    defaults: {
        system_name: "HotelHub",
        maintenance_mode: "false",
        default_currency: "USD",
        currency_symbol: "$",
        tax_rate_percent: "12.0",
        service_fee: "15.0",
        free_cancellation_hours: "24",
        max_booking_advance_days: "180",
        auto_confirm_bookings: "true",
        support_email: "support@hotelhub.com"
    },

    storageKey: "hotelhub_system_settings",

    /**
     * Get settings synchronously from cached localStorage or defaults
     */
    getCached() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                return { ...this.defaults, ...JSON.parse(raw) };
            }
        } catch (e) {
            console.warn("Could not read cached settings:", e);
        }
        return { ...this.defaults };
    },

    /**
     * Get single setting value synchronously
     */
    get(key, fallback = null) {
        const cached = this.getCached();
        if (cached && cached[key] !== undefined) {
            return cached[key];
        }
        return fallback !== null ? fallback : this.defaults[key];
    },

    /**
     * Load settings from backend API, updating cache on success.
     * Gracefully falls back to cached/defaults if backend is offline.
     */
    async load() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            const response = await fetch(apiUrl('/api/settings'), {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.settingsMap) {
                    const merged = { ...this.defaults, ...data.settingsMap };
                    localStorage.setItem(this.storageKey, JSON.stringify(merged));
                    return { source: 'backend', settings: merged };
                }
            }
        } catch (err) {
            // Backend offline or unreachable — silently fall back
        }

        const cached = this.getCached();
        return { source: 'local', settings: cached };
    },

    /**
     * Save settings to backend API and local storage
     */
    async save(settingsMap) {
        // Always save locally first so changes take effect immediately
        const current = this.getCached();
        const merged = { ...current, ...settingsMap };
        localStorage.setItem(this.storageKey, JSON.stringify(merged));

        let backendSaved = false;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const response = await fetch(apiUrl('/api/settings'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(merged),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                backendSaved = true;
            }
        } catch (err) {
            backendSaved = false;
        }

        return { success: true, backendSaved: backendSaved, settings: merged };
    },

    /**
     * Reset settings to system factory defaults
     */
    async reset() {
        return await this.save(this.defaults);
    },

    /**
     * Format a price according to currently configured currency
     */
    formatPrice(amount) {
        const symbol = this.get('currency_symbol', '$');
        const num = parseFloat(amount) || 0;
        return `${symbol}${num.toFixed(2)}`;
    }
};

// Make available globally
window.HotelHubSettings = HotelHubSettings;
