'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const BioManager = () => {
    const { user, updateUser } = useAuth();
    const { t } = useLanguage();
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
            showError(t('minChars'));
            return;
        }

        setSaving(true);
        try {
            await userService.updateBio(bio);
            if (user) {
                updateUser({ ...user, bio });
            }
            success(t('bioUpdated'));
            setIsEditing(false);
        } catch (error) {
            showError(t('bioUpdateFailed'));
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
                    {t('bioTitle')}
                </h2>
                {!isEditing && !loading && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FaEdit /> {t('edit')}
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
                            placeholder={t('bioPlaceholder')}
                        />

                        {/* Character Counter */}
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                                {bio.length} / {maxLength} {t('char')}
                            </span>
                            <div className="flex items-center gap-2">
                                {bio.length < 10 && (
                                    <span className="text-sm text-red-500">{t('minChars')}</span>
                                )}
                                {bio.length >= 10 && bio.length < 50 && (
                                    <span className="text-sm text-yellow-500">{t('goodBio')}</span>
                                )}
                                {bio.length >= 50 && (
                                    <span className="text-sm text-green-500">{t('bioExcellent')}</span>
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
                            {t('bioTipsTitle')}
                        </h4>
                        <ul className="space-y-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                            <li>{t('bioTip1')}</li>
                            <li>{t('bioTip2')}</li>
                            <li>{t('bioTip3')}</li>
                            <li>{t('bioTip4')}</li>
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
                                    {t('save')}...
                                </>
                            ) : (
                                <>
                                    <FaSave className="inline ml-2" />
                                    {t('save')}
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
                            {t('cancel')}
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
                            {t('noBioSet')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BioManager;
