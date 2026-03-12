package com.medtracker.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String batchNumber;
    
    private LocalDate expiryDate;

    private int stockQuantity;
    private int threshold = 10; // add this default value
    private int lowStockThreshold = 10; // default threshold
    private boolean expired = false;
private String dosage;

    public Medicine() {}

    public Medicine(String name, String batchNumber, LocalDate expiryDate, int stockQuantity, String dosage) {
        this.name = name;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
        this.stockQuantity = stockQuantity;
        this.dosage = dosage;
        this.checkExpiry();
    }
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public boolean isExpired() { return expired; }

    public void checkExpiry() {
        if (expiryDate != null && expiryDate.isBefore(LocalDate.now())) {
            this.expired = true;
        }
    }
    public int getThreshold() { return threshold; }
public void setThreshold(int threshold) { this.threshold = threshold; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
}