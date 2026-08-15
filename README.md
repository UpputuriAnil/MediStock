# 🏥 MediStock – Medical Inventory Management Platform

> **Infosys Springboard Mentorship Project**

MediStock is an enterprise-grade, full-stack **Medical Inventory Management Platform** designed for pharmacies, clinics, and hospitals. It provides real-time stock tracking, automated reorder and expiration alerts, role-based access control (RBAC), multi-batch inventory management, and transaction audit trails.

---

## 👥 Team Members / Contributors

1. **Anil Upputuri**
2. **Chandur Supriya**
3. **CHEKKILI USHA SREE**

---

## 🌟 Key Features

- **User Authentication & Role-Based Access Control (RBAC):** Secure JWT authentication with role-based access for **Admin**, **Pharmacist**, and **Staff**.
- **Medicine & Inventory Management:** Add/update stock, categorize medicines, track batch numbers, dosage forms, barcodes, and movement history.
- **Expiry & Low-Stock Alerts:** Real-time stock tracking with automated dynamic status categorization (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `EXPIRING_SOON`, `EXPIRED`).
- **FEFO Dispatch Recommendation Engine:** Priority ordering for stock dispatching based on First-Expired-First-Out principles.
- **Supplier Management:** Track supplier details, purchase orders, and supplier performance metrics.
- **Stock Audit Logs:** Immutable transaction logs tracking every `STOCK_IN`, `STOCK_OUT`, and `ADJUSTMENT` with user attribution.
- **Dashboards & Analytics:** Interactive visual dashboards showing inventory trends, sales summaries, and stock alerts.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios |
| **Backend** | Java 17, Spring Boot 3.2.x, Spring Security, Spring Data JPA, Hibernate, Maven |
| **Database** | MySQL 8.0 (Development & Production) |
| **Security & Auth** | JWT (JSON Web Tokens), BCrypt Password Hashing |
| **Testing** | JUnit 5, Mockito, Spring Boot Test |

---

## 🏗️ Repository Structure

```
medical_inventory/
├── backend/                  # Spring Boot 3 REST API Application
│   ├── src/main/java/com/medistock/
│   │   ├── auth/             # Authentication & Registration Controllers & Services
│   │   ├── config/           # Security, CORS, DataLoader configurations
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
│   │   ├── pages/            # Dashboard, Medicines, Inventory, Suppliers, Users, Login
│   │   ├── services/         # API integration services
│   │   └── types/            # TypeScript interfaces
│   └── package.json
├── mysql_setup.sql           # Database creation & sample seed data script
└── README.md
```

---

## 🗄️ Database Entities & Architecture

- **`User` / `Role`**: System users with granular permissions (`ROLE_ADMIN`, `ROLE_PHARMACIST`, `ROLE_STAFF`).
- **`Medicine`**: Product catalog details (name, generic name, category, dosage form, manufacturer, reorder level).
- **`Supplier`**: Supplier directory, contact info, address, and ratings.
- **`Inventory`**: Stock batch details (batch number, expiry date, manufacture date, quantity, cost price, selling price, location).
- **`StockLog`**: Audit trail recording transactions (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`, transaction date, user).

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medistock.com` | `Admin@123` | Full administrative control, user/role management, system analytics. |
| **Pharmacist** | `pharmacist@medistock.com` | `Pharmacist@123` | Medicine catalog, supplier management, batch entry, stock transactions. |
| **Staff** | `staff@medistock.com` | `Staff@123` | Read-only access to medicine catalog, batch locations, stock levels. |

---

## 🚀 Getting Started / Local Installation Guide

### Prerequisites

- **Java JDK 17+**
- **Node.js (v18+) & npm**
- **MySQL Server 8.0+**

---

### Step 1: Database Setup

Ensure MySQL Server is running locally. Execute the SQL setup script to create the schema and seed initial data:

```bash
mysql -u root -p < mysql_setup.sql
```
*(This creates the `medistock` database and preloads sample test accounts and inventory data.)*

---

### Step 2: Backend Setup (Spring Boot)

Navigate to the `backend` folder and run:

```bash
cd backend
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```
*Backend REST API will run at `http://localhost:8080`.*

---

### Step 3: Frontend Setup (React + Vite)

In a new terminal window, navigate to the `frontend` folder and run:

```bash
cd frontend
npm install
npm run dev
```
*Frontend Application will be accessible at `http://localhost:5173`.*

---

## ⚙️ Environment Configuration

### Backend Configuration (`backend/src/main/resources/application.properties`)

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/medistock?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root

# JPA / Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Security Configuration
app.jwt.secret=9a2f4c8e7b1d3f5a6c8e9b0d2f4a6c8e1d3f5a7b9c0d2e4f6a8b0c2d4e6f8a0b
app.jwt.expiration-ms=86400000
```

---

## 📌 Key API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User login & JWT token retrieval | Public |
| `POST` | `/api/auth/register` | User registration | Admin |
| `GET` | `/api/medicines` | Retrieve medicine catalog | Authenticated |
| `POST` | `/api/medicines` | Add new medicine to catalog | Admin / Pharmacist |
| `GET` | `/api/inventory` | Retrieve stock inventory batches | Authenticated |
| `GET` | `/api/inventory/low-stock` | Get low stock alert items | Authenticated |
| `GET` | `/api/inventory/expiring-soon` | Get near-expiry stock batches | Authenticated |
| `POST` | `/api/inventory/transaction` | Record stock in / stock out | Admin / Pharmacist |
| `GET` | `/api/suppliers` | List supplier records | Authenticated |

---

## 📅 Development Milestones

- **Milestone 1:** Architecture Design, ER Diagram, Database Scaffolding & Spring Security JWT Auth
- **Milestone 2:** Medicine Catalog, Supplier Management, Multi-Batch Inventory & Stock Audit Engine
- **Milestone 3:** Real-Time Expiry/Reorder Alerts, FEFO Dispatch Recommendations & React Dashboard
- **Milestone 4:** Full-Stack Integration Testing, Documentation & Production Readiness

---

## 📜 License & Maintainers

- **Project Maintainers:**
  - Anil Upputuri
  - Chandur Supriya
  - CHEKKILI USHA SREE
- **License:** Educational & Open Source project developed under **Infosys Springboard Mentorship**.
