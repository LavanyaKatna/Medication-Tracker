package com.medtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtracker.entity.DrugInfoResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class DrugInfoService {

    private static final String API_KEY = "f55KxYXVKb0TUPJ1cd368vcw8U4ucNAbQdxOd9xu";

    public DrugInfoResponse getDrugInfo(String name) {

        RestTemplate restTemplate = new RestTemplate();

        String searchName = name.toLowerCase();

        if (searchName.equals("paracetamol")) {
            searchName = "acetaminophen";
        }

        String url = "https://api.fda.gov/drug/label.json?search=("
                + "openfda.generic_name:" + searchName
                + "+OR+openfda.brand_name:" + searchName
                + "+OR+openfda.substance_name:" + searchName
                + "+OR+openfda.pharm_class_epc:" + searchName
                + ")&limit=1&api_key=" + API_KEY;

        String response = restTemplate.getForObject(url, String.class);
        DrugInfoResponse drug = new DrugInfoResponse();

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            JsonNode results = root.path("results");

            if (results.isMissingNode() || results.size() == 0) {
                drug.setBrandName(name);
                drug.setActiveIngredient("Not available");
                drug.setPurpose("Not available");
                drug.setWarnings("Not available");
                drug.setDosage("Not available");
                return drug;
            }

            JsonNode result = results.get(0);

            drug.setBrandName(result.path("openfda").path("brand_name").get(0).asText());
            drug.setActiveIngredient(
                    result.path("active_ingredient").size() > 0 ? result.path("active_ingredient").get(0).asText()
                            : "Not available");

            drug.setPurpose(
                    result.path("purpose").size() > 0 ? result.path("purpose").get(0).asText() : "Not available");

            drug.setWarnings(
                    result.path("warnings").size() > 0 ? result.path("warnings").get(0).asText()
                            : "No warnings listed");

            drug.setDosage(
                    result.path("dosage_and_administration").size() > 0
                            ? result.path("dosage_and_administration").get(0).asText()
                            : "Dosage not specified");
        } catch (Exception e) {
            e.printStackTrace();
        }

        return drug;
    }
}