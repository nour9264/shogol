# Files Conversion Checklist

## ✅ Already Converted
- [x] package.json
- [x] tsconfig.json
- [x] next.config.ts
- [x] tailwind.config.ts
- [x] src/types/index.ts
- [x] src/services/api.ts
- [x] src/context/AuthContext.tsx
- [x] src/context/ToastContext.tsx
- [x] src/utils/helpers.ts
- [x] src/components/Common/Modal.tsx + Modal.module.css
- [x] src/app/layout.tsx
- [x] src/app/page.tsx
- [x] src/app/login/page.tsx
- [x] src/app/register/page.tsx
- [x] src/app/globals.css

## 🔄 Remaining Files (25+ files)

### Components (9 files)
- [ ] Header.jsx → Header.tsx + Header.module.css
- [ ] Footer.jsx → Footer.tsx + Footer.module.css
- [ ] ProtectedRoute.jsx → ProtectedRoute.tsx
- [ ] Loading.jsx → Loading.tsx + Loading.module.css
- [ ] Badge.jsx → Badge.tsx + Badge.module.css
- [ ] StarRating.jsx → StarRating.tsx + StarRating.module.css
- [ ] Toast.jsx → (can delete, using Modal)
- [ ] FreelancerCard.jsx → FreelancerCard.tsx + FreelancerCard.module.css
- [ ] JobCard.jsx → JobCard.tsx + JobCard.module.css

### Pages (13+ files)
- [ ] pages/Home.jsx → app/page.tsx (or components/pages/Home.tsx)
- [ ] pages/Auth/Login.jsx → app/login/page.tsx
- [ ] pages/Auth/Register.jsx → app/register/page.tsx
- [ ] pages/Auth/VerifyOTP.jsx → app/verify-otp/page.tsx
- [ ] pages/Jobs/JobList.jsx → app/jobs/page.tsx
- [ ] pages/Jobs/JobDetails.jsx → app/jobs/[id]/page.tsx
- [ ] pages/Jobs/PostJob.jsx → app/post-job/page.tsx
- [ ] pages/Freelancers/FreelancerList.jsx → app/freelancers/page.tsx
- [ ] pages/Freelancers/FreelancerProfile.jsx → app/freelancers/[id]/page.tsx
- [ ] pages/Profile/Profile.jsx → app/profile/page.tsx
- [ ] pages/Profile/EditProfile.jsx → app/profile/edit/page.tsx
- [ ] pages/Messages.jsx → app/messages/page.tsx
- [ ] pages/MyJobs.jsx → app/my-jobs/page.tsx
- [ ] pages/Notifications.jsx → app/notifications/page.tsx

### Old Files to Delete
- [ ] App.jsx
- [ ] main.jsx
- [ ] index.html
- [ ] vite.config.js
- [ ] src/index.css (keep globals.css instead)
- [ ] All .jsx files after conversion

## Strategy
Due to large number of files, conversion will be done systematically:
1. Core components first (Header, Footer, Common components)
2. Then pages (one by one)
3. Finally cleanup old files

