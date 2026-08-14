package com.medistock.service.impl;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.service.SupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository,
                               MedicineRepository medicineRepository,
                               InventoryRepository inventoryRepository) {
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Override
    public Supplier updateSupplier(Long id, Supplier supplier) {
        Supplier existingSupplier = supplierRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        
        existingSupplier.setName(supplier.getName());
        existingSupplier.setContactPerson(supplier.getContactPerson());
        existingSupplier.setEmail(supplier.getEmail());
        existingSupplier.setPhoneNumber(supplier.getPhoneNumber());
        existingSupplier.setAddress(supplier.getAddress());
        existingSupplier.setCity(supplier.getCity());
        existingSupplier.setState(supplier.getState());
        existingSupplier.setPostalCode(supplier.getPostalCode());
        existingSupplier.setCountry(supplier.getCountry());
        existingSupplier.setTaxId(supplier.getTaxId());
        existingSupplier.setLicenseNumber(supplier.getLicenseNumber());
        existingSupplier.setRating(supplier.getRating());
        existingSupplier.setNotes(supplier.getNotes());
        
        return supplierRepository.save(existingSupplier);
    }

    @Override
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
    }

    @Override
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findByDeletedFalse();
    }

    @Override
    public List<Supplier> searchSuppliers(String keyword) {
        return supplierRepository.searchSuppliers(keyword);
    }

    @Override
    public List<Medicine> getMedicinesBySupplier(Long supplierId) {
        // Ensure supplier exists
        getSupplierById(supplierId);
        return inventoryRepository.findMedicinesBySupplierId(supplierId);
    }

    @Override
    public void linkSupplierToMedicine(Long supplierId, Long medicineId) {
        Supplier supplier = getSupplierById(supplierId);
        Medicine medicine = medicineRepository.findByIdAndDeletedFalse(medicineId)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + medicineId));

        List<Medicine> existingMedicines = inventoryRepository.findMedicinesBySupplierId(supplierId);
        boolean alreadyLinked = existingMedicines.stream().anyMatch(m -> m.getId().equals(medicineId));

        if (!alreadyLinked) {
            Inventory inventoryLink = new Inventory();
            inventoryLink.setSupplier(supplier);
            inventoryLink.setMedicine(medicine);
            inventoryLink.setQuantity(0);
            inventoryLink.setAvailable(true);
            inventoryLink.setNotes("Linked supplier: " + supplier.getName());
            inventoryRepository.save(inventoryLink);
        }
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        supplier.setDeleted(true);
        supplierRepository.save(supplier);
    }

    @Override
    public Supplier toggleActiveStatus(Long id) {
        Supplier supplier = supplierRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        supplier.setActive(!supplier.getActive());
        return supplierRepository.save(supplier);
    }
}
