package com.medistock.controller;

import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.response.ApiResponse;
import com.medistock.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@Tag(name = "Supplier Management", description = "Supplier management APIs")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SUPPLIER_CREATE')")
    @Operation(summary = "Create new supplier")
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(@Valid @RequestBody Supplier supplier) {
        Supplier response = supplierService.createSupplier(supplier);
        return ResponseEntity.ok(ApiResponse.success("Supplier created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_UPDATE')")
    @Operation(summary = "Update supplier")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody Supplier supplier) {
        Supplier response = supplierService.updateSupplier(id, supplier);
        return ResponseEntity.ok(ApiResponse.success("Supplier updated successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_READ')")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<ApiResponse<Supplier>> getSupplierById(@PathVariable Long id) {
        Supplier response = supplierService.getSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SUPPLIER_READ')")
    @Operation(summary = "Get all suppliers")
    public ResponseEntity<ApiResponse<List<Supplier>>> getAllSuppliers() {
        List<Supplier> response = supplierService.getAllSuppliers();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('SUPPLIER_READ')")
    @Operation(summary = "Search suppliers")
    public ResponseEntity<ApiResponse<List<Supplier>>> searchSuppliers(@RequestParam String keyword) {
        List<Supplier> response = supplierService.searchSuppliers(keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/medicines")
    @PreAuthorize("hasAuthority('SUPPLIER_READ')")
    @Operation(summary = "Get medicines associated with a supplier")
    public ResponseEntity<ApiResponse<List<Medicine>>> getMedicinesBySupplier(@PathVariable Long id) {
        List<Medicine> response = supplierService.getMedicinesBySupplier(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/medicines/{medicineId}")
    @PreAuthorize("hasAuthority('SUPPLIER_UPDATE')")
    @Operation(summary = "Link supplier with a medicine")
    public ResponseEntity<ApiResponse<Void>> linkSupplierToMedicine(
            @PathVariable Long id,
            @PathVariable Long medicineId) {
        supplierService.linkSupplierToMedicine(id, medicineId);
        return ResponseEntity.ok(ApiResponse.success("Supplier linked with medicine successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_DELETE')")
    @Operation(summary = "Delete supplier")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted successfully"));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('SUPPLIER_UPDATE')")
    @Operation(summary = "Toggle supplier active status")
    public ResponseEntity<ApiResponse<Supplier>> toggleActiveStatus(@PathVariable Long id) {
        Supplier response = supplierService.toggleActiveStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier status updated successfully", response));
    }
}
