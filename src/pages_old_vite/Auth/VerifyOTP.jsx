import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const { success, error: showError } = useToast();
  
  const phoneNumber = location.state?.phoneNumber || '';
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/register');
    }
  }, [phoneNumber, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
    setOtp(newOtp);
    
    if (pastedData.length === 4) {
      inputRefs[3].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      showError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(phoneNumber, otpCode);
    setLoading(false);

    if (result.success) {
      success('تم التحقق بنجاح!');
      navigate('/');
    } else {
      showError(result.error);
      setOtp(['', '', '', '']);
      inputRefs[0].current.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp(phoneNumber);
      success('تم إرسال رمز جديد');
    } catch (error) {
      showError('فشل إرسال رمز التحقق');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">ش</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">رمز التحقق</h2>
          <p className="text-gray-600">
            تم إرسال رمز التحقق إلى بريدك الإلكتروني
          </p>
          <p className="text-sm text-gray-500 mt-2">{phoneNumber}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 justify-center mb-8" dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
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
              <p className="text-sm text-gray-600 mb-2">
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
              <Link to="/register" className="link text-sm">
                تغيير رقم الجوال
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

