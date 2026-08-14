package com.medistock.repository;

import com.medistock.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);
    List<PurchaseOrder> findByAssignedPharmacistId(Long pharmacistId);
    List<PurchaseOrder> findByAssignedPharmacistEmail(String pharmacistEmail);
    List<PurchaseOrder> findByMedicineId(Long medicineId);
    List<PurchaseOrder> findBySupplierId(Long supplierId);
}
