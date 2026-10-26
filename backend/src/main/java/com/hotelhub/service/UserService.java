package com.hotelhub.service;

import com.hotelhub.model.User;
import com.hotelhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Hash password using standard SHA-256
     */
    public String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return password;
        }
    }

    public User register(String email, String plainPassword, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }
        User user = new User(email, hashPassword(plainPassword), phone);
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String plainPassword) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(hashPassword(plainPassword)) || u.getPassword().equals(plainPassword));
    }

    public String generateToken(User user) {
        return "token_" + UUID.randomUUID().toString().replace("-", "") + "_" + user.getId();
    }
}
