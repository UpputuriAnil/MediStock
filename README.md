# Medical Inventory Platform (MediStock)

> Infosys Springboard Mentorship Project — Milestone 1 & 2 Deliverables

MediStock is a modern, enterprise-grade **Medical Inventory Management Platform** designed for hospitals, clinics, and pharmacies. It provides real-time stock tracking, automated reorder and expiration alerts, role-based access control (RBAC), multi-batch inventory management, and transaction audit trails.

---

## 🌟 Key Features

- **Multi-Role Authentication & Security**: JWT-based login/registration with Spring Security, supporting `ROLE_ADMIN`, `ROLE_PHARMACIST`, and `ROLE_STAFF`.
- **User & Profile Management**: Self-service profile updates, password changes, and administrator user/role management.
- **Medicine & Supplier Catalog**: Centralized catalog of pharmaceutical products, generic names, categories, dosage forms, barcodes, and supplier ratings.
- **Batch & Expiry Inventory Management**: Track multiple stock batches per medicine with individual expiry dates, manufacturing dates, warehouse locations, unit costs, and selling prices.
- **Competency & Stock Business Engine**:
  - **Automated Stock Status**: Dynamic status categorization (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `EXPIRING_SOON`, `EXPIRED`).
  - **Reorder Threshold Alerts**: Instant notifications when item stock drops below configured reorder levels.
  - **FEFO (First-Expired-First-Out) Dispatch Recommendations**: Priority ordering for stock dispatching.
  - **Immutable Stock Transaction Logs**: Audit logs tracking every `STOCK_IN`, `STOCK_OUT`, and `ADJUSTMENT` with user attribution.
- **Modern Responsive UI**: Built with React 18, Vite, TypeScript, TailwindCSS, Framer Motion animations, and Lucide icons.

---

## 🏗️ Architecture & Technology Stack

### Backend Stack
- **Framework**: Java 17 + Spring Boot 3.2.x
- **Security**: Spring Security + JWT Tokens + BCrypt Password Encoding
- **Persistence**: Spring Data JPA + Hibernate + MySQL 8.0
- **Build Tool**: Maven

### Frontend Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Framer Motion
- **Icons & Visuals**: Lucide React
- **HTTP Client**: Axios with Authorization Bearer Interceptors

---

## 📁 Repository Structure

```
medical_inventory/
├── backend/                  # Spring Boot 3 REST API Application
│   ├── src/main/java/com/medistock/
│   │   ├── auth/             # Authentication & Registration Controllers & Services
│   │   ├── config/           # Security, Cors, DataLoader configurations
│   │   ├── controller/       # Medicine, Supplier, Inventory, User Controllers
│   │   ├── entity/           # JPA Entities (User, Role, Medicine, Inventory, StockLog, etc.)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── security/         # Custom JWT Filters & UserDetailsService
│   │   └── service/          # Business logic services & stock threshold calculations
│   └── pom.xml
├── frontend/                 # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/       # Common UI elements, Layout, Drawers, Modals
│   │   ├── context/          # Auth & Notification React Contexts
│   │   ├── pages/            # Dashboard, Medicines, Inventory, Suppliers, Users, Login, Register
│   │   ├── services/         # API integration services
│   │   └── types/            # TypeScript interfaces
│   └── package.json
├── mysql_setup.sql           # Database creation & sample seed data script
└── README.md
```

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medistock.com` | `Admin@123` | Full administrative control, user/role management, system analytics. |
| **Pharmacist** | `pharmacist@medistock.com` | `Pharmacist@123` | Medicine catalog, supplier management, batch entry, stock transactions. |
| **Staff** | `staff@medistock.com` | `Staff@123` | Read-only access to medicine catalog, batch locations, stock levels. |

---

## 🚀 Quick Start Guide

### 1. Database Setup
Ensure MySQL Server 8.0+ is running locally. Execute the setup script:
```sql
mysql -u root -p < mysql_setup.sql
```
*This creates the `medistock` database, all schemas, indexes, foreign keys, and preloads sample test accounts and inventory data.*

### 2. Backend Setup
Navigate to the `backend` directory:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*The Spring Boot server will start on `http://localhost:8080`.*

### 3. Frontend Setup
Navigate to the `frontend` directory:
```powershell
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser to access MediStock.*

---

## 🧪 Verification Commands

- **Backend Verification**:
  ```powershell
  cd backend
  .\mvnw.cmd test-compile
  ```
- **Frontend Verification**:
  ```powershell
  cd frontend
  npm run build
  ```
