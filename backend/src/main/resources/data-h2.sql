-- MediStock Sample Data for H2
-- Medical Inventory Management Platform

-- Insert Permissions
INSERT INTO permissions (name, description, category, version) VALUES ('USER_CREATE', 'Create new users', 'USER', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('USER_READ', 'View user information', 'USER', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('USER_UPDATE', 'Update user information', 'USER', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('USER_DELETE', 'Delete users', 'USER', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('ROLE_CREATE', 'Create new roles', 'ROLE', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('ROLE_READ', 'View role information', 'ROLE', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('ROLE_UPDATE', 'Update role information', 'ROLE', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('ROLE_DELETE', 'Delete roles', 'ROLE', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('MEDICINE_CREATE', 'Create new medicines', 'MEDICINE', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('MEDICINE_READ', 'View medicine information', 'MEDICINE', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('MEDICINE_UPDATE', 'Update medicine information', 'MEDICINE', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('MEDICINE_DELETE', 'Delete medicines', 'MEDICINE', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('SUPPLIER_CREATE', 'Create new suppliers', 'SUPPLIER', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('SUPPLIER_READ', 'View supplier information', 'SUPPLIER', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('SUPPLIER_UPDATE', 'Update supplier information', 'SUPPLIER', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('SUPPLIER_DELETE', 'Delete suppliers', 'SUPPLIER', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('INVENTORY_CREATE', 'Create inventory records', 'INVENTORY', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('INVENTORY_READ', 'View inventory information', 'INVENTORY', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('INVENTORY_UPDATE', 'Update inventory information', 'INVENTORY', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('INVENTORY_DELETE', 'Delete inventory records', 'INVENTORY', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('REPORT_READ', 'View reports', 'REPORT', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('DASHBOARD_READ', 'View dashboard', 'DASHBOARD', 0);
INSERT INTO permissions (name, description, category, version) VALUES ('NOTIFICATION_SEND', 'Send notifications', 'NOTIFICATION', 0);

-- Insert Roles
INSERT INTO roles (name, description, version) VALUES ('ROLE_ADMIN', 'Administrator with full system access', 0);
INSERT INTO roles (name, description, version) VALUES ('ROLE_PHARMACIST', 'Pharmacist with medicine and inventory management access', 0);
INSERT INTO roles (name, description, version) VALUES ('ROLE_STAFF', 'Staff with read-only access to medicines and inventory', 0);

-- Assign Permissions to Admin Role (Full Access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_ADMIN';

-- Assign Permissions to Pharmacist Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_PHARMACIST' 
AND p.name IN ('MEDICINE_READ', 'MEDICINE_CREATE', 'MEDICINE_UPDATE', 'SUPPLIER_READ', 'SUPPLIER_CREATE', 'INVENTORY_READ', 'INVENTORY_UPDATE', 'DASHBOARD_READ', 'NOTIFICATION_SEND');

-- Assign Permissions to Staff Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_STAFF' 
AND p.name IN ('MEDICINE_READ', 'INVENTORY_READ', 'DASHBOARD_READ');

-- Insert Admin User (Password: Admin@123)
-- Note: In production, use a stronger password and change this immediately
INSERT INTO users (email, password, first_name, last_name, phone_number, is_enabled, is_account_non_expired, is_account_non_locked, is_credentials_non_expired, email_verified, version) VALUES ('admin@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System', 'Administrator', '+1234567890', TRUE, TRUE, TRUE, TRUE, TRUE, 0);

-- Assign Admin Role to Admin User
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@medistock.com' AND r.name = 'ROLE_ADMIN';

-- Insert Sample Pharmacist User (Password: Pharmacist@123)
INSERT INTO users (email, password, first_name, last_name, phone_number, is_enabled, is_account_non_expired, is_account_non_locked, is_credentials_non_expired, email_verified, version) VALUES ('pharmacist@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John', 'Doe', '+1234567891', TRUE, TRUE, TRUE, TRUE, TRUE, 0);

-- Assign Pharmacist Role to Sample Pharmacist
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'pharmacist@medistock.com' AND r.name = 'ROLE_PHARMACIST';

-- Insert Sample Staff User (Password: Staff@123)
INSERT INTO users (email, password, first_name, last_name, phone_number, is_enabled, is_account_non_expired, is_account_non_locked, is_credentials_non_expired, email_verified, version) VALUES ('staff@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane', 'Smith', '+1234567892', TRUE, TRUE, TRUE, TRUE, TRUE, 0);

-- Assign Staff Role to Sample Staff
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'staff@medistock.com' AND r.name = 'ROLE_STAFF';
