import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import { isValidEmail, isValidPhone, validatePassword } from '../../utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { success, error: showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Account Type, 2: Basic Info, 3: Details
  const [selectedUserType, setSelectedUserType] = useState(''); // Track selected user type

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      accountType: '',
      userType: '',
    },
  });

  const accountType = watch('accountType');
  const userType = watch('userType');
  const password = watch('password');

  // Sync selectedUserType with form value
  useEffect(() => {
    if (selectedUserType) {
      setValue('userType', selectedUserType);
    }
  }, [selectedUserType, setValue]);

  const onSubmit = async (data) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`%c[📝 REGISTER PAGE] ${timestamp} - Form Submitted`, 'color: #2196F3; font-weight: bold; font-size: 14px;');
    console.log('%cRaw Form Data:', 'color: #2196F3;', data);
    
    // Ensure userType is included (should be set in step 1)
    const finalUserType = data.userType || userType || selectedUserType;
    console.log('%cUser Type Check:', 'color: #2196F3;', {
      fromData: data.userType,
      fromState: userType,
      fromSelected: selectedUserType,
      final: finalUserType
    });
    
    if (!finalUserType) {
      console.error('%c[📝 REGISTER PAGE] ❌ User Type Missing!', 'color: #F44336; font-weight: bold;');
      showError('يرجى اختيار نوع الحساب (مستخدم أو مشتغل)');
      setStep(1);
      return;
    }

    // Combine form data with userType and clean up data
    const { acceptTerms, companyName, ...formDataWithoutTerms } = data;
    console.log('%cForm Data After Cleaning:', 'color: #2196F3;', {
      acceptTerms,
      companyName,
      formDataWithoutTerms
    });
    
    // Build submit data according to backend requirements
    const submitData = {
      phoneNumber: formDataWithoutTerms.phoneNumber,
      email: formDataWithoutTerms.email,
      firstName: formDataWithoutTerms.firstName,
      lastName: formDataWithoutTerms.lastName,
      password: formDataWithoutTerms.password,
      accountType: formDataWithoutTerms.accountType,
      userType: finalUserType,
    };

    // Only include companyName if accountType is Company
    if (formDataWithoutTerms.accountType === 'Company' && companyName) {
      submitData.companyName = companyName;
      console.log('%cCompany Name Added:', 'color: #2196F3;', companyName);
    }

    // Include optional fields if they exist
    if (formDataWithoutTerms.nationality) {
      submitData.nationality = formDataWithoutTerms.nationality;
    }
    if (formDataWithoutTerms.gender) {
      submitData.gender = formDataWithoutTerms.gender;
    }

    console.log('%c[📝 REGISTER PAGE] Final Submit Data:', 'color: #4CAF50; font-weight: bold;', submitData);
    console.log('%cSubmit Data (JSON):', 'color: #4CAF50;', JSON.stringify(submitData, null, 2));

    setLoading(true);
    console.log('%c[📝 REGISTER PAGE] Setting loading state to TRUE', 'color: #FF9800;');
    
    try {
      console.log('%c[📝 REGISTER PAGE] Calling registerUser()...', 'color: #FF9800;');
      const result = await registerUser(submitData);
      console.log('%c[📝 REGISTER PAGE] ✅ registerUser() completed', 'color: #4CAF50; font-weight: bold;');
      console.log('%cRegistration Result:', 'color: #4CAF50;', result);
      
      setLoading(false);
      console.log('%c[📝 REGISTER PAGE] Setting loading state to FALSE', 'color: #FF9800;');

      if (result.success) {
        console.log('%c[📝 REGISTER PAGE] ✅ Registration Success! Redirecting to OTP page...', 'color: #4CAF50; font-weight: bold;');
        success('تم التسجيل بنجاح! يرجى التحقق من البريد الإلكتروني');
        navigate('/verify-otp', { state: { phoneNumber: submitData.phoneNumber } });
      } else {
        const errorMsg = result.error || 'فشل التسجيل. يرجى المحاولة مرة أخرى.';
        console.error('%c[📝 REGISTER PAGE] ❌ Registration Failed:', 'color: #F44336; font-weight: bold;', errorMsg);
        console.error('%c[📝 REGISTER PAGE] Showing error toast notification...', 'color: #F44336; font-weight: bold;');
        showError(errorMsg);
        console.log('%c[📝 REGISTER PAGE] Error toast should be visible for 7 seconds', 'color: #FF9800; font-weight: bold;');
      }
    } catch (error) {
      setLoading(false);
      console.error('%c[📝 REGISTER PAGE] ❌ Exception Caught!', 'color: #F44336; font-weight: bold;');
      console.error('%cError Object:', 'color: #F44336;', error);
      console.error('%cError Stack:', 'color: #F44336;', error.stack);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] ||
                          'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.';
      console.error('%cFinal Error Message:', 'color: #F44336;', errorMessage);
      console.error('%c[📝 REGISTER PAGE] Showing error toast notification (from catch block)...', 'color: #F44336; font-weight: bold;');
      showError(errorMessage);
      console.log('%c[📝 REGISTER PAGE] Error toast should be visible for 7 seconds', 'color: #FF9800; font-weight: bold;');
    }
  };

  // Step 1: Account Type Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">ش</span>
              </div>
            </Link>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">إنشاء حساب</h2>
            <p className="text-gray-600 text-lg">حدد نوع الحساب، يمكن تغييره لاحقاً</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Freelancer Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedUserType('Freelancer');
                setValue('userType', 'Freelancer');
                setStep(2);
              }}
              className="card-bordered hover:border-primary-500 hover:shadow-lg transition-all p-8 text-center group"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-primary-50 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg className="w-12 h-12 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">حساب مستخدم</h3>
              <p className="text-gray-600">
                للمستقلين والموظفين المستقلين الذين يبحثون عن فرص عمل ومشاريع
              </p>
            </button>

            {/* Client Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedUserType('Client');
                setValue('userType', 'Client');
                setStep(2);
              }}
              className="card-bordered hover:border-primary-500 hover:shadow-lg transition-all p-8 text-center group"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-secondary-50 rounded-full flex items-center justify-center group-hover:bg-secondary-100 transition-colors">
                <svg className="w-12 h-12 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">حساب مشتغل</h3>
              <p className="text-gray-600">
                لأصحاب المشاريع والشركات الذين يبحثون عن موظفين مستقلين محترفين
              </p>
            </button>
          </div>

          <p className="text-center text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="link font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2 & 3: Registration Form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ش</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedUserType === 'Freelancer' ? 'حساب مستخدم' : selectedUserType === 'Client' ? 'حساب مشتغل' : 'إنشاء حساب'}
          </h2>
          {selectedUserType && (
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {selectedUserType === 'Freelancer' ? 'مستخدم' : 'مشتغل'}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            تغيير نوع الحساب
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hidden field to ensure userType is included in form submission */}
            <input 
              type="hidden" 
              {...register('userType', { required: true })} 
            />
            
            {/* First Name */}
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
                {errors.firstName && (
                  <p className="error-text">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
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
                {errors.lastName && (
                  <p className="error-text">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
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
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
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
              {errors.phoneNumber && (
                <p className="error-text">{errors.phoneNumber.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                أدخل رقم الجوال بدون مسافات. مثال: +966501234567 أو +201141479508
              </p>
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
                    minLength: { value: 8, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
                    validate: (value) =>
                      validatePassword(value).isValid || 'كلمة المرور ضعيفة',
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
              {errors.password && (
                <p className="error-text">{errors.password.message}</p>
              )}
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

            {/* Account Type */}
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
              {errors.accountType && (
                <p className="error-text">{errors.accountType.message}</p>
              )}
            </div>

            {/* Company Name (if company account) */}
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
                {errors.companyName && (
                  <p className="error-text">{errors.companyName.message}</p>
                )}
              </div>
            )}

            {/* Gender */}
            <div>
              <label className="label">النوع</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    {...register('gender')}
                    value="Male"
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="font-medium">ذكر</span>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    {...register('gender')}
                    value="Female"
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="font-medium">أنثى</span>
                </label>
              </div>
            </div>

            {/* Nationality */}
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

            {/* Terms */}
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
                  <Link to="/terms" className="link">
                    الشروط والأحكام
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="error-text">{errors.acceptTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="link font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

