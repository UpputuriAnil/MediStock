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
    @PreAuthorize("hasAnyAuthority('SUPPLIER_CREATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Create new supplier")
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(@Valid @RequestBody Supplier supplier) {
        Supplier response = supplierService.createSupplier(supplier);
        return ResponseEntity.ok(ApiResponse.success("Supplier created successfully", response));
    }

    @PutMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('SUPPLIER_UPDATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Update supplier")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplier(
            @PathVariable Long id,
            @RequestBody Supplier supplier) {
        Supplier response = supplierService.updateSupplier(id, supplier);
        return ResponseEntity.ok(ApiResponse.success("Supplier updated successfully", response));
    }

    @GetMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('SUPPLIER_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<ApiResponse<Supplier>> getSupplierById(@PathVariable Long id) {
        Supplier response = supplierService.getSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPPLIER_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get all suppliers")
    public ResponseEntity<ApiResponse<List<Supplier>>> getAllSuppliers() {
        List<Supplier> response = supplierService.getAllSuppliers();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('SUPPLIER_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Search suppliers")
    public ResponseEntity<ApiResponse<List<Supplier>>> searchSuppliers(@RequestParam(required = false, defaultValue = "") String keyword) {
        List<Supplier> response = supplierService.searchSuppliers(keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id:[0-9]+}/medicines")
    @PreAuthorize("hasAnyAuthority('SUPPLIER_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get medicines associated with a supplier")
    public ResponseEntity<ApiResponse<List<Medicine>>> getMedicinesBySupplier(@PathVariable Long id) {
        List<Medicine> response = supplierService.getMedicinesBySupplier(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id:[0-9]+}/medicines/{medicineId:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('SUPPLIER_UPDATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Link supplier with a medicine")
    public ResponseEntity<ApiResponse<Void>> linkSupplierToMedicine(
            @PathVariable Long id,
            @PathVariable Long medicineId) {
        supplierService.linkSupplierToMedicine(id, medicineId);
        return ResponseEntity.ok(ApiResponse.success("Supplier linked with medicine successfully"));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('SUPPLIER_DELETE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Delete supplier")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted successfully"));
    }

    @PutMapping("/{id:[0-9]+}/toggle-active")
    @PreAuthorize("hasAnyAuthority('SUPPLIER_UPDATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Toggle supplier active status")
    public ResponseEntity<ApiResponse<Supplier>> toggleActiveStatus(@PathVariable Long id) {
        Supplier response = supplierService.toggleActiveStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier status updated successfully", response));
    }
}
