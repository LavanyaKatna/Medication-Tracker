package com.medtracker.service;

import com.medtracker.dto.PrescriptionAuditDTO;
import com.medtracker.entity.PrescriptionAudit;
import com.medtracker.entity.Prescription;
import com.medtracker.entity.User;
import com.medtracker.repository.PrescriptionAuditRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionAuditService {

    private final PrescriptionAuditRepository auditRepo;

    public PrescriptionAuditService(PrescriptionAuditRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    // 🔹 Save Audit
    public void log(Prescription prescription, User changedByUser, String action, String details) {
        PrescriptionAudit audit = new PrescriptionAudit(prescription, changedByUser, action, details);
        auditRepo.save(audit);
    }

    // 🔹 Get Audit Trail for a Prescription
    public List<PrescriptionAuditDTO> getAuditByPrescription(Long prescriptionId) {

        List<PrescriptionAudit> audits =
                auditRepo.findByPrescriptionIdOrderByChangedAtAsc(prescriptionId);

        return audits.stream()
                .map(a -> new PrescriptionAuditDTO(
                        a.getAction(),
                        a.getDetails(),
                        a.getChangedAt(),
                        a.getChangedByUser() != null ? a.getChangedByUser().getName() : "System",
                        a.getChangedByUser().getRole()
                ))
                .toList();
    }
}