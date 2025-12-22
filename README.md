# UAMS Frontend

Urban Alternative Management System - Frontend Application

## Overview

Modern, role-based management platform built with Next.js 14, TypeScript, and Tailwind CSS. Features a clean, minimalist design inspired by VoteHub.

## Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Token refresh mechanism
- Role-based access control
- Route guards

✅ **Modern UI/UX**
- Clean, minimalist design
- Responsive layout
- Role-aware navigation
- Loading and error states

✅ **API Integration**
- Centralized API client
- Automatic token injection
- Error handling
- Request/response interceptors

✅ **State Management**
- Zustand for global state
- Persistent auth state
- Type-safe stores

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Project Structure

```
frontend/
├── app/                    # Next.js app router
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Auth pages
│   └── [routes]/          # Feature pages
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── hooks/                # Custom hooks
├── lib/                  # Utilities & API client
├── store/                # Zustand stores
├── types/                # TypeScript types
└── public/               # Static assets
```

## Key Files

- `FRONTEND_ACCESS_MATRIX.md` - Role-based visibility matrix
- `FRONTEND_SETUP.md` - Detailed setup guide
- `lib/api-client.ts` - Centralized API client
- `store/auth-store.ts` - Authentication state
- `components/layout/` - Layout components

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Design System

Inspired by VoteHub's clean aesthetic:

- **Colors**: Black & white with gray accents
- **Typography**: Clean, readable fonts
- **Components**: Card-based layouts
- **Spacing**: Consistent padding and margins

## Access Control

The frontend uses the access matrix (`FRONTEND_ACCESS_MATRIX.md`) to determine UI visibility. All security is enforced by backend RLS - the frontend only hides UI elements.

## Next Steps

1. Implement dashboard widgets
2. Build member management interface
3. Create attendance tracking UI
4. Add form validation
5. Implement real-time updates

## License

Private - Urban Alternative Management System

