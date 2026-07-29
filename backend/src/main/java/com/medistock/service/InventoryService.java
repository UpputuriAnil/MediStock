package com.medistock.service;

import com.medistock.entity.Inventory;

import java.time.LocalDate;
import java.util.List;

public interface InventoryService {
    Inventory createInventory(Inventory inventory);
    Inventory updateInventory(Long id, Inventory inventory);
    Inventory getInventoryById(Long id);
    List<Inventory> getAllInventory();
    List<Inventory> getInventoryByMedicine(Long medicineId);
    List<Inventory> getInventoryBySupplier(Long supplierId);
    List<Inventory> getExpiringStock(LocalDate date);
    void deleteInventory(Long id);
    Integer getTotalStockByMedicine(Long medicineId);
    Inventory addStock(Long inventoryId, Integer quantity, String performedBy, String reason);
    Inventory removeStock(Long inventoryId, Integer quantity, String performedBy, String reason);
}
