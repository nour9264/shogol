'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCamera, FaTimes } from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';
import { isValidEmail, isValidPhone, validatePassword, validateImageFile } from '@/utils/helpers';
import ImageCropper from '@/components/Common/ImageCropper';
import type { RegisterData } from '@/types';
import styles from './Register.module.css';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  accountType: 'Individual' | 'Company';
  userType: 'Freelancer' | 'Client';
  companyName?: string;
  gender?: 'Male' | 'Female';
  nationality?: string;
  acceptTerms?: boolean;
}

const Register = () => {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { t, isArabic } = useLanguage();
  const { success, error: showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedUserType, setSelectedUserType] = useState<'Freelancer' | 'Client' | ''>('');

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image file
    const validation = validateImageFile(file, 5); // 5MB max
    if (!validation.valid) {
      showError(validation.error || 'صورة غير صالحة');
      return;
    }

    // Create a data URL for the cropper
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert blob to File
    const croppedFile = new File([croppedBlob], 'profile-picture.jpg', {
      type: 'image/jpeg',
    });

    setProfilePicture(croppedFile);

    // Create preview URL from the cropped blob
    const previewUrl = URL.createObjectURL(croppedBlob);
    if (profilePicturePreview) {
      URL.revokeObjectURL(profilePicturePreview);
    }
    setProfilePicturePreview(previewUrl);

    // Close cropper and cleanup
    setShowCropper(false);
    setImageToCrop(null);

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

  const removeProfilePicture = () => {
    setProfilePicture(null);
    if (profilePicturePreview) {
      URL.revokeObjectURL(profilePicturePreview);
      setProfilePicturePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      accountType: 'Individual',
      userType: 'Freelancer',
    },
  });

  const accountType = watch('accountType');
  const userType = watch('userType');
  const password = watch('password');

  useEffect(() => {
    if (selectedUserType) {
      setValue('userType', selectedUserType as 'Freelancer' | 'Client');
    }
  }, [selectedUserType, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    const finalUserType = data.userType || (selectedUserType as 'Freelancer' | 'Client');

    if (!finalUserType) {
      showError('يرجى اختيار نوع الحساب (مستخدم أو مشتغل)');
      setStep(1);
      return;
    }

    const { acceptTerms, companyName, ...formDataWithoutTerms } = data;

    const submitData: RegisterData = {
      phoneNumber: formDataWithoutTerms.phoneNumber,
      email: formDataWithoutTerms.email,
      firstName: formDataWithoutTerms.firstName,
      lastName: formDataWithoutTerms.lastName,
      password: formDataWithoutTerms.password,
      accountType: formDataWithoutTerms.accountType,
      userType: finalUserType,
    };

    if (formDataWithoutTerms.accountType === 'Company' && companyName) {
      submitData.companyName = companyName;
    }

    if (formDataWithoutTerms.nationality) {
      submitData.nationality = formDataWithoutTerms.nationality;
    }
    if (formDataWithoutTerms.gender) {
      submitData.gender = formDataWithoutTerms.gender;
    }

    setLoading(true);

    try {
      // Pass profile picture as second parameter (optional)
      const result = await registerUser(submitData, profilePicture || undefined);

      if (result.success) {
        setLoading(false);
        success('تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('registerPhoneNumber', submitData.phoneNumber);
          sessionStorage.setItem('registerEmail', submitData.email);
        }
        router.push('/verify-otp');
      } else {
        setLoading(false);
        // Check if the error message indicates success (backend might return 400 for unverified users)
        const errorMsg = result.error || '';
        if (errorMsg.includes('Registration successful')) {
          success('تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني');
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('registerPhoneNumber', submitData.phoneNumber);
            sessionStorage.setItem('registerEmail', submitData.email);
          }
          router.push('/verify-otp');
        } else {
          showError(errorMsg || 'فشل التسجيل. يرجى المحاولة مرة أخرى.');
        }
      }
    } catch (error: any) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.';

      // Check if the error message indicates success
      if (errorMessage.includes('Registration successful')) {
        success('تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('registerPhoneNumber', submitData.phoneNumber);
          sessionStorage.setItem('registerEmail', submitData.email);
        }
        router.push('/verify-otp');
      } else {
        showError(errorMessage);
      }
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{isArabic ? 'ش' : 'S'}</span>
              </div>
            </Link>
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>{t('createAccount')}</h2>
            <p className="text-lg" style={{ color: 'rgb(var(--text-secondary))' }}>{t('selectAccountType')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              type="button"
              onClick={() => {
                setSelectedUserType('Freelancer');
                setValue('userType', 'Freelancer');
                setStep(2);
              }}
              className="card-bordered hover:border-primary-500 hover:shadow-lg transition-all p-8 text-center group"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{t('freelancerAccount')}</h3>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('freelancerDesc')}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedUserType('Client');
                setValue('userType', 'Client');
                setStep(2);
              }}
              className="card-bordered hover:border-primary-500 hover:shadow-lg transition-all p-8 text-center group"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-secondary-50 dark:bg-secondary-900/30 rounded-full flex items-center justify-center group-hover:bg-secondary-100 dark:group-hover:bg-secondary-900/50 transition-colors">
                <svg className="w-12 h-12 text-secondary-600 dark:text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{t('clientAccount')}</h3>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('clientDesc')}
              </p>
            </button>
          </div>

          <p className="text-center" style={{ color: 'rgb(var(--text-secondary))' }}>
            {t('haveAccount')}{' '}
            <Link href="/login" className="link font-medium">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{isArabic ? 'ش' : 'S'}</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
            {selectedUserType === 'Freelancer'
              ? t('freelancerAccount')
              : selectedUserType === 'Client'
                ? t('clientAccount')
                : t('createAccount')}
          </h2>
          {selectedUserType && (
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {selectedUserType === 'Freelancer' ? (isArabic ? 'مستخدم' : 'Freelancer') : (isArabic ? 'مشتغل' : 'Client')}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {t('changeAccountType')}
          </button>
        </div>

        <div className="card rounded-2xl shadow-soft p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
                const tagName = (e.target as HTMLElement).tagName.toLowerCase();
                if (tagName === 'textarea') return;
                const inputType = (e.target as HTMLInputElement).type;
                if (inputType === 'file') return; // Let file input work
                e.preventDefault();
                const form = e.currentTarget;
                if (form && typeof form.requestSubmit === 'function') {
                  form.requestSubmit();
                }
              }
            }}
            className="space-y-6"
          >
            <input type="hidden" {...register('userType', { required: true })} />

            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-6">
              <label className="label text-center mb-3">{t('profilePicture')} ({t('optional')})</label>
              <div className="relative">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-full border-3 border-dashed flex items-center justify-center cursor-pointer hover:border-primary-500 transition-all overflow-hidden group"
                  style={{
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    borderColor: 'rgb(var(--border-secondary))'
                  }}
                >
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt={t('profilePicture')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <FaCamera className="text-3xl mx-auto mb-1 group-hover:text-primary-500 transition-colors" style={{ color: 'rgb(var(--text-tertiary))' }} />
                      <span className="text-xs group-hover:text-primary-600" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('addPhoto')}</span>
                    </div>
                  )}
                </div>

                {profilePicture && (
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    title="إزالة الصورة"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleProfilePictureChange}
                className="hidden"
              />

              <p className="text-xs text-gray-500 mt-2 text-center">
                صيغ مدعومة: JPEG, PNG, GIF, WebP (الحد الأقصى 5MB)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  الاسم الأول <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    {...register('firstName', {
                      required: 'الاسم الأول مطلوب',
                      minLength: { value: 2, message: 'الاسم قصير جداً' },
                    })}
                    className={`input pr-12 ${errors.firstName ? 'input-error' : ''}`}
                    placeholder="الاسم الأول"
                  />
                </div>
                {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="label">
                  الاسم الأخير <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('lastName', {
                    required: 'الاسم الأخير مطلوب',
                    minLength: { value: 2, message: 'الاسم قصير جداً' },
                  })}
                  className={`input ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="الاسم الأخير"
                />
                {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'البريد الإلكتروني مطلوب',
                    validate: (value) => isValidEmail(value) || 'البريد الإلكتروني غير صحيح',
                  })}
                  className={`input pr-12 ${errors.email ? 'input-error' : ''}`}
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">
                رقم الجوال <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  {...register('phoneNumber', {
                    required: 'رقم الجوال مطلوب',
                    validate: (value) => {
                      if (!value || value.trim() === '') {
                        return 'رقم الجوال مطلوب';
                      }
                      return isValidPhone(value) || 'رقم الجوال غير صحيح. مثال: +966501234567 أو +201141479508';
                    },
                  })}
                  className={`input pr-12 ${errors.phoneNumber ? 'input-error' : ''}`}
                  placeholder="+966501234567 أو +201141479508"
                />
              </div>
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                أدخل رقم الجوال بدون مسافات. مثال: +966501234567 أو +201141479508
              </p>
            </div>

            <div>
              <label className="label">
                كلمة المرور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'كلمة المرور مطلوبة',
                    minLength: { value: 8, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
                    validate: (value) => validatePassword(value).isValid || 'كلمة المرور ضعيفة',
                  })}
                  className={`input pr-12 pl-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
              {password && (
                <div className="mt-2 text-xs space-y-1">
                  {validatePassword(password).minLength ? (
                    <p className="text-green-600">✓ 8 أحرف على الأقل</p>
                  ) : (
                    <p className="text-gray-500">○ 8 أحرف على الأقل</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label">
                نوع الحساب <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    {...register('accountType', { required: 'نوع الحساب مطلوب' })}
                    value="Individual"
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="font-medium">حساب فرد</span>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    {...register('accountType', { required: 'نوع الحساب مطلوب' })}
                    value="Company"
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="font-medium">حساب شركة</span>
                </label>
              </div>
              {errors.accountType && <p className="error-text">{errors.accountType.message}</p>}
            </div>

            {accountType === 'Company' && (
              <div>
                <label className="label">
                  اسم الشركة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('companyName', {
                    required: accountType === 'Company' ? 'اسم الشركة مطلوب' : false,
                  })}
                  className={`input ${errors.companyName ? 'input-error' : ''}`}
                  placeholder="اسم الشركة"
                />
                {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}
              </div>
            )}

            <div>
              <label className="label">النوع</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input type="radio" {...register('gender')} value="Male" className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">ذكر</span>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input type="radio" {...register('gender')} value="Female" className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">أنثى</span>
                </label>
              </div>
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

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('acceptTerms', {
                    required: 'يجب الموافقة على الشروط والأحكام',
                  })}
                  className="mt-1 w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-600">
                  أوافق على{' '}
                  <Link href="/terms" className="link">
                    الشروط والأحكام
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && <p className="error-text">{errors.acceptTerms.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center mt-6" style={{ color: 'rgb(var(--text-secondary))' }}>
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="link font-medium">
              تسجيل الدخول
            </Link>
          </p>
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

export default Register;

