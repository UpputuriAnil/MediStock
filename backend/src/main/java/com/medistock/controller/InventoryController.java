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
    @PreAuthorize("hasAnyAuthority('INVENTORY_CREATE', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or hasRole('ADMIN')")
    @Operation(summary = "Create inventory record")
    public ResponseEntity<ApiResponse<Inventory>> createInventory(@Valid @RequestBody Inventory inventory) {
        Inventory response = inventoryService.createInventory(inventory);
        return ResponseEntity.ok(ApiResponse.success("Inventory created successfully", response));
    }

    @PutMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('INVENTORY_UPDATE', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or hasRole('ADMIN')")
    @Operation(summary = "Update inventory")
    public ResponseEntity<ApiResponse<Inventory>> updateInventory(
            @PathVariable Long id,
            @RequestBody Inventory inventory) {
        Inventory response = inventoryService.updateInventory(id, inventory);
        return ResponseEntity.ok(ApiResponse.success("Inventory updated successfully", response));
    }

    @GetMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('INVENTORY_READ', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or isAuthenticated()")
    @Operation(summary = "Get inventory by ID")
    public ResponseEntity<ApiResponse<Inventory>> getInventoryById(@PathVariable Long id) {
        Inventory response = inventoryService.getInventoryById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('INVENTORY_READ', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or isAuthenticated()")
    @Operation(summary = "Get all inventory")
    public ResponseEntity<ApiResponse<List<Inventory>>> getAllInventory() {
        List<Inventory> response = inventoryService.getAllInventory();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/medicine/{medicineId:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('INVENTORY_READ', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or isAuthenticated()")
    @Operation(summary = "Get inventory by medicine")
    public ResponseEntity<ApiResponse<List<Inventory>>> getInventoryByMedicine(@PathVariable Long medicineId) {
        List<Inventory> response = inventoryService.getInventoryByMedicine(medicineId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/supplier/{supplierId:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('INVENTORY_READ', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or isAuthenticated()")
    @Operation(summary = "Get inventory by supplier")
    public ResponseEntity<ApiResponse<List<Inventory>>> getInventoryBySupplier(@PathVariable Long supplierId) {
        List<Inventory> response = inventoryService.getInventoryBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAnyAuthority('INVENTORY_READ', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or isAuthenticated()")
    @Operation(summary = "Get expiring stock")
    public ResponseEntity<ApiResponse<List<Inventory>>> getExpiringStock(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now().plusMonths(6);
        List<Inventory> response = inventoryService.getExpiringStock(queryDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/medicine/{medicineId:[0-9]+}/total")
    @PreAuthorize("hasAnyAuthority('INVENTORY_READ', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or isAuthenticated()")
    @Operation(summary = "Get total stock by medicine")
    public ResponseEntity<ApiResponse<Integer>> getTotalStockByMedicine(@PathVariable Long medicineId) {
        Integer response = inventoryService.getTotalStockByMedicine(medicineId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('INVENTORY_DELETE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Delete inventory")
    public ResponseEntity<ApiResponse<Void>> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.ok(ApiResponse.success("Inventory deleted successfully"));
    }

    @PostMapping("/{id:[0-9]+}/add-stock")
    @PreAuthorize("hasAnyAuthority('INVENTORY_UPDATE', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or hasRole('ADMIN')")
    @Operation(summary = "Add stock to inventory")
    public ResponseEntity<ApiResponse<Inventory>> addStock(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @RequestParam(required = false, defaultValue = "Admin User") String performedBy,
            @RequestParam(required = false) String reason) {
        Inventory response = inventoryService.addStock(id, quantity, performedBy, reason);
        return ResponseEntity.ok(ApiResponse.success("Stock added successfully", response));
    }

    @PostMapping("/{id:[0-9]+}/remove-stock")
    @PreAuthorize("hasAnyAuthority('INVENTORY_UPDATE', 'ROLE_ADMIN', 'ADMIN', 'ROLE_PHARMACIST', 'PHARMACIST') or hasRole('ADMIN')")
    @Operation(summary = "Remove stock from inventory")
    public ResponseEntity<ApiResponse<Inventory>> removeStock(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @RequestParam(required = false, defaultValue = "Admin User") String performedBy,
            @RequestParam(required = false) String reason) {
        Inventory response = inventoryService.removeStock(id, quantity, performedBy, reason);
        return ResponseEntity.ok(ApiResponse.success("Stock removed successfully", response));
    }
}
