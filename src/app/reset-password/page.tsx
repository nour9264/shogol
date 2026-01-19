'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';

export const dynamic = 'force-dynamic';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isArabic } = useLanguage();
  const { success, error: showError } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // OTP state (6-digit code)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('resetEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current?.focus();
    }
    // Move focus to password field on Enter when OTP is complete
    if (e.key === 'Enter' && otp.join('').length === 6) {
      e.preventDefault();
      // Focus the password field
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      if (passwordInput) {
        passwordInput.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setOtp(newOtp);

    if (pastedData.length === 6 && inputRefs[5].current) {
      inputRefs[5].current?.focus();
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      showError(isArabic ? 'يرجى إدخال رمز التحقق كاملاً (6 أرقام)' : 'Please enter the complete OTP code (6 digits)');
      return;
    }

    if (!email) {
      showError(isArabic ? 'البريد الإلكتروني غير موجود. يرجى البدء من جديد' : 'Email not found. Please start again');
      router.push('/forgot-password');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email,
        resetToken: otpCode,
        newPassword: data.newPassword,
      });

      // Clear stored email
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('resetEmail');
      }

      setResetSuccess(true);
      success(isArabic ? 'تم إعادة تعيين كلمة المرور بنجاح!' : 'Password reset successfully!');

      // Auto-login the user with new password
      setLoggingIn(true);
      const loginResult = await login(email, data.newPassword);

      if (loginResult.success) {
        success(isArabic ? 'تم تسجيل دخولك تلقائياً!' : 'You have been logged in automatically!');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        // If auto-login fails, user can still go to login page manually
        setLoggingIn(false);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data ||
        (isArabic ? 'فشل إعادة تعيين كلمة المرور. تأكد من صحة الرمز' : 'Failed to reset password. Please check the OTP code');
      showError(errorMessage);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
        <div className="max-w-md w-full">
          <div className="card rounded-2xl shadow-soft p-8 text-center transition-colors">
            <div className="w-20 h-20 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(var(--status-success), 0.1)' }}>
              {loggingIn ? (
                <FaSpinner className="text-4xl animate-spin" style={{ color: 'rgb(var(--primary))' }} />
              ) : (
                <FaCheckCircle className="text-4xl" style={{ color: 'rgb(var(--status-success))' }} />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
              {isArabic ? 'تم إعادة تعيين كلمة المرور!' : 'Password Reset Successfully!'}
            </h2>
            <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
              {loggingIn
                ? (isArabic ? 'جاري تسجيل دخولك تلقائياً...' : 'Logging you in automatically...')
                : (isArabic ? 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة' : 'You can now login with your new password')
              }
            </p>
            {!loggingIn && (
              <Link href="/login" className="btn btn-primary w-full">
                {isArabic ? 'تسجيل الدخول' : 'Login'}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </h2>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>
            {isArabic
              ? 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة'
              : 'Enter the verification code sent to your email and your new password'}
          </p>
          {email && (
            <p className="text-sm font-medium mt-2" style={{ color: 'rgb(var(--primary))' }}>{email}</p>
          )}
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
            {/* OTP Code (6 digits) */}
            <div>
              <label className="label text-center block mb-4">
                {isArabic ? 'رمز التحقق (6 أرقام)' : 'OTP Code (6 digits)'} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 justify-center mb-2" dir="ltr">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 outline-none transition-all"
                    style={{
                      backgroundColor: 'rgb(var(--bg-tertiary))',
                      borderColor: 'rgb(var(--border-secondary))',
                      color: 'rgb(var(--text-primary))',
                      '--tw-ring-color': 'rgba(var(--primary), 0.2)'
                    } as any}
                  />
                ))}
              </div>
              <p className="text-xs text-center" style={{ color: 'rgb(var(--text-tertiary))' }}>
                {isArabic ? 'أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني' : 'Enter the 6-digit code sent to your email'}
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="label">
                {isArabic ? 'كلمة المرور الجديدة' : 'New Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 rtl:right-4 ltr:left-4" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword', {
                    required: isArabic ? 'كلمة المرور الجديدة مطلوبة' : 'New password is required',
                    minLength: {
                      value: 8,
                      message: isArabic ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: isArabic
                        ? 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص'
                        : 'Password must contain uppercase, lowercase, number and special character',
                    },
                  })}
                  className={`input px-12 ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder={isArabic ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-80 rtl:left-4 ltr:right-4"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && <p className="error-text">{errors.newPassword.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">
                {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 rtl:right-4 ltr:left-4" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: isArabic ? 'تأكيد كلمة المرور مطلوب' : 'Please confirm your password',
                    validate: (value) =>
                      value === newPassword || (isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'),
                  })}
                  className={`input px-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder={isArabic ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-80 rtl:left-4 ltr:right-4"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || otp.some(d => !d)}
              className="btn btn-primary w-full"
            >
              {loading
                ? (isArabic ? 'جاري إعادة التعيين...' : 'Resetting...')
                : (isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              {isArabic ? 'لم تستلم الرمز؟' : 'Didn\'t receive the code?'}{' '}
              <Link href="/forgot-password" className="link font-medium">
                {isArabic ? 'إعادة الإرسال' : 'Resend'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

