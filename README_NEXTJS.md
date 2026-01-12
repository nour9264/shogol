# SHOGOL Frontend - Next.js Migration Guide

## Overview
This project has been migrated from React + Vite to Next.js 15 with TypeScript and App Router.

## Key Changes

### 1. Project Structure
- **App Router**: All pages are now in `src/app/` directory
- **TypeScript**: All files converted to `.ts` or `.tsx`
- **Separated CSS**: Each component has its own CSS file

### 2. Routing
- React Router replaced with Next.js App Router
- Pages are now in `src/app/` as `page.tsx` files
- Layouts are in `layout.tsx` files

### 3. Type Safety
- Full TypeScript support
- Types defined in `src/types/index.ts`
- API service fully typed

### 4. Installation
```bash
npm install
```

### 5. Development
```bash
npm run dev
```

### 6. Build
```bash
npm run build
npm start
```

## Migration Status

✅ Completed:
- Next.js 15 setup with TypeScript
- Tailwind CSS configuration
- TypeScript types definition
- API service with TypeScript
- Global CSS setup

🔄 In Progress:
- Converting components to TypeScript
- Separating CSS files
- Migrating contexts
- Converting pages to App Router

## Notes

- The project uses Next.js App Router (not Pages Router)
- All components are Client Components by default (use 'use client' directive)
- Server Components can be used for static content
- API routes can be added in `src/app/api/` directory

