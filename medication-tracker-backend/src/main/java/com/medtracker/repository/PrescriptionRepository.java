package com.medtracker.repository;

import com.medtracker.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientId(Long patientId);
    List<Prescription> findByDoctorId(Long doctorId);
    List<Prescription> findByStatus(String status);
    List<Prescription> findByPatientIdAndStatus(Long patientId, String status);
    @Query("SELECT p.startDate, COUNT(p) " +
           "FROM Prescription p " +
           "WHERE p.doctor.id = :doctorId " +
           "GROUP BY p.startDate ORDER BY p.startDate")
    List<Object[]> getDoctorPrescriptionStats(@Param("doctorId") Long doctorId);
@Query(value = """
SELECT 
CASE 
  WHEN adherence >= 80 THEN 'Good'
  WHEN adherence >= 50 THEN 'Average'
  ELSE 'Poor'
END as level,
COUNT(*) 
FROM (
    SELECT patient_id,
    SUM(CASE WHEN status='TAKEN' THEN 1 ELSE 0 END)*100.0/COUNT(*) as adherence
    FROM medication_schedule
    GROUP BY patient_id
) t
GROUP BY level
""", nativeQuery = true)
List<Object[]> getPatientAdherenceLevels();

@Query("SELECT p.startDate, COUNT(p) " +
       "FROM Prescription p GROUP BY p.startDate ORDER BY p.startDate")
List<Object[]> getSystemUsage();

}
