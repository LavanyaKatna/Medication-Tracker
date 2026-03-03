package com.medtracker.controller;

import com.medtracker.entity.AdminProfile;
import com.medtracker.entity.PatientProfile;
import com.medtracker.entity.DoctorProfile;
import com.medtracker.entity.PharmacistProfile;
import com.medtracker.entity.User;
import com.medtracker.repository.AdminProfileRepository;
import com.medtracker.repository.PatientProfileRepository;
import com.medtracker.repository.DoctorProfileRepository;
import com.medtracker.repository.PharmacistProfileRepository;
import com.medtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired private AdminProfileRepository adminRepo;
    @Autowired private PatientProfileRepository patientRepo;
    @Autowired private DoctorProfileRepository doctorRepo;
    @Autowired private PharmacistProfileRepository pharmacistRepo;
    @Autowired private UserRepository userRepo;

    @PostMapping("/patient/{userId}")
    public String patientProfile(@PathVariable Long userId, @RequestBody Map<String, Object> data){
        System.out.println("Processing patient profile for user: " + userId);
        System.out.println("Received Map: " + data);
        
        User u = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        PatientProfile target = patientRepo.findByUser(u).orElse(new PatientProfile());
        if (target.getId() == null) {
            System.out.println("Creating new patient profile.");
            target.setUser(u);
        }

        // Manual extraction from map for 100% certainty
        if(data.containsKey("fullName")) target.setFullName((String) data.get("fullName"));
        if(data.containsKey("phone")) target.setPhone((String) data.get("phone"));
        if(data.containsKey("address")) target.setAddress((String) data.get("address"));
        if(data.containsKey("emergencyContact")) target.setEmergencyContact((String) data.get("emergencyContact"));
        if(data.containsKey("medicalHistory")) target.setMedicalHistory((String) data.get("medicalHistory"));
        if(data.containsKey("bloodGroup")) target.setBloodGroup((String) data.get("bloodGroup"));
        if(data.containsKey("allergies")) target.setAllergies((String) data.get("allergies"));
        
        // Data of birth handling (maps dob or dateOfBirth)
        String dobStr = (String) data.getOrDefault("dob", data.get("dateOfBirth"));
        if (dobStr != null && !dobStr.isEmpty()) {
            try {
                target.setDateOfBirth(LocalDate.parse(dobStr));
            } catch (Exception e) {
                System.out.println("Error parsing date: " + dobStr);
            }
        }

        System.out.println("Saving PatientProfile: " + target);
        patientRepo.save(target);

        u.setProfileCompleted(true);
        userRepo.save(u);
        return "Patient profile saved successfully";
    }

    @PostMapping("/doctor/{userId}")
    public String doctorProfile(@PathVariable Long userId, @RequestBody Map<String, Object> data){
        System.out.println("Processing doctor profile for user: " + userId);
        System.out.println("Received Map: " + data);

        User u = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        DoctorProfile target = doctorRepo.findByUser(u).orElse(new DoctorProfile());
        if (target.getId() == null) {
            target.setUser(u);
        }

        if(data.containsKey("fullName")) target.setFullName((String) data.get("fullName"));
        if(data.containsKey("phone")) target.setPhone((String) data.get("phone"));
        if(data.containsKey("address")) target.setAddress((String) data.get("address"));
        if(data.containsKey("licenseNumber")) target.setLicenseNumber((String) data.get("licenseNumber"));
        if(data.containsKey("specialization")) target.setSpecialization((String) data.get("specialization"));
        if(data.containsKey("experience")) target.setExperience((String) data.get("experience"));
        if(data.containsKey("hospitalName")) target.setHospitalName((String) data.get("hospitalName"));

        System.out.println("Saving DoctorProfile: " + target);
        doctorRepo.save(target);

        u.setProfileCompleted(true);
        userRepo.save(u);
        return "Doctor profile saved successfully";
    }

    @PostMapping("/pharmacist/{userId}")
    public String pharmacistProfile(@PathVariable Long userId, @RequestBody Map<String, Object> data){
        System.out.println("Processing pharmacist profile for user: " + userId);
        System.out.println("Received Map: " + data);

        User u = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        PharmacistProfile target = pharmacistRepo.findByUser(u).orElse(new PharmacistProfile());
        if (target.getId() == null) {
            target.setUser(u);
        }

        if(data.containsKey("fullName")) target.setFullName((String) data.get("fullName"));
        if(data.containsKey("phone")) target.setPhone((String) data.get("phone"));
        if(data.containsKey("address")) target.setAddress((String) data.get("address"));
        if(data.containsKey("shopName")) target.setShopName((String) data.get("shopName"));
        if(data.containsKey("shopAddress")) target.setShopAddress((String) data.get("shopAddress"));
        if(data.containsKey("licenseNumber")) target.setLicenseNumber((String) data.get("licenseNumber"));
        if(data.containsKey("openingHours")) target.setOpeningHours((String) data.get("openingHours"));

        System.out.println("Saving PharmacistProfile: " + target);
        pharmacistRepo.save(target);

        u.setProfileCompleted(true);
        userRepo.save(u);
        return "Pharmacist profile saved successfully";
    }

    @PostMapping("/admin/{userId}")
    public String adminProfile(@PathVariable Long userId, @RequestBody Map<String, Object> data){
        System.out.println("Processing admin profile for user: " + userId);
        System.out.println("Received Map: " + data);

        User u = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        AdminProfile target = adminRepo.findByUser(u).orElse(new AdminProfile());
        if (target.getId() == null) {
            target.setUser(u);
        }

        if(data.containsKey("fullName")) target.setFullName((String) data.get("fullName"));
        if(data.containsKey("phone")) target.setPhone((String) data.get("phone"));
        if(data.containsKey("address")) target.setAddress((String) data.get("address"));
        if(data.containsKey("department")) target.setDepartment((String) data.get("department"));
        if(data.containsKey("employeeId")) target.setEmployeeId((String) data.get("employeeId"));

        System.out.println("Saving AdminProfile: " + target);
        adminRepo.save(target);

        u.setProfileCompleted(true);
        userRepo.save(u);
        return "Admin profile saved successfully";
    }
}
