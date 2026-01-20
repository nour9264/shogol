'use client';

import { useState, useRef } from 'react';
import { userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { FaCamera, FaSpinner } from 'react-icons/fa';
import ImageCropper from '@/components/Common/ImageCropper';
import { getImageUrl, validateImageFile } from '@/utils/helpers';

const CoverImageManager = () => {
    const { user, updateUser } = useAuth();
    const { t } = useLanguage();
    const { success, error: showError } = useToast();
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image cropper state
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file, 5);
        if (!validation.valid) {
            showError(validation.error || t('invalidImage'));
            return;
        }

        // Open cropper
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageToCrop(e.target?.result as string);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setShowCropper(false);
        setImageToCrop(null);

        const croppedFile = new File([croppedBlob], 'cover-image.jpg', {
            type: 'image/jpeg',
        });

        // Create preview
        const previewUrl = URL.createObjectURL(croppedBlob);
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(previewUrl);

        // Upload
        setUploading(true);
        try {
            const response = await userService.updateCoverImage(croppedFile);
            if (user && response.data.imageUrl) {
                updateUser({ ...user, coverImageUrl: response.data.imageUrl });
            }
            success(t('coverImageUpdated'));
        } catch (error: any) {
            showError(error.response?.data?.message || t('coverImageUpdateFailed'));
            setPreview(null);
        }
        setUploading(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setImageToCrop(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!user?.isFreelancer) return null;

    return (
        <>
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
                    {t('coverImage')}
                </h2>
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900">
                    {(preview || user.coverImageUrl) && (
                        <img
                            src={preview || getImageUrl(user.coverImageUrl)}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-6 py-3 bg-white/90 hover:bg-white text-gray-900 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span>{t('processing')}...</span>
                                </>
                            ) : (
                                <>
                                    <FaCamera />
                                    <span>{user.coverImageUrl ? t('changeCoverImage') : t('addCoverImage')}</span>
                                </>
                            )}
                        </button>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                    />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                    {t('recommendedDimensions')}
                </p>
            </div>

            {/* Image Cropper Modal */}
            {showCropper && imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspectRatio={16 / 9}
                    cropShape="rect"
                    title={t('cropCoverImage')}
                />
            )}
        </>
    );
};

export default CoverImageManager;
