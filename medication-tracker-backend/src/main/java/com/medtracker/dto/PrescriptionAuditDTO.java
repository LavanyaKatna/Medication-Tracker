package com.medtracker.dto;

import java.time.LocalDateTime;

public class PrescriptionAuditDTO {

    private String action;
    private String details;
    private LocalDateTime changedAt;
    private String performedBy;
    private String role;

    public PrescriptionAuditDTO(String action,
                                String details,
                                LocalDateTime changedAt,
                                String performedBy,
                                String role) {
        this.action = action;
        this.details = details;
        this.changedAt = changedAt;
        this.performedBy = performedBy;
        this.role = role;
    }

    public String getAction() { return action; }
    public String getDetails() { return details; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public String getPerformedBy() { return performedBy; }
    public String getRole() { return role; }
}