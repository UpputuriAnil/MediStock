-- MediStock Sample Data
-- Medical Inventory Management Platform

USE medistock;

-- Insert Permissions
INSERT IGNORE INTO permissions (name, description, category) VALUES
-- User Permissions
('USER_CREATE', 'Create new users', 'USER'),
('USER_READ', 'View user information', 'USER'),
('USER_UPDATE', 'Update user information', 'USER'),
('USER_DELETE', 'Delete users', 'USER'),

-- Role Permissions
('ROLE_CREATE', 'Create new roles', 'ROLE'),
('ROLE_READ', 'View role information', 'ROLE'),
('ROLE_UPDATE', 'Update role information', 'ROLE'),
('ROLE_DELETE', 'Delete roles', 'ROLE'),

-- Medicine Permissions
('MEDICINE_CREATE', 'Create new medicines', 'MEDICINE'),
('MEDICINE_READ', 'View medicine information', 'MEDICINE'),
('MEDICINE_UPDATE', 'Update medicine information', 'MEDICINE'),
('MEDICINE_DELETE', 'Delete medicines', 'MEDICINE'),

-- Supplier Permissions
('SUPPLIER_CREATE', 'Create new suppliers', 'SUPPLIER'),
('SUPPLIER_READ', 'View supplier information', 'SUPPLIER'),
('SUPPLIER_UPDATE', 'Update supplier information', 'SUPPLIER'),
('SUPPLIER_DELETE', 'Delete suppliers', 'SUPPLIER'),

-- Inventory Permissions
('INVENTORY_CREATE', 'Create inventory records', 'INVENTORY'),
('INVENTORY_READ', 'View inventory information', 'INVENTORY'),
('INVENTORY_UPDATE', 'Update inventory information', 'INVENTORY'),
('INVENTORY_DELETE', 'Delete inventory records', 'INVENTORY'),

-- Report Permissions
('REPORT_READ', 'View reports', 'REPORT'),

-- Dashboard Permissions
('DASHBOARD_READ', 'View dashboard', 'DASHBOARD'),

-- Notification Permissions
('NOTIFICATION_SEND', 'Send notifications', 'NOTIFICATION');

-- Insert Roles
INSERT IGNORE INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Administrator with full system access'),
('ROLE_PHARMACIST', 'Pharmacist with medicine and inventory management access'),
('ROLE_STAFF', 'Staff with read-only access to medicines and inventory');

-- Assign Permissions to Admin Role (Full Access)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_ADMIN';

-- Assign Permissions to Pharmacist Role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_PHARMACIST' 
AND p.name IN (
    'MEDICINE_READ', 'MEDICINE_CREATE', 'MEDICINE_UPDATE',
    'SUPPLIER_READ', 'SUPPLIER_CREATE',
    'INVENTORY_READ', 'INVENTORY_UPDATE',
    'DASHBOARD_READ',
    'NOTIFICATION_SEND'
);

-- Assign Permissions to Staff Role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_STAFF' 
AND p.name IN (
    'MEDICINE_READ',
    'INVENTORY_READ',
    'DASHBOARD_READ'
);

-- Insert Admin User (Password: Admin@123)
-- Note: In production, use a stronger password and change this immediately
INSERT IGNORE INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    phone_number, 
    is_enabled, 
    is_account_non_expired, 
    is_account_non_locked, 
    is_credentials_non_expired, 
    email_verified
) VALUES (
    'admin@medistock.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt hash of "Admin@123"
    'System',
    'Administrator',
    '+1234567890',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE
);

-- Assign Admin Role to Admin User
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@medistock.com' AND r.name = 'ROLE_ADMIN';

-- Insert Sample Pharmacist User (Password: Pharmacist@123)
INSERT IGNORE INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    phone_number, 
    is_enabled, 
    is_account_non_expired, 
    is_account_non_locked, 
    is_credentials_non_expired, 
    email_verified
) VALUES (
    'pharmacist@medistock.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt hash of "Pharmacist@123"
    'John',
    'Doe',
    '+1234567891',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE
);

-- Assign Pharmacist Role to Sample Pharmacist
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'pharmacist@medistock.com' AND r.name = 'ROLE_PHARMACIST';

-- Insert Sample Staff User (Password: Staff@123)
INSERT IGNORE INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    phone_number, 
    is_enabled, 
    is_account_non_expired, 
    is_account_non_locked, 
    is_credentials_non_expired, 
    email_verified
) VALUES (
    'staff@medistock.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt hash of "Staff@123"
    'Jane',
    'Smith',
    '+1234567892',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE
);

-- Assign Staff Role to Sample Staff
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'staff@medistock.com' AND r.name = 'ROLE_STAFF';
