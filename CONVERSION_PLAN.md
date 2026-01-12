# Conversion Plan - Complete Next.js Migration

Due to the large number of files (28+ JSX files), I'll convert them systematically. Here's the plan:

## Priority Order:

### Phase 1: Core Infrastructure ✅
- [x] package.json - Next.js setup
- [x] tsconfig.json
- [x] next.config.ts
- [x] Types definitions
- [x] API service (api.ts)
- [x] AuthContext.tsx
- [x] ToastContext.tsx
- [x] Helpers (helpers.ts)

### Phase 2: Layout Components (Next)
- [ ] Header.tsx + Header.module.css
- [ ] Footer.tsx + Footer.module.css
- [ ] App layout.tsx (already created)

### Phase 3: Common Components
- [ ] Modal.tsx + Modal.module.css
- [ ] ProtectedRoute.tsx
- [ ] Loading.tsx + Loading.module.css
- [ ] Badge.tsx + Badge.module.css
- [ ] StarRating.tsx + StarRating.module.css
- [ ] Toast.tsx (can be removed, using Modal)

### Phase 4: Card Components
- [ ] FreelancerCard.tsx + FreelancerCard.module.css
- [ ] JobCard.tsx + JobCard.module.css

### Phase 5: Pages (App Router)
- [ ] Home page
- [ ] Login page
- [ ] Register page
- [ ] VerifyOTP page
- [ ] Jobs pages
- [ ] Freelancers pages
- [ ] Profile pages
- [ ] Other pages

### Phase 6: Cleanup
- [ ] Remove old Vite files
- [ ] Remove React Router
- [ ] Update all imports

## Note:
Due to the large number of files, I'll continue with systematic conversion. Each component will:
1. Be converted to TypeScript (.tsx)
2. Have separate CSS file (Module CSS or regular CSS)
3. Use 'use client' directive where needed
4. Update imports to use @/ alias

