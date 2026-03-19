package com.medtracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.medtracker.entity.Medicine;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    // 🔹 Top Selling Medicines
   @Query("""
SELECT p.medicationName, COUNT(p)
FROM Prescription p
GROUP BY p.medicationName
ORDER BY COUNT(p) DESC
""")
List<Object[]> getTopSellingMedicines();
    // 🔹 Sales vs Stock
    @Query("""
SELECT m.name, COUNT(p), MAX(m.stockQuantity)
FROM Medicine m
LEFT JOIN Prescription p ON m.name = p.medicationName
GROUP BY m.name
""")
    List<Object[]> getSalesData();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.stockQuantity < 10")
    long countLowStockMedicines();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate < CURRENT_DATE")
    long countExpiredMedicines();
}
