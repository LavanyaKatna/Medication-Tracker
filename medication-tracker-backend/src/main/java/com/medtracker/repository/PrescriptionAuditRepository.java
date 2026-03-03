package com.medtracker.repository;

import com.medtracker.entity.PrescriptionAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionAuditRepository
        extends JpaRepository<PrescriptionAudit, Long> {

    List<PrescriptionAudit> findByPrescriptionIdOrderByChangedAtAsc(Long prescriptionId);
    List<PrescriptionAudit> findByPrescriptionIdOrderByChangedAtDesc(Long prescriptionId);
}
