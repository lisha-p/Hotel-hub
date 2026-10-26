package com.hotelhub.controller;

import com.hotelhub.model.SystemSetting;
import com.hotelhub.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    /**
     * Get all system settings as a key-value dictionary and list.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSettings() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("settingsMap", systemSettingService.getSettingsAsMap());
        response.put("settingsList", systemSettingService.getAllSettings());
        return ResponseEntity.ok(response);
    }

    /**
     * Get single setting value by key.
     */
    @GetMapping("/{key}")
    public ResponseEntity<Map<String, Object>> getSetting(@PathVariable String key) {
        Map<String, Object> response = new HashMap<>();
        return systemSettingService.getSetting(key)
                .map(s -> {
                    response.put("success", true);
                    response.put("setting", s);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("message", "Setting not found: " + key);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Update batch system configuration settings.
     */
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, String> settings) {
        Map<String, String> updated = systemSettingService.updateBatchSettings(settings);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "System settings successfully updated");
        response.put("settings", updated);
        return ResponseEntity.ok(response);
    }

    /**
     * Update a single setting by key.
     */
    @PutMapping("/{key}")
    public ResponseEntity<Map<String, Object>> updateSingleSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> payload) {
        String value = payload.get("value");
        if (value == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing 'value' in request body"));
        }
        SystemSetting updated = systemSettingService.updateSetting(key, value);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Setting updated",
                "setting", updated
        ));
    }
}
