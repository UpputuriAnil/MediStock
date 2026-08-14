package com.medistock.controller;

import com.medistock.entity.Report;
import com.medistock.repository.ReportRepository;
import com.medistock.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Report Management Endpoints")
public class ReportController {

    private final ReportRepository reportRepository;

    public ReportController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('REPORT_READ') or hasRole('ADMIN')")
    @Operation(summary = "Get all generated reports")
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports() {
        List<Report> reports = reportRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Reports retrieved successfully", reports));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate new report record")
    public ResponseEntity<ApiResponse<Report>> createReport(@RequestBody Report report) {
        Report saved = reportRepository.save(report);
        return ResponseEntity.ok(ApiResponse.success("Report record created successfully", saved));
    }
}
