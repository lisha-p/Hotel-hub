package com.hotelhub.controller;

import com.hotelhub.model.User;
import com.hotelhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        String phone = payload.get("phone");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and password are required"));
        }

        try {
            User user = userService.register(email, password, phone);
            String token = userService.generateToken(user);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "User registered successfully");
            resp.put("token", token);
            resp.put("user", Map.of("id", user.getId(), "email", user.getEmail()));
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        return userService.authenticate(email, password)
                .map(user -> {
                    String token = userService.generateToken(user);
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("success", true);
                    resp.put("message", "Login successful");
                    resp.put("token", token);
                    resp.put("user", Map.of("id", user.getId(), "email", user.getEmail()));
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid email or password")));
    }

    @PostMapping("/admin-login")
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        // Standard HotelHub administrative credentials
        if ("hotelhub".equals(username) && "hotelhub@123".equals(password)) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Admin authentication successful");
            resp.put("token", "admin_jwt_" + System.currentTimeMillis());
            resp.put("role", "ROLE_ADMIN");
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid admin credentials"));
    }
}
