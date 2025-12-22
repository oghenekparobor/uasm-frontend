# Frontend Setup Guide

## Overview

The UAMS frontend is built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Zustand for state management. It follows a modern, clean design inspired by VoteHub.

## Architecture

### 1. Auth & Session Foundation ✅

- **Token Storage**:
  - Access token: Stored in memory (not persisted)
  - Refresh token: Stored in localStorage (will be moved to httpOnly cookie)
  - User data: Persisted in localStorage via Zustand

- **Auth Store** (`store/auth-store.ts`):
  - Manages authentication state
  - Handles login/logout
  - Provides user data to components

- **API Client** (`lib/api-client.ts`):
  - Centralized axios instance
  - Automatic token injection
  - Automatic token refresh on 401
  - Error handling and mapping

- **Route Guards** (`components/auth/auth-guard.tsx`):
  - Protects routes based on authentication
  - Optional role-based protection
  - Redirects unauthenticated users to login

### 2. App Layout & Navigation ✅

- **Sidebar** (`components/layout/sidebar.tsx`):
  - Role-aware navigation menu
  - Shows only visible items based on user role
  - Fixed position, responsive

- **Header** (`components/layout/header.tsx`):
  - User menu
  - Notifications
  - Logout functionality

- **Dashboard Layout** (`components/layout/dashboard-layout.tsx`):
  - Wraps all dashboard pages
  - Includes sidebar and header
  - Enforces authentication

### 3. API Client Layer ✅

- **Central API Client** (`lib/api-client.ts`):
  - Base URL configuration
  - Request/response interceptors
  - Token refresh logic
  - Error mapping

- **Error Handling**:
  - `401 Unauthorized` → Attempt refresh → Redirect to login if fails
  - `403 Forbidden` → Show access restricted (component handles)
  - `404 Not Found` → Show not found
  - `500 Server Error` → Show error message

### 4. Data Contracts ✅

- **Types** (`types/`):
  - `auth.ts`: Authentication types
  - `api.ts`: API response shapes, loading/error states

- **Standard States**:
  - Loading: `idle | loading | success | error`
  - Async: `{ data, loading, error }`
  - Empty state props
  - Error state props

### 5. UI Components ✅

- **Card** (`components/ui/card.tsx`): Card container with header/content
- **Button** (`components/ui/button.tsx`): Styled button with variants
- **Loading** (`components/ui/loading.tsx`): Loading spinner and page
- **Empty State** (`components/ui/empty-state.tsx`): Empty state display
- **Error State** (`components/ui/error-state.tsx`): Error display

## Styling

### Design System

Inspired by VoteHub's clean, minimalist design:

- **Colors**:
  - Background: White (`#FFFFFF`)
  - Foreground: Black (`#000000`)
  - Muted: Light gray (`#F5F5F5`)
  - Border: Light gray (`#E5E5E5`)

- **Typography**:
  - Large headings: `text-4xl font-bold`
  - Body text: `text-gray-600`
  - Small text: `text-sm`

- **Components**:
  - Cards: White background, border, rounded corners
  - Buttons: Black background, white text
  - Inputs: Border, rounded, focus states

### Tailwind Configuration

- Custom color variables
- Responsive breakpoints
- Custom utilities

## Access Matrix

See `FRONTEND_ACCESS_MATRIX.md` for detailed role-based visibility rules.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**:
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
frontend/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API client
├── store/                # Zustand stores
├── types/                # TypeScript types
└── public/               # Static assets
```

## Next Steps

1. **Implement Pages**:
   - Dashboard widgets (connect to API)
   - Members list (with pagination, filtering)
   - Attendance interface
   - Other pages as needed

2. **Enhancements**:
   - Add httpOnly cookie support for refresh token
   - Implement real-time notifications
   - Add form validation (Zod)
   - Add loading states for all API calls
   - Implement error boundaries

3. **Testing**:
   - Unit tests for components
   - Integration tests for API calls
   - E2E tests for critical flows

## Notes

- All API calls should go through `apiClient` from `lib/api-client.ts`
- Never call `fetch` directly in components
- Always handle loading and error states
- Use the access matrix to determine UI visibility
- Backend RLS enforces security; frontend only hides UI

