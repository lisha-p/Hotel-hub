package com.hotelhub.service;

import com.hotelhub.model.SystemSetting;
import com.hotelhub.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingService {

    private final SystemSettingRepository repository;

    /**
     * Seed default system configuration settings on startup if they don't already exist.
     */
    @PostConstruct
    @Transactional
    public void initDefaultSettings() {
        try {
            Map<String, String[]> defaults = new LinkedHashMap<>();
            // key -> [value, category, description]
            defaults.put("system_name", new String[]{"HotelHub", "GENERAL", "Application display name"});
            defaults.put("maintenance_mode", new String[]{"false", "GENERAL", "Enable to temporarily disable guest bookings"});
            defaults.put("default_currency", new String[]{"USD", "PRICING", "Default currency symbol/code (USD, EUR, GBP, INR)"});
            defaults.put("currency_symbol", new String[]{"$", "PRICING", "Currency symbol displayed across the site"});
            defaults.put("tax_rate_percent", new String[]{"12.0", "PRICING", "Percentage tax applied to room bookings"});
            defaults.put("service_fee", new String[]{"15.0", "PRICING", "Flat service/cleaning fee in configured currency"});
            defaults.put("free_cancellation_hours", new String[]{"24", "BOOKING_POLICY", "Free cancellation cutoff hours before check-in"});
            defaults.put("max_booking_advance_days", new String[]{"180", "BOOKING_POLICY", "How many days in advance guests can reserve rooms"});
            defaults.put("auto_confirm_bookings", new String[]{"true", "BOOKING_POLICY", "Automatically confirm bookings without manual admin approval"});
            defaults.put("support_email", new String[]{"support@hotelhub.com", "GENERAL", "Customer support email displayed on receipts"});

            for (Map.Entry<String, String[]> entry : defaults.entrySet()) {
                String key = entry.getKey();
                if (!repository.existsBySettingKey(key)) {
                    String[] meta = entry.getValue();
                    SystemSetting setting = SystemSetting.builder()
                            .settingKey(key)
                            .settingValue(meta[0])
                            .category(meta[1])
                            .description(meta[2])
                            .build();
                    repository.save(setting);
                    log.info("Initialized default system setting: {} = {}", key, meta[0]);
                }
            }
        } catch (Exception e) {
            log.warn("Could not seed default settings into database (database might not be initialized yet): {}", e.getMessage());
        }
    }

    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
    }

    public Map<String, String> getSettingsAsMap() {
        Map<String, String> map = new HashMap<>();
        repository.findAll().forEach(s -> map.put(s.getSettingKey(), s.getSettingValue()));
        return map;
    }

    public Optional<SystemSetting> getSetting(String key) {
        return repository.findBySettingKey(key);
    }

    public String getValueOrDefault(String key, String defaultValue) {
        return repository.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = repository.findBySettingKey(key)
                .orElseGet(() -> SystemSetting.builder()
                        .settingKey(key)
                        .category("CUSTOM")
                        .description("Custom system setting")
                        .build());
        setting.setSettingValue(value);
        return repository.save(setting);
    }

    @Transactional
    public Map<String, String> updateBatchSettings(Map<String, String> newSettings) {
        for (Map.Entry<String, String> entry : newSettings.entrySet()) {
            updateSetting(entry.getKey(), entry.getValue());
        }
        return getSettingsAsMap();
    }
}
