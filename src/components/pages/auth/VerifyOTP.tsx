'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import styles from './VerifyOTP.module.css';

const VerifyOTP = () => {
  const router = useRouter();
  const { verifyOtp } = useAuth();
  const { success, error: showError } = useToast();

  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPhone = sessionStorage.getItem('registerPhoneNumber');
      const storedEmail = sessionStorage.getItem('registerEmail');
      if (storedPhone) {
        setUserPhone(storedPhone);
        if (storedEmail) {
          setUserEmail(storedEmail);
        }
      } else {
        router.push('/register');
      }
    }
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current?.focus();
    }
    // Submit on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      const otpCode = otp.join('');
      if (otpCode.length === 6) {
        submitOtp(otpCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setOtp(newOtp);

    if (pastedData.length === 6 && inputRefs[5].current) {
      inputRefs[5].current?.focus();
    }
  };

  // Auto-submit function
  const submitOtp = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      return;
    }

    if (!userPhone) {
      showError('البريد الإلكتروني غير موجود');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(userPhone, otpCode);
    setLoading(false);

    if (result.success) {
      success('تم التحقق بنجاح!');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('registerPhoneNumber');
        sessionStorage.removeItem('registerEmail');
      }
      router.push('/');
    } else {
      showError(result.error || 'رمز التحقق غير صحيح');
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && !loading && userPhone) {
      // Small delay to allow the user to see the last digit entered
      const timer = setTimeout(() => {
        submitOtp(otpCode);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [otp, loading, userPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      showError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    await submitOtp(otpCode);
  };

  const handleResend = async () => {
    if (!userPhone) {
      showError('البريد الإلكتروني غير موجود');
      return;
    }

    setResending(true);
    try {
      await authService.resendOtp(userPhone);
      success('تم إرسال رمز جديد إلى بريدك الإلكتروني');
    } catch (error) {
      showError('فشل إرسال رمز التحقق');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">ش</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>رمز التحقق</h2>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>تم إرسال رمز التحقق إلى بريدك الإلكتروني</p>
          <p className="text-sm text-primary-600 font-medium mt-2">{userEmail || userPhone}</p>
        </div>

        <div className="card rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-8" dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  style={{
                    backgroundColor: 'rgb(var(--bg-secondary))',
                    color: 'rgb(var(--text-primary))',
                    borderColor: 'rgb(var(--border-secondary))'
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.some((d) => !d)}
              className="btn btn-primary w-full mb-4"
            >
              {loading ? 'جاري التحقق...' : 'تحقق'}
            </button>

            <div className="text-center">
              <p className="text-sm mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                لم تستلم الرمز؟{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="link font-medium"
                >
                  {resending ? 'جاري الإرسال...' : 'إعادة الإرسال'}
                </button>
              </p>
              <Link href="/register" className="link text-sm">
                تغيير البريد الإلكتروني
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

