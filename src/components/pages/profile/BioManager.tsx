'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const BioManager = () => {
    const { user, updateUser } = useAuth();
    const { success, error: showError } = useToast();
    const [bio, setBio] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const maxLength = 500;

    useEffect(() => {
        fetchBio();
    }, []);

    const fetchBio = async () => {
        try {
            const response = await userService.getBio();
            console.log('Bio response:', response.data);

            // Handle various response structures
            // Swagger shows { bio: "..." }
            const bioData = response.data;
            let bioText = '';

            if (typeof bioData === 'string') {
                bioText = bioData;
            } else if (typeof bioData === 'object' && bioData !== null) {
                // Check if bio is a direct property or nested
                bioText = (bioData as any).bio || '';
            }

            setBio(bioText);

            // Update context if we found a bio
            if (user && bioText) {
                updateUser({ ...user, bio: bioText });
            }
        } catch (error) {
            console.error('Failed to fetch bio:', error);
            // Fallback to user context
            setBio(user?.bio || '');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (bio.trim().length < 10) {
            showError('السيرة الذاتية يجب أن تكون 10 أحرف على الأقل');
            return;
        }

        setSaving(true);
        try {
            await userService.updateBio(bio);
            if (user) {
                updateUser({ ...user, bio });
            }
            success('تم تحديث السيرة الذاتية بنجاح');
            setIsEditing(false);
        } catch (error) {
            showError('فشل تحديث السيرة الذاتية');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setBio(user?.bio || '');
        setIsEditing(false);
    };

    const progress = (bio.length / maxLength) * 100;

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                    السيرة الذاتية
                </h2>
                {!isEditing && !loading && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FaEdit /> تعديل
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : isEditing ? (
                <div className="space-y-4">
                    <div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, maxLength))}
                            className="w-full px-4 py-3 rounded-lg border focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all duration-200 min-h-[200px] resize-none"
                            style={{
                                backgroundColor: 'rgb(var(--bg-secondary))',
                                color: 'rgb(var(--text-primary))',
                                borderColor: 'rgb(var(--border-secondary))'
                            }}
                            placeholder="اكتب نبذة عن نفسك، خبراتك، ومهاراتك..."
                        />

                        {/* Character Counter */}
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                                {bio.length} / {maxLength} حرف
                            </span>
                            <div className="flex items-center gap-2">
                                {bio.length < 10 && (
                                    <span className="text-sm text-red-500">الحد الأدنى 10 أحرف</span>
                                )}
                                {bio.length >= 10 && bio.length < 50 && (
                                    <span className="text-sm text-yellow-500">جيد، لكن يمكنك إضافة المزيد</span>
                                )}
                                {bio.length >= 50 && (
                                    <span className="text-sm text-green-500">ممتاز!</span>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: progress < 20 ? '#ef4444' : progress < 40 ? '#f59e0b' : '#00bacc'
                                }}
                            />
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                        <h4 className="font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                            💡 نصائح لكتابة سيرة ذاتية جيدة:
                        </h4>
                        <ul className="space-y-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                            <li>• اذكر خبراتك ومهاراتك الرئيسية</li>
                            <li>• أضف أمثلة على مشاريع سابقة</li>
                            <li>• كن واضحاً ومختصراً</li>
                            <li>• اذكر ما يميزك عن الآخرين</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving || bio.trim().length < 10}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                            style={{
                                backgroundColor: bio.trim().length >= 10 ? '#00bacc' : 'rgb(var(--bg-tertiary))',
                                color: bio.trim().length >= 10 ? 'white' : 'rgb(var(--text-secondary))'
                            }}
                        >
                            {saving ? (
                                <>
                                    <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <FaSave className="inline ml-2" />
                                    حفظ
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-lg transition-all hover:opacity-80"
                            style={{
                                backgroundColor: 'rgb(var(--bg-tertiary))',
                                color: 'rgb(var(--text-primary))'
                            }}
                        >
                            <FaTimes className="inline ml-2" />
                            إلغاء
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    {bio ? (
                        <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'rgb(var(--text-secondary))' }}>
                            {bio}
                        </p>
                    ) : (
                        <p className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                            لم تقم بإضافة سيرة ذاتية بعد. اضغط على "تعديل" لإضافة سيرتك الذاتية.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BioManager;
