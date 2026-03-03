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
        return notificationRepo.findByUserId(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepo.findByUserIdAndIsReadFalse(userId).size();
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepo.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(unread);
    }
}
