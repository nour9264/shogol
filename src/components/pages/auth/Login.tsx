'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';
import styles from './Login.module.css';

interface LoginFormData {
  emailOrPhone: string;
  password: string;
}

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const { t, isArabic } = useLanguage();
  const { success, error: showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    console.log('%c[🔐 LOGIN PAGE] Starting login attempt...', 'color: #2196F3; font-weight: bold;');
    setLoading(true);

    try {
      const result = await login(data.emailOrPhone, data.password);
      setLoading(false);

      if (result.success) {
        console.log('%c[🔐 LOGIN PAGE] ✅ Login successful!', 'color: #4CAF50; font-weight: bold;');
        success(isArabic ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
        setTimeout(() => {
          console.log('%c[🔐 LOGIN PAGE] Navigating to home page...', 'color: #2196F3;');
          router.push('/');
        }, 500);
      } else {
        console.error('%c[🔐 LOGIN PAGE] ❌ Login failed:', 'color: #F44336; font-weight: bold;', result.error);
        showError(result.error || (isArabic ? 'حدث خطأ أثناء تسجيل الدخول' : 'Login failed'));
      }
    } catch (error: any) {
      setLoading(false);
      console.error('%c[🔐 LOGIN PAGE] ❌ Exception caught:', 'color: #F44336; font-weight: bold;', error);
      const errorMessage = error.response?.data?.message || (isArabic ? 'حدث خطأ غير متوقع أثناء تسجيل الدخول' : 'An unexpected error occurred');
      showError(errorMessage);
    }
  };

  // Handle Enter key for form submission
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
      const tagName = (e.target as HTMLElement).tagName.toLowerCase();
      // Don't submit on Enter in textarea
      if (tagName === 'textarea') return;

      e.preventDefault();
      const form = e.currentTarget;
      if (form && typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{isArabic ? 'ش' : 'S'}</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('login')}</h2>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>{isArabic ? 'مرحباً بعودتك إلى شغل' : 'Welcome back to SHOGOL'}</p>
        </div>

        <div className="card rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-6">
            <div>
              <label className="label">
                {t('emailOrPhone')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rtl:right-4 ltr:left-4" />
                <input
                  type="text"
                  {...register('emailOrPhone', {
                    required: isArabic ? 'هذا الحقل مطلوب' : 'This field is required',
                  })}
                  className={`input px-12 ${errors.emailOrPhone ? 'input-error' : ''}`}
                  placeholder={t('enterEmailOrPhone')}
                />
              </div>
              {errors.emailOrPhone && <p className="error-text">{errors.emailOrPhone.message}</p>}
            </div>

            <div>
              <label className="label">
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock
                  className="absolute top-1/2 -translate-y-1/2 text-gray-400"
                  style={isArabic ? { right: '1rem' } : { left: '1rem' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: isArabic ? 'كلمة المرور مطلوبة' : 'Password is required',
                  })}
                  className={`input px-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  style={isArabic ? { left: '1rem' } : { right: '1rem' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div className="text-left rtl:text-right">
              <Link href="/forgot-password" className="link text-sm">
                {t('forgotPassword')}
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? (isArabic ? 'جاري تسجيل الدخول...' : 'Logging in...') : t('login')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgb(var(--border-primary))' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-sm" style={{ backgroundColor: 'rgb(var(--bg-secondary))', color: 'rgb(var(--text-tertiary))' }}>{isArabic ? 'أو' : 'or'}</span>
            </div>
          </div>

          <p className="text-center" style={{ color: 'rgb(var(--text-secondary))' }}>
            {t('noAccount')}{' '}
            <Link href="/register" className="link font-medium">
              {isArabic ? 'سجل الآن' : 'Register now'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

