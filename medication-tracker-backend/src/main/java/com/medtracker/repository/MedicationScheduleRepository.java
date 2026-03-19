package com.medtracker.repository;

import com.medtracker.entity.MedicationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicationScheduleRepository 
        extends JpaRepository<MedicationSchedule, Long> {

    List<MedicationSchedule> findByPatientId(Long patientId);

    // ✅ FIXED: Use 'taken' instead of 'status'
    @Query("SELECT m.startDate, SUM(CASE WHEN m.taken = true THEN 1 ELSE 0 END) * 100.0 / COUNT(m) " +
           "FROM MedicationSchedule m " +
           "WHERE m.patientId = :patientId " +
           "GROUP BY m.startDate ORDER BY m.startDate")
    List<Object[]> getAdherenceTrend(@Param("patientId") Long patientId);

    // ✅ FIXED: Adherence Levels
    @Query(value = """
        SELECT 
        CASE 
          WHEN adherence >= 80 THEN 'High'
          WHEN adherence >= 50 THEN 'Medium'
          ELSE 'Low'
        END as level,
        COUNT(*) 
        FROM (
            SELECT patient_id,
            SUM(CASE WHEN taken = true THEN 1 ELSE 0 END)*100.0/COUNT(*) as adherence
            FROM medication_schedules
            GROUP BY patient_id
        ) t
        GROUP BY level
        """, nativeQuery = true)
    List<Object[]> getPatientAdherenceLevels();
}