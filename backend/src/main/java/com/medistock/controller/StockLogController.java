package com.medistock.controller;

import com.medistock.entity.StockLog;
import com.medistock.response.ApiResponse;
import com.medistock.service.StockLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/stock-logs")
@Tag(name = "Stock Log Management", description = "Stock log management APIs")
public class StockLogController {

    private final StockLogService stockLogService;

    public StockLogController(StockLogService stockLogService) {
        this.stockLogService = stockLogService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVENTORY_CREATE')")
    @Operation(summary = "Create stock log")
    public ResponseEntity<ApiResponse<StockLog>> createStockLog(@RequestBody StockLog stockLog) {
        StockLog response = stockLogService.createStockLog(stockLog);
        return ResponseEntity.ok(ApiResponse.success("Stock log created successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get stock log by ID")
    public ResponseEntity<ApiResponse<StockLog>> getStockLogById(@PathVariable Long id) {
        StockLog response = stockLogService.getStockLogById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get all stock logs")
    public ResponseEntity<ApiResponse<List<StockLog>>> getAllStockLogs() {
        List<StockLog> response = stockLogService.getAllStockLogs();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/medicine/{medicineId}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get stock logs by medicine")
    public ResponseEntity<ApiResponse<List<StockLog>>> getStockLogsByMedicine(@PathVariable Long medicineId) {
        List<StockLog> response = stockLogService.getStockLogsByMedicine(medicineId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/inventory/{inventoryId}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get stock logs by inventory")
    public ResponseEntity<ApiResponse<List<StockLog>>> getStockLogsByInventory(@PathVariable Long inventoryId) {
        List<StockLog> response = stockLogService.getStockLogsByInventory(inventoryId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transaction/{transactionType}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get stock logs by transaction type")
    public ResponseEntity<ApiResponse<List<StockLog>>> getStockLogsByTransactionType(@PathVariable String transactionType) {
        List<StockLog> response = stockLogService.getStockLogsByTransactionType(transactionType);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/performed-by/{performedBy}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get stock logs by performed by")
    public ResponseEntity<ApiResponse<List<StockLog>>> getStockLogsByPerformedBy(@PathVariable String performedBy) {
        List<StockLog> response = stockLogService.getStockLogsByPerformedBy(performedBy);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get stock logs by date range")
    public ResponseEntity<ApiResponse<List<StockLog>>> getStockLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<StockLog> response = stockLogService.getStockLogsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
