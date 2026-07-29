package com.medistock.controller;

import com.medistock.entity.Inventory;
import com.medistock.response.ApiResponse;
import com.medistock.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/inventory")
@Tag(name = "Inventory Management", description = "Inventory management APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVENTORY_CREATE')")
    @Operation(summary = "Create inventory record")
    public ResponseEntity<ApiResponse<Inventory>> createInventory(@Valid @RequestBody Inventory inventory) {
        Inventory response = inventoryService.createInventory(inventory);
        return ResponseEntity.ok(ApiResponse.success("Inventory created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    @Operation(summary = "Update inventory")
    public ResponseEntity<ApiResponse<Inventory>> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody Inventory inventory) {
        Inventory response = inventoryService.updateInventory(id, inventory);
        return ResponseEntity.ok(ApiResponse.success("Inventory updated successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get inventory by ID")
    public ResponseEntity<ApiResponse<Inventory>> getInventoryById(@PathVariable Long id) {
        Inventory response = inventoryService.getInventoryById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get all inventory")
    public ResponseEntity<ApiResponse<List<Inventory>>> getAllInventory() {
        List<Inventory> response = inventoryService.getAllInventory();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/medicine/{medicineId}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get inventory by medicine")
    public ResponseEntity<ApiResponse<List<Inventory>>> getInventoryByMedicine(@PathVariable Long medicineId) {
        List<Inventory> response = inventoryService.getInventoryByMedicine(medicineId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get inventory by supplier")
    public ResponseEntity<ApiResponse<List<Inventory>>> getInventoryBySupplier(@PathVariable Long supplierId) {
        List<Inventory> response = inventoryService.getInventoryBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get expiring stock")
    public ResponseEntity<ApiResponse<List<Inventory>>> getExpiringStock(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Inventory> response = inventoryService.getExpiringStock(date);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/medicine/{medicineId}/total")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get total stock by medicine")
    public ResponseEntity<ApiResponse<Integer>> getTotalStockByMedicine(@PathVariable Long medicineId) {
        Integer response = inventoryService.getTotalStockByMedicine(medicineId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY_DELETE')")
    @Operation(summary = "Delete inventory")
    public ResponseEntity<ApiResponse<Void>> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.ok(ApiResponse.success("Inventory deleted successfully"));
    }

    @PostMapping("/{id}/add-stock")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    @Operation(summary = "Add stock to inventory")
    public ResponseEntity<ApiResponse<Inventory>> addStock(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @RequestParam String performedBy,
            @RequestParam(required = false) String reason) {
        Inventory response = inventoryService.addStock(id, quantity, performedBy, reason);
        return ResponseEntity.ok(ApiResponse.success("Stock added successfully", response));
    }

    @PostMapping("/{id}/remove-stock")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    @Operation(summary = "Remove stock from inventory")
    public ResponseEntity<ApiResponse<Inventory>> removeStock(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @RequestParam String performedBy,
            @RequestParam(required = false) String reason) {
        Inventory response = inventoryService.removeStock(id, quantity, performedBy, reason);
        return ResponseEntity.ok(ApiResponse.success("Stock removed successfully", response));
    }
}
