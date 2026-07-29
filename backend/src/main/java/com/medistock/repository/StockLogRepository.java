package com.medistock.repository;

import com.medistock.entity.StockLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockLogRepository extends JpaRepository<StockLog, Long> {

    List<StockLog> findByMedicineIdOrderByPerformedAtDesc(Long medicineId);

    List<StockLog> findByInventoryIdOrderByPerformedAtDesc(Long inventoryId);

    List<StockLog> findByTransactionTypeOrderByPerformedAtDesc(String transactionType);

    List<StockLog> findByPerformedByOrderByPerformedAtDesc(String performedBy);

    @Query("SELECT sl FROM StockLog sl WHERE sl.performedAt BETWEEN :startDate AND :endDate " +
           "ORDER BY sl.performedAt DESC")
    List<StockLog> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT sl FROM StockLog sl WHERE sl.medicine.id = :medicineId AND " +
           "sl.performedAt BETWEEN :startDate AND :endDate ORDER BY sl.performedAt DESC")
    List<StockLog> findByMedicineAndDateRange(Long medicineId, LocalDateTime startDate, LocalDateTime endDate);
}
