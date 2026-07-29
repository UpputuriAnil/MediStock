package com.medistock.service;

import com.medistock.entity.StockLog;

import java.time.LocalDateTime;
import java.util.List;

public interface StockLogService {
    StockLog createStockLog(StockLog stockLog);
    StockLog getStockLogById(Long id);
    List<StockLog> getStockLogsByMedicine(Long medicineId);
    List<StockLog> getStockLogsByInventory(Long inventoryId);
    List<StockLog> getStockLogsByTransactionType(String transactionType);
    List<StockLog> getStockLogsByPerformedBy(String performedBy);
    List<StockLog> getStockLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    List<StockLog> getAllStockLogs();
}
