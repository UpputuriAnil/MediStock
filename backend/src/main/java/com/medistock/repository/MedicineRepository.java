package com.medistock.repository;

import com.medistock.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

       Optional<Medicine> findByIdAndDeletedFalse(Long id);

       List<Medicine> findByDeletedFalse();

       List<Medicine> findByActiveTrueAndDeletedFalse();

       Optional<Medicine> findByBarcodeAndDeletedFalse(String barcode);

       Optional<Medicine> findByNdcCodeAndDeletedFalse(String ndcCode);

       @Query("SELECT m FROM Medicine m WHERE m.deleted = false AND " +
                     "(LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(m.category) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       List<Medicine> searchMedicines(String keyword);

       @Query("SELECT m FROM Medicine m WHERE m.deleted = false AND m.active = true AND " +
                     "m.minStockLevel >= (SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i WHERE i.medicine.id = m.id AND i.deleted = false AND i.available = true)")
       List<Medicine> findLowStockMedicines();
}
