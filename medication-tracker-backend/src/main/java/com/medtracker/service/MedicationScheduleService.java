package com.medtracker.service;

import com.medtracker.entity.MedicationSchedule;
import com.medtracker.repository.MedicationScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MedicationScheduleService {

    private final MedicationScheduleRepository repo;

    public MedicationScheduleService(MedicationScheduleRepository repo) {
        this.repo = repo;
    }

    public MedicationSchedule create(MedicationSchedule schedule){
        return repo.save(schedule);
    }

    public List<MedicationSchedule> getPatientSchedules(Long patientId){
        return repo.findByPatientId(patientId);
    }

    public void markTaken(Long id){

    MedicationSchedule s = repo.findById(id).orElseThrow();

    s.setTaken(true);

    repo.save(s);

    checkAdherenceAlert(s.getPatientId());
}

    public void snooze(Long id){

    MedicationSchedule s = repo.findById(id).orElseThrow();

    s.setSnoozed(true);

    // if patient snoozes instead of taking
    s.setMissed(true);

    repo.save(s);
}
    public double calculateAdherence(Long patientId){

    List<MedicationSchedule> schedules = repo.findByPatientId(patientId);

    long taken = schedules.stream()
            .filter(MedicationSchedule::isTaken)
            .count();

    long missed = schedules.stream()
            .filter(MedicationSchedule::isMissed)
            .count();

    long total = taken + missed;

    if(total == 0) return 100;

    return (taken * 100.0) / total;
}
public void checkAdherenceAlert(Long patientId){

    double adherence = calculateAdherence(patientId);

    if(adherence < 80){

        System.out.println("ALERT: Patient " + patientId + adherence + "%");
    }
}
public List<Map<String, Object>> getHighRiskPatients(){

    List<Long> patientIds = repo.findAll()
            .stream()
            .map(MedicationSchedule::getPatientId)
            .distinct()
            .toList();

    List<Map<String, Object>> result = new ArrayList<>();

    for(Long patientId : patientIds){

        double adherence = calculateAdherence(patientId);

        if(adherence < 80){

            Map<String,Object> data = new HashMap<>();
            data.put("patientId", patientId);
            data.put("adherence", adherence);

            result.add(data);
        }
    }

    return result;
}
public Map<String, Long> getAdherenceStats(Long patientId){

    List<MedicationSchedule> schedules = repo.findByPatientId(patientId);

    long taken = schedules.stream()
            .filter(MedicationSchedule::isTaken)
            .count();

    long missed = schedules.stream()
            .filter(MedicationSchedule::isMissed)
            .count();

    Map<String, Long> result = new HashMap<>();
    result.put("taken", taken);
    result.put("missed", missed);

    return result;
}

}