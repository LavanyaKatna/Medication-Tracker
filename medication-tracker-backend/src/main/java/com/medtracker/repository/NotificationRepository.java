package com.medtracker.repository;

import com.medtracker.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(Long userId);
    List<Notification> findByUserIdAndIsReadFalse(Long userId);
    @Query("SELECT n.type, COUNT(n) FROM Notification n GROUP BY n.type")
List<Object[]> getAlertsByType();
}
