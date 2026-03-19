package com.medtracker.controller;

import com.medtracker.entity.DailyDoseLog;
import com.medtracker.repository.DailyDoseLogRepository;
import com.medtracker.service.MedicationScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doses")
@CrossOrigin
public class DailyDoseController {

    @Autowired
    private DailyDoseLogRepository doseRepo;

    @Autowired
    private MedicationScheduleService scheduleService;

    // Fetch today's doses for a patient
    @GetMapping("/today/{patientId}")
    public List<DailyDoseLog> getTodaysDoses(@PathVariable Long patientId) {
        return doseRepo.findByPatientIdAndScheduledDateOrderByScheduledTimeAsc(patientId, LocalDate.now());
    }

    // Fetch all doses for a patient (history)
    @GetMapping("/patient/{patientId}")
    public List<DailyDoseLog> getAllDoses(@PathVariable Long patientId) {
        return doseRepo.findByPatientId(patientId);
    }

    // Update status mapping
    @PutMapping("/{id}/status")
    public DailyDoseLog updateStatus(@PathVariable Long id, @RequestParam String status) {
        DailyDoseLog log = doseRepo.findById(id).orElseThrow();
        log.setStatus(status.toUpperCase());
        DailyDoseLog saved = doseRepo.save(log);

        // trigger adherence recalculation alert if needed
        scheduleService.checkAdherenceAlert(log.getPatientId());

        return saved;
    }
}
