'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useForm } from 'react-hook-form';
import ProtectedRoute from '@/components/Common/ProtectedRoute';
import { getImageUrl, validateImageFile } from '@/utils/helpers';
import { FaCamera, FaSpinner } from 'react-icons/fa';
import ImageCropper from '@/components/Common/ImageCropper';
import CoverImageManager from './CoverImageManager';
import styles from './EditProfile.module.css';

interface EditProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  gender: string;
  nationality: string;
}

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      gender: user?.gender || '',
      nationality: user?.nationality || '',
    },
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      showError(validation.error || 'صورة غير صالحة');
      return;
    }

    // Open cropper instead of uploading directly
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Close cropper
    setShowCropper(false);
    setImageToCrop(null);

    // Convert blob to File
    const croppedFile = new File([croppedBlob], 'profile-picture.jpg', {
      type: 'image/jpeg',
    });

    // Create preview from cropped image
    const previewUrl = URL.createObjectURL(croppedBlob);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(previewUrl);

    // Upload the cropped image
    setUploadingImage(true);
    try {
      const response = await userService.updateProfilePicture(croppedFile);
      if (user && response.data.imageUrl) {
        updateUser({ ...user, profilePictureUrl: response.data.imageUrl });
      }
      success('تم تحديث الصورة الشخصية بنجاح');
    } catch (error: any) {
      showError(error.response?.data?.message || 'فشل تحميل الصورة');
      setPreviewImage(null);
    }
    setUploadingImage(false);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    setLoading(true);
    try {
      await userService.updateProfile(data);
      if (user) {
        updateUser({ ...user, ...data });
      }
      success('تم تحديث الملف الشخصي بنجاح');
      router.push('/profile');
    } catch (error: any) {
      showError(error.response?.data?.message || 'فشل تحديث الملف الشخصي');
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="container-custom max-w-2xl">
        <div className="card">
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'rgb(var(--text-primary))' }}>تعديل الملف الشخصي</h1>

          {/* Cover Image Section - Only for Freelancers */}
          {user.isFreelancer && <CoverImageManager />}

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={previewImage || getImageUrl(user.profilePictureUrl)}
                alt={user.firstName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg"
              >
                {uploadingImage ? <FaSpinner className="animate-spin" /> : <FaCamera />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">اضغط على أيقونة الكاميرا لتغيير الصورة</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
                const tagName = (e.target as HTMLElement).tagName.toLowerCase();
                if (tagName === 'textarea') return;
                const inputType = (e.target as HTMLInputElement).type;
                if (inputType === 'file') return;
                e.preventDefault();
                const form = e.currentTarget;
                if (form && typeof form.requestSubmit === 'function') {
                  form.requestSubmit();
                }
              }
            }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">الاسم الأول <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('firstName', { required: 'الاسم الأول مطلوب' })}
                  className={`input ${errors.firstName ? 'input-error' : ''}`}
                />
                {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">الاسم الأخير <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('lastName', { required: 'الاسم الأخير مطلوب' })}
                  className={`input ${errors.lastName ? 'input-error' : ''}`}
                />
                {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">نبذة عني</label>
              <textarea {...register('bio')} className="input min-h-[150px]" placeholder="اكتب نبذة عن نفسك..." />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">النوع</label>
                <select {...register('gender')} className="input">
                  <option value="">اختر</option>
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
              </div>
              <div>
                <label className="label">الجنسية</label>
                <select {...register('nationality')} className="input">
                  <option value="">اختر الدولة</option>
                  <option value="السعودية">السعودية</option>
                  <option value="مصر">مصر</option>
                  <option value="الأردن">الأردن</option>
                  <option value="الإمارات">الإمارات</option>
                  <option value="الكويت">الكويت</option>
                  <option value="قطر">قطر</option>
                  <option value="عمان">عمان</option>
                  <option value="البحرين">البحرين</option>
                  <option value="لبنان">لبنان</option>
                  <option value="سوريا">سوريا</option>
                  <option value="العراق">العراق</option>
                  <option value="فلسطين">فلسطين</option>
                  <option value="المغرب">المغرب</option>
                  <option value="الجزائر">الجزائر</option>
                  <option value="تونس">تونس</option>
                  <option value="ليبيا">ليبيا</option>
                  <option value="السودان">السودان</option>
                  <option value="اليمن">اليمن</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="btn btn-outline flex-1"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="round"
          title="قص الصورة الشخصية"
        />
      )}
    </div>
  );
};

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  );
}



