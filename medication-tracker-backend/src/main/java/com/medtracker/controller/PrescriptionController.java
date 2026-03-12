package com.medtracker.controller;

import com.medtracker.entity.Prescription;
import com.medtracker.entity.PrescriptionAudit;
import com.medtracker.repository.UserRepository;
import com.medtracker.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;
    @Autowired
private UserRepository userRepo;
    // Doctor: create prescription
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> data) {
        try {
            Long doctorId = Long.valueOf(data.get("doctorId").toString());
            Prescription p = prescriptionService.createPrescription(data, doctorId);
            return ResponseEntity.ok(p);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error generating PDF: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Doctor: list their prescriptions
    @GetMapping("/doctor/{doctorId}")
    public List<Prescription> byDoctor(@PathVariable Long doctorId) {
        return prescriptionService.getByDoctor(doctorId);
    }

    // Patient: list approved prescriptions
    @GetMapping("/patient/{patientId}")
    public List<Prescription> byPatient(@PathVariable Long patientId) {
        return prescriptionService.getByPatient(patientId);
    }

    // Admin: list all pending
    @GetMapping("/pending")
    public List<Prescription> pending() {
        return prescriptionService.getPending();
    }

    // Admin: list all prescriptions
    @GetMapping("/all")
    public List<Prescription> all() {
        return prescriptionService.getAllPrescriptions();
    }

    // Admin: approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Long adminId = Long.valueOf(body.get("adminId").toString());
            Prescription p = prescriptionService.approvePrescription(id, adminId);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Admin: reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Long adminId = Long.valueOf(body.get("adminId").toString());
            String reason = (String) body.getOrDefault("reason", "No reason provided");
            Prescription p = prescriptionService.rejectPrescription(id, adminId, reason);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Doctor/Patient/Admin: download PDF
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        try {
            byte[] pdfBytes = prescriptionService.getPdfBytes(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"prescription_" + id + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

   // Audit trail
@GetMapping("/{id}/audit")
public List<Map<String, Object>> audit(@PathVariable Long id) {

    List<PrescriptionAudit> audits = prescriptionService.getAudit(id);

    return audits.stream().map(a -> {
        Map<String, Object> map = new java.util.HashMap<>();

        map.put("action", a.getAction());
        map.put("changedAt", a.getChangedAt());

        // 👇 MATCH FRONTEND
        map.put("performedBy",
                a.getChangedByUser() != null
                        ? a.getChangedByUser().getName()
                        : "System");

        map.put("role",
        a.getChangedByUser() != null
                ? a.getChangedByUser().getRole()
                : "SYSTEM");

        map.put("details", a.getDetails());

        return map;

    }).toList();
}}
