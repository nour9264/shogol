# Next.js Migration Guide - Complete Instructions

## Overview
The project is being migrated from React + Vite to Next.js 15 with TypeScript and App Router. This guide explains what has been done and what remains.

## ✅ What's Been Completed

### 1. Project Configuration
- ✅ Next.js 15 with TypeScript configuration
- ✅ Updated `package.json` with Next.js dependencies
- ✅ Created `tsconfig.json` for TypeScript
- ✅ Created `next.config.ts`
- ✅ Updated Tailwind CSS configuration
- ✅ PostCSS configuration

### 2. Type Definitions
- ✅ Created `src/types/index.ts` with comprehensive TypeScript types
- ✅ Types for: User, Auth, Job, Proposal, Freelancer, Toast, etc.

### 3. API Service
- ✅ Converted `api.js` to `api.ts` with full TypeScript support
- ✅ All API endpoints fully typed
- ✅ Request/Response interceptors with proper types

### 4. App Router Structure Started
- ✅ Created `src/app/layout.tsx` (root layout)
- ✅ Created `src/app/page.tsx` (home page)
- ✅ Created `src/app/login/page.tsx`
- ✅ Created `src/app/register/page.tsx`
- ✅ Created `src/app/globals.css`

## 🔄 What Needs To Be Done

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Convert Contexts to TypeScript
1. Convert `src/context/AuthContext.jsx` → `src/context/AuthContext.tsx`
   - Add TypeScript types for context values
   - Type all state and functions
   
2. Convert `src/context/ToastContext.jsx` → `src/context/ToastContext.tsx`
   - Add types for Toast
   - Type all functions

### Step 3: Convert Components to TypeScript
For each component in `src/components/`:
1. Rename `.jsx` → `.tsx`
2. Add TypeScript types for props
3. Create separate CSS file (e.g., `Component.module.css`)
4. Import CSS in component
5. Add `'use client'` directive if component uses hooks/interactivity

### Step 4: Migrate Pages to App Router
For each page in `src/pages/`:
1. Create folder in `src/app/` (e.g., `src/app/jobs/`)
2. Create `page.tsx` file
3. Import and render the component
4. Remove old React Router logic

### Step 5: Update Imports
- Change relative imports to use `@/` alias
- Update all import paths
- Remove React Router imports

### Step 6: Clean Up
- Remove `index.html`
- Remove `vite.config.js`
- Remove `main.jsx`
- Remove old React Router files
- Update `.gitignore`

## 📁 New Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── globals.css
├── components/            # React components
│   ├── Common/
│   │   ├── Modal.tsx
│   │   └── Modal.module.css
│   └── Layout/
├── context/               # React contexts
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── services/              # API services
│   └── api.ts
├── types/                 # TypeScript types
│   └── index.ts
└── utils/                 # Utility functions
```

## 🔧 Important Notes

1. **Client Components**: Components that use hooks, state, or interactivity need `'use client'` directive
2. **Server Components**: Static components can be Server Components (default)
3. **CSS Modules**: Use CSS Modules for component-specific styles
4. **Layout**: Root layout wraps all pages
5. **Metadata**: Use Next.js metadata API for SEO

## 📝 Example Conversion

### Before (React Router):
```jsx
// pages/Home.jsx
import { Link } from 'react-router-dom';
export default function Home() {
  return <Link to="/login">Login</Link>;
}
```

### After (Next.js App Router):
```tsx
// app/page.tsx
import Link from 'next/link';
export default function HomePage() {
  return <Link href="/login">Login</Link>;
}
```

## 🚀 Running the Project

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## ⚠️ Migration Checklist

- [ ] Install Next.js dependencies
- [ ] Convert all contexts to TypeScript
- [ ] Convert all components to TypeScript
- [ ] Separate CSS for each component
- [ ] Migrate all pages to App Router
- [ ] Update all imports
- [ ] Remove old Vite files
- [ ] Test all routes
- [ ] Fix TypeScript errors
- [ ] Test authentication flow
- [ ] Test API calls

