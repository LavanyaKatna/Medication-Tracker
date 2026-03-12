package com.medtracker.service;

import com.medtracker.entity.Notification;
import com.medtracker.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepo;

    public List<Notification> getNotifications(Long userId) {
    return notificationRepo.findByUserIdAndIsReadFalse(userId);
}

    public long getUnreadCount(Long userId) {
        return notificationRepo.findByUserIdAndIsReadFalse(userId).size();
    }

    public void markAllRead(Long userId) {

    List<Notification> unread =
        notificationRepo.findByUserIdAndIsReadFalse(userId);

    unread.forEach(n -> n.setRead(true));

    notificationRepo.saveAll(unread);
}

    public void createNotification(Long userId, String message){

        Notification n = new Notification();

        n.setUserId(userId);
        n.setMessage(message);
        n.setRead(false);

        notificationRepo.save(n);   // ✅ fixed variable name
    }
    public boolean existsTodayReminder(Long userId, String medicine){

    List<Notification> list = notificationRepo.findByUserId(userId);

    String today = java.time.LocalDate.now().toString();

    return list.stream().anyMatch(n ->
            n.getMessage().contains(medicine)
            && n.getCreatedAt().toString().startsWith(today)
    );
}
}