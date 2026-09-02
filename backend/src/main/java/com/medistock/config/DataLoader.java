package com.medistock.config;

import com.medistock.entity.*;
import com.medistock.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.context.annotation.DependsOn;

@Component
@DependsOn("postgreSQLSchemaInitializer")
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ExpiryTrackingRepository expiryTrackingRepository;
    private final NotificationRepository notificationRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, RoleRepository roleRepository,
                      PermissionRepository permissionRepository, SupplierRepository supplierRepository,
                      MedicineRepository medicineRepository, InventoryRepository inventoryRepository,
                      PurchaseOrderRepository purchaseOrderRepository,
                      ExpiryTrackingRepository expiryTrackingRepository,
                      NotificationRepository notificationRepository,
                      ReportRepository reportRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.expiryTrackingRepository = expiryTrackingRepository;
        this.notificationRepository = notificationRepository;
        this.reportRepository = reportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            loadSeedData();
        } catch (Exception e) {
            log.error("MediStock DataLoader encountered an initialization warning: {}", e.getMessage());
        }
    }

    private void loadSeedData() {
        // Step 1: Create Permissions (idempotent)
        Set<Permission> permissions = new HashSet<>();
        permissions.add(getOrCreatePermission("USER_CREATE", "Create new users", "USER"));
        permissions.add(getOrCreatePermission("USER_READ", "View user information", "USER"));
        permissions.add(getOrCreatePermission("USER_UPDATE", "Update user information", "USER"));
        permissions.add(getOrCreatePermission("USER_DELETE", "Delete users", "USER"));
        permissions.add(getOrCreatePermission("ROLE_CREATE", "Create new roles", "ROLE"));
        permissions.add(getOrCreatePermission("ROLE_READ", "View role information", "ROLE"));
        permissions.add(getOrCreatePermission("ROLE_UPDATE", "Update role information", "ROLE"));
        permissions.add(getOrCreatePermission("ROLE_DELETE", "Delete roles", "ROLE"));
        permissions.add(getOrCreatePermission("MEDICINE_CREATE", "Create new medicines", "MEDICINE"));
        permissions.add(getOrCreatePermission("MEDICINE_READ", "View medicine information", "MEDICINE"));
        permissions.add(getOrCreatePermission("MEDICINE_UPDATE", "Update medicine information", "MEDICINE"));
        permissions.add(getOrCreatePermission("MEDICINE_DELETE", "Delete medicines", "MEDICINE"));
        permissions.add(getOrCreatePermission("SUPPLIER_CREATE", "Create new suppliers", "SUPPLIER"));
        permissions.add(getOrCreatePermission("SUPPLIER_READ", "View supplier information", "SUPPLIER"));
        permissions.add(getOrCreatePermission("SUPPLIER_UPDATE", "Update supplier information", "SUPPLIER"));
        permissions.add(getOrCreatePermission("SUPPLIER_DELETE", "Delete suppliers", "SUPPLIER"));
        permissions.add(getOrCreatePermission("INVENTORY_CREATE", "Create inventory records", "INVENTORY"));
        permissions.add(getOrCreatePermission("INVENTORY_READ", "View inventory information", "INVENTORY"));
        permissions.add(getOrCreatePermission("INVENTORY_UPDATE", "Update inventory information", "INVENTORY"));
        permissions.add(getOrCreatePermission("INVENTORY_DELETE", "Delete inventory records", "INVENTORY"));
        permissions.add(getOrCreatePermission("REPORT_READ", "View reports", "REPORT"));
        permissions.add(getOrCreatePermission("DASHBOARD_READ", "View dashboard", "DASHBOARD"));
        permissions.add(getOrCreatePermission("NOTIFICATION_SEND", "Send notifications", "NOTIFICATION"));

        // Step 2: Create Roles (idempotent)
        Role adminRole = getOrCreateRole("ROLE_ADMIN", "Administrator with full system access", permissions);
        Role pharmacistRole = getOrCreateRole("ROLE_PHARMACIST", "Pharmacist with medicine, inventory, supplier, and purchase management access",
                getPermissionsByName(permissions, "MEDICINE_READ", "MEDICINE_CREATE", "MEDICINE_UPDATE",
                        "SUPPLIER_READ", "SUPPLIER_CREATE", "SUPPLIER_UPDATE", "INVENTORY_READ", "INVENTORY_CREATE", "INVENTORY_UPDATE",
                        "REPORT_READ", "DASHBOARD_READ", "NOTIFICATION_SEND"));

        // Step 3: Create Users (idempotent)
        createUserIfNotFound("admin@medistock.com", "Admin@123", "System", "Administrator", "+1234567890", Set.of(adminRole));
        createUserIfNotFound("pharmacist@medistock.com", "Pharmacist@123", "John", "Doe", "+1234567891", Set.of(pharmacistRole));

        // Step 4: Create Suppliers if table empty
        if (supplierRepository.count() == 0) {
            Supplier sup1 = createSupplier("Apollo Pharmacy", "Rajesh Kumar", "procurement@apollopharmacy.in", "+91 800-200-1122", "Apollo Logistics Hub", "Chennai", "TN", "600001", new BigDecimal("4.90"));
            Supplier sup2 = createSupplier("MedPlus", "Suresh Reddy", "orders@medplusindia.com", "+91 800-425-0000", "MedPlus Wholesale Hub", "Hyderabad", "TS", "500001", new BigDecimal("4.80"));
            Supplier sup3 = createSupplier("PharmEasy", "Anish Sharma", "supply@pharmeasy.in", "+91 800-120-8888", "PharmEasy Fulfillment Center", "Mumbai", "MH", "400001", new BigDecimal("4.70"));
            createSupplier("1mg / Tata 1mg", "Priya Nair", "b2b@1mg.com", "+91 800-300-9999", "Tata 1mg Warehouse Depot", "Gurgaon", "HR", "122001", new BigDecimal("4.80"));
            createSupplier("Netmeds", "Venkatesh Iyer", "distributors@netmeds.com", "+91 800-540-3333", "Netmeds Logistics Park", "Chennai", "TN", "600002", new BigDecimal("4.60"));
            createSupplier("Cipla", "Dr. Yusuf Hamied", "institutional@cipla.com", "+91 22-2482-6000", "Cipla House, BKC", "Mumbai", "MH", "400051", new BigDecimal("5.00"));
            createSupplier("Sun Pharmaceutical Industries", "Amitabh Gupta", "sales@sunpharma.com", "+91 22-4324-4324", "Sun House, Goregaon East", "Mumbai", "MH", "400063", new BigDecimal("4.90"));
            createSupplier("Dr. Reddy's Laboratories", "K. Satish Reddy", "corporate@drreddys.com", "+91 40-4900-2900", "Greenlands, Ameerpet", "Hyderabad", "TS", "500016", new BigDecimal("4.90"));
            createSupplier("Abbott", "Vikram Shroff", "orders@abbott.co.in", "+91 22-3816-2000", "Godrej BKC, Bandra East", "Mumbai", "MH", "400051", new BigDecimal("4.80"));
            createSupplier("Alkem Laboratories", "Sandeep Singh", "b2b@alkem.com", "+91 22-3982-9999", "Alkem House, Senapati Bapat Marg", "Mumbai", "MH", "400013", new BigDecimal("4.60"));
            createSupplier("Zydus Lifesciences", "Pankaj Patel", "contact@zyduslife.com", "+91 79-4804-0000", "Zydus Corporate Park", "Ahmedabad", "GJ", "380054", new BigDecimal("4.70"));
            createSupplier("Torrent Pharmaceuticals", "Samir Mehta", "supply@torrentpharma.com", "+91 79-2686-6666", "Torrent House, Ashram Road", "Ahmedabad", "GJ", "380009", new BigDecimal("4.70"));
            createSupplier("Glenmark Pharmaceuticals", "Glenn Saldanha", "institutional@glenmarkpharma.com", "+91 22-4018-9999", "Glenmark House, B.D. Sawant Marg", "Mumbai", "MH", "400099", new BigDecimal("4.60"));
            createSupplier("Micro Labs", "Dilip Surana", "orders@microlabs.in", "+91 80-2225-1509", "Micro Labs House, Race Course Road", "Bengaluru", "KA", "560001", new BigDecimal("4.80"));
            createSupplier("Lupin", "Nilesh Gupta", "info@lupin.com", "+91 22-6640-2222", "Kalpataru Inspire, BKC", "Mumbai", "MH", "400051", new BigDecimal("4.70"));
            createSupplier("Mankind Pharma", "Rajeev Juneja", "contact@mankindpharma.com", "+91 11-4654-1111", "Mankind House, Okhla Phase III", "New Delhi", "DL", "110020", new BigDecimal("4.60"));

            // Step 5: Create Medicines if table empty
            if (medicineRepository.count() == 0) {
                Medicine m1 = createMedicine("Paracetamol 500mg", "Paracetamol 500mg", "Crocin", "Crocin (Paracetamol 500mg) for fever reduction and mild analgesia.", "Analgesic / Antipyretic", "Tablet", "500mg", "Sun Pharma", "MedPlus", "890123456701", 300, 3000, 500, 2.00, 1200);
                Medicine m2 = createMedicine("Paracetamol 650mg", "Paracetamol 650mg", "Dolo 650", "Dolo 650 (Paracetamol 650mg) by Micro Labs for acute fever and aches.", "Analgesic / Antipyretic", "Tablet", "650mg", "Micro Labs", "MedPlus", "890123456702", 150, 2000, 300, 2.50, 500);
                Medicine m3 = createMedicine("Amoxicillin 500mg", "Amoxicillin 500mg", "Mox 500", "Mox 500 (Amoxicillin 500mg) broad-spectrum antibiotic capsule.", "Antibiotic", "Capsule", "500mg", "Sun Pharma", "Apollo Pharmacy", "890123456703", 300, 3000, 500, 8.50, 1450);
                createMedicine("Azithromycin 500mg", "Azithromycin 500mg", "Azithral 500", "Azithral 500 macrolide antibiotic for upper respiratory infections.", "Antibiotic", "Tablet", "500mg", "Alembic Pharma", "PharmEasy", "890123456704", 100, 1500, 200, 22.00, 620);
                createMedicine("Cetirizine 10mg", "Cetirizine 10mg", "Cetirizine", "Cetirizine 10mg non-drowsy antihistamine for allergic rhinitis.", "Antihistamine", "Tablet", "10mg", "Dr. Reddy's Laboratories", "1mg / Tata 1mg", "890123456705", 200, 2000, 400, 3.50, 890);
                createMedicine("Pantoprazole 40mg", "Pantoprazole 40mg", "Pantocid 40", "Pantocid 40 proton pump inhibitor for GERD and acidity.", "Gastrointestinal", "Tablet", "40mg", "Sun Pharma", "Netmeds", "890123456706", 150, 2000, 300, 9.00, 740);
                Medicine m7 = createMedicine("Omeprazole 20mg", "Omeprazole 20mg", "Omez 20", "Omez 20 capsules for peptic ulcer and gastric acid suppression.", "Gastrointestinal", "Capsule", "20mg", "Dr. Reddy's Laboratories", "Apollo Pharmacy", "890123456707", 120, 1500, 200, 7.00, 98);
                createMedicine("Ibuprofen 400mg", "Ibuprofen 400mg", "Brufen 400", "Brufen 400 (Ibuprofen) NSAID for pain, swelling, and inflammation.", "NSAID / Pain Relief", "Tablet", "400mg", "Abbott", "MedPlus", "890123456708", 400, 4000, 600, 4.00, 1800);
                createMedicine("Diclofenac 50mg", "Diclofenac 50mg", "Voveran 50", "Voveran 50 (Diclofenac Sodium) for musculoskeletal pain.", "NSAID / Pain Relief", "Tablet", "50mg", "Novartis", "Sun Pharmaceutical Industries", "890123456709", 100, 1000, 200, 6.50, 430);
                createMedicine("Metformin 500mg", "Metformin 500mg", "Glycomet 500", "Glycomet 500 (Metformin HCl) first-line type-2 diabetes treatment.", "Antidiabetic", "Tablet", "500mg", "USV", "Dr. Reddy's Laboratories", "890123456710", 500, 5000, 800, 3.00, 2100);
                createMedicine("Glimepiride 1mg", "Glimepiride 1mg", "Amaryl 1mg", "Amaryl 1mg sulfonylurea antidiabetic agent for glycemic control.", "Antidiabetic", "Tablet", "1mg", "Sanofi", "Abbott", "890123456711", 80, 1000, 150, 5.50, 350);
                createMedicine("Amlodipine 5mg", "Amlodipine 5mg", "Amlong 5", "Amlong 5 calcium channel blocker for hypertension & angina.", "Antihypertensive", "Tablet", "5mg", "Micro Labs", "Alkem Laboratories", "890123456712", 250, 3000, 400, 4.20, 1100);
                createMedicine("Losartan 50mg", "Losartan 50mg", "Losar 50", "Losar 50 angiotensin II receptor blocker for blood pressure control.", "Antihypertensive", "Tablet", "50mg", "Unichem", "Torrent Pharmaceuticals", "890123456713", 150, 2000, 300, 8.00, 670);
                Medicine m14 = createMedicine("Atorvastatin 10mg", "Atorvastatin 10mg", "Atorva 10", "Atorva 10 lipid-lowering statin for hypercholesterolemia management.", "Statin / Cholesterol", "Tablet", "10mg", "Zydus Lifesciences", "Glenmark Pharmaceuticals", "890123456714", 150, 1500, 250, 12.00, 85);
                createMedicine("Levothyroxine 50mcg", "Levothyroxine 50mcg", "Thyronorm 50", "Thyronorm 50 synthetic thyroid hormone T4 for hypothyroidism.", "Thyroid", "Tablet", "50mcg", "Abbott", "Lupin", "890123456715", 300, 3000, 500, 3.80, 1600);
                createMedicine("Ondansetron 4mg", "Ondansetron 4mg", "Ondem 4", "Ondem 4 serotonin 5-HT3 receptor antagonist for nausea & vomiting.", "Antiemetic", "Tablet", "4mg", "Alkem Laboratories", "Mankind Pharma", "890123456716", 100, 1500, 200, 11.00, 530);
                createMedicine("Domperidone 10mg", "Domperidone 10mg", "Domstal 10", "Domstal 10 dopamine antagonist prokinetic for upper GI motility.", "Gastrointestinal", "Tablet", "10mg", "Torrent Pharma", "Apollo Pharmacy", "890123456717", 150, 2000, 300, 4.50, 710);
                createMedicine("Salbutamol 4mg", "Salbutamol 4mg", "Asthalin", "Asthalin (Salbutamol 4mg) short-acting beta-agonist for asthma.", "Bronchodilator", "Tablet", "4mg", "Cipla", "Cipla", "890123456718", 200, 2500, 400, 15.00, 1250);
                createMedicine("Montelukast 10mg", "Montelukast 10mg", "Montair 10", "Montair 10 leukotriene receptor antagonist for allergic rhinitis & asthma.", "Anti-allergic", "Tablet", "10mg", "Cipla", "PharmEasy", "890123456719", 100, 1500, 200, 14.00, 480);
                createMedicine("Multivitamin Tablets", "Multivitamin Tablets", "Becosules", "Becosules B-complex multivitamin capsules with Vitamin C.", "Vitamins / Supplements", "Capsule", "Multi", "Pfizer", "Netmeds", "890123456720", 500, 5000, 800, 5.00, 2500);
                createMedicine("ORS Sachet", "Oral Rehydration Salts", "Electral", "Electral WHO-formula oral rehydration salts for dehydration.", "Electrolyte", "Sachet", "21.8g", "FDC Limited", "1mg / Tata 1mg", "890123456721", 600, 6000, 1000, 18.00, 3200);
                createMedicine("Clotrimazole 1%", "Clotrimazole 1% Cream", "Candid Cream", "Candid Cream (Clotrimazole 1%) broad-spectrum topical antifungal.", "Antifungal", "Cream", "15g", "Glenmark", "Micro Labs", "890123456722", 80, 1000, 150, 45.00, 340);
                createMedicine("Mupirocin 2%", "Mupirocin 2% Ointment", "T-Bact", "T-Bact (Mupirocin 2%) topical antibacterial ointment for impetigo.", "Antibiotic / Topical", "Ointment", "5g", "Glenmark", "MedPlus", "890123456723", 50, 800, 100, 85.00, 210);
                createMedicine("Povidone-Iodine", "Povidone-Iodine 10%", "Betadine", "Betadine (Povidone-Iodine 10%) microbicidal topical antiseptic solution.", "Antiseptic", "Solution", "100ml", "Win-Medicare", "Apollo Pharmacy", "890123456724", 100, 1500, 200, 65.00, 580);
                createMedicine("Calcium + Vitamin D3", "Calcium Carbonate 500mg + Vit D3 250 IU", "Shelcal 500", "Shelcal 500 (Calcium + Vitamin D3) for bone mineral density support.", "Supplement", "Tablet", "500mg", "Torrent Pharma", "Torrent Pharmaceuticals", "890123456725", 300, 3000, 500, 10.50, 1400);

                // Step 6: Create Inventory Batches
                if (inventoryRepository.count() == 0) {
                    Inventory inv1 = createInventory(m1, sup2, "BT-CRO500-01", LocalDate.now().plusMonths(24), LocalDate.now().minusMonths(2), 1200, new BigDecimal("1.20"), new BigDecimal("2.00"), "Main Warehouse", "A1", "S1");
                    Inventory inv2 = createInventory(m2, sup2, "BT-DOLO650-99", LocalDate.now().plusMonths(24), LocalDate.now().minusMonths(4), 500, new BigDecimal("1.50"), new BigDecimal("2.50"), "Main Warehouse", "A2", "S2");
                    Inventory inv3 = createInventory(m3, sup1, "BT-MOX500-12", LocalDate.now().plusMonths(24), LocalDate.now().minusMonths(3), 1450, new BigDecimal("5.00"), new BigDecimal("8.50"), "Main Warehouse", "A3", "S3");

                    // Step 7: Create Purchase Orders
                    if (purchaseOrderRepository.count() == 0) {
                        createPurchaseOrder("PO-2026-001", sup2, "MedPlus", 5, new BigDecimal("12500.00"), "Delivered", LocalDateTime.now().plusDays(5), "Chief Pharmacist");
                        createPurchaseOrder("PO-2026-002", sup1, "Apollo Pharmacy", 3, new BigDecimal("28000.50"), "Shipped", LocalDateTime.now().plusDays(10), "John Doe");
                    }

                    // Step 8: Create Expiry Tracking Alerts
                    if (expiryTrackingRepository.count() == 0) {
                        createExpiryTracking(m7, inv3, "Omeprazole 20mg (Omez 20)", "BT-OMEZ20-09", LocalDate.now().plusDays(65), 98, 65, "Warning", "Active");
                        createExpiryTracking(m14, inv2, "Atorvastatin 10mg (Atorva 10)", "BT-ATO10-82", LocalDate.now().plusDays(25), 85, 25, "Critical", "Active");
                    }
                }
            }
        }

        // Step 9: Create Notifications
        if (notificationRepository.count() == 0) {
            createNotification("Low Stock Alert", "Omeprazole 20mg (Omez 20) stock count has fallen below threshold (98 units remaining).", "warning", "Stock", false);
            createNotification("Expiration Warning", "Atorvastatin 10mg (Atorva 10) Batch BT-ATO10-82 is expiring within 30 days.", "alert", "Expiry", false);
        }

        // Step 10: Create Reports
        if (reportRepository.count() == 0) {
            createReport("Q3 Pharmacy Inventory Valuation Report", "Inventory", "/reports/inventory_q3_2026.pdf", "Completed", "System Admin");
            createReport("Monthly FEFO Expiry Audit Report", "Expiry", "/reports/expiry_audit_august_2026.pdf", "Completed", "Chief Pharmacist");
        }

        log.info("MediStock seed data initialization completed successfully!");
    }

    private Permission getOrCreatePermission(String name, String description, String category) {
        return permissionRepository.findByName(name).orElseGet(() -> {
            Permission permission = new Permission();
            permission.setName(name);
            permission.setDescription(description);
            permission.setCategory(category);
            return permissionRepository.save(permission);
        });
    }

    private Role getOrCreateRole(String name, String description, Set<Permission> permissions) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            role.setPermissions(permissions);
            return roleRepository.save(role);
        });
    }

    private void createUserIfNotFound(String email, String password, String firstName, String lastName, String phone, Set<Role> roles) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhoneNumber(phone);
            user.setEnabled(true);
            user.setAccountNonExpired(true);
            user.setAccountNonLocked(true);
            user.setCredentialsNonExpired(true);
            user.setEmailVerified(true);
            user.setRoles(roles);
            userRepository.save(user);
        }
    }

    private Supplier createSupplier(String name, String contact, String email, String phone, String address, String city, String state, String zip, BigDecimal rating) {
        Supplier s = new Supplier();
        s.setName(name);
        s.setContactPerson(contact);
        s.setEmail(email);
        s.setPhoneNumber(phone);
        s.setAddress(address);
        s.setCity(city);
        s.setState(state);
        s.setPostalCode(zip);
        s.setRating(rating);
        s.setActive(true);
        return supplierRepository.save(s);
    }

    private Medicine createMedicine(String name, String genericName, String brandName, String description, String category, String dosageForm, String strength, String manufacturer, String supplierName, String barcode, int minStock, int maxStock, int reorder, double price, int stock) {
        Medicine m = new Medicine();
        m.setName(name);
        m.setGenericName(genericName);
        m.setBrandName(brandName);
        m.setDescription(description);
        m.setCategory(category);
        m.setDosageForm(dosageForm);
        m.setStrength(strength);
        m.setManufacturer(manufacturer);
        m.setSupplier(supplierName);
        m.setBarcode(barcode);
        m.setMinStockLevel(minStock);
        m.setMaxStockLevel(maxStock);
        m.setReorderLevel(reorder);
        m.setPrice(price);
        m.setStock(stock);
        m.setUnitOfMeasure("units");
        m.setActive(true);
        return medicineRepository.save(m);
    }

    private Inventory createInventory(Medicine medicine, Supplier supplier, String batch, LocalDate expiry, LocalDate mfd, int qty, BigDecimal cost, BigDecimal price, String loc, String sec, String shelf) {
        Inventory inv = new Inventory();
        inv.setMedicine(medicine);
        inv.setSupplier(supplier);
        inv.setBatchNumber(batch);
        inv.setExpiryDate(expiry);
        inv.setManufacturingDate(mfd);
        inv.setQuantity(qty);
        inv.setUnitCost(cost);
        inv.setSellingPrice(price);
        inv.setLocation(loc);
        inv.setWarehouseSection(sec);
        inv.setShelfNumber(shelf);
        inv.setAvailable(true);
        return inventoryRepository.save(inv);
    }

    private PurchaseOrder createPurchaseOrder(String orderNum, Supplier supplier, String supplierName, int itemsCount, BigDecimal total, String status, LocalDateTime expDelivery, String createdBy) {
        PurchaseOrder po = new PurchaseOrder();
        po.setOrderNumber(orderNum);
        po.setSupplier(supplier);
        po.setSupplierName(supplierName);
        po.setItemsCount(itemsCount);
        po.setTotalAmount(total);
        po.setStatus(status);
        po.setExpectedDelivery(expDelivery);
        po.setCreatedByName(createdBy);
        return purchaseOrderRepository.save(po);
    }

    private ExpiryTracking createExpiryTracking(Medicine medicine, Inventory inv, String name, String batch, LocalDate expDate, int qty, int days, String risk, String status) {
        ExpiryTracking exp = new ExpiryTracking();
        exp.setMedicine(medicine);
        exp.setInventory(inv);
        exp.setMedicineName(name);
        exp.setBatchNumber(batch);
        exp.setExpiryDate(expDate);
        exp.setQuantity(qty);
        exp.setDaysUntilExpiry(days);
        exp.setRiskLevel(risk);
        exp.setStatus(status);
        return expiryTrackingRepository.save(exp);
    }

    private Notification createNotification(String title, String message, String type, String category, boolean read) {
        Notification n = new Notification();
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setCategory(category);
        n.setRead(read);
        return notificationRepository.save(n);
    }

    private Report createReport(String name, String type, String filePath, String status, String generatedBy) {
        Report r = new Report();
        r.setReportName(name);
        r.setReportType(type);
        r.setFilePath(filePath);
        r.setStatus(status);
        r.setGeneratedBy(generatedBy);
        return reportRepository.save(r);
    }

    private Set<Permission> getPermissionsByName(Set<Permission> permissions, String... names) {
        Set<Permission> result = new HashSet<>();
        for (Permission permission : permissions) {
            for (String name : names) {
                if (permission.getName().equals(name)) {
                    result.add(permission);
                    break;
                }
            }
        }
        return result;
    }
}
