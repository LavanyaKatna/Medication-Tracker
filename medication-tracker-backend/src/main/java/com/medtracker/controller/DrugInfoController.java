package com.medtracker.controller;

import com.medtracker.entity.DrugInfoResponse;
import com.medtracker.service.DrugInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drug-info")
@CrossOrigin
public class DrugInfoController {

    @Autowired
    private DrugInfoService service;

    @GetMapping("/{name}")
    public DrugInfoResponse getDrugInfo(@PathVariable String name) {
        return service.getDrugInfo(name);
    }
}