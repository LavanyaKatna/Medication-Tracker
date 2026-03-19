package com.medtracker.repository;

import com.medtracker.entity.DailyDoseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface DailyDoseLogRepository extends JpaRepository<DailyDoseLog, Long> {

    List<DailyDoseLog> findByPatientIdAndScheduledDateOrderByScheduledTimeAsc(Long patientId, LocalDate scheduledDate);

    List<DailyDoseLog> findByPatientId(Long patientId);

    List<DailyDoseLog> findByScheduleId(Long scheduleId);

    @Query("SELECT d FROM DailyDoseLog d WHERE d.status = 'PENDING' AND d.scheduledDate <= :date AND d.scheduledTime < :time")
    List<DailyDoseLog> findPendingMissedDoses(@Param("date") LocalDate date, @Param("time") LocalTime time);

    @Query("SELECT d.scheduledDate, SUM(CASE WHEN d.status = 'TAKEN' THEN 1 ELSE 0 END) * 100.0 / COUNT(d) " +
           "FROM DailyDoseLog d " +
           "WHERE d.patientId = :patientId " +
           "GROUP BY d.scheduledDate ORDER BY d.scheduledDate")
    List<Object[]> getAdherenceTrend(@Param("patientId") Long patientId);

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
            SUM(CASE WHEN status = 'TAKEN' THEN 1 ELSE 0 END)*100.0/COUNT(*) as adherence
            FROM daily_dose_logs
            GROUP BY patient_id
        ) t
        GROUP BY level
        """, nativeQuery = true)
    List<Object[]> getPatientAdherenceLevels();
}
