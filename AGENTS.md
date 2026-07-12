# SocietyMaintenanceApp - Agent Guide

## Quick Start

```bash
# Frontend
cd frontend && npm install && npm run dev    # localhost:5173

# Backend (2 microservices)
cd backend/identity-service && mvn spring-boot:run  # :8081
cd backend/core-service && mvn spring-boot:run       # :8082
```

## Project Overview

Society Management MVP with **2 Spring Boot microservices** + **React** frontend.

- **Frontend** (Vercel): React SPA with Tailwind CSS, Vite build
- **identity-service** (Railway, :8081): Authentication, societies, members, JWT
- **core-service** (Railway, :8082): Maintenance, expenses, notices, reports, rules

## Architecture

```
Vercel (React)
    ├── identity-service → Neon identity_db
    └── core-service     → Neon core_db
              ↑ shared JWT_SECRET
```

Both services use the same `JWT_SECRET` for token validation. JWT tokens contain `societyId` and `role` claims.

## Commands

| Purpose | Frontend | Backend |
|---------|----------|---------|
| Run | `npm run dev` | `mvn spring-boot:run` |
| Build | `npm run build` | `mvn clean package` |
| Test | (none) | `mvn test` |

## Directory Structure

```
SocietyMaintenanceApp/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/           # API client (axios)
│   │   ├── components/    # UI components
│   │   ├── context/     # React contexts (Auth, Toast)
│   │   ├── pages/
│   │   │   ├── admin/   # ADMIN dashboard pages
│   │   │   ├── member/  # MEMBER dashboard pages
│   │   │   ├── auth/    # Login, register pages
│   │   │   └── reports/ # Financial reports (ADMIN only)
│   │   └── utils/       # Utility functions
│   └── .env             # VITE_CORE_API_URL, VITE_IDENTITY_API_URL
├── backend/
│   ├── identity-service/  # Auth service (:8081)
│   └── core-service/      # Operations service (:8082)
└── sql/                   # Database migrations
```

## Authentication & Authorization

### Roles
- **ADMIN**: Committee/society admin - full write access
- **MEMBER**: Resident/member - read-only access

### Frontend Patterns
- Use `useAuth()` hook to access `user`, `isAuthenticated`, `isAdmin`
- `ProtectedRoute` component guards routes by role
- Role check: `isAdmin` (user?.role === 'ADMIN')

### Backend Patterns
- Security config at `SecurityConfig.java` in each service
- `@PreAuthorize("hasRole('ADMIN')")` for admin-only endpoints
- `/api/admin/**` and `/api/v1/admin/**` routes require ADMIN role
- `AuthenticatedUser` extracts `societyId` and details from JWT

## API Endpoints

### Identity Service (:8081)
- `POST /api/v1/auth/register` - Society registration
- `POST /api/v1/auth/login` - JWT login
- `POST /api/v1/auth/register-member` - Member registration
- `GET /api/v1/societies/{id}/exists` - Public check

### Core Service (:8082)
- `/api/v1/maintenance` - Maintenance charges
- `/api/v1/expenses` - Expense tracking
- `/api/v1/notices` - Society notices
- `/api/v1/rules` - Society rules
- `/api/v1/reports/**` - Financial reports (ADMIN only)
- `/api/admin/**` - Admin-only operations

## Gotchas

1. **JWT Secret**: Both services must share the same `JWT_SECRET` env var
2. **Profile Switching**: Run with `h2` profile locally (in-memory), `postgres` for production
3. **CORS Origins**: Configure `app.cors.allowed-origins` for frontend URLs
4. **Report Access**: Reports page and `/api/v1/reports/**` endpoints are ADMIN-only
5. **No Frontend Tests**: No test framework configured for React
6. **Tailwind**: Uses Tailwind CSS v3 with `@tailwind` directives in index.css