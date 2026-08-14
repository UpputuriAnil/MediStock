package com.medistock.service;

import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;

import java.util.List;

public interface SupplierService {
    Supplier createSupplier(Supplier supplier);
    Supplier updateSupplier(Long id, Supplier supplier);
    Supplier getSupplierById(Long id);
    List<Supplier> getAllSuppliers();
    List<Supplier> searchSuppliers(String keyword);
    List<Medicine> getMedicinesBySupplier(Long supplierId);
    void linkSupplierToMedicine(Long supplierId, Long medicineId);
    void deleteSupplier(Long id);
    Supplier toggleActiveStatus(Long id);
}
