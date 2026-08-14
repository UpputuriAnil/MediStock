package com.medistock.service;

import com.medistock.dto.PurchaseRequestDto;
import com.medistock.entity.PurchaseOrder;

import java.util.List;

public interface PurchaseService {
    PurchaseOrder createPurchase(PurchaseRequestDto request, String createdBy);
    List<PurchaseOrder> getAllPurchases();
    PurchaseOrder getPurchaseById(Long id);
    List<PurchaseOrder> getPurchasesByPharmacist(Long pharmacistId);
    List<PurchaseOrder> getPurchasesByPharmacistEmail(String email);
    List<PurchaseOrder> getPurchasesByMedicine(Long medicineId);
    List<PurchaseOrder> getPurchasesBySupplier(Long supplierId);
    PurchaseOrder deliverPurchase(Long id);
    PurchaseOrder cancelPurchase(Long id);
}
