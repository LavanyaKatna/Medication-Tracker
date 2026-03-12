package com.medtracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.medtracker.entity.Medicine;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
}
