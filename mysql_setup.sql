-- MediStock MySQL Database Setup Script
-- Run this in MySQL Workbench to create the database and sample data

-- Create database cleanly
DROP DATABASE IF EXISTS medistock;
CREATE DATABASE medistock
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE medistock;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    is_enabled BOOLEAN DEFAULT TRUE,
    is_account_non_expired BOOLEAN DEFAULT TRUE,
    is_account_non_locked BOOLEAN DEFAULT TRUE,
    is_credentials_non_expired BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    oauth_provider VARCHAR(50),
    oauth_provider_id VARCHAR(255),
    profile_picture_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    version BIGINT DEFAULT 0,
    INDEX idx_email (email),
    INDEX idx_deleted (deleted),
    INDEX idx_email_verified (email_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    version BIGINT DEFAULT 0,
    INDEX idx_name (name),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    category VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    version BIGINT DEFAULT 0,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User-Role junction table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role-Permission junction table (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at DATETIME,
    replaced_by_token VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_revoked (revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_used (used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Permissions
INSERT INTO permissions (name, description, category) VALUES
('USER_CREATE', 'Create new users', 'USER'),
('USER_READ', 'View user information', 'USER'),
('USER_UPDATE', 'Update user information', 'USER'),
('USER_DELETE', 'Delete users', 'USER'),
('ROLE_CREATE', 'Create new roles', 'ROLE'),
('ROLE_READ', 'View role information', 'ROLE'),
('ROLE_UPDATE', 'Update role information', 'ROLE'),
('ROLE_DELETE', 'Delete roles', 'ROLE'),
('MEDICINE_CREATE', 'Create new medicines', 'MEDICINE'),
('MEDICINE_READ', 'View medicine information', 'MEDICINE'),
('MEDICINE_UPDATE', 'Update medicine information', 'MEDICINE'),
('MEDICINE_DELETE', 'Delete medicines', 'MEDICINE'),
('SUPPLIER_CREATE', 'Create new suppliers', 'SUPPLIER'),
('SUPPLIER_READ', 'View supplier information', 'SUPPLIER'),
('SUPPLIER_UPDATE', 'Update supplier information', 'SUPPLIER'),
('SUPPLIER_DELETE', 'Delete suppliers', 'SUPPLIER'),
('INVENTORY_CREATE', 'Create inventory records', 'INVENTORY'),
('INVENTORY_READ', 'View inventory information', 'INVENTORY'),
('INVENTORY_UPDATE', 'Update inventory information', 'INVENTORY'),
('INVENTORY_DELETE', 'Delete inventory records', 'INVENTORY'),
('REPORT_READ', 'View reports', 'REPORT'),
('DASHBOARD_READ', 'View dashboard', 'DASHBOARD'),
('NOTIFICATION_SEND', 'Send notifications', 'NOTIFICATION');

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Administrator with full system access'),
('ROLE_PHARMACIST', 'Pharmacist with medicine and inventory management access'),
('ROLE_STAFF', 'Staff with read-only access to medicines and inventory');

-- Assign Permissions to Admin Role (Full Access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_ADMIN';

-- Assign Permissions to Pharmacist Role
INSERT INTO role_permissions (role_id, permission_id)
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
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_STAFF' 
AND p.name IN (
    'MEDICINE_READ',
    'INVENTORY_READ',
    'DASHBOARD_READ'
);

-- Insert Admin User (Password: Admin@123)
INSERT INTO users (
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
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@medistock.com' AND r.name = 'ROLE_ADMIN';

-- Insert Sample Pharmacist User (Password: Pharmacist@123)
INSERT INTO users (
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
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'pharmacist@medistock.com' AND r.name = 'ROLE_PHARMACIST';

-- Insert Sample Staff User (Password: Staff@123)
INSERT INTO users (
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
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'staff@medistock.com' AND r.name = 'ROLE_STAFF';

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone_number VARCHAR(20),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    tax_id VARCHAR(50),
    license_number VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    version BIGINT DEFAULT 0,
    INDEX idx_name (name),
    INDEX idx_active (is_active),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    description TEXT,
    category VARCHAR(100),
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    manufacturer VARCHAR(200),
    barcode VARCHAR(100),
    ndc_code VARCHAR(50),
    storage_conditions VARCHAR(200),
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 1000,
    reorder_level INT DEFAULT 20,
    unit_of_measure VARCHAR(20) DEFAULT 'units',
    is_prescription_required BOOLEAN DEFAULT FALSE,
    is_controlled_substance BOOLEAN DEFAULT FALSE,
    schedule_number VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    version BIGINT DEFAULT 0,
    INDEX idx_name (name),
    INDEX idx_generic_name (generic_name),
    INDEX idx_category (category),
    INDEX idx_barcode (barcode),
    INDEX idx_active (is_active),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    supplier_id BIGINT,
    batch_number VARCHAR(100),
    expiry_date DATE,
    manufacturing_date DATE,
    quantity INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    location VARCHAR(100),
    warehouse_section VARCHAR(50),
    shelf_number VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    version BIGINT DEFAULT 0,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_batch_number (batch_number),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_available (is_available),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock logs table
CREATE TABLE IF NOT EXISTS stock_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    inventory_id BIGINT,
    transaction_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    previous_quantity INT,
    new_quantity INT,
    reference_number VARCHAR(100),
    reference_type VARCHAR(50),
    reason VARCHAR(255),
    performed_by VARCHAR(100),
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE SET NULL,
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_inventory_id (inventory_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_performed_at (performed_at),
    INDEX idx_reference_number (reference_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone_number, address, city, state, postal_code, rating, is_active) VALUES
('PharmaCorp Inc.', 'John Smith', 'contact@pharmacorp.com', '+1234567890', '123 Medical Drive', 'New York', 'NY', '10001', 4.5, TRUE),
('MedSupply Co.', 'Jane Doe', 'info@medsupply.com', '+1234567891', '456 Health Street', 'Los Angeles', 'CA', '90001', 4.2, TRUE),
('Global Pharma', 'Bob Johnson', 'sales@globalpharma.com', '+1234567892', '789 Wellness Blvd', 'Chicago', 'IL', '60601', 4.8, TRUE);

-- Insert sample medicines
INSERT INTO medicines (name, generic_name, description, category, dosage_form, strength, manufacturer, barcode, min_stock_level, max_stock_level, reorder_level, unit_of_measure, is_prescription_required) VALUES
('Amoxicillin', 'Amoxicillin Trihydrate', 'Antibiotic used to treat bacterial infections', 'Antibiotic', 'Capsule', '500mg', 'PharmaCorp Inc.', '1234567890123', 50, 500, 100, 'capsules', TRUE),
('Ibuprofen', 'Ibuprofen', 'Non-steroidal anti-inflammatory drug', 'Pain Relief', 'Tablet', '400mg', 'MedSupply Co.', '1234567890124', 100, 1000, 200, 'tablets', FALSE),
('Paracetamol', 'Acetaminophen', 'Pain reliever and fever reducer', 'Pain Relief', 'Tablet', '500mg', 'Global Pharma', '1234567890125', 200, 2000, 300, 'tablets', FALSE),
('Metformin', 'Metformin Hydrochloride', 'Diabetes medication', 'Diabetes', 'Tablet', '850mg', 'PharmaCorp Inc.', '1234567890126', 80, 800, 150, 'tablets', TRUE),
('Omeprazole', 'Omeprazole', 'Proton pump inhibitor for acid reflux', 'Gastric', 'Capsule', '20mg', 'MedSupply Co.', '1234567890127', 60, 600, 120, 'capsules', TRUE);

-- Insert sample inventory
INSERT INTO inventory (medicine_id, supplier_id, batch_number, expiry_date, manufacturing_date, quantity, unit_cost, selling_price, location, warehouse_section, shelf_number) VALUES
(1, 1, 'BATCH001', '2025-12-31', '2024-01-01', 150, 5.00, 8.50, 'Main Warehouse', 'A1', 'S1'),
(2, 2, 'BATCH002', '2026-06-30', '2024-02-01', 300, 2.50, 4.00, 'Main Warehouse', 'A2', 'S2'),
(3, 3, 'BATCH003', '2026-03-31', '2024-03-01', 500, 1.50, 3.00, 'Main Warehouse', 'A3', 'S3'),
(4, 1, 'BATCH004', '2025-09-30', '2024-01-15', 120, 8.00, 12.00, 'Main Warehouse', 'B1', 'S4'),
(5, 2, 'BATCH005', '2026-01-31', '2024-04-01', 200, 6.00, 10.00, 'Main Warehouse', 'B2', 'S5');

-- Insert sample stock logs
INSERT INTO stock_logs (medicine_id, inventory_id, transaction_type, quantity, previous_quantity, new_quantity, reference_number, reference_type, reason, performed_by) VALUES
(1, 1, 'STOCK_IN', 150, 0, 150, 'PO-001', 'PURCHASE_ORDER', 'Initial stock', 'admin@medistock.com'),
(2, 2, 'STOCK_IN', 300, 0, 300, 'PO-002', 'PURCHASE_ORDER', 'Initial stock', 'admin@medistock.com'),
(3, 3, 'STOCK_IN', 500, 0, 500, 'PO-003', 'PURCHASE_ORDER', 'Initial stock', 'admin@medistock.com'),
(4, 4, 'STOCK_IN', 120, 0, 120, 'PO-004', 'PURCHASE_ORDER', 'Initial stock', 'admin@medistock.com'),
(5, 5, 'STOCK_IN', 200, 0, 200, 'PO-005', 'PURCHASE_ORDER', 'Initial stock', 'admin@medistock.com');
