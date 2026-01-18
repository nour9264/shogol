'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import styles from './FreelancerBio.module.css';

const FreelancerBio = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { success, error: showError } = useToast();

    const [bio, setBio] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const maxLength = 500;

    useEffect(() => {
        // Check if user is freelancer - check both userType and isFreelancer for compatibility
        if (user && user.userType !== 'Freelancer' && !user.isFreelancer) {
            console.log('%c[⚠️ Not a freelancer, redirecting to home]', 'color: #FF9800; font-weight: bold;', user);
            router.push('/');
            return;
        }
    }, [user, router]);

    const handleSubmit = async () => {
        if (bio.trim().length === 0) {
            showError('يرجى كتابة نبذة عنك');
            return;
        }

        if (bio.trim().length < 50) {
            showError('يرجى كتابة نبذة لا تقل عن 50 حرفاً');
            return;
        }

        setSubmitting(true);
        try {
            await userService.updateBio(bio.trim());
            success('تم حفظ السيرة الذاتية بنجاح!');

            // Complete onboarding - redirect to home
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error) {
            console.error('Failed to save bio:', error);
            showError('فشل حفظ السيرة الذاتية');
        } finally {
            setSubmitting(false);
        }
    };

    const remainingChars = maxLength - bio.length;
    const progress = (bio.length / maxLength) * 100;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <span>ش</span>
                        </div>
                    </Link>

                    <div className={styles.progressBar}>
                        <div className={styles.progressStep}>
                            <div className={`${styles.stepCircle} ${styles.completed}`}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M16 6L8 14L4 10"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <span className={styles.stepLabel}>اختيار المهارات</span>
                        </div>
                        <div className={`${styles.progressLine} ${styles.completed}`}></div>
                        <div className={styles.progressStep}>
                            <div className={`${styles.stepCircle} ${styles.active}`}>2</div>
                            <span className={styles.stepLabel}>السيرة الذاتية</span>
                        </div>
                    </div>

                    <h1 className={styles.title}>أخبرنا عن نفسك</h1>
                    <p className={styles.subtitle}>
                        اكتب نبذة مختصرة عنك وعن خبراتك لمساعدة العملاء في التعرف عليك
                    </p>
                </div>

                {/* Bio Card */}
                <div className={styles.bioCard}>
                    <div className={styles.textareaWrapper}>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={maxLength}
                            placeholder="مثال: مطور ويب محترف مع 5 سنوات من الخبرة في تطوير تطبيقات الويب الحديثة باستخدام React و Node.js. متخصص في بناء واجهات مستخدم تفاعلية وسريعة الاستجابة..."
                            className={styles.textarea}
                            dir="rtl"
                        />

                        <div className={styles.charCount}>
                            <span className={remainingChars < 50 ? styles.warning : ''}>
                                {remainingChars} حرف متبقي
                            </span>
                        </div>

                        <div className={styles.progressBarContainer}>
                            <div
                                className={styles.progressBarFill}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className={styles.tips}>
                        <h3 className={styles.tipsTitle}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M10 14V10"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <circle cx="10" cy="7" r="1" fill="currentColor" />
                            </svg>
                            نصائح لكتابة نبذة مميزة:
                        </h3>
                        <ul className={styles.tipsList}>
                            <li>اذكر تخصصك الرئيسي وسنوات الخبرة</li>
                            <li>أبرز مهاراتك وإنجازاتك الرئيسية</li>
                            <li>اكتب بأسلوب احترافي وواضح</li>
                            <li>تجنب المعلومات الشخصية الحساسة</li>
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || bio.trim().length < 50}
                        className={styles.submitButton}
                    >
                        {submitting ? (
                            <>
                                <div className={styles.buttonSpinner}></div>
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M16 6L8 14L4 10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                إنهاء التسجيل
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => router.back()}
                        disabled={submitting}
                        className={styles.backButton}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M12 4L6 10L12 16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        رجوع
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreelancerBio;
