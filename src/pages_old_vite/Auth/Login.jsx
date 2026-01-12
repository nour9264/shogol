import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log('%c[🔐 LOGIN PAGE] Starting login attempt...', 'color: #2196F3; font-weight: bold;');
    setLoading(true);
    
    try {
      const result = await login(data.emailOrPhone, data.password);
      setLoading(false);

      if (result.success) {
        console.log('%c[🔐 LOGIN PAGE] ✅ Login successful!', 'color: #4CAF50; font-weight: bold;');
        success('تم تسجيل الدخول بنجاح');
        // Delay navigation slightly to allow toast to appear
        setTimeout(() => {
          console.log('%c[🔐 LOGIN PAGE] Navigating to home page...', 'color: #2196F3;');
          navigate('/');
        }, 500);
      } else {
        console.error('%c[🔐 LOGIN PAGE] ❌ Login failed:', 'color: #F44336; font-weight: bold;', result.error);
        console.log('%c[🔐 LOGIN PAGE] Showing error toast notification...', 'color: #F44336; font-weight: bold;');
        showError(result.error || 'حدث خطأ أثناء تسجيل الدخول');
        console.log('%c[🔐 LOGIN PAGE] Error toast should be visible for 7 seconds', 'color: #FF9800; font-weight: bold;');
      }
    } catch (error) {
      setLoading(false);
      console.error('%c[🔐 LOGIN PAGE] ❌ Exception caught:', 'color: #F44336; font-weight: bold;', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول';
      console.log('%c[🔐 LOGIN PAGE] Showing error toast notification (from catch)...', 'color: #F44336; font-weight: bold;');
      showError(errorMessage);
      console.log('%c[🔐 LOGIN PAGE] Error toast should be visible for 7 seconds', 'color: #FF9800; font-weight: bold;');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">ش</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">تسجيل الدخول</h2>
          <p className="text-gray-600">مرحباً بعودتك إلى شغل</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email or Phone */}
            <div>
              <label className="label">
                البريد الإلكتروني أو رقم الجوال <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  {...register('emailOrPhone', {
                    required: 'هذا الحقل مطلوب',
                  })}
                  className={`input pr-12 ${errors.emailOrPhone ? 'input-error' : ''}`}
                  placeholder="أدخل البريد الإلكتروني أو رقم الجوال"
                />
              </div>
              {errors.emailOrPhone && (
                <p className="error-text">{errors.emailOrPhone.message}</p>
              )}
            </div>

            {/* Password */}
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
                  })}
                  className={`input pr-12 pl-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="error-text">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <Link to="/forgot-password" className="link text-sm">
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">أو</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-600">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="link font-medium">
              سجل الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

