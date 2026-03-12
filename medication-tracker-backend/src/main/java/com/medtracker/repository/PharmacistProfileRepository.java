package com.medtracker.repository;

import com.medtracker.entity.PharmacistProfile;
import com.medtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PharmacistProfileRepository extends JpaRepository<PharmacistProfile, Long> {
    Optional<PharmacistProfile> findByUser(User user);
}
