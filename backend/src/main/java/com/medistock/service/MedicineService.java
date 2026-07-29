package com.medistock.service;

import com.medistock.entity.Medicine;

import java.util.List;

public interface MedicineService {
    Medicine createMedicine(Medicine medicine);
    Medicine updateMedicine(Long id, Medicine medicine);
    Medicine getMedicineById(Long id);
    List<Medicine> getAllMedicines();
    List<Medicine> searchMedicines(String keyword);
    List<Medicine> getLowStockMedicines();
    void deleteMedicine(Long id);
    Medicine toggleActiveStatus(Long id);
}
