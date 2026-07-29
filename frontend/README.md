# MediStock Frontend

React frontend application for MediStock Medical Inventory Management System.

## Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── context/             # React Context
│   │   └── AuthContext.jsx
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   └── Unauthorized.jsx
│   ├── services/            # API services
│   │   ├── api.js
│   │   └── authService.js
│   ├── utils/               # Utility functions
│   │   └── ProtectedRoute.jsx
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Features

### Authentication
- User registration with validation
- Login with email and password
- JWT token management
- Automatic token refresh
- Logout functionality
- Forgot password flow
- Reset password flow

### Authorization
- Protected routes with authentication check
- Role-based access control
- Permission-based access control
- Unauthorized access handling

### Components

#### AuthContext
Provides authentication state and methods:
- `user` - Current user data
- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token
- `login()` - Login method
- `logout()` - Logout method
- `hasRole()` - Check user role
- `hasPermission()` - Check user permission
- `isAuthenticated` - Authentication status

#### ProtectedRoute
Wrapper component for protected routes:
- Checks authentication status
- Validates required roles
- Validates required permissions
- Redirects to login if not authenticated
- Redirects to unauthorized page if access denied

#### Authentication Components
- **Login**: Email/password login form
- **Register**: User registration with validation
- **ForgotPassword**: Password reset request
- **ResetPassword**: Password reset with token

#### Pages
- **Dashboard**: Main dashboard showing user info, roles, and permissions
- **Unauthorized**: Access denied page

## API Integration

### Axios Configuration
- Base URL: `/api` (proxied to backend)
- Request interceptor: Adds JWT token to Authorization header
- Response interceptor: Handles automatic token refresh on 401 errors

### API Service
`authService` provides methods:
- `register()` - User registration
- `login()` - User login
- `logout()` - User logout
- `refreshToken()` - Token refresh
- `forgotPassword()` - Password reset request
- `resetPassword()` - Password reset
- `verifyEmail()` - Email verification

## Routing

- `/` - Redirects to login or dashboard based on auth status
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page
- `/dashboard` - Protected dashboard page
- `/unauthorized` - Unauthorized access page

## Styling

Uses Tailwind CSS for styling with a modern, clean design:
- Gradient backgrounds
- Card-based layouts
- Responsive design
- Icon integration with Lucide React
- Form validation styles
- Loading states

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Development Server
Runs on `http://localhost:5173` with API proxy to `http://localhost:8080/api`

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The build output will be in the `dist` directory

3. Serve the `dist` directory with a web server (nginx, Apache, etc.)

4. Configure the web server to handle client-side routing (SPA mode)

## Environment Variables

No environment variables required for development. For production, you may want to configure:
- API base URL
- Other configuration options

## Notes

- The frontend uses the same backend API as documented in the main README
- JWT tokens are stored in localStorage
- Token refresh is handled automatically by Axios interceptor
- All API calls include the JWT token in the Authorization header
