import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { jobService, userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FaPlus, FaTimes, FaPaperclip } from 'react-icons/fa';

const PostJob = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await userService.getAllSkills();
      setAllSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSkillToggle = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
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
      navigate(`/jobs/${response.data.jobRequestId}`);
    } catch (error) {
      showError(error.response?.data?.message || 'فشل نشر المشروع');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl font-bold mb-4">طلب عرض للسعر..</h1>
            <p className="text-xl text-white/90">
              هناك حقيقة مثبتة منذ زمن طويل وهي أن المحتوى المقروء لصفحة ما سيلهي القارئ عن التركيز
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-strong p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
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

              {/* Description */}
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

              {/* Budget and Duration */}
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">ريال</span>
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">يوم</span>
                  </div>
                  {errors.durationInDays && (
                    <p className="error-text">{errors.durationInDays.message}</p>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="label">الموعد النهائي</label>
                <input type="date" {...register('deadline')} className="input" />
              </div>

              {/* Skills */}
              <div>
                <label className="label">
                  المهارات <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  اسحب واضغط أن تضم إلى مستوانك هذا (بحد أقصى لتحديد الفقرات ما تحدم ملفات%): نحد بائلاً
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                      <p className="text-gray-500">لم يتم تحديد مهارات بعد</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const modal = document.getElementById('skills-modal');
                        modal.classList.toggle('hidden');
                      }}
                      className="btn btn-outline"
                    >
                      <FaPlus className="ml-2" />
                      تحديد المهارات
                    </button>
                  </div>
                </div>

                {/* Skills Modal */}
                <div id="skills-modal" className="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold">اختر المهارات</h3>
                      <button
                        type="button"
                        onClick={() => document.getElementById('skills-modal').classList.add('hidden')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {allSkills.map((skill) => (
                        <label
                          key={skill.id}
                          className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill.id)}
                            onChange={() => handleSkillToggle(skill.id)}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <span className="text-sm">{skill.nameAr}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => document.getElementById('skills-modal').classList.add('hidden')}
                      className="btn btn-primary w-full mt-6"
                    >
                      تم
                    </button>
                  </div>
                </div>
              </div>

              {/* Attachments */}
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
                  className="flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <FaPaperclip className="text-2xl text-gray-400" />
                  <span className="text-gray-600">اضغط لتحميل الملفات</span>
                </label>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FaPaperclip className="text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg py-4"
              >
                {loading ? 'جاري النشر...' : 'إرسال'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;

