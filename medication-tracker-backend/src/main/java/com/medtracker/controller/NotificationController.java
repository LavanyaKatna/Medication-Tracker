package com.medtracker.controller;

import com.medtracker.entity.Notification;
import com.medtracker.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<Notification> getAll(@PathVariable Long userId) {
        return notificationService.getNotifications(userId);
    }

    @GetMapping("/{userId}/unread-count")
    public Map<String, Long> unreadCount(@PathVariable Long userId) {
        return Map.of("count", notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{userId}/read")
    public Map<String, String> markRead(@PathVariable Long userId) {
        notificationService.markAllRead(userId);
        return Map.of("status", "ok");
    }
}
