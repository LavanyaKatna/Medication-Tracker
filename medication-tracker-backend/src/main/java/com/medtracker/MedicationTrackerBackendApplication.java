package com.medtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class MedicationTrackerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedicationTrackerBackendApplication.class, args);
	}

}
