package com.medistock.service.impl;

import com.medistock.entity.StockLog;
import com.medistock.repository.StockLogRepository;
import com.medistock.service.StockLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class StockLogServiceImpl implements StockLogService {

    private final StockLogRepository stockLogRepository;

    public StockLogServiceImpl(StockLogRepository stockLogRepository) {
        this.stockLogRepository = stockLogRepository;
    }

    @Override
    public StockLog createStockLog(StockLog stockLog) {
        return stockLogRepository.save(stockLog);
    }

    @Override
    public StockLog getStockLogById(Long id) {
        return stockLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock log not found with id: " + id));
    }

    @Override
    public List<StockLog> getStockLogsByMedicine(Long medicineId) {
        return stockLogRepository.findByMedicineIdOrderByPerformedAtDesc(medicineId);
    }

    @Override
    public List<StockLog> getStockLogsByInventory(Long inventoryId) {
        return stockLogRepository.findByInventoryIdOrderByPerformedAtDesc(inventoryId);
    }

    @Override
    public List<StockLog> getStockLogsByTransactionType(String transactionType) {
        return stockLogRepository.findByTransactionTypeOrderByPerformedAtDesc(transactionType);
    }

    @Override
    public List<StockLog> getStockLogsByPerformedBy(String performedBy) {
        return stockLogRepository.findByPerformedByOrderByPerformedAtDesc(performedBy);
    }

    @Override
    public List<StockLog> getStockLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return stockLogRepository.findByDateRange(startDate, endDate);
    }

    @Override
    public List<StockLog> getAllStockLogs() {
        return stockLogRepository.findAll();
    }
}
