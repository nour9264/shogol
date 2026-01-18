'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import styles from './FreelancerSkills.module.css';

interface Skill {
    id: number;
    nameAr: string;
    nameEn: string;
    skills?: Skill[];
}

const FreelancerSkills = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { success, error: showError } = useToast();

    const [categories, setCategories] = useState<Skill[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    useEffect(() => {
        // Check if user is freelancer - check both userType and isFreelancer for compatibility
        if (user && user.userType !== 'Freelancer' && !user.isFreelancer) {
            console.log('%c[⚠️ Not a freelancer, redirecting to home]', 'color: #FF9800; font-weight: bold;', user);
            router.push('/');
            return;
        }

        fetchSkills();
    }, [user, router]);

    const fetchSkills = async () => {
        try {
            setLoading(true);
            const response = await userService.getAvailableSkills();
            console.log('Skills response:', response.data);

            // The API returns { categories: [...] }
            const skillData = response.data?.categories || response.data || [];
            console.log('Parsed categories:', skillData);
            setCategories(Array.isArray(skillData) ? skillData : []);

            // Categories start collapsed by default
            // Users can click the arrow to expand them
        } catch (error) {
            console.error('Failed to fetch skills:', error);
            showError('فشل تحميل المهارات');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleSkill = (skillId: number) => {
        setSelectedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    const handleSubmit = async () => {
        if (selectedSkills.length === 0) {
            showError('يرجى اختيار مهارة واحدة على الأقل');
            return;
        }

        setSubmitting(true);
        try {
            await userService.addMultipleSkills(selectedSkills);
            success('تم حفظ المهارات بنجاح!');
            router.push('/onboarding/bio');
        } catch (error) {
            console.error('Failed to save skills:', error);
            showError('فشل حفظ المهارات');
        } finally {
            setSubmitting(false);
        }
    };

    const renderSkills = (skills: Skill[], level = 0) => {
        return skills.map((skill) => {
            const hasChildren = skill.skills && skill.skills.length > 0;
            const isExpanded = expandedCategories.includes(skill.id);
            const isSelected = selectedSkills.includes(skill.id);

            return (
                <div key={skill.id} className={styles.skillItem} style={{ paddingRight: `${level * 20}px` }}>
                    <div className={styles.skillRow}>
                        {hasChildren && (
                            <button
                                type="button"
                                onClick={() => toggleCategory(skill.id)}
                                className={styles.expandButton}
                            >
                                <svg
                                    className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path
                                        d="M7 8L10 11L13 8"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        )}

                        <label className={styles.skillLabel}>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSkill(skill.id)}
                                className={styles.checkbox}
                            />
                            <span className={styles.checkmark}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M13 4L6 11L3 8"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                            <span className={styles.skillName}>{skill.nameAr}</span>
                            <span className={styles.skillNameEn}>{skill.nameEn}</span>
                        </label>
                    </div>

                    {hasChildren && isExpanded && (
                        <div className={styles.childSkills}>
                            {renderSkills(skill.skills!, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>جاري تحميل المهارات...</p>
                </div>
            </div>
        );
    }

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
                            <div className={`${styles.stepCircle} ${styles.active}`}>1</div>
                            <span className={styles.stepLabel}>اختيار المهارات</span>
                        </div>
                        <div className={styles.progressLine}></div>
                        <div className={styles.progressStep}>
                            <div className={styles.stepCircle}>2</div>
                            <span className={styles.stepLabel}>السيرة الذاتية</span>
                        </div>
                    </div>

                    <h1 className={styles.title}>اختر مهاراتك</h1>
                    <p className={styles.subtitle}>
                        حدد المهارات التي تتقنها لمساعدة العملاء في العثور عليك
                    </p>
                </div>

                {/* Skills List */}
                <div className={styles.skillsCard}>
                    <div className={styles.selectedCount}>
                        <span>المهارات المحددة:</span>
                        <span className={styles.count}>{selectedSkills.length}</span>
                    </div>

                    <div className={styles.skillsList}>
                        {categories.length > 0 ? (
                            renderSkills(categories)
                        ) : (
                            <p className={styles.emptyState}>لا توجد مهارات متاحة</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedSkills.length === 0}
                        className={styles.submitButton}
                    >
                        {submitting ? (
                            <>
                                <div className={styles.buttonSpinner}></div>
                                جاري الحفظ...
                            </>
                        ) : (
                            'التالي: إضافة السيرة الذاتية'
                        )}
                    </button>

                    <p className={styles.hint}>
                        يمكنك اختيار مهارات متعددة من فئات مختلفة
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FreelancerSkills;
