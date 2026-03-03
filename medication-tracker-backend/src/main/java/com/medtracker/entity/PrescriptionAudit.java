package com.medtracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescription_audit")
public class PrescriptionAudit {

    public PrescriptionAudit() {}

    public PrescriptionAudit(Prescription prescription, User changedByUser, String action, String details) {
        this.prescription = prescription;
        this.changedByUser = changedByUser;
        this.action = action;
        this.details = details;
        this.changedAt = LocalDateTime.now();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedByUser;

    @Column(nullable = false)
    private String action;

    @Column(length = 2000)
    private String details;

    @Column(name = "changed_at")
    private LocalDateTime changedAt = LocalDateTime.now();

    // Getters & Setters
    public Long getId() { return id; }

    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }

    public User getChangedByUser() { return changedByUser; }
    public void setChangedByUser(User changedByUser) { this.changedByUser = changedByUser; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}