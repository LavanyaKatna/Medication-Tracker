package com.medtracker.scheduler;

import com.medtracker.entity.MedicationSchedule;
import com.medtracker.repository.MedicationScheduleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;

@Component
public class MedicationReminderScheduler {

    private final MedicationScheduleRepository repo;

    public MedicationReminderScheduler(MedicationScheduleRepository repo){
        this.repo = repo;
    }

    // runs every 10 minutes
    @Scheduled(cron = "0 */10 * * * ?")
    public void checkMissedDoses(){

        List<MedicationSchedule> schedules = repo.findAll();

        for (MedicationSchedule schedule : schedules) {

            if(!schedule.isTaken() &&
               !schedule.isMissed() &&
               LocalTime.now().isAfter(schedule.getTime())){

                schedule.setMissed(true);

                repo.save(schedule);

                System.out.println(
                        "Missed dose for patient "
                                + schedule.getPatientId()
                                + " medicine "
                                + schedule.getMedicineName()
                );
            }
        }
    }
}