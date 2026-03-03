package com.medtracker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "doctor_profiles")
public class DoctorProfile {

    public DoctorProfile() {}

    public DoctorProfile(Long id, String fullName, String phone, String address, String experience, String hospitalName, String licenseNumber, String specialization, User user) {
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.experience = experience;
        this.hospitalName = hospitalName;
        this.licenseNumber = licenseNumber;
        this.specialization = specialization;
        this.user = user;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "experience")
    private String experience;

    @Column(name = "hospital_name")
    private String hospitalName;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "specialization")
    private String specialization;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    @Override
    public String toString() {
        return "DoctorProfile{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", specialization='" + specialization + '\'' +
                ", licenseNumber='" + licenseNumber + '\'' +
                '}';
    }
}
