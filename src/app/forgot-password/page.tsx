'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/api';

export const dynamic = 'force-dynamic';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, isArabic } = useLanguage();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);

    try {
      await authService.forgotPassword(data.email);
      success(isArabic
        ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
        : 'Password reset link has been sent to your email'
      );

      // Store email for reset password page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('resetEmail', data.email);
      }

      // Navigate to reset password page
      router.push('/reset-password');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data ||
        (isArabic ? 'حدث خطأ. يرجى المحاولة مرة أخرى' : 'An error occurred. Please try again');
      showError(errorMessage);
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
            {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
          </h2>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>
            {isArabic
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور'
              : 'Enter your email and we\'ll send you a link to reset your password'}
          </p>
        </div>

        <div className="card rounded-2xl shadow-soft p-8 transition-colors">
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
                const tagName = (e.target as HTMLElement).tagName.toLowerCase();
                if (tagName === 'textarea') return;
                e.preventDefault();
                const form = e.currentTarget;
                if (form && typeof form.requestSubmit === 'function') {
                  form.requestSubmit();
                }
              }
            }}
            className="space-y-6"
          >
            <div>
              <label className="label">
                {isArabic ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 rtl:right-4 ltr:left-4" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type="email"
                  {...register('email', {
                    required: isArabic ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: isArabic ? 'بريد إلكتروني غير صالح' : 'Invalid email address',
                    },
                  })}
                  className={`input px-12 ${errors.email ? 'input-error' : ''}`}
                  placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading
                ? (isArabic ? 'جاري الإرسال...' : 'Sending...')
                : (isArabic ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="link text-sm inline-flex items-center gap-2"
            >
              {isArabic ? (
                <>
                  <FaArrowRight className="text-xs" />
                  العودة لتسجيل الدخول
                </>
              ) : (
                <>
                  <FaArrowLeft className="text-xs" />
                  Back to Login
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

