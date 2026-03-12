package com.medtracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import com.medtracker.entity.Medicine;
import com.medtracker.repository.MedicineRepository;
import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import com.medtracker.entity.DrugInfoResponse;

import org.springframework.web.client.RestTemplate;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository repository;

    @Autowired
    private DrugInfoService drugInfoService;

    public List<Medicine> getAllMedicines() {
        List<Medicine> medicines = repository.findAll();
        medicines.forEach(Medicine::checkExpiry); // check expiry dynamically
        return medicines;
    }

    public Medicine addMedicine(Medicine medicine) {
        medicine.checkExpiry();

        // Ensure dosage is never null
        if (medicine.getDosage() == null)
            medicine.setDosage("");
        if (medicine.getThreshold() == 0) {
            medicine.setThreshold(10); // default threshold if not sent
        }
        // StockQuantity might come as 0, so ensure it's valid
        if (medicine.getStockQuantity() < 0)
            medicine.setStockQuantity(0);

        return repository.save(medicine);
    }

    public Medicine updateMedicine(Long id, Medicine updated) {
        Medicine med = repository.findById(id).orElseThrow(() -> new NoSuchElementException("Medicine not found"));
        med.setName(updated.getName());
        med.setBatchNumber(updated.getBatchNumber());
        med.setExpiryDate(updated.getExpiryDate());
        med.setStockQuantity(updated.getStockQuantity());
        med.setDosage(updated.getDosage()); // <-- add this line
        med.checkExpiry();
        return repository.save(med);
    }

    public void deleteMedicine(Long id) {
        repository.deleteById(id);
    }

    public Medicine getMedicine(Long id) {
        Medicine med = repository.findById(id).orElseThrow();
        med.checkExpiry();
        return med;
    }

    public List<Medicine> getLowStockMedicines() {
        return repository.findAll().stream()
                .filter(m -> m.getStockQuantity() <= m.getLowStockThreshold())
                .collect(Collectors.toList());
    }

    public List<Medicine> expiredMedicines() {
        LocalDate today = LocalDate.now();
        return repository.findAll().stream()
                .filter(m -> m.getExpiryDate().isBefore(today))
                .toList();
    }

    public DrugInfoResponse getDrugInfo(String name) {
        return drugInfoService.getDrugInfo(name);
    }
}