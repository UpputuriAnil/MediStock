package com.medistock.config;

import com.medistock.entity.Permission;
import com.medistock.entity.Role;
import com.medistock.entity.User;
import com.medistock.repository.PermissionRepository;
import com.medistock.repository.RoleRepository;
import com.medistock.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

//@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, RoleRepository roleRepository,
                      PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
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
        User adminUser = createUser("admin@medistock.com", "Admin@123", "System", "Administrator", "+1234567890", Set.of(adminRole));
        User pharmacistUser = createUser("pharmacist@medistock.com", "Pharmacist@123", "John", "Doe", "+1234567891", Set.of(pharmacistRole));
        User staffUser = createUser("staff@medistock.com", "Staff@123", "Jane", "Smith", "+1234567892", Set.of(staffRole));

        System.out.println("Sample data loaded successfully!");
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
