package com.medistock.controller;

import com.medistock.entity.ExpiryTracking;
import com.medistock.repository.ExpiryTrackingRepository;
import com.medistock.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expiry-tracking")
@Tag(name = "Expiry Tracking Management", description = "Pharmaceutical Expiry Monitoring APIs")
public class ExpiryTrackingController {

    private final ExpiryTrackingRepository expiryTrackingRepository;

    public ExpiryTrackingController(ExpiryTrackingRepository expiryTrackingRepository) {
        this.expiryTrackingRepository = expiryTrackingRepository;
    }

    @GetMapping
    @Operation(summary = "Get all expiry tracking items")
    public ResponseEntity<ApiResponse<List<ExpiryTracking>>> getAllExpiryTrackingItems() {
        List<ExpiryTracking> list = expiryTrackingRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expiry tracking item by ID")
    public ResponseEntity<ApiResponse<ExpiryTracking>> getExpiryTrackingById(@PathVariable Long id) {
        return expiryTrackingRepository.findById(id)
                .map(item -> ResponseEntity.ok(ApiResponse.success(item)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/risk/{riskLevel}")
    @Operation(summary = "Get expiry tracking items by risk level")
    public ResponseEntity<ApiResponse<List<ExpiryTracking>>> getByRiskLevel(@PathVariable String riskLevel) {
        List<ExpiryTracking> list = expiryTrackingRepository.findByRiskLevel(riskLevel);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
