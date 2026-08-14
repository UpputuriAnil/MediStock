package com.medistock.service.impl;

import com.medistock.dto.PurchaseRequestDto;
import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.entity.PurchaseOrder;
import com.medistock.entity.StockLog;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseOrderRepository;
import com.medistock.repository.StockLogRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import com.medistock.service.PurchaseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final StockLogRepository stockLogRepository;
    private final InventoryRepository inventoryRepository;

    public PurchaseServiceImpl(
            PurchaseOrderRepository purchaseOrderRepository,
            MedicineRepository medicineRepository,
            SupplierRepository supplierRepository,
            UserRepository userRepository,
            StockLogRepository stockLogRepository,
            InventoryRepository inventoryRepository
    ) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.medicineRepository = medicineRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.stockLogRepository = stockLogRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public PurchaseOrder createPurchase(PurchaseRequestDto request, String createdBy) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        if (request.getPricePerUnit() == null || request.getPricePerUnit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price per unit must be greater than zero");
        }
        if (request.getExpiryDate() != null && request.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Expiry date cannot be in the past");
        }

        // 1. Resolve or create Medicine Catalog entry
        Medicine medicine = null;
        if (request.getMedicineId() != null) {
            medicine = medicineRepository.findById(request.getMedicineId()).orElse(null);
        }
        if (medicine == null && request.getMedicineName() != null) {
            medicine = new Medicine();
            medicine.setName(request.getMedicineName());
            medicine.setGenericName(request.getMedicineName());
            medicine.setCategory(request.getCategory() != null ? request.getCategory() : "General Pharmaceuticals");
            medicine.setStock(0);
            medicine.setPrice(request.getPricePerUnit().doubleValue());
            medicine.setBatchNumber(request.getBatchNumber());
            medicine.setStatus("Low Stock");
            medicine = medicineRepository.save(medicine);
        }

        // 2. Resolve Supplier
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        }

        // 3. Resolve Assigned Pharmacist
        User pharmacist = null;
        if (request.getPharmacistId() != null) {
            pharmacist = userRepository.findById(request.getPharmacistId()).orElse(null);
        }

        // 4. Calculate Total Price
        BigDecimal totalPrice = request.getPricePerUnit().multiply(BigDecimal.valueOf(request.getQuantity()));

        // 5. Create Purchase Order Record with initial status 'Pending'
        PurchaseOrder order = new PurchaseOrder();
        order.setOrderNumber("PO-" + System.currentTimeMillis() % 1000000);
        order.setMedicine(medicine);
        order.setMedicineName(medicine != null ? medicine.getName() : request.getMedicineName());
        order.setSupplier(supplier);
        order.setSupplierName(supplier != null ? supplier.getName() : request.getSupplierName());
        order.setAssignedPharmacist(pharmacist);
        order.setAssignedPharmacistName(pharmacist != null ? pharmacist.getName() : request.getPharmacistName());
        order.setAssignedPharmacistEmail(pharmacist != null ? pharmacist.getEmail() : request.getPharmacistEmail());
        order.setQuantity(request.getQuantity());
        order.setPricePerUnit(request.getPricePerUnit());
        order.setTotalAmount(totalPrice);
        order.setItemsCount(request.getQuantity());
        order.setBatchNumber(request.getBatchNumber());
        if (request.getExpiryDate() != null) {
            order.setExpiryDate(request.getExpiryDate().atStartOfDay());
        }
        order.setInvoiceNumber(request.getInvoiceNumber());
        order.setNotes(request.getNotes());
        order.setStatus("Pending"); // Stock is NOT added until supplier delivers
        order.setOrderedDate(LocalDateTime.now());
        order.setCreatedByName(createdBy != null ? createdBy : "Admin User");

        return purchaseOrderRepository.save(order);
    }

    @Override
    public PurchaseOrder deliverPurchase(Long id) {
        PurchaseOrder order = getPurchaseById(id);
        if ("Delivered".equalsIgnoreCase(order.getStatus()) || "Completed".equalsIgnoreCase(order.getStatus())) {
            return order; // Already delivered
        }

        order.setStatus("Delivered");
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        // Increase Medicine Stock upon Supplier Delivery
        Medicine medicine = order.getMedicine();
        if (medicine != null) {
            int currentStock = medicine.getStock() != null ? medicine.getStock() : 0;
            int qty = order.getQuantity() != null ? order.getQuantity() : 1;
            medicine.setStock(currentStock + qty);
            if (order.getBatchNumber() != null) {
                medicine.setBatchNumber(order.getBatchNumber());
            }
            medicine.setStatus("In Stock");
            medicineRepository.save(medicine);

            // Create Inventory Batch Record
            Inventory inv = new Inventory();
            inv.setMedicine(medicine);
            inv.setSupplier(order.getSupplier());
            inv.setBatchNumber(order.getBatchNumber());
            if (order.getExpiryDate() != null) {
                inv.setExpiryDate(order.getExpiryDate().toLocalDate());
            }
            inv.setQuantity(qty);
            inv.setUnitCost(order.getPricePerUnit());
            inv.setSellingPrice(order.getPricePerUnit());
            inv.setAvailable(true);
            inv.setCreatedBy("Supplier Delivery");
            inv = inventoryRepository.save(inv);

            // Log Stock Transaction
            StockLog log = new StockLog();
            log.setMedicine(medicine);
            log.setInventory(inv);
            log.setQuantity(qty);
            log.setPreviousQuantity(currentStock);
            log.setNewQuantity(currentStock + qty);
            log.setTransactionType("Stock In");
            log.setReferenceType("PURCHASE_ORDER_DELIVERY");
            log.setReferenceNumber(order.getOrderNumber());
            log.setReason("Supplier delivered Purchase Order " + order.getOrderNumber() + " (" + qty + " units assigned to " + (order.getAssignedPharmacistName() != null ? order.getAssignedPharmacistName() : "Pharmacist") + ")");
            log.setPerformedBy(order.getSupplierName() != null ? order.getSupplierName() : "Supplier Delivery");
            log.setPerformedAt(LocalDateTime.now());
            stockLogRepository.save(log);
        }

        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> getAllPurchases() {
        return purchaseOrderRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> getPurchasesByPharmacist(Long pharmacistId) {
        return purchaseOrderRepository.findByAssignedPharmacistId(pharmacistId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> getPurchasesByPharmacistEmail(String email) {
        return purchaseOrderRepository.findByAssignedPharmacistEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> getPurchasesByMedicine(Long medicineId) {
        return purchaseOrderRepository.findByMedicineId(medicineId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> getPurchasesBySupplier(Long supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId);
    }

    @Override
    public PurchaseOrder cancelPurchase(Long id) {
        PurchaseOrder order = getPurchaseById(id);
        order.setStatus("Cancelled");
        return purchaseOrderRepository.save(order);
    }
}
