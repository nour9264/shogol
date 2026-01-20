'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';

interface UserSkill {
    id: number;
    skillId: number;
    skillNameAr: string;
    skillNameEn: string;
    proficiencyLevel?: string;
    createdAt: string;
}

interface AvailableSkill {
    id: number;
    nameAr: string;
    nameEn: string;
}

interface SkillCategory {
    id: number;
    key: string;
    nameAr: string;
    nameEn: string;
    skills: AvailableSkill[];
}

const SkillsManager = () => {
    const { success, error: showError } = useToast();
    const { t } = useLanguage();
    const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
    const [availableSkills, setAvailableSkills] = useState<SkillCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
    const [adding, setAdding] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    useEffect(() => {
        fetchUserSkills();
        fetchAvailableSkills();
    }, []);

    const fetchUserSkills = async () => {
        try {
            const response = await userService.getUserSkills();
            console.log('User skills:', response.data);
            const skills = response.data?.skills || response.data || [];
            setUserSkills(Array.isArray(skills) ? skills : []);
        } catch (error) {
            console.error('Failed to fetch user skills:', error);
            showError(t('failedLoadSkills'));
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSkills = async () => {
        try {
            const response = await userService.getAvailableSkills();
            const categories = response.data?.categories || response.data || [];
            setAvailableSkills(Array.isArray(categories) ? categories : []);
        } catch (error) {
            console.error('Failed to fetch available skills:', error);
        }
    };

    const handleDeleteSkill = async (userSkillId: number) => {
        if (!confirm(t('confirmDeleteSkill'))) return;

        try {
            await userService.removeSkill(userSkillId);
            success(t('skillDeleted'));
            fetchUserSkills();
        } catch (error) {
            showError(t('skillDeleteFailed'));
        }
    };

    const handleAddSkills = async () => {
        if (selectedSkills.length === 0) {
            showError(t('selectAtLeastOneSkill'));
            return;
        }

        setAdding(true);
        try {
            await userService.addMultipleSkills(selectedSkills);
            success(t('skillsAdded'));
            setShowAddModal(false);
            setSelectedSkills([]);
            fetchUserSkills();
        } catch (error) {
            showError(t('skillsAddFailed'));
        } finally {
            setAdding(false);
        }
    };

    const toggleSkillSelection = (skillId: number) => {
        setSelectedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Filter out skills that user already has
    const userSkillIds = userSkills.map(s => s.skillId);
    const filteredCategories = availableSkills.map(cat => ({
        ...cat,
        skills: cat.skills.filter(skill => !userSkillIds.includes(skill.id))
    })).filter(cat => cat.skills.length > 0);

    if (loading) {
        return (
            <div className="card">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                        {t('skills')}
                    </h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FaPlus /> {t('addSkill')}
                    </button>
                </div>

                {userSkills.length === 0 ? (
                    <p style={{ color: 'rgb(var(--text-secondary))' }} className="text-center py-8">
                        {t('noSkillsAdded')}
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {userSkills.map((skill) => (
                            <div
                                key={skill.id}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all hover:shadow-md"
                                style={{
                                    backgroundColor: 'rgb(var(--bg-tertiary))',
                                    borderColor: 'rgb(var(--border-secondary))',
                                    color: 'rgb(var(--text-primary))'
                                }}
                            >
                                <span className="font-medium">{skill.skillNameAr}</span>
                                <span className="text-sm opacity-70">({skill.skillNameEn})</span>
                                <button
                                    onClick={() => handleDeleteSkill(skill.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    title={t('delete')}
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Skills Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
                        style={{
                            backgroundColor: 'rgb(var(--bg-secondary))',
                            maxHeight: '90vh'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Fixed */}
                        <div className="p-6 border-b flex-shrink-0" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                                    {t('addNewSkills')}
                                </h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-2xl hover:opacity-70 transition-opacity"
                                    style={{ color: 'rgb(var(--text-secondary))' }}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <p className="mt-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                                {t('selectedSkillsCount')}: <span className="font-bold text-primary-500">{selectedSkills.length}</span>
                            </p>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto flex-1" style={{ minHeight: 0 }}>
                            {filteredCategories.length === 0 ? (
                                <p className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                                    {t('allSkillsAdded')}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {filteredCategories.map((category) => (
                                        <div key={category.id} className="border rounded-lg overflow-hidden" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                                            <button
                                                onClick={() => toggleCategory(category.id)}
                                                className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
                                                style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                                            >
                                                <span className="font-bold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                                                    {category.nameAr} ({category.skills.length})
                                                </span>
                                                <svg
                                                    className={`w-5 h-5 transition-transform ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {expandedCategories.includes(category.id) && (
                                                <div className="p-4 space-y-2">
                                                    {category.skills.map((skill) => (
                                                        <label
                                                            key={skill.id}
                                                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-opacity-50 transition-all"
                                                            style={{ backgroundColor: selectedSkills.includes(skill.id) ? 'rgba(102, 126, 234, 0.1)' : 'transparent' }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedSkills.includes(skill.id)}
                                                                onChange={() => toggleSkillSelection(skill.id)}
                                                                className="w-5 h-5 text-primary-500 rounded"
                                                            />
                                                            <div>
                                                                <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                                                                    {skill.nameAr}
                                                                </span>
                                                                <span className="text-sm ml-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                                                                    ({skill.nameEn})
                                                                </span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer - Fixed */}
                        <div className="p-6 border-t flex gap-4 flex-shrink-0" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                            <button
                                onClick={handleAddSkills}
                                disabled={adding || selectedSkills.length === 0}
                                className="flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                                style={{
                                    backgroundColor: selectedSkills.length > 0 ? '#00bacc' : 'rgb(var(--bg-tertiary))',
                                    color: selectedSkills.length > 0 ? 'white' : 'rgb(var(--text-secondary))'
                                }}
                            >
                                {adding ? t('processing') : `${t('addSkill')} ${selectedSkills.length > 0 ? `(${selectedSkills.length})` : ''}`}
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-80"
                                style={{
                                    backgroundColor: 'rgb(var(--bg-tertiary))',
                                    color: 'rgb(var(--text-primary))'
                                }}
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SkillsManager;
