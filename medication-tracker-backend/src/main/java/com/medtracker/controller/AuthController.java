package com.medtracker.controller;

import com.medtracker.entity.User;
import com.medtracker.repository.UserRepository;
import com.medtracker.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired private UserRepository repo;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtUtil jwt;
    @Autowired private AuthenticationManager authManager;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        logger.info("Registration attempt for email: {}", user.getEmail());
        try {
            user.setPassword(encoder.encode(user.getPassword()));
            repo.save(user);
            logger.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok("User registered successfully");
        } 
        catch (Exception e) {
            logger.error("Registration failed for {}: {}", user.getEmail(), e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            // Authenticate user
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );

            // Fetch user from DB
            Optional<User> optionalUser = repo.findByEmail(user.getEmail());
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }

            User dbUser = optionalUser.get();

            // Generate JWT token
            String token = jwt.generateToken(dbUser.getEmail(), dbUser.getRole());

            // Response JSON
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", dbUser.getRole());
            response.put("profileCompleted", dbUser.isProfileCompleted());
            response.put("userId", dbUser.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401).body("Login failed! Check credentials.");
        }
    }
}
