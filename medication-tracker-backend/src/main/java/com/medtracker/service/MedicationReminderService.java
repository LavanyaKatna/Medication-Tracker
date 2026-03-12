package com.medtracker.service;

import com.medtracker.entity.MedicationSchedule;
import com.medtracker.repository.MedicationScheduleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class MedicationReminderService {

    private final MedicationScheduleRepository repo;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

   public MedicationReminderService(
        MedicationScheduleRepository repo,
        NotificationService notificationService,
        SimpMessagingTemplate messagingTemplate
){
    this.repo = repo;
    this.notificationService = notificationService;
    this.messagingTemplate = messagingTemplate;
}
    // Runs every 30 seconds
    @Scheduled(fixedRate = 30000)
    public void checkReminders(){

        System.out.println("Reminder scheduler running...");

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<MedicationSchedule> schedules = repo.findAll();

        for(MedicationSchedule s : schedules){

            if(s.getStartDate() == null || s.getEndDate() == null)
                continue;

            // Check date range
            if(today.isBefore(s.getStartDate()) || today.isAfter(s.getEndDate()))
                continue;

            if(s.getTime() == null)
                continue;

            // Compare hour + minute only
            LocalTime scheduleTime = s.getTime();

if(now.isBefore(scheduleTime) || now.isAfter(scheduleTime.plusMinutes(1)))
    continue;

            boolean notify = false;

            if(s.getFrequency() == null)
                continue;

            switch (s.getFrequency()){

                case "DAILY":
                    notify = true;
                    break;

                case "ALTERNATE":

                    long days = java.time.temporal.ChronoUnit.DAYS
                            .between(s.getStartDate(), today);

                    if(days % 2 == 0)
                        notify = true;

                    break;

                case "CUSTOM":

                    if(s.getCustomDates() != null &&
                       s.getCustomDates().contains(today.toString()))
                        notify = true;

                    break;
            }

           if(notify){

    System.out.println("Sending reminder for " + s.getMedicineName());

    String message = "⏰ Time to take " + s.getMedicineName();

    boolean alreadySent =
            notificationService.existsTodayReminder(
                    s.getPatientId(),
                    s.getMedicineName()
            );

    if(!alreadySent){

        notificationService.createNotification(
                s.getPatientId(),
                message
        );

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + s.getPatientId(),
                message
        );
    }
}
        }
    }
}