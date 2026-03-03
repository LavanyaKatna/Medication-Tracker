package com.medtracker.controller;

import com.medtracker.entity.Prescription;
import com.medtracker.entity.User;
import com.medtracker.repository.UserRepository;
import com.medtracker.service.PrescriptionAuditService;
import com.medtracker.service.PrescriptionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/users")
    public List<User> allUsers() {
        return userRepo.findAll();
    }

    // For doctor's patient dropdown
    @GetMapping("/patients")
    public List<User> allPatients() {
        return userRepo.findByRole("PATIENT");
    }
    @Autowired
private PrescriptionAuditService auditService;
@Autowired
private PrescriptionService prescriptionService;
@PutMapping("/{id}/approve")
public ResponseEntity<?> approvePrescription(@PathVariable Long id, @RequestBody Map<String, Object> body) {
    Long adminId = Long.valueOf(body.get("adminId").toString());

    // Get the Prescription object first
    Prescription p = prescriptionService.approvePrescription(id, adminId);

    // Log audit using Prescription object
    auditService.log(p, p.getDoctor(), "APPROVED", "Prescription approved by admin");

    return ResponseEntity.ok().build();
}

@PutMapping("/{id}/reject")
public ResponseEntity<?> rejectPrescription(@PathVariable Long id, @RequestBody Map<String, Object> body) {
    Long adminId = Long.valueOf(body.get("adminId").toString());
    String reason = body.get("reason").toString();

    // Get the Prescription object first
    Prescription p = prescriptionService.rejectPrescription(id, adminId, reason);

    // Log audit using Prescription object
    auditService.log(p, p.getDoctor(), "REJECTED", "Prescription rejected: " + reason);

    return ResponseEntity.ok().build();
}
}
