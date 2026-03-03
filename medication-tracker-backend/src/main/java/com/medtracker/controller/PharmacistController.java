package com.medtracker.controller;

import com.medtracker.entity.Prescription;
import com.medtracker.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pharmacist")
public class PharmacistController {

    @Autowired
    private PrescriptionRepository prescriptionRepo;

    @PreAuthorize("hasRole('PHARMACIST')")
    @GetMapping("/stock")
    public String stock() {
        return "Medicine stock details";
    }

    @GetMapping("/all-prescriptions")
    public List<Prescription> allPrescriptions() {
        return prescriptionRepo.findAll();
    }

}
