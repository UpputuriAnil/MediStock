# MediStock - Medical Inventory Management Platform

An enterprise-grade medical inventory management system with complete RBAC (Role-Based Access Control) authentication and authorization.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [File-by-File Explanation](#file-by-file-explanation)
- [Testing the APIs](#testing-the-apis)
- [Default Credentials](#default-credentials)

## Overview

MediStock is a production-ready Spring Boot application that provides a complete authentication and authorization system with JWT tokens, role-based access control, and comprehensive security features. The system is designed for medical inventory management with three primary roles: ADMIN, PHARMACIST, and STAFF.

## Technology Stack

### Backend
- **Java 21** - Programming language
- **Spring Boot 4.1.0** - Application framework
- **Spring Security 7** - Security framework
- **Spring Data JPA** - Data persistence
- **Hibernate** - ORM framework
- **MySQL 8** - Database
- **JWT (jjwt)** - Token-based authentication
- **MapStruct** - Entity-DTO mapping
- **Lombok** - Code generation
- **Jakarta Validation** - Input validation
- **SpringDoc OpenAPI** - API documentation

### Build Tools
- **Maven** - Dependency management and build tool

## Features

### Authentication
- User registration with email verification
- Login with email and password
- JWT access token (15 minutes expiry)
- JWT refresh token (7 days expiry)
- Logout with token invalidation
- Forgot password with email reset
- Reset password with token
- Email verification
- Google OAuth2 integration (ready to configure)

### Authorization (RBAC)
- Three predefined roles: ADMIN, PHARMACIST, STAFF
- 27 granular permissions across categories
- Many-to-many user-role relationships
- Many-to-many role-permission relationships
- Method-level security with @PreAuthorize
- Dynamic permission assignment

### Security Features
- BCrypt password encoding
- Stateless session management
- CORS configuration
- CSRF disabled for REST APIs
- Custom JWT authentication filter
- Custom UserDetailsService
- Soft delete support
- Optimistic locking with @Version
- Audit fields (createdAt, updatedAt, createdBy, updatedBy)

### Production-Ready Features
- Global exception handling
- Standard API response format
- Input validation with Jakarta Validation
- Pagination support
- Swagger/OpenAPI documentation
- Postman collection included

## Project Structure

```
medical_invetory/
├── src/
│   ├── main/
│   │   ├── java/com/medistock/
│   │   │   ├── MediStockApplication.java          # Main application class
│   │   │   ├── auth/                              # Authentication layer
│   │   │   │   ├── AuthService.java               # Auth service interface
│   │   │   │   └── impl/
│   │   │   │       └── AuthServiceImpl.java       # Auth service implementation
│   │   │   ├── config/                            # Configuration classes
│   │   │   │   ├── SecurityConfig.java            # Spring Security configuration
│   │   │   │   └── OpenApiConfig.java             # Swagger configuration
│   │   │   ├── constants/                         # Constants
│   │   │   │   └── SecurityConstants.java          # Security-related constants
│   │   │   ├── controller/                        # REST controllers
│   │   │   │   ├── AuthController.java            # Authentication endpoints
│   │   │   │   ├── UserController.java            # User management endpoints
│   │   │   │   ├── RoleController.java            # Role management endpoints
│   │   │   │   └── PermissionController.java      # Permission management endpoints
│   │   │   ├── dto/                               # Data Transfer Objects
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── AuthResponse.java
│   │   │   │   ├── RefreshTokenRequest.java
│   │   │   │   ├── ForgotPasswordRequest.java
│   │   │   │   ├── ResetPasswordRequest.java
│   │   │   │   ├── RoleDto.java
│   │   │   │   ├── PermissionDto.java
│   │   │   │   ├── UserResponseDto.java
│   │   │   │   ├── CreateRoleRequest.java
│   │   │   │   ├── UpdateRoleRequest.java
│   │   │   │   ├── CreatePermissionRequest.java
│   │   │   │   ├── AssignRoleRequest.java
│   │   │   │   └── AssignPermissionRequest.java
│   │   │   ├── entity/                            # JPA entities
│   │   │   │   ├── User.java
│   │   │   │   ├── Role.java
│   │   │   │   ├── Permission.java
│   │   │   │   ├── RefreshToken.java
│   │   │   │   ├── PasswordResetToken.java
│   │   │   │   └── EmailVerificationToken.java
│   │   │   ├── exception/                         # Custom exceptions
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── BadRequestException.java
│   │   │   │   ├── UnauthorizedException.java
│   │   │   │   ├── ForbiddenException.java
│   │   │   │   ├── TokenExpiredException.java
│   │   │   │   ├── InvalidTokenException.java
│   │   │   │   ├── UserAlreadyExistsException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── mapper/                            # MapStruct mappers
│   │   │   │   ├── UserMapper.java
│   │   │   │   ├── RoleMapper.java
│   │   │   │   └── PermissionMapper.java
│   │   │   ├── permission/                        # Permission layer
│   │   │   │   ├── PermissionService.java
│   │   │   │   └── impl/
│   │   │   │       └── PermissionServiceImpl.java
│   │   │   ├── repository/                        # JPA repositories
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── RoleRepository.java
│   │   │   │   ├── PermissionRepository.java
│   │   │   │   ├── RefreshTokenRepository.java
│   │   │   │   ├── PasswordResetTokenRepository.java
│   │   │   │   └── EmailVerificationTokenRepository.java
│   │   │   ├── response/                          # API response wrappers
│   │   │   │   ├── ApiResponse.java
│   │   │   │   └── PagedResponse.java
│   │   │   ├── role/                              # Role layer
│   │   │   │   ├── RoleService.java
│   │   │   │   └── impl/
│   │   │   │       └── RoleServiceImpl.java
│   │   │   ├── security/                          # Security components
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   └── JwtAuthenticationFilter.java
│   │   │   ├── user/                              # User layer
│   │   │   │   ├── UserService.java
│   │   │   │   └── impl/
│   │   │   │       └── UserServiceImpl.java
│   │   │   ├── util/                              # Utility classes
│   │   │   │   └── JwtUtil.java
│   │   │   └── validation/                        # Validation utilities
│   │   │       ├── PasswordValidator.java
│   │   │       └── EmailValidator.java
│   │   └── resources/
│   │       ├── application.yml                     # Application configuration
│   │       ├── schema.sql                          # Database schema
│   │       └── data.sql                            # Sample data
├── pom.xml                                         # Maven configuration
├── MediStock-API-Collection.postman_collection.json # Postman collection
└── README.md                                       # This file
```

## Setup Instructions

### Prerequisites
- Java 21 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher
- IDE (IntelliJ IDEA, Eclipse, or VS Code)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medical_invetory
   ```

2. **Configure MySQL Database**
   - Create a MySQL database named `medistock`
   - Update database credentials in `src/main/resources/application.yml`

3. **Run the SQL Scripts**
   - Execute `src/main/resources/schema.sql` to create tables
   - Execute `src/main/resources/data.sql` to insert sample data

4. **Build the Project**
   ```bash
   ./mvnw clean install
   ```

5. **Run the Application**
   ```bash
   ./mvnw spring-boot:run
   ```

6. **Access Swagger Documentation**
   - Open browser: `http://localhost:8080/swagger-ui.html`

## Database Setup

### Schema
The database schema includes the following tables:
- `users` - User accounts
- `roles` - User roles
- `permissions` - System permissions
- `user_roles` - User-role junction table
- `role_permissions` - Role-permission junction table
- `refresh_tokens` - JWT refresh tokens
- `password_reset_tokens` - Password reset tokens
- `email_verification_tokens` - Email verification tokens

### Sample Data
The `data.sql` script includes:
- 27 permissions across categories (USER, ROLE, MEDICINE, SUPPLIER, INVENTORY, REPORT, DASHBOARD, NOTIFICATION)
- 3 roles (ADMIN, PHARMACIST, STAFF)
- 3 sample users (admin, pharmacist, staff)

## API Documentation

### Swagger UI
Access the interactive API documentation at: `http://localhost:8080/swagger-ui.html`

### Postman Collection
Import the provided `MediStock-API-Collection.postman_collection.json` file into Postman to test all APIs.

## Security Features

### Password Policy
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (@#$%^&+=!)
- No whitespace allowed

### JWT Configuration
- Access Token: 15 minutes expiry
- Refresh Token: 7 days expiry
- Signing algorithm: HS256
- Token stored in Authorization header: `Bearer <token>`

### Role-Based Access Control
- **ADMIN**: Full system access, all permissions
- **PHARMACIST**: Medicine and inventory management, limited user access
- **STAFF**: Read-only access to medicines and inventory

## File-by-File Explanation

### Configuration Files

#### `pom.xml`
Maven configuration file with all required dependencies:
- Spring Boot starters (web, security, data-jpa, validation, mail, oauth2)
- MySQL connector
- JWT libraries (jjwt-api, jjwt-impl, jjwt-jackson)
- MapStruct for DTO mapping
- Lombok for code generation
- SpringDoc OpenAPI for Swagger documentation

#### `application.yml`
Application configuration including:
- Database connection settings
- JWT secret and expiration times
- OAuth2 Google client configuration
- Mail server settings
- CORS configuration
- Password policy settings
- Swagger configuration

### Entity Classes

#### `User.java`
User entity with fields:
- Authentication: email, password (BCrypt encoded)
- Personal: firstName, lastName, phoneNumber
- Account status: enabled, accountNonExpired, accountNonLocked, credentialsNonExpired, emailVerified
- OAuth2: oauthProvider, oauthProviderId
- Relationships: roles (Many-to-Many), refreshTokens, passwordResetTokens, emailVerificationTokens
- Audit: createdAt, updatedAt, createdBy, updatedBy
- Soft delete: deleted, deletedAt
- Optimistic locking: version

#### `Role.java`
Role entity with:
- name, description
- Relationships: permissions (Many-to-Many), users (Many-to-Many)
- Audit and soft delete fields

#### `Permission.java`
Permission entity with:
- name, description, category
- Relationship: roles (Many-to-Many)
- Audit and soft delete fields

#### Token Entities
- `RefreshToken.java`: JWT refresh tokens with expiry and revocation tracking
- `PasswordResetToken.java`: Password reset tokens with usage tracking
- `EmailVerificationToken.java`: Email verification tokens with verification tracking

### Repository Interfaces

All repositories extend `JpaRepository` and include custom query methods:
- Soft delete support (findActive methods)
- Token management queries
- Relationship queries

### DTO Classes

Request/Response DTOs for:
- Authentication: LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest
- RBAC: RoleDto, PermissionDto, CreateRoleRequest, UpdateRoleRequest, CreatePermissionRequest, AssignRoleRequest, AssignPermissionRequest
- User: UserResponseDto

### Mapper Classes

MapStruct mappers for entity-DTO conversions:
- `UserMapper`: User entity ↔ UserResponseDto
- `RoleMapper`: Role entity ↔ RoleDto
- `PermissionMapper`: Permission entity ↔ PermissionDto

### Security Components

#### `SecurityConfig.java`
Spring Security configuration:
- SecurityFilterChain with CORS, CSRF disabled, stateless sessions
- AuthenticationManager and AuthenticationProvider
- BCrypt password encoder
- Public endpoints: /auth/**, /swagger-ui/**
- Role-based endpoint protection

#### `CustomUserDetailsService.java`
Implements UserDetailsService:
- Loads user by email
- Converts permissions to GrantedAuthority
- Handles soft delete and account status

#### `JwtAuthenticationFilter.java`
JWT filter extending OncePerRequestFilter:
- Extracts JWT from Authorization header
- Validates token
- Sets authentication in SecurityContext
- Handles token expiration

#### `JwtUtil.java`
JWT utility class:
- Generate access tokens with user details, roles, permissions
- Generate refresh tokens
- Validate tokens
- Extract claims (email, userId, roles, permissions)
- Check token expiration

### Service Layer

#### `AuthServiceImpl.java`
Authentication service implementation:
- register: Creates user with default STAFF role, generates email verification token
- login: Authenticates user, generates JWT tokens, manages refresh tokens
- logout: Revokes refresh token
- refreshToken: Validates refresh token, generates new tokens
- forgotPassword: Generates password reset token
- resetPassword: Validates token, updates password
- verifyEmail: Validates token, marks email as verified

#### `RoleServiceImpl.java`
Role management service:
- CRUD operations for roles
- Permission assignment/removal
- Soft delete with validation

#### `PermissionServiceImpl.java`
Permission management service:
- CRUD operations for permissions
- Category-based queries
- Soft delete with validation

#### `UserServiceImpl.java`
User management service:
- Get current user, user by ID, all users, users by role
- Update user information
- Soft delete user with token revocation
- Role assignment/removal
- Enable/disable user accounts

### Controller Layer

All controllers use:
- Standard ApiResponse wrapper
- Swagger annotations
- @PreAuthorize for method-level security
- Jakarta validation

#### `AuthController.java`
Endpoints:
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /auth/verify-email

#### `UserController.java`
Endpoints:
- GET /users/me
- GET /users/{id}
- GET /users
- GET /users/role/{roleName}
- PUT /users/{id}
- DELETE /users/{id}
- POST /users/assign-roles
- DELETE /users/{userId}/roles
- PUT /users/{id}/enable
- PUT /users/{id}/disable

#### `RoleController.java`
Endpoints:
- POST /roles
- GET /roles/{id}
- GET /roles/name/{name}
- GET /roles
- PUT /roles/{id}
- DELETE /roles/{id}
- POST /roles/assign-permissions
- DELETE /roles/{roleId}/permissions

#### `PermissionController.java`
Endpoints:
- POST /permissions
- GET /permissions/{id}
- GET /permissions/name/{name}
- GET /permissions
- GET /permissions/category/{category}
- PUT /permissions/{id}
- DELETE /permissions/{id}

### Exception Handling

#### `GlobalExceptionHandler.java`
Handles all exceptions:
- Custom exceptions (ResourceNotFoundException, BadRequestException, etc.)
- Spring Security exceptions (BadCredentialsException, AccessDeniedException)
- Validation exceptions (MethodArgumentNotValidException, ConstraintViolationException)
- Generic exceptions

### Validation Utilities

#### `PasswordValidator.java`
Validates password against policy:
- Length check
- Uppercase, lowercase, digit, special character checks
- Whitespace check
- Password match validation

#### `EmailValidator.java`
Validates email format using regex pattern

### Response Wrappers

#### `ApiResponse.java<T>`
Standard API response:
- success (boolean)
- message (String)
- data (T)
- error (String)
- timestamp (LocalDateTime)
- path (String)

#### `PagedResponse.java<T>`
Paginated response with metadata:
- content (List<T>)
- currentPage, totalPages, totalElements, pageSize
- first, last, empty flags

## Testing the APIs

### Using Swagger UI
1. Navigate to `http://localhost:8080/swagger-ui.html`
2. Click "Authorize" and enter JWT token
3. Execute endpoints directly from the UI

### Using Postman
1. Import `MediStock-API-Collection.postman_collection.json`
2. Set environment variables:
   - baseUrl: `http://localhost:8080/api`
   - accessToken: (auto-set after login)
   - refreshToken: (auto-set after login)
3. Execute requests

### Manual Testing with cURL

**Register User:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"Password@123","confirmPassword":"Password@123","phoneNumber":"+1234567890"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medistock.com","password":"Admin@123"}'
```

**Get All Users (with token):**
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <access-token>"
```

## Default Credentials

### Admin User
- Email: `admin@medistock.com`
- Password: `Admin@123`
- Role: ADMIN (Full access)

### Pharmacist User
- Email: `pharmacist@medistock.com`
- Password: `Pharmacist@123`
- Role: PHARMACIST (Medicine and inventory management)

### Staff User
- Email: `staff@medistock.com`
- Password: `Staff@123`
- Role: STAFF (Read-only access)

**Important:** Change these passwords immediately after first login in production!

## Next Steps

### Medicine Management Module
The authentication and authorization module is now complete. The next phase will include:
- Medicine entity and CRUD operations
- Supplier management
- Inventory tracking
- Purchase orders
- Expiry management
- Search functionality

### Frontend Development
React frontend with:
- Vite build tool
- Tailwind CSS styling
- React Router for navigation
- Axios for API calls
- JWT token management
- Role-based protected routes

## License

MIT License

## Support

For issues and questions, contact: support@medistock.com
