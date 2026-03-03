package com.medtracker.dto;

import java.time.LocalDateTime;

public class PrescriptionAuditResponse {

    private String action;
    private String changedBy;
    private String role;
    private String details;
    private LocalDateTime changedAt;

    public PrescriptionAuditResponse(String action,
                                     String changedBy,
                                     String role,
                                     String details,
                                     LocalDateTime changedAt) {
        this.action = action;
        this.changedBy = changedBy;
        this.role = role;
        this.details = details;
        this.changedAt = changedAt;
    }

    public String getAction() { return action; }
    public String getChangedBy() { return changedBy; }
    public String getRole() { return role; }
    public String getDetails() { return details; }
    public LocalDateTime getChangedAt() { return changedAt; }
}