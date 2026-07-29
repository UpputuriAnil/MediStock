package com.medistock.service.impl;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockLog;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.service.InventoryService;
import com.medistock.service.StockLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final StockLogService stockLogService;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, 
                                 MedicineRepository medicineRepository,
                                 StockLogService stockLogService) {
        this.inventoryRepository = inventoryRepository;
        this.medicineRepository = medicineRepository;
        this.stockLogService = stockLogService;
    }

    @Override
    public Inventory createInventory(Inventory inventory) {
        Medicine medicine = medicineRepository.findByIdAndDeletedFalse(inventory.getMedicine().getId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        
        inventory.setMedicine(medicine);
        Inventory savedInventory = inventoryRepository.save(inventory);
        
        // Create stock log
        createStockLog(savedInventory, "STOCK_IN", savedInventory.getQuantity(), 
                       0, savedInventory.getQuantity(), "Initial stock", "system");
        
        return savedInventory;
    }

    @Override
    public Inventory updateInventory(Long id, Inventory inventory) {
        Inventory existingInventory = inventoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found with id: " + id));
        
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
                .orElseThrow(() -> new RuntimeException("Inventory not found with id: " + id));
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
                .orElseThrow(() -> new RuntimeException("Inventory not found with id: " + id));
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
                .orElseThrow(() -> new RuntimeException("Inventory not found with id: " + inventoryId));
        
        Integer previousQuantity = inventory.getQuantity();
        inventory.setQuantity(previousQuantity + quantity);
        Inventory savedInventory = inventoryRepository.save(inventory);
        
        createStockLog(savedInventory, "STOCK_IN", quantity, 
                       previousQuantity, savedInventory.getQuantity(), reason, performedBy);
        
        return savedInventory;
    }

    @Override
    public Inventory removeStock(Long inventoryId, Integer quantity, String performedBy, String reason) {
        Inventory inventory = inventoryRepository.findByIdAndDeletedFalse(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found with id: " + inventoryId));
        
        Integer previousQuantity = inventory.getQuantity();
        if (previousQuantity < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + previousQuantity + ", Requested: " + quantity);
        }
        
        inventory.setQuantity(previousQuantity - quantity);
        Inventory savedInventory = inventoryRepository.save(inventory);
        
        createStockLog(savedInventory, "STOCK_OUT", quantity, 
                       previousQuantity, savedInventory.getQuantity(), reason, performedBy);
        
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
