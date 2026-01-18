'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FaStar } from 'react-icons/fa';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    initialRating?: number;
    initialComment?: string;
    isSubmitting?: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialRating = 5,
    initialComment = '',
    isSubmitting = false,
}) => {
    const { t, isArabic } = useLanguage();
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);
    const [hoverRating, setHoverRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(rating, comment);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('rateFreelancer') || 'Rate Freelancer'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`text-4xl transition-transform hover:scale-110 focus:outline-none ${star <= (hoverRating || rating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <FaStar />
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {rating === 1 && (t('veryPoor') || 'Very Poor')}
                            {rating === 2 && (t('poor') || 'Poor')}
                            {rating === 3 && (t('good') || 'Good')}
                            {rating === 4 && (t('veryGood') || 'Very Good')}
                            {rating === 5 && (t('excellent') || 'Excellent')}
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('yourReview') || 'Your Review'}
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none h-32 text-gray-800 dark:text-gray-100"
                            placeholder={t('writeReviewPlaceholder') || 'Share your experience working with this freelancer...'}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={isSubmitting}
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (t('submitting') || 'Submitting...') : (t('submitReview') || 'Submit Review')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
