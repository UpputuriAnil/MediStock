package com.medistock.service.impl;

import com.medistock.entity.Medicine;
import com.medistock.repository.MedicineRepository;
import com.medistock.service.MedicineService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineServiceImpl(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Override
    public Medicine createMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    @Override
    public Medicine updateMedicine(Long id, Medicine medicine) {
        Medicine existingMedicine = medicineRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        
        existingMedicine.setName(medicine.getName());
        existingMedicine.setGenericName(medicine.getGenericName());
        existingMedicine.setDescription(medicine.getDescription());
        existingMedicine.setCategory(medicine.getCategory());
        existingMedicine.setDosageForm(medicine.getDosageForm());
        existingMedicine.setStrength(medicine.getStrength());
        existingMedicine.setManufacturer(medicine.getManufacturer());
        existingMedicine.setBarcode(medicine.getBarcode());
        existingMedicine.setNdcCode(medicine.getNdcCode());
        existingMedicine.setStorageConditions(medicine.getStorageConditions());
        existingMedicine.setMinStockLevel(medicine.getMinStockLevel());
        existingMedicine.setMaxStockLevel(medicine.getMaxStockLevel());
        existingMedicine.setReorderLevel(medicine.getReorderLevel());
        existingMedicine.setUnitOfMeasure(medicine.getUnitOfMeasure());
        existingMedicine.setPrescriptionRequired(medicine.getPrescriptionRequired());
        existingMedicine.setControlledSubstance(medicine.getControlledSubstance());
        existingMedicine.setScheduleNumber(medicine.getScheduleNumber());
        existingMedicine.setNotes(medicine.getNotes());
        
        return medicineRepository.save(existingMedicine);
    }

    @Override
    public Medicine getMedicineById(Long id) {
        return medicineRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
    }

    @Override
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findByDeletedFalse();
    }

    @Override
    public List<Medicine> searchMedicines(String keyword) {
        return medicineRepository.searchMedicines(keyword);
    }

    @Override
    public List<Medicine> getLowStockMedicines() {
        return medicineRepository.findLowStockMedicines();
    }

    @Override
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        medicine.setDeleted(true);
        medicineRepository.save(medicine);
    }

    @Override
    public Medicine toggleActiveStatus(Long id) {
        Medicine medicine = medicineRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        medicine.setActive(!medicine.getActive());
        return medicineRepository.save(medicine);
    }
}
