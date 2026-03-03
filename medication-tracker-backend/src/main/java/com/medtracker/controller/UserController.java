package com.medtracker.controller;

import com.medtracker.entity.User;
import com.medtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;   // ✅ FIX

    @GetMapping("/patients")
    public List<User> getAllPatients() {
        return userRepository.findByRole("PATIENT");
    }
}