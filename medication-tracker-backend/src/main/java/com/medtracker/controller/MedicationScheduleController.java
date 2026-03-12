package com.medtracker.controller;


import com.medtracker.entity.MedicationSchedule;
import com.medtracker.service.MedicationScheduleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/schedules")
public class MedicationScheduleController {

    private final MedicationScheduleService service;

    public MedicationScheduleController(MedicationScheduleService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public MedicationSchedule create(@RequestBody MedicationSchedule s){
        return service.create(s);
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicationSchedule> getPatientSchedules(@PathVariable Long patientId){
        return service.getPatientSchedules(patientId);
    }

    @PutMapping("/{id}/taken")
    public void markTaken(@PathVariable Long id){
        service.markTaken(id);
    }

    @PutMapping("/{id}/snooze")
    public void snooze(@PathVariable Long id){
        service.snooze(id);
    }
    @GetMapping("/adherence/{patientId}")
public double getAdherence(@PathVariable Long patientId){
    return service.calculateAdherence(patientId);
}
@GetMapping("/high-risk")
public List<Map<String,Object>> getHighRiskPatients(){
    return service.getHighRiskPatients();
}
@GetMapping("/analytics/{patientId}")
public Map<String, Long> getAnalytics(@PathVariable Long patientId){
    return service.getAdherenceStats(patientId);
}
}