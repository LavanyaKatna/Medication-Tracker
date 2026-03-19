package com.medtracker.controller;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.medtracker.repository.MedicationScheduleRepository;
import com.medtracker.repository.PrescriptionRepository;
import com.medtracker.repository.MedicineRepository;
import com.medtracker.repository.UserRepository;
import com.medtracker.repository.NotificationRepository; // or AlertRepository
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
public class AnalyticsController {

    @Autowired
    private MedicationScheduleRepository scheduleRepo;

    @Autowired
    private PrescriptionRepository prescriptionRepo;


    @Autowired
private MedicineRepository medicineRepo;

@Autowired
private UserRepository userRepo;

@Autowired
private NotificationRepository notificationRepo; // or AlertRepository


    // ✅ Patient Line Chart
    @GetMapping("/patient/adherence-trend/{patientId}")
public Map<String, Object> getAdherenceTrend(@PathVariable Long patientId) {

    List<Object[]> data = scheduleRepo.getAdherenceTrend(patientId);

    List<String> labels = new ArrayList<>();
    List<Double> values = new ArrayList<>();

    for (Object[] row : data) {

        // ✅ Safe date formatting
        String date = String.valueOf(row[0]);

        // ✅ Safe number conversion
        Number num = (Number) row[1];

        labels.add(date);
        values.add(num.doubleValue());
    }

    Map<String, Object> res = new HashMap<>();
    res.put("labels", labels);
    res.put("values", values);

    return res;
}

    // 👨‍⚕️ Doctor Bar Chart
    @GetMapping("/doctor/prescriptions/{doctorId}")
    public Map<String, Object> getDoctorStats(@PathVariable Long doctorId) {

        List<Object[]> data = prescriptionRepo.getDoctorPrescriptionStats(doctorId);

        List<String> labels = new ArrayList<>();
        List<Integer> values = new ArrayList<>();

        for (Object[] row : data) {
            labels.add(row[0].toString());
            values.add(Integer.parseInt(row[1].toString()));
        }

        Map<String, Object> res = new HashMap<>();
        res.put("labels", labels);
        res.put("values", values);

        return res;
    }

    // 👨‍⚕️ Doctor Pie Chart
    @GetMapping("/doctor/adherence-levels")
    public Map<String, Object> getAdherenceLevels() {

        List<Object[]> data = scheduleRepo.getPatientAdherenceLevels();

        List<String> labels = new ArrayList<>();
        List<Integer> values = new ArrayList<>();

        for (Object[] row : data) {
            labels.add(row[0].toString());
            values.add(Integer.parseInt(row[1].toString()));
        }

        Map<String, Object> res = new HashMap<>();
        res.put("labels", labels);
        res.put("values", values);

        return res;
    }
    // 💊 Top Selling Medicines
@GetMapping("/top-medicines")
public List<Object[]> topMedicines() {
    return medicineRepo.getTopSellingMedicines();
}

// 💊 Sales vs Stock
@GetMapping("/sales-stock")
public List<Object[]> salesStock() {
    return medicineRepo.getSalesData();
}


// 📊 System Usage (Prescriptions per day)
@GetMapping("/system-usage")
public Map<String, Object> systemUsage() {
    List<Object[]> data = prescriptionRepo.getSystemUsage();

    List<String> labels = new ArrayList<>();
    List<Integer> values = new ArrayList<>();

    for (Object[] row : data) {
        labels.add(row[0].toString());
        values.add(Integer.parseInt(row[1].toString()));
    }

    Map<String, Object> res = new HashMap<>();
    res.put("labels", labels);
    res.put("values", values);
    return res;
}

// 👥 User Growth
@GetMapping("/user-growth")
public Map<String, Object> userGrowth() {
    List<Object[]> data = userRepo.getUserGrowth();

    List<String> labels = new ArrayList<>();
    List<Integer> values = new ArrayList<>();

    for (Object[] row : data) {
        labels.add(row[0].toString());
        values.add(Integer.parseInt(row[1].toString()));
    }

    Map<String, Object> res = new HashMap<>();
    res.put("labels", labels);
    res.put("values", values);
    return res;
}

// 🔔 Alerts by Type
@GetMapping("/alerts-by-type")
public Map<String, Object> alertsByType() {

    long lowStock = medicineRepo.countLowStockMedicines();
    long expired = medicineRepo.countExpiredMedicines();

    long highRiskPatients = 0;

    List<Object[]> adherenceLevels = scheduleRepo.getPatientAdherenceLevels();

    if (adherenceLevels != null) {
        for (Object[] row : adherenceLevels) {

            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {

                if ("Low".equalsIgnoreCase(row[0].toString())) {
                    try {
                        highRiskPatients = Long.parseLong(row[1].toString());
                    } catch (Exception e) {
                        highRiskPatients = 0;
                    }
                    break;
                }
            }
        }
    }

    List<String> labels = Arrays.asList("Low Stock", "Expired", "High-Risk");
    List<Long> values = Arrays.asList(lowStock, expired, highRiskPatients);

    Map<String, Object> res = new HashMap<>();
    res.put("labels", labels);
    res.put("values", values);

    return res;
}
@GetMapping("/admin-stats")
public Map<String, Long> getAdminStats() {
    Map<String, Long> map = new HashMap<>();

    map.put("users", userRepo.count());
    map.put("prescriptions", prescriptionRepo.count());
    
    long lowStock = medicineRepo.countLowStockMedicines();
    long expired = medicineRepo.countExpiredMedicines();

    long highRiskPatients = 0;
    List<Object[]> adherenceLevels = scheduleRepo.getPatientAdherenceLevels();

    for (Object[] row : adherenceLevels) {
        if ("Low".equalsIgnoreCase(row[0].toString())) {
            highRiskPatients = Long.parseLong(row[1].toString());
            break;
        }
    }

    map.put("alerts", lowStock + expired + highRiskPatients);

    return map;
}
}