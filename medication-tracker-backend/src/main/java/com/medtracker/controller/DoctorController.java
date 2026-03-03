package com.medtracker.controller;

import com.medtracker.entity.Prescription;
import com.medtracker.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/doctor")
public class DoctorController {

    @Autowired
    private PrescriptionRepository prescriptionRepo;

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping("/approve")
    public String approvePrescription() {
        return "Doctor approved prescription";
    }

    @PostMapping("/prescribe")
    public Prescription addPrescription(@RequestBody Prescription p){
        return prescriptionRepo.save(p);
    }

}
