package com.medistock.repository;

import com.medistock.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByIdAndDeletedFalse(Long id);

    List<Inventory> findByDeletedFalse();

    List<Inventory> findByMedicineIdAndDeletedFalse(Long medicineId);

    List<Inventory> findBySupplierIdAndDeletedFalse(Long supplierId);

    Optional<Inventory> findByBatchNumberAndDeletedFalse(String batchNumber);

    @Query("SELECT i FROM Inventory i WHERE i.deleted = false AND i.available = true AND " +
           "i.expiryDate <= :date")
    List<Inventory> findExpiringStock(LocalDate date);

    @Query("SELECT i FROM Inventory i WHERE i.deleted = false AND i.medicine.id = :medicineId " +
           "ORDER BY i.expiryDate ASC")
    List<Inventory> findByMedicineIdOrderByExpiryDate(Long medicineId);

    @Query("SELECT SUM(i.quantity) FROM Inventory i WHERE i.deleted = false AND " +
           "i.medicine.id = :medicineId AND i.available = true")
    Integer getTotalStockByMedicine(Long medicineId);
}
