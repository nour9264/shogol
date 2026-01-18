'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { jobService, userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import ProtectedRoute from '@/components/Common/ProtectedRoute';
import { FaPlus, FaTimes, FaPaperclip } from 'react-icons/fa';
import type { Skill } from '@/types';
import styles from './PostJob.module.css';

interface PostJobFormData {
  title: string;
  description: string;
  budget: string;
  durationInDays: string;
  deadline?: string;
}

const PostJob = () => {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostJobFormData>();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await userService.getAvailableSkills();
      const categories = response.data?.categories || response.data || [];

      const flattenSkills = (items: any[]): Skill[] => {
        let flat: Skill[] = [];
        items.forEach(item => {
          if (item.skills && item.skills.length > 0) {
            flat = [...flat, ...flattenSkills(item.skills)];
          } else {
            flat.push(item);
          }
        });
        return flat;
      };

      const flatList = Array.isArray(categories) ? flattenSkills(categories) : [];
      console.log('Flatted skills:', flatList);
      setAllSkills(flatList);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSkillToggle = (skillId: number) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments([...attachments, ...files]);
      // Focus the form after file selection so Enter key works
      setTimeout(() => formRef.current?.focus(), 100);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PostJobFormData) => {
    if (selectedSkills.length === 0) {
      showError('يرجى اختيار مهارة واحدة على الأقل');
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        ...data,
        budget: parseFloat(data.budget),
        durationInDays: parseInt(data.durationInDays),
        skillIds: selectedSkills,
        attachments: attachments,
      };

      const response = await jobService.createJob(jobData);
      success('تم نشر المشروع بنجاح');
      router.push(`/jobs/${response.data.jobRequestId}`);
    } catch (error: any) {
      showError(error.response?.data?.message || 'فشل نشر المشروع');
    }
    setLoading(false);
  };

  // Handle Enter key for form submission
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Check for Enter key
    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();

      // Don't submit from textarea (allow new lines)
      if (tagName === 'textarea') {
        return;
      }

      // Don't submit from file input (let it open file dialog)
      if (tagName === 'input' && (target as HTMLInputElement).type === 'file') {
        return;
      }

      // Submit form from anywhere else in the form
      e.preventDefault();
      const form = e.currentTarget;
      if (form && typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            <h1 className="text-4xl font-bold mb-4">طلب عرض للسعر..</h1>
            <p className="text-xl opacity-90">
              هناك حقيقة مثبتة منذ زمن طويل وهي أن المحتوى المقروء لصفحة ما سيلهي القارئ عن التركيز
            </p>
          </div>

          <div className="card p-8">
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} tabIndex={0} className="space-y-6 outline-none">
              <div>
                <label className="label">
                  عنوان الطلب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', {
                    required: 'العنوان مطلوب',
                    minLength: { value: 10, message: 'العنوان قصير جداً' },
                  })}
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="على سبيل المثال: بناء موقع على شبكة الإنترنت"
                />
                {errors.title && <p className="error-text">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">
                  اكتب تفاصيل إعلانك <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description', {
                    required: 'التفاصيل مطلوبة',
                    minLength: { value: 50, message: 'التفاصيل قصيرة جداً' },
                  })}
                  className={`input min-h-[200px] ${errors.description ? 'input-error' : ''}`}
                  placeholder="صف مشروعك هنا..."
                />
                {errors.description && <p className="error-text">{errors.description.message}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    السعر <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('budget', {
                        required: 'السعر مطلوب',
                        min: { value: 1, message: 'السعر يجب أن يكون أكبر من 0' },
                      })}
                      className={`input pl-16 ${errors.budget ? 'input-error' : ''}`}
                      placeholder="0"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-secondary))' }}>ريال</span>
                  </div>
                  {errors.budget && <p className="error-text">{errors.budget.message}</p>}
                </div>

                <div>
                  <label className="label">
                    المدة <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('durationInDays', {
                        required: 'المدة مطلوبة',
                        min: { value: 1, message: 'المدة يجب أن تكون أكبر من 0' },
                      })}
                      className={`input pl-16 ${errors.durationInDays ? 'input-error' : ''}`}
                      placeholder="0"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-secondary))' }}>يوم</span>
                  </div>
                  {errors.durationInDays && <p className="error-text">{errors.durationInDays.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">الموعد النهائي</label>
                <input type="date" {...register('deadline')} className="input" />
              </div>

              <div>
                <label className="label">
                  المهارات <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed rounded-lg p-6" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.length > 0 ? (
                      selectedSkills.map((skillId) => {
                        const skill = allSkills.find((s) => s.id === skillId);
                        return (
                          <span
                            key={skillId}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg"
                          >
                            {skill?.nameAr}
                            <button
                              type="button"
                              onClick={() => handleSkillToggle(skillId)}
                              className="hover:text-red-200"
                            >
                              <FaTimes />
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <p style={{ color: 'rgb(var(--text-tertiary))' }}>لم يتم تحديد مهارات بعد</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowSkillsModal(true)}
                      className="btn btn-outline"
                    >
                      <FaPlus className="ml-2" />
                      تحديد المهارات
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">الملفات</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-3 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary-500 transition-colors"
                  style={{ borderColor: 'rgb(var(--border-secondary))' }}
                >
                  <FaPaperclip className="text-2xl" style={{ color: 'rgb(var(--text-tertiary))' }} />
                  <span style={{ color: 'rgb(var(--text-secondary))' }}>اضغط لتحميل الملفات</span>
                </label>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                      >
                        <div className="flex items-center gap-3">
                          <FaPaperclip style={{ color: 'rgb(var(--text-secondary))' }} />
                          <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full text-lg py-4">
                {loading ? 'جاري النشر...' : 'إرسال'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showSkillsModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
              e.preventDefault();
              e.stopPropagation(); // Stop event from bubbling to form
              setShowSkillsModal(false);
              // Don't auto-focus form - let user continue editing
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              setShowSkillsModal(false);
            }
          }}
        >
          <div className="rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>اختر المهارات</h3>
              <button
                type="button"
                onClick={() => setShowSkillsModal(false)}
                className="p-2 hover:bg-opacity-10 rounded-lg transition-colors"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allSkills.map((skill) => (
                <label
                  key={skill.id}
                  className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                  style={{ borderColor: 'rgb(var(--border-secondary))' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.id)}
                    onChange={() => handleSkillToggle(skill.id)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>{skill.nameAr}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowSkillsModal(false)}
              className="btn btn-primary w-full mt-6"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PostJobPage() {
  return (
    <ProtectedRoute requireClient>
      <PostJob />
    </ProtectedRoute>
  );
}




