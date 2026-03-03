package com.medtracker.repository;

import com.medtracker.entity.PatientProfile;
import com.medtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUser(User user);
}
