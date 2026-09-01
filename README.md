# 🏥 MediStock – Medical Inventory Management Platform

> **Infosys Springboard Mentorship Project**

MediStock is an enterprise-grade, full-stack **Medical Inventory Management Platform** designed for pharmacies, clinics, and hospital networks. It provides real-time stock tracking, FEFO dispatch recommendations, automated reorder and expiration alerts, Razorpay payment gateway integration, role-based access control (RBAC), multi-batch inventory management, and transaction audit trails.

---

## 👥 Team Members / Contributors

1. **Anil Upputuri**
2. **Chandur Supriya**
3. **CHEKKILI USHA SREE**

---

## 🌟 Key Features

- **User Authentication & Role-Based Access Control (RBAC):** Secure JWT authentication with role-based access control for **Admin**, **Pharmacist**, **Staff**, and **Supplier** roles.
- **Medicine & Inventory Catalog:** Add/update catalog, batch numbers, dosage forms, barcodes, manufacturer details, and stock movement logs.
- **Expiry & Low-Stock Alerts:** Real-time stock tracking with automated dynamic status categorization (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `EXPIRING_SOON`, `EXPIRED`).
- **FEFO Dispatch Recommendation Engine:** Priority ordering for stock dispatching based on First-Expired-First-Out (FEFO) clinical safety principles.
- **Razorpay Payment Gateway Integration:** Authentic Razorpay JS SDK Checkout integration with payment order generation, signature verification, and PDF payment receipt download.
- **Interactive Notification Center:** Role-based alert notifications with instant **"Mark as read"** actions, filter tabs, and unread count badges.
- **Supplier Management:** Track supplier details, purchase orders, consignment dispatches, and supplier fulfillment performance metrics.
- **Stock Audit Logs:** Immutable transaction logs tracking every `STOCK_IN`, `STOCK_OUT`, and `ADJUSTMENT` with user attribution.
- **Dashboards & Analytics:** Interactive visual dashboards showing inventory trends, sales summaries, and stock alerts.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios, HTML2Canvas, JSPDF |
| **Backend** | Java 17 / 21, Spring Boot 3.2.x, Spring Security, Spring Data JPA, Hibernate, Maven |
| **Database** | MySQL 8.0 / PostgreSQL |
| **Payments** | Razorpay Payment Gateway JS SDK |
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
│   │   ├── controller/       # Medicine, Supplier, Inventory, User, Payment Controllers
│   │   ├── entity/           # JPA Entities (User, Role, Medicine, Inventory, StockLog, Payment, etc.)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── security/         # Custom JWT Filters & UserDetailsService
│   │   └── service/          # Business logic services & Razorpay payment calculations
│   └── pom.xml
├── frontend/                 # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/       # Common UI elements, Layout, Drawers, Modals, Payment Modals
│   │   ├── context/          # Auth, Inventory & Notification React Contexts
│   │   ├── pages/            # Dashboard, Medicines, Inventory, Suppliers, Notifications, Payment History, Login
│   │   ├── services/         # Dynamic API integration services
│   │   └── types/            # TypeScript interfaces
│   └── package.json
├── mysql_setup.sql           # Database creation & sample seed data script
└── README.md
```

---

## 🗄️ Database Entities & Architecture

- **`User` / `Role`**: System users with granular permissions (`ROLE_ADMIN`, `ROLE_PHARMACIST`, `ROLE_STAFF`, `ROLE_SUPPLIER`).
- **`Medicine`**: Product catalog details (name, generic name, category, dosage form, manufacturer, reorder level).
- **`Supplier`**: Supplier directory, contact info, address, and ratings.
- **`Inventory`**: Stock batch details (batch number, expiry date, manufacture date, quantity, cost price, selling price, location).
- **`StockLog`**: Audit trail recording transactions (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`, transaction date, user).
- **`Payment`**: Payment transaction logs (`order_id`, `payment_id`, `razorpay_signature`, `status`, `amount`).

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medistock.com` | `Admin@123` | Full administrative control, user/role management, system analytics. |
| **Pharmacist** | `pharmacist@medistock.com` | `Pharmacist@123` | Medicine catalog, supplier management, batch entry, stock transactions, Razorpay purchases. |
| **Staff** | `staff@medistock.com` | `Staff@123` | Read-only access to medicine catalog, batch locations, stock levels. |

---

## 🚀 Getting Started / Local Installation Guide

### Prerequisites

- **Java JDK 17+**
- **Node.js (v18+) & npm**
- **MySQL Server 8.0+**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/springboardmentor63053m-art/Medical-Inventory-Platform.git
cd Medical-Inventory-Platform
```

---

### Step 2: Database Setup

Ensure MySQL Server is running locally. Execute the SQL setup script to create the schema and seed initial data:

```bash
mysql -u root -p < mysql_setup.sql
```
*(This creates the `medistock` database and preloads sample test accounts and inventory data.)*

---

### Step 3: Environment Configuration (`.env`)

Create or verify the `.env` file in the root directory:

```env
# Database Credentials
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/medistock?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root

# JWT Authentication Secret
APP_JWT_SECRET=9a2f4c8e7b1d3f5a6c8e9b0d2f4a6c8e1d3f5a7b9c0d2e4f6a8b0c2d4e6f8a0b

# Razorpay Test Gateway Keys
RAZORPAY_KEY_ID=rzp_test_TWnNPQvPZhc3Y3
VITE_RAZORPAY_KEY_ID=rzp_test_TWnNPQvPZhc3Y3
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
```

---

### Step 4: Backend Setup (Spring Boot)

Navigate to the `backend` folder and run:

```bash
cd backend

# Windows
.\mvnw.cmd clean spring-boot:run

# Linux / macOS
./mvnw clean spring-boot:run
```
*Backend REST API will run at `http://localhost:8080` (or `http://localhost:8080/api`).*

To build the executable production JAR:
```bash
./mvnw clean package
```

---

### Step 5: Frontend Setup (React + Vite)

In a new terminal window, navigate to the `frontend` folder and run:

```bash
cd frontend
npm install
npm run dev
```
*Frontend Application will be accessible at `http://localhost:5173`.*

To build for production:
```bash
npm run build
```

---

## ⚙️ Environment Configuration Details

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

# Razorpay Gateway Configuration
razorpay.key-id=${RAZORPAY_KEY_ID:rzp_test_TWnNPQvPZhc3Y3}
razorpay.key-secret=${RAZORPAY_KEY_SECRET:YOUR_KEY_SECRET}
```

---

## 📌 Key API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User login & JWT token retrieval | Public |
| `POST` | `/api/auth/register` | User registration | Admin |
| `POST` | `/api/auth/logout` | Token revocation & session termination | Authenticated |
| `GET` | `/api/auth/me` | Retrieve authenticated user details | Authenticated |
| `GET` | `/api/medicines` | Retrieve medicine catalog | Authenticated |
| `POST` | `/api/medicines` | Add new medicine to catalog | Admin / Pharmacist |
| `PUT` | `/api/medicines/{id}` | Update medicine details | Admin / Pharmacist |
| `DELETE` | `/api/medicines/{id}` | Remove medicine from catalog | Admin |
| `GET` | `/api/inventory` | Retrieve stock inventory batches | Authenticated |
| `GET` | `/api/inventory/low-stock` | Get low stock alert items | Authenticated |
| `GET` | `/api/inventory/expiring-soon` | Get near-expiry stock batches | Authenticated |
| `POST` | `/api/inventory/transaction` | Record stock in / stock out | Admin / Pharmacist |
| `POST` | `/api/payments/razorpay/create-order` | Generate Razorpay order ID | Authenticated |
| `POST` | `/api/payments/razorpay/verify` | Verify payment signature & record in MySQL | Authenticated |
| `GET` | `/api/payments/history` | Get payment transaction history | Authenticated |
| `GET` | `/api/suppliers` | List supplier records | Authenticated |

---

## 🌐 Free Deployment Guide

### Frontend Deployment (Vercel / Netlify)
1. Connect Git repository and set root directory to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_BASE_URL=https://your-backend-app.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID=rzp_test_TWnNPQvPZhc3Y3`

### Backend Deployment (Render / Railway)
1. Connect Git repository and set root directory to `backend`.
2. Build Command: `./mvnw clean package -DskipTests=true`
3. Start Command: `java -jar target/medistock-0.0.1-SNAPSHOT.jar`
4. Environment Variables:
   - `SPRING_DATASOURCE_URL=jdbc:mysql://<your-db-host>:3306/medistock`
   - `SPRING_DATASOURCE_USERNAME=<db_user>`
   - `SPRING_DATASOURCE_PASSWORD=<db_password>`
   - `RAZORPAY_KEY_ID=rzp_test_TWnNPQvPZhc3Y3`

---

## 📅 Development Milestones

- **Milestone 1:** Architecture Design, ER Diagram, Database Scaffolding & Spring Security JWT Auth
- **Milestone 2:** Medicine Catalog, Supplier Management, Multi-Batch Inventory & Stock Audit Engine
- **Milestone 3:** Real-Time Expiry/Reorder Alerts, FEFO Dispatch Recommendations & React Dashboard
- **Milestone 4:** Razorpay Payment Gateway Integration, Notification Center Mark as Read & Production Deployment Verification

---

## 📜 License & Maintainers

- **Project Maintainers:**
  - Anil Upputuri
  - Chandur Supriya
  - CHEKKILI USHA SREE
- **License:** Educational & Open Source project developed under **Infosys Springboard Mentorship**.
