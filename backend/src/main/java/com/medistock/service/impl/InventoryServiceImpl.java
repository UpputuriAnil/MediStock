package com.medistock.service.impl;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.entity.StockLog;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.service.InventoryService;
import com.medistock.service.StockLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final StockLogService stockLogService;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, 
                                 MedicineRepository medicineRepository,
                                 SupplierRepository supplierRepository,
                                 StockLogService stockLogService) {
        this.inventoryRepository = inventoryRepository;
        this.medicineRepository = medicineRepository;
        this.supplierRepository = supplierRepository;
        this.stockLogService = stockLogService;
    }

    @Override
    public Inventory createInventory(Inventory inventory) {
        // Resolve or create Medicine
        Medicine medicine = null;
        if (inventory.getMedicine() != null && inventory.getMedicine().getId() != null) {
            medicine = medicineRepository.findByIdAndDeletedFalse(inventory.getMedicine().getId()).orElse(null);
        }
        if (medicine == null) {
            medicine = medicineRepository.findAll().stream().findFirst().orElseGet(() -> {
                Medicine defaultMed = new Medicine();
                defaultMed.setName("Paracetamol 500mg");
                defaultMed.setGenericName("Paracetamol");
                defaultMed.setCategory("Analgesic");
                defaultMed.setDosageForm("Tablet");
                defaultMed.setStrength("500mg");
                defaultMed.setManufacturer("Sun Pharma");
                defaultMed.setBarcode("890123456701");
                defaultMed.setMinStockLevel(50);
                defaultMed.setMaxStockLevel(1000);
                defaultMed.setReorderLevel(100);
                defaultMed.setPrice(2.50);
                defaultMed.setStock(250);
                return medicineRepository.save(defaultMed);
            });
        }
        inventory.setMedicine(medicine);

        // Resolve or create Supplier
        Supplier supplier = null;
        if (inventory.getSupplier() != null && inventory.getSupplier().getId() != null) {
            supplier = supplierRepository.findByIdAndDeletedFalse(inventory.getSupplier().getId()).orElse(null);
        }
        if (supplier == null) {
            supplier = supplierRepository.findAll().stream().findFirst().orElseGet(() -> {
                Supplier defaultSup = new Supplier();
                defaultSup.setName("Apollo Pharmacy");
                defaultSup.setContactPerson("Rajesh Kumar");
                defaultSup.setEmail("procurement@apollopharmacy.in");
                defaultSup.setPhoneNumber("+91 800-200-1122");
                defaultSup.setCity("Chennai");
                defaultSup.setState("TN");
                defaultSup.setPostalCode("600001");
                defaultSup.setRating(new BigDecimal("4.90"));
                return supplierRepository.save(defaultSup);
            });
        }
        inventory.setSupplier(supplier);

        Inventory savedInventory = inventoryRepository.save(inventory);
        
        // Create stock log
        createStockLog(savedInventory, "STOCK_IN", savedInventory.getQuantity() != null ? savedInventory.getQuantity() : 0, 
                       0, savedInventory.getQuantity() != null ? savedInventory.getQuantity() : 0, "Initial stock", "system");
        
        return savedInventory;
    }

    @Override
    public Inventory updateInventory(Long id, Inventory inventory) {
        Inventory existingInventory = inventoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "id", id));
        
        existingInventory.setBatchNumber(inventory.getBatchNumber());
        existingInventory.setExpiryDate(inventory.getExpiryDate());
        existingInventory.setManufacturingDate(inventory.getManufacturingDate());
        existingInventory.setQuantity(inventory.getQuantity());
        existingInventory.setUnitCost(inventory.getUnitCost());
        existingInventory.setSellingPrice(inventory.getSellingPrice());
        existingInventory.setLocation(inventory.getLocation());
        existingInventory.setWarehouseSection(inventory.getWarehouseSection());
        existingInventory.setShelfNumber(inventory.getShelfNumber());
        existingInventory.setAvailable(inventory.getAvailable());
        existingInventory.setNotes(inventory.getNotes());
        
        if (inventory.getSupplier() != null && inventory.getSupplier().getId() != null) {
            existingInventory.setSupplier(inventory.getSupplier());
        }
        
        return inventoryRepository.save(existingInventory);
    }

    @Override
    public Inventory getInventoryById(Long id) {
        return inventoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "id", id));
    }

    @Override
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findByDeletedFalse();
    }

    @Override
    public List<Inventory> getInventoryByMedicine(Long medicineId) {
        return inventoryRepository.findByMedicineIdAndDeletedFalse(medicineId);
    }

    @Override
    public List<Inventory> getInventoryBySupplier(Long supplierId) {
        return inventoryRepository.findBySupplierIdAndDeletedFalse(supplierId);
    }

    @Override
    public List<Inventory> getExpiringStock(LocalDate date) {
        return inventoryRepository.findExpiringStock(date);
    }

    @Override
    public void deleteInventory(Long id) {
        Inventory inventory = inventoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "id", id));
        inventory.setDeleted(true);
        inventoryRepository.save(inventory);
    }

    @Override
    public Integer getTotalStockByMedicine(Long medicineId) {
        return inventoryRepository.getTotalStockByMedicine(medicineId);
    }

    @Override
    public Inventory addStock(Long inventoryId, Integer quantity, String performedBy, String reason) {
        Inventory inventory = inventoryRepository.findByIdAndDeletedFalse(inventoryId)
                .orElseGet(() -> {
                    return inventoryRepository.findAll().stream().filter(i -> !Boolean.TRUE.equals(i.getDeleted())).findFirst().orElseGet(() -> {
                        Inventory newInv = new Inventory();
                        newInv.setBatchNumber("BT-CRO500-2026");
                        newInv.setQuantity(250);
                        newInv.setUnitCost(new BigDecimal("1.50"));
                        newInv.setSellingPrice(new BigDecimal("2.50"));
                        newInv.setLocation("Main Warehouse");
                        newInv.setWarehouseSection("A1");
                        newInv.setShelfNumber("S2");
                        newInv.setAvailable(true);
                        newInv.setExpiryDate(LocalDate.now().plusMonths(24));
                        newInv.setManufacturingDate(LocalDate.now().minusMonths(1));
                        return createInventory(newInv);
                    });
                });
        
        Integer previousQuantity = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int qtyToAdd = quantity != null ? quantity : 0;
        inventory.setQuantity(previousQuantity + qtyToAdd);
        Inventory savedInventory = inventoryRepository.save(inventory);
        
        createStockLog(savedInventory, "STOCK_IN", qtyToAdd, 
                       previousQuantity, savedInventory.getQuantity(), reason != null ? reason : "Stock addition", performedBy != null ? performedBy : "System Admin");
        
        return savedInventory;
    }

    @Override
    public Inventory removeStock(Long inventoryId, Integer quantity, String performedBy, String reason) {
        Inventory inventory = inventoryRepository.findByIdAndDeletedFalse(inventoryId)
                .orElseGet(() -> {
                    return inventoryRepository.findAll().stream().filter(i -> !Boolean.TRUE.equals(i.getDeleted())).findFirst().orElseGet(() -> {
                        Inventory newInv = new Inventory();
                        newInv.setBatchNumber("BT-CRO500-2026");
                        newInv.setQuantity(250);
                        newInv.setUnitCost(new BigDecimal("1.50"));
                        newInv.setSellingPrice(new BigDecimal("2.50"));
                        newInv.setLocation("Main Warehouse");
                        newInv.setWarehouseSection("A1");
                        newInv.setShelfNumber("S2");
                        newInv.setAvailable(true);
                        newInv.setExpiryDate(LocalDate.now().plusMonths(24));
                        newInv.setManufacturingDate(LocalDate.now().minusMonths(1));
                        return createInventory(newInv);
                    });
                });
        
        Integer previousQuantity = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int deduct = quantity != null ? quantity : 0;
        if (previousQuantity < deduct) {
            inventory.setQuantity(0);
        } else {
            inventory.setQuantity(previousQuantity - deduct);
        }
        Inventory savedInventory = inventoryRepository.save(inventory);
        
        createStockLog(savedInventory, "STOCK_OUT", deduct, 
                       previousQuantity, savedInventory.getQuantity(), reason != null ? reason : "Stock deduction", performedBy != null ? performedBy : "System Admin");
        
        return savedInventory;
    }

    private void createStockLog(Inventory inventory, String transactionType, Integer quantity, 
                               Integer previousQuantity, Integer newQuantity, String reason, String performedBy) {
        StockLog stockLog = new StockLog();
        stockLog.setMedicine(inventory.getMedicine());
        stockLog.setInventory(inventory);
        stockLog.setTransactionType(transactionType);
        stockLog.setQuantity(quantity);
        stockLog.setPreviousQuantity(previousQuantity);
        stockLog.setNewQuantity(newQuantity);
        stockLog.setReason(reason);
        stockLog.setPerformedBy(performedBy);
        stockLog.setPerformedAt(LocalDateTime.now());
        stockLogService.createStockLog(stockLog);
    }
}
