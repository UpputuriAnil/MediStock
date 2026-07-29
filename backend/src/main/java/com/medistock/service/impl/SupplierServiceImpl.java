package com.medistock.service.impl;

import com.medistock.entity.Supplier;
import com.medistock.repository.SupplierRepository;
import com.medistock.service.SupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
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
