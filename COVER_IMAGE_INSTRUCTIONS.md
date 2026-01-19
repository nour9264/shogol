# Instructions to Add Cover Image Upload UI

## File to Edit
`d:\projects\ShogolFront\ShogolFront\src\components\pages\profile\EditProfile.tsx`

## What to Add
After line 142 (right after the `<h1>` tag that says "تعديل الملف الشخصي"), add these 3 lines:

```tsx
          {/* Cover Image Section - Only for Freelancers */}
          {user.isFreelancer && <CoverImageManager />}

```

## Before (lines 142-144):
```tsx
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'rgb(var(--text-primary))' }}>تعديل الملف الشخصي</h1>

          <div className="flex flex-col items-center mb-8">
```

## After (lines 142-147):
```tsx
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'rgb(var(--text-primary))' }}>تعديل الملف الشخصي</h1>

          {/* Cover Image Section - Only for Freelancers */}
          {user.isFreelancer && <CoverImageManager />}

          <div className="flex flex-col items-center mb-8">
```

## Also Need to Add API Method
In `d:\projects\ShogolFront\ShogolFront\src\services\api.ts`, after line 284 (after the `updateProfilePicture` method), add:

```typescript
  updateCoverImage: (file: File) => {
    const formData = new FormData();
    formData.append('CoverImage', file);
    return api.post<{ imageUrl: string; message: string }>('/User/cover-image', formData, {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    });
  },
```

## Result
After making these changes and refreshing the page:
- You'll see a cover image upload section ABOVE the profile picture
- It will only show for freelancers
- You can upload and crop cover images with 16:9 aspect ratio
