package com.medtracker.controller;

import com.medtracker.entity.Prescription;
import com.medtracker.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/patient")
public class PatientController {

    @Autowired
    private PrescriptionRepository prescriptionRepo;

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/prescriptions")
    public String prescriptions() {
        return "Patient prescriptions data";
    }

    @GetMapping("/prescriptions/{userId}")
    public List<Prescription> getMyPrescriptions(@PathVariable Long userId) {
        return prescriptionRepo.findByPatientId(userId);
    }

}
