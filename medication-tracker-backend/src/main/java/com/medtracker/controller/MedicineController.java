package com.medtracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.medtracker.entity.DrugInfoResponse;
import com.medtracker.entity.Medicine;
import com.medtracker.service.MedicineService;
@RestController
@RequestMapping("/api/medicines")
@CrossOrigin
public class MedicineController {

    @Autowired
    private MedicineService service;

    @GetMapping
    public List<Medicine> getAll() {
        return service.getAllMedicines();
    }

   
    @PostMapping
public Medicine add(@RequestBody Medicine medicine) {
    // dosage is automatically saved if present in JSON
    return service.addMedicine(medicine);
}

@PutMapping("/{id}")
public Medicine update(@PathVariable Long id, @RequestBody Medicine updatedMed) {
    Medicine med = service.getMedicine(id);
    med.setName(updatedMed.getName());
    med.setBatchNumber(updatedMed.getBatchNumber());
    med.setExpiryDate(updatedMed.getExpiryDate());
    med.setStockQuantity(updatedMed.getStockQuantity());
    med.setDosage(updatedMed.getDosage()); // <-- make sure dosage is updated
    return service.updateMedicine(id, med);
}

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteMedicine(id);
    }

    @GetMapping("/{id}")
    public Medicine getOne(@PathVariable Long id) {
        return service.getMedicine(id);
    }

    // New endpoints
    @GetMapping("/low-stock")
    public List<Medicine> getLowStockMedicines() {
        return service.getLowStockMedicines();
    }


    @GetMapping("/expired")
    public List<Medicine> expired() {
        return service.expiredMedicines();
    }
   
    @GetMapping("/info/{name}")
public DrugInfoResponse drugInfo(@PathVariable String name) {
    return service.getDrugInfo(name);
}
}