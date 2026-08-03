package com.medistock.config;

import com.medistock.entity.*;
import com.medistock.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, RoleRepository roleRepository,
                      PermissionRepository permissionRepository, SupplierRepository supplierRepository,
                      MedicineRepository medicineRepository, InventoryRepository inventoryRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (permissionRepository.count() > 0) {
            return;
        }

        // Create Permissions
        Set<Permission> permissions = new HashSet<>();
        permissions.add(createPermission("USER_CREATE", "Create new users", "USER"));
        permissions.add(createPermission("USER_READ", "View user information", "USER"));
        permissions.add(createPermission("USER_UPDATE", "Update user information", "USER"));
        permissions.add(createPermission("USER_DELETE", "Delete users", "USER"));
        permissions.add(createPermission("ROLE_CREATE", "Create new roles", "ROLE"));
        permissions.add(createPermission("ROLE_READ", "View role information", "ROLE"));
        permissions.add(createPermission("ROLE_UPDATE", "Update role information", "ROLE"));
        permissions.add(createPermission("ROLE_DELETE", "Delete roles", "ROLE"));
        permissions.add(createPermission("MEDICINE_CREATE", "Create new medicines", "MEDICINE"));
        permissions.add(createPermission("MEDICINE_READ", "View medicine information", "MEDICINE"));
        permissions.add(createPermission("MEDICINE_UPDATE", "Update medicine information", "MEDICINE"));
        permissions.add(createPermission("MEDICINE_DELETE", "Delete medicines", "MEDICINE"));
        permissions.add(createPermission("SUPPLIER_CREATE", "Create new suppliers", "SUPPLIER"));
        permissions.add(createPermission("SUPPLIER_READ", "View supplier information", "SUPPLIER"));
        permissions.add(createPermission("SUPPLIER_UPDATE", "Update supplier information", "SUPPLIER"));
        permissions.add(createPermission("SUPPLIER_DELETE", "Delete suppliers", "SUPPLIER"));
        permissions.add(createPermission("INVENTORY_CREATE", "Create inventory records", "INVENTORY"));
        permissions.add(createPermission("INVENTORY_READ", "View inventory information", "INVENTORY"));
        permissions.add(createPermission("INVENTORY_UPDATE", "Update inventory information", "INVENTORY"));
        permissions.add(createPermission("INVENTORY_DELETE", "Delete inventory records", "INVENTORY"));
        permissions.add(createPermission("REPORT_READ", "View reports", "REPORT"));
        permissions.add(createPermission("DASHBOARD_READ", "View dashboard", "DASHBOARD"));
        permissions.add(createPermission("NOTIFICATION_SEND", "Send notifications", "NOTIFICATION"));

        // Create Roles
        Role adminRole = createRole("ROLE_ADMIN", "Administrator with full system access", permissions);
        Role pharmacistRole = createRole("ROLE_PHARMACIST", "Pharmacist with medicine and inventory management access",
                getPermissionsByName(permissions, "MEDICINE_READ", "MEDICINE_CREATE", "MEDICINE_UPDATE",
                        "SUPPLIER_READ", "SUPPLIER_CREATE", "INVENTORY_READ", "INVENTORY_UPDATE",
                        "DASHBOARD_READ", "NOTIFICATION_SEND"));
        Role staffRole = createRole("ROLE_STAFF", "Staff with read-only access to medicines and inventory",
                getPermissionsByName(permissions, "MEDICINE_READ", "INVENTORY_READ", "DASHBOARD_READ"));

        // Create Users
        createUser("admin@medistock.com", "Admin@123", "System", "Administrator", "+1234567890", Set.of(adminRole));
        createUser("pharmacist@medistock.com", "Pharmacist@123", "John", "Doe", "+1234567891", Set.of(pharmacistRole));
        createUser("staff@medistock.com", "Staff@123", "Jane", "Smith", "+1234567892", Set.of(staffRole));

        // Create Suppliers
        Supplier s1 = createSupplier("PharmaCorp Inc.", "John Smith", "contact@pharmacorp.com", "+1234567890", "123 Medical Drive", "New York", "NY", "10001", new BigDecimal("4.50"));
        Supplier s2 = createSupplier("MedSupply Co.", "Jane Doe", "info@medsupply.com", "+1234567891", "456 Health Street", "Los Angeles", "CA", "90001", new BigDecimal("4.20"));
        Supplier s3 = createSupplier("Global Pharma", "Bob Johnson", "sales@globalpharma.com", "+1234567892", "789 Wellness Blvd", "Chicago", "IL", "60601", new BigDecimal("4.80"));

        // Create Medicines
        Medicine m1 = createMedicine("Amoxicillin", "Amoxicillin Trihydrate", "Antibiotic for bacterial infections", "Antibiotic", "Capsule", "500mg", "PharmaCorp Inc.", "1234567890123", 50, 500, 100);
        Medicine m2 = createMedicine("Ibuprofen", "Ibuprofen", "Non-steroidal anti-inflammatory", "Pain Relief", "Tablet", "400mg", "MedSupply Co.", "1234567890124", 100, 1000, 200);
        Medicine m3 = createMedicine("Paracetamol", "Acetaminophen", "Pain reliever & fever reducer", "Pain Relief", "Tablet", "500mg", "Global Pharma", "1234567890125", 200, 2000, 300);
        Medicine m4 = createMedicine("Metformin", "Metformin Hydrochloride", "Diabetes medication", "Diabetes", "Tablet", "850mg", "PharmaCorp Inc.", "1234567890126", 80, 800, 150);
        Medicine m5 = createMedicine("Omeprazole", "Omeprazole", "Proton pump inhibitor", "Gastric", "Capsule", "20mg", "MedSupply Co.", "1234567890127", 60, 600, 120);

        // Create Inventory Batches
        createInventory(m1, s1, "BATCH001", LocalDate.now().plusMonths(12), LocalDate.now().minusMonths(6), 150, new BigDecimal("5.00"), new BigDecimal("8.50"), "Main Warehouse", "A1", "S1");
        createInventory(m2, s2, "BATCH002", LocalDate.now().plusMonths(18), LocalDate.now().minusMonths(3), 300, new BigDecimal("2.50"), new BigDecimal("4.00"), "Main Warehouse", "A2", "S2");
        createInventory(m3, s3, "BATCH003", LocalDate.now().plusMonths(15), LocalDate.now().minusMonths(2), 500, new BigDecimal("1.50"), new BigDecimal("3.00"), "Main Warehouse", "A3", "S3");
        createInventory(m4, s1, "BATCH004", LocalDate.now().plusMonths(8), LocalDate.now().minusMonths(5), 120, new BigDecimal("8.00"), new BigDecimal("12.00"), "Main Warehouse", "B1", "S4");
        createInventory(m5, s2, "BATCH005", LocalDate.now().plusMonths(10), LocalDate.now().minusMonths(4), 200, new BigDecimal("6.00"), new BigDecimal("10.00"), "Main Warehouse", "B2", "S5");

        System.out.println("Sample MediStock data loaded successfully!");
    }

    private Permission createPermission(String name, String description, String category) {
        Permission permission = new Permission();
        permission.setName(name);
        permission.setDescription(description);
        permission.setCategory(category);
        return permissionRepository.save(permission);
    }

    private Role createRole(String name, String description, Set<Permission> permissions) {
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        role.setPermissions(permissions);
        return roleRepository.save(role);
    }

    private User createUser(String email, String password, String firstName, String lastName, String phoneNumber, Set<Role> roles) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        user.setEnabled(true);
        user.setEmailVerified(true);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);
        user.setRoles(roles);
        return userRepository.save(user);
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

    private Medicine createMedicine(String name, String genericName, String description, String category, String dosageForm, String strength, String manufacturer, String barcode, int minStock, int maxStock, int reorder) {
        Medicine m = new Medicine();
        m.setName(name);
        m.setGenericName(genericName);
        m.setDescription(description);
        m.setCategory(category);
        m.setDosageForm(dosageForm);
        m.setStrength(strength);
        m.setManufacturer(manufacturer);
        m.setBarcode(barcode);
        m.setMinStockLevel(minStock);
        m.setMaxStockLevel(maxStock);
        m.setReorderLevel(reorder);
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

