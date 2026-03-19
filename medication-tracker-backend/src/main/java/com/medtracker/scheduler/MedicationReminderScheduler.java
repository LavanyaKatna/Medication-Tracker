package com.medtracker.scheduler;

import com.medtracker.entity.MedicationSchedule;
import com.medtracker.repository.MedicationScheduleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;

@Component
public class MedicationReminderScheduler {

    private final MedicationScheduleRepository scheduleRepo;

    public MedicationReminderScheduler(MedicationScheduleRepository scheduleRepo){
        this.scheduleRepo = scheduleRepo;
    }

    // runs every 10 minutes
    @Scheduled(cron = "0 */10 * * * ?")
    public void checkMissedDoses(){

        LocalTime now = LocalTime.now();
        
        List<MedicationSchedule> reminders = scheduleRepo.findAll();

        for (MedicationSchedule r : reminders) {
            
            if(r.getTime().isBefore(now) && !r.isTaken() && !r.isSnoozed()){

                r.setMissed(true);
                scheduleRepo.save(r);

                System.out.println("Missed dose for patient " + r.getPatientId());
            }
        }
    }
}