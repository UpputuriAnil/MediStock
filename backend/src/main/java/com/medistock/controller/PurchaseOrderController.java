package com.medistock.controller;

import com.medistock.dto.PurchaseRequestDto;
import com.medistock.entity.PurchaseOrder;
import com.medistock.response.ApiResponse;
import com.medistock.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@Tag(name = "Purchase Orders", description = "Purchase Order & Medicine Procurement Endpoints")
public class PurchaseOrderController {

    private final PurchaseService purchaseService;

    public PurchaseOrderController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @GetMapping
    @Operation(summary = "Get all purchase orders")
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> getAllOrders() {
        List<PurchaseOrder> orders = purchaseService.getAllPurchases();
        return ResponseEntity.ok(ApiResponse.success("Purchase orders retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID")
    public ResponseEntity<ApiResponse<PurchaseOrder>> getOrderById(@PathVariable Long id) {
        PurchaseOrder order = purchaseService.getPurchaseById(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order retrieved", order));
    }

    @GetMapping("/pharmacist/{pharmacistId}")
    @Operation(summary = "Get purchases assigned to a pharmacist")
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> getPurchasesByPharmacist(@PathVariable Long pharmacistId) {
        List<PurchaseOrder> orders = purchaseService.getPurchasesByPharmacist(pharmacistId);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist purchase orders retrieved", orders));
    }

    @GetMapping("/medicine/{medicineId}")
    @Operation(summary = "Get purchases by medicine ID")
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> getPurchasesByMedicine(@PathVariable Long medicineId) {
        List<PurchaseOrder> orders = purchaseService.getPurchasesByMedicine(medicineId);
        return ResponseEntity.ok(ApiResponse.success("Medicine purchase history retrieved", orders));
    }

    @PostMapping("/purchase")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create medicine purchase and assign stock to pharmacist (Admin only)")
    public ResponseEntity<ApiResponse<PurchaseOrder>> createPurchase(
            @Valid @RequestBody PurchaseRequestDto request,
            Principal principal
    ) {
        String createdBy = principal != null ? principal.getName() : "Admin User";
        PurchaseOrder savedOrder = purchaseService.createPurchase(request, createdBy);
        return ResponseEntity.ok(ApiResponse.success("Medicine purchase completed & stock assigned successfully", savedOrder));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Legacy create purchase order endpoint")
    public ResponseEntity<ApiResponse<PurchaseOrder>> createOrder(
            @Valid @RequestBody PurchaseRequestDto request,
            Principal principal
    ) {
        return createPurchase(request, principal);
    }

    @PutMapping("/{id}/deliver")
    @Operation(summary = "Mark purchase order as Delivered and restock inventory")
    public ResponseEntity<ApiResponse<PurchaseOrder>> deliverPurchase(@PathVariable Long id) {
        PurchaseOrder delivered = purchaseService.deliverPurchase(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order delivered & inventory restocked successfully", delivered));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cancel purchase order")
    public ResponseEntity<ApiResponse<PurchaseOrder>> cancelPurchase(@PathVariable Long id) {
        PurchaseOrder cancelled = purchaseService.cancelPurchase(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order cancelled", cancelled));
    }
}
