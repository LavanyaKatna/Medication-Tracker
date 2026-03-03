package com.medtracker.service;

import com.medtracker.entity.*;
import com.medtracker.repository.*;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

@Autowired private PrescriptionRepository prescriptionRepo;
@Autowired private PrescriptionAuditRepository auditRepo;
@Autowired private NotificationRepository notificationRepo;
@Autowired private UserRepository userRepo;



private static final String PDF_DIR = "uploads/prescriptions/";

    // ─── 1) Doctor Creates Prescription ────────────────────────────────────────
public Prescription createPrescription(Map<String, Object> data, Long doctorId) throws IOException {
        User doctor = userRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Long patientId = Long.valueOf(data.get("patientId").toString());
        User patient = userRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Prescription p = new Prescription();
        p.setDoctor(doctor);
        p.setPatient(patient);
        p.setMedicationName((String) data.get("medicationName"));
        p.setDosage((String) data.get("dosage"));
        p.setInstructions((String) data.get("instructions"));
        p.setDoctorNotes((String) data.getOrDefault("doctorNotes", ""));
        p.setStartDate(LocalDate.parse((String) data.get("startDate")));
        p.setEndDate(LocalDate.parse((String) data.get("endDate")));

        // Calculate renewal date (7 days before expiry)
       // Renewal date = Last date
p.setRenewalDate(p.getEndDate());
        p.setStatus("PENDING");
        

        // Save first to get ID
        p = prescriptionRepo.save(p);

        // Generate PDF
        String pdfPath = generatePdf(p, doctor, patient);
        p.setPdfPath(pdfPath);
        p = prescriptionRepo.save(p);

auditRepo.save(new PrescriptionAudit(p, doctor, "CREATED",
        "Prescription created for patient: " + patient.getName()));

return p;
}

    // ─── 2) Admin Approves ──────────────────────────────────────────────────────
public Prescription approvePrescription(Long prescriptionId, Long adminId) {
Prescription p = prescriptionRepo.findById(prescriptionId)
        .orElseThrow(() -> new RuntimeException("Prescription not found"));

User admin = userRepo.findById(adminId)
.orElseThrow(() -> new RuntimeException("Admin not found"));

p.setStatus("APPROVED");
prescriptionRepo.save(p);

notificationRepo.save(new Notification(p.getPatient().getId(),
"✅ Your prescription for \"" + p.getMedicationName() + "\" has been APPROVED by the admin."));

    // Log audit
auditRepo.save(new PrescriptionAudit(p, admin, "APPROVED", "Prescription approved by admin"));

return p;
}

public Prescription rejectPrescription(Long prescriptionId, Long adminId, String reason) {
Prescription p = prescriptionRepo.findById(prescriptionId)
.orElseThrow(() -> new RuntimeException("Prescription not found"));

User admin = userRepo.findById(adminId)
.orElseThrow(() -> new RuntimeException("Admin not found"));

p.setStatus("REJECTED");
p.setRejectReason(reason);
prescriptionRepo.save(p);


    // Log audit
auditRepo.save(new PrescriptionAudit(p, admin, "REJECTED", reason));

return p;
}

    // ─── 4) Queries ─────────────────────────────────────────────────────────────
public List<Prescription> getByDoctor(Long doctorId) {
return prescriptionRepo.findByDoctorId(doctorId);
}

public List<Prescription> getByPatient(Long patientId) {
        // Patients only see APPROVED prescriptions
return prescriptionRepo.findByPatientIdAndStatus(patientId, "APPROVED");
}

public List<Prescription> getPending() {
        return prescriptionRepo.findByStatus("PENDING");
}

public List<Prescription> getAllPrescriptions() {
        return prescriptionRepo.findAll();
}
public Prescription getPrescriptionById(Long id) {
return prescriptionRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("Prescription not found"));
}

public List<PrescriptionAudit> getAudit(Long prescriptionId) {
return auditRepo.findByPrescriptionIdOrderByChangedAtDesc(prescriptionId);
}

public byte[] getPdfBytes(Long prescriptionId) throws IOException {
        Prescription p = prescriptionRepo.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        if (p.getPdfPath() == null) throw new RuntimeException("No PDF found");
        return Files.readAllBytes(Paths.get(p.getPdfPath()));
}

    // ─── PDF Generator ──────────────────────────────────────────────────────────
private String generatePdf(Prescription p, User doctor, User patient) throws IOException {
        // Ensure directory exists
        Files.createDirectories(Paths.get(PDF_DIR));
        String fileName = PDF_DIR + "prescription_" + p.getId() + ".pdf";

        PdfWriter writer = new PdfWriter(fileName);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);
        document.setMargins(40, 50, 40, 50);

        // ── Header ──
        Paragraph header = new Paragraph("MEDICATION TRACKER")
                .setFontSize(22)
                .setBold()
                .setFontColor(ColorConstants.DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(header);

        Paragraph subHeader = new Paragraph("Official Medical Prescription")
                .setFontSize(12)
                .setItalic()
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(subHeader);

        document.add(new Paragraph("\n"));

        // ── Doctor Info ──
        document.add(new Paragraph("Prescribed By:")
                .setBold().setFontSize(12));

        // Get doctor profile info
        document.add(new Paragraph("Dr. " + doctor.getName())
                .setFontSize(11));
        document.add(new Paragraph("Date Issued: " + p.getStartDate())
                .setFontSize(10).setFontColor(ColorConstants.GRAY));

        document.add(new Paragraph("\n"));

        // ── Patient Info ──
        document.add(new Paragraph("Patient Information:")
                .setBold().setFontSize(12));

        Table patientTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .setWidth(UnitValue.createPercentValue(100));
        patientTable.addCell(new Cell().add(new Paragraph("Name")).setBold());
        patientTable.addCell(new Cell().add(new Paragraph(patient.getName())));
        patientTable.addCell(new Cell().add(new Paragraph("Email")).setBold());
        patientTable.addCell(new Cell().add(new Paragraph(patient.getEmail())));
        document.add(patientTable);

        document.add(new Paragraph("\n"));

        // ── Prescription Details ──
        document.add(new Paragraph("Prescription Details:")
                .setBold().setFontSize(12));

        Table rxTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .setWidth(UnitValue.createPercentValue(100));

        rxTable.addCell(new Cell().add(new Paragraph("Medication")).setBold());
        rxTable.addCell(new Cell().add(new Paragraph(p.getMedicationName())));

        rxTable.addCell(new Cell().add(new Paragraph("Dosage")).setBold());
        rxTable.addCell(new Cell().add(new Paragraph(p.getDosage())));

        rxTable.addCell(new Cell().add(new Paragraph("Instructions")).setBold());
        rxTable.addCell(new Cell().add(new Paragraph(p.getInstructions())));

        rxTable.addCell(new Cell().add(new Paragraph("Start Date")).setBold());
        rxTable.addCell(new Cell().add(new Paragraph(p.getStartDate().toString())));

        rxTable.addCell(new Cell().add(new Paragraph("End Date")).setBold());
        rxTable.addCell(new Cell().add(new Paragraph(p.getEndDate().toString())));

        rxTable.addCell(new Cell().add(new Paragraph("Renewal Date")).setBold());
        rxTable.addCell(new Cell().add(new Paragraph(
                p.getRenewalDate() != null ? p.getRenewalDate().toString() : "N/A")));

        document.add(rxTable);

        // ── Doctor Notes ──
if (p.getDoctorNotes() != null && !p.getDoctorNotes().isEmpty()) {
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Doctor's Notes:")
        .setBold().setFontSize(12));
        document.add(new Paragraph(p.getDoctorNotes())
        .setFontSize(12).setItalic().setFontColor(ColorConstants.DARK_GRAY));
}

document.add(new Paragraph("\n\n"));

        // ── Signature ──
        document.add(new Paragraph("_______________________________")
                .setTextAlignment(TextAlignment.RIGHT));
        document.add(new Paragraph("Dr. " + doctor.getName() + "  |  Digital Signature")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.RIGHT));

        // ── Footer ──
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("This is a digitally generated prescription from Medication Tracker. Prescription ID: #" + p.getId())
                .setFontSize(8)
                .setFontColor(ColorConstants.LIGHT_GRAY)
                .setTextAlignment(TextAlignment.CENTER));

        document.close();
        return fileName;
}
}
