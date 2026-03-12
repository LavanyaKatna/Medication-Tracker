package com.medtracker.repository;

import com.medtracker.entity.MedicationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicationScheduleRepository 
        extends JpaRepository<MedicationSchedule, Long> {

    List<MedicationSchedule> findByPatientId(Long patientId);
}