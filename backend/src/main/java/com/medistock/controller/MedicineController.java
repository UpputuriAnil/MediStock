package com.medistock.controller;

import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.response.ApiResponse;
import com.medistock.service.MedicineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicines")
@Tag(name = "Medicine Management", description = "Medicine management APIs")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MEDICINE_CREATE')")
    @Operation(summary = "Create new medicine")
    public ResponseEntity<ApiResponse<Medicine>> createMedicine(@Valid @RequestBody Medicine medicine) {
        Medicine response = medicineService.createMedicine(medicine);
        return ResponseEntity.ok(ApiResponse.success("Medicine created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MEDICINE_UPDATE')")
    @Operation(summary = "Update medicine")
    public ResponseEntity<ApiResponse<Medicine>> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody Medicine medicine) {
        Medicine response = medicineService.updateMedicine(id, medicine);
        return ResponseEntity.ok(ApiResponse.success("Medicine updated successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MEDICINE_READ')")
    @Operation(summary = "Get medicine by ID")
    public ResponseEntity<ApiResponse<Medicine>> getMedicineById(@PathVariable Long id) {
        Medicine response = medicineService.getMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MEDICINE_READ')")
    @Operation(summary = "Get all medicines")
    public ResponseEntity<ApiResponse<List<Medicine>>> getAllMedicines() {
        List<Medicine> response = medicineService.getAllMedicines();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('MEDICINE_READ')")
    @Operation(summary = "Search medicines")
    public ResponseEntity<ApiResponse<List<Medicine>>> searchMedicines(@RequestParam String keyword) {
        List<Medicine> response = medicineService.searchMedicines(keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAuthority('MEDICINE_READ')")
    @Operation(summary = "Get low stock medicines")
    public ResponseEntity<ApiResponse<List<Medicine>>> getLowStockMedicines() {
        List<Medicine> response = medicineService.getLowStockMedicines();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/suppliers")
    @PreAuthorize("hasAuthority('MEDICINE_READ')")
    @Operation(summary = "Get suppliers associated with a medicine")
    public ResponseEntity<ApiResponse<List<Supplier>>> getSuppliersByMedicine(@PathVariable Long id) {
        List<Supplier> response = medicineService.getSuppliersByMedicine(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MEDICINE_DELETE')")
    @Operation(summary = "Delete medicine")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine deleted successfully"));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('MEDICINE_UPDATE')")
    @Operation(summary = "Toggle medicine active status")
    public ResponseEntity<ApiResponse<Medicine>> toggleActiveStatus(@PathVariable Long id) {
        Medicine response = medicineService.toggleActiveStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine status updated successfully", response));
    }
}
