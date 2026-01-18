'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { jobService } from '@/services/api';
import Loading from '@/components/Common/Loading';
import { FaSave, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import type { JobRequest } from '@/types';

interface EditJobFormData {
  title: string;
  description: string;
  budget: number;
  durationInDays: number;
  deadline?: string;
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isAuthenticated } = useAuth();
  const { isArabic } = useLanguage();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<JobRequest | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditJobFormData>();

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobService.getJobDetails(parseInt(id));
      const jobData = response.data;
      setJob(jobData);

      // Check if current user is the owner
      if (user && jobData.clientId !== user.id) {
        showError(isArabic ? 'ليس لديك صلاحية لتعديل هذا المشروع' : 'You are not authorized to edit this project');
        router.push(`/jobs/${id}`);
        return;
      }

      // Check if job can be edited (only Pending status)
      if (jobData.status !== 'Pending') {
        const statusMessage = jobData.status === 'InProgress'
          ? (isArabic ? 'لا يمكن تعديل المشروع. تم قبول عرض لهذا المشروع.' : 'Cannot edit project. An offer has been accepted for this project.')
          : jobData.status === 'Completed'
            ? (isArabic ? 'لا يمكن تعديل المشروع. تم إكمال هذا المشروع.' : 'Cannot edit project. This project has been completed.')
            : (isArabic ? 'لا يمكن تعديل هذا المشروع.' : 'This project cannot be edited.');
        showError(statusMessage);
        router.push(`/jobs/${id}`);
        return;
      }

      // Pre-fill form with job data
      reset({
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        durationInDays: jobData.durationInDays,
        deadline: jobData.deadline ? new Date(jobData.deadline).toISOString().split('T')[0] : '',
      });
    } catch (error) {
      showError(isArabic ? 'فشل تحميل تفاصيل المشروع' : 'Failed to load project details');
      router.push('/my-jobs');
    }
    setLoading(false);
  };

  const onSubmit = async (data: EditJobFormData) => {
    setSaving(true);
    try {
      await jobService.updateJob(parseInt(id), {
        title: data.title,
        description: data.description,
        budget: data.budget,
        durationInDays: data.durationInDays,
        deadline: data.deadline || undefined,
      });

      success(isArabic ? 'تم تحديث المشروع بنجاح' : 'Project updated successfully');
      router.push(`/jobs/${id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '';

      // Handle specific error messages from API
      if (errorMessage.toLowerCase().includes('offer has been accepted') || errorMessage.toLowerCase().includes('cannot update')) {
        showError(isArabic
          ? 'لا يمكن تعديل المشروع. تم قبول عرض لهذا المشروع.'
          : 'Cannot update job request. An offer has been accepted for this project.');
        router.push(`/jobs/${id}`);
      } else if (errorMessage.toLowerCase().includes('contract exists')) {
        showError(isArabic
          ? 'لا يمكن تعديل المشروع. يوجد عقد لهذا المشروع.'
          : 'Cannot update job request. A contract exists for this project.');
        router.push(`/jobs/${id}`);
      } else if (errorMessage.toLowerCase().includes('not found')) {
        showError(isArabic ? 'المشروع غير موجود' : 'Job request not found');
        router.push('/my-jobs');
      } else {
        showError(errorMessage || (isArabic ? 'فشل تحديث المشروع' : 'Failed to update project'));
      }
    }
    setSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'}
          </p>
          <Link href="/login" className="btn btn-primary">
            {isArabic ? 'تسجيل الدخول' : 'Login'}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/jobs/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-4"
          >
            {isArabic ? <FaArrowRight /> : <FaArrowLeft />}
            <span>{isArabic ? 'العودة للمشروع' : 'Back to Project'}</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isArabic ? 'تعديل المشروع' : 'Edit Project'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isArabic ? 'قم بتعديل تفاصيل مشروعك' : 'Update your project details'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-8 transition-colors">
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
            {/* Title */}
            <div>
              <label className="label">
                {isArabic ? 'عنوان المشروع' : 'Project Title'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title', {
                  required: isArabic ? 'عنوان المشروع مطلوب' : 'Project title is required',
                  minLength: {
                    value: 10,
                    message: isArabic ? 'العنوان يجب أن يكون 10 أحرف على الأقل' : 'Title must be at least 10 characters',
                  },
                })}
                className={`input ${errors.title ? 'input-error' : ''}`}
                placeholder={isArabic ? 'مثال: تصميم موقع إلكتروني لمتجر' : 'e.g., Design a website for a store'}
              />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="label">
                {isArabic ? 'وصف المشروع' : 'Project Description'} <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description', {
                  required: isArabic ? 'وصف المشروع مطلوب' : 'Project description is required',
                  minLength: {
                    value: 50,
                    message: isArabic ? 'الوصف يجب أن يكون 50 حرف على الأقل' : 'Description must be at least 50 characters',
                  },
                })}
                rows={6}
                className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                placeholder={isArabic ? 'اشرح تفاصيل المشروع بشكل واضح...' : 'Explain project details clearly...'}
              />
              {errors.description && <p className="error-text">{errors.description.message}</p>}
            </div>

            {/* Budget and Duration */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  {isArabic ? 'الميزانية (ريال)' : 'Budget (SAR)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('budget', {
                    required: isArabic ? 'الميزانية مطلوبة' : 'Budget is required',
                    min: {
                      value: 5,
                      message: isArabic ? 'الحد الأدنى للميزانية 5 ريال' : 'Minimum budget is 5 SAR',
                    },
                  })}
                  className={`input ${errors.budget ? 'input-error' : ''}`}
                  placeholder="0"
                />
                {errors.budget && <p className="error-text">{errors.budget.message}</p>}
              </div>

              <div>
                <label className="label">
                  {isArabic ? 'مدة التنفيذ (أيام)' : 'Duration (days)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('durationInDays', {
                    required: isArabic ? 'مدة التنفيذ مطلوبة' : 'Duration is required',
                    min: {
                      value: 1,
                      message: isArabic ? 'المدة يجب أن تكون يوم واحد على الأقل' : 'Duration must be at least 1 day',
                    },
                  })}
                  className={`input ${errors.durationInDays ? 'input-error' : ''}`}
                  placeholder="0"
                />
                {errors.durationInDays && <p className="error-text">{errors.durationInDays.message}</p>}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="label">
                {isArabic ? 'الموعد النهائي (اختياري)' : 'Deadline (optional)'}
              </label>
              <input
                type="date"
                {...register('deadline')}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href={`/jobs/${id}`}
                className="btn btn-outline flex-1 flex items-center justify-center"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <FaSave />
                <span>
                  {saving
                    ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                    : (isArabic ? 'حفظ التغييرات' : 'Save Changes')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

