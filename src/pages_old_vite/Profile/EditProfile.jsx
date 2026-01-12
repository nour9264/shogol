import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useForm } from 'react-hook-form';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      gender: user?.gender || '',
      nationality: user?.nationality || '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await userService.updateProfile(data);
      updateUser({ ...user, ...data });
      success('تم تحديث الملف الشخصي');
      navigate('/profile');
    } catch (error) {
      showError('فشل تحديث الملف الشخصي');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-2xl">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">تعديل الملف الشخصي</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">الاسم الأول</label>
                <input type="text" {...register('firstName')} className="input" />
              </div>
              <div>
                <label className="label">الاسم الأخير</label>
                <input type="text" {...register('lastName')} className="input" />
              </div>
            </div>

            <div>
              <label className="label">نبذة عني</label>
              <textarea {...register('bio')} className="input min-h-[150px]" />
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
                <input type="text" {...register('nationality')} className="input" />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn btn-outline flex-1"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

