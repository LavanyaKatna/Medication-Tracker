package com.medtracker.controller;

import com.medtracker.entity.Medicine;
import com.medtracker.entity.Prescription;
import com.medtracker.repository.PrescriptionRepository;
import com.medtracker.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pharmacist")
@CrossOrigin
public class PharmacistController {

    @Autowired
    private PrescriptionRepository prescriptionRepo;

    @Autowired
    private MedicineService medicineService;

    @PreAuthorize("hasRole('PHARMACIST')")
    @GetMapping("/stock")
    public List<Medicine> stock() {
        // Optional: you can filter expired medicines or low stock
        return medicineService.getAllMedicines();
    }

    @PreAuthorize("hasRole('PHARMACIST')")
    @GetMapping("/all-prescriptions")
    public List<Prescription> allPrescriptions() {
        return prescriptionRepo.findAll();
    }
}