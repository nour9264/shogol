'use client';

import { useState, useEffect, useRef } from 'react';
import { userService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { FaPlus, FaTrash, FaTimes, FaLink, FaImage } from 'react-icons/fa';
import { getImageUrl } from '@/utils/helpers';

interface Portfolio {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    projectUrl: string;
    createdAt: string;
}

const PortfolioManager = () => {
    const { success, error: showError } = useToast();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [adding, setAdding] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPortfolios();
    }, []);

    const fetchPortfolios = async () => {
        try {
            const response = await userService.getPortfolios();
            console.log('Portfolios:', response.data);
            const data = response.data?.portfolios || response.data || [];
            setPortfolios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch portfolios:', error);
            showError('فشل تحميل الأعمال');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddPortfolio = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            showError('عنوان المشروع مطلوب');
            return;
        }

        if (!selectedImage) {
            showError('صورة المشروع مطلوبة');
            return;
        }

        setAdding(true);

        try {
            const formData = new FormData();
            formData.append('Title', title);
            if (description) formData.append('Description', description);
            if (projectUrl) formData.append('ProjectUrl', projectUrl);
            formData.append('Image', selectedImage);

            await userService.addPortfolio(formData);
            success('تم إضافة المشروع بنجاح');
            setShowAddModal(false);
            resetForm();
            fetchPortfolios();
        } catch (error) {
            console.error('Add portfolio error:', error);
            showError('فشل إضافة المشروع');
        } finally {
            setAdding(false);
        }
    };

    const handleDeletePortfolio = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;

        try {
            await userService.deletePortfolio(id);
            success('تم حذف المشروع بنجاح');
            setPortfolios(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            showError('فشل حذف المشروع');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setProjectUrl('');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const closeModal = () => {
        setShowAddModal(false);
        resetForm();
    };

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
                        معرض الأعمال
                    </h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FaPlus /> إضافة عمل
                    </button>
                </div>

                {portfolios.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                        <div className="flex justify-center mb-4">
                            <FaImage className="text-4xl opacity-20" style={{ color: 'rgb(var(--text-secondary))' }} />
                        </div>
                        <p style={{ color: 'rgb(var(--text-secondary))' }}>
                            لم تقم بإضافة أي أعمال بعد. أضف أعمالك لتجذب المزيد من العملاء!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {portfolios.map((portfolio) => (
                            <div
                                key={portfolio.id}
                                className="group relative rounded-xl overflow-hidden border transition-all hover:shadow-lg"
                                style={{ borderColor: 'rgb(var(--border-secondary))', backgroundColor: 'rgb(var(--bg-tertiary))' }}
                            >
                                <div className="aspect-video relative overflow-hidden bg-gray-100">
                                    <img
                                        src={getImageUrl(portfolio.imageUrl)}
                                        alt={portfolio.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/400x225?text=No+Image';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-3">
                                        <button
                                            onClick={() => handleDeletePortfolio(portfolio.id)}
                                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                                            title="حذف"
                                        >
                                            <FaTrash />
                                        </button>
                                        {portfolio.projectUrl && (
                                            <a
                                                href={portfolio.projectUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                                                title="عرض المشروع"
                                            >
                                                <FaLink />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1 truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                                        {portfolio.title}
                                    </h3>
                                    {portfolio.description && (
                                        <p className="text-sm line-clamp-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                                            {portfolio.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Portfolio Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
                        style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b flex-shrink-0 flex justify-between items-center" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                            <h3 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                                إضافة عمل جديد
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-2xl hover:opacity-70 transition-opacity"
                                style={{ color: 'rgb(var(--text-secondary))' }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="add-portfolio-form" onSubmit={handleAddPortfolio} className="space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                                        صورة المشروع <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-primary-500 relative overflow-hidden group"
                                        style={{ borderColor: 'rgb(var(--border-secondary))', backgroundColor: 'rgb(var(--bg-tertiary))' }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />

                                        {imagePreview ? (
                                            <div className="relative h-48 w-full">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white font-medium">تغيير الصورة</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-8">
                                                <FaImage className="mx-auto text-4xl mb-3 opacity-50" />
                                                <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                                                    اضغط لاختيار صورة
                                                </p>
                                                <p className="text-xs mt-1 opacity-70" style={{ color: 'rgb(var(--text-secondary))' }}>
                                                    PNG, JPG, JPEG (Max 5MB)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                                        عنوان المشروع <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                        style={{
                                            backgroundColor: 'rgb(var(--bg-primary))',
                                            color: 'rgb(var(--text-primary))',
                                            borderColor: 'rgb(var(--border-secondary))'
                                        }}
                                        placeholder="مثال: متجر إلكتروني متكامل"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                                        وصف المشروع
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none h-32"
                                        style={{
                                            backgroundColor: 'rgb(var(--bg-primary))',
                                            color: 'rgb(var(--text-primary))',
                                            borderColor: 'rgb(var(--border-secondary))'
                                        }}
                                        placeholder="اشرح تفاصيل المشروع، التقنيات المستخدمة، ودورك فيه..."
                                    />
                                </div>

                                {/* Project URL */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                                        رابط المشروع
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLink className="text-gray-400" />
                                        </div>
                                        <input
                                            type="url"
                                            value={projectUrl}
                                            onChange={(e) => setProjectUrl(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                            style={{
                                                backgroundColor: 'rgb(var(--bg-primary))',
                                                color: 'rgb(var(--text-primary))',
                                                borderColor: 'rgb(var(--border-secondary))'
                                            }}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t flex gap-4 flex-shrink-0" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                            <button
                                type="submit"
                                form="add-portfolio-form"
                                disabled={adding || !title || !selectedImage}
                                className="flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg text-white"
                                style={{
                                    backgroundColor: (!adding && title && selectedImage) ? '#00bacc' : 'rgb(var(--bg-tertiary))',
                                    color: (!adding && title && selectedImage) ? 'white' : 'rgb(var(--text-secondary))'
                                }}
                            >
                                {adding ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        جاري الإضافة...
                                    </div>
                                ) : 'إضافة المشروع'}
                            </button>
                            <button
                                onClick={closeModal}
                                disabled={adding}
                                className="flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-80"
                                style={{
                                    backgroundColor: 'rgb(var(--bg-tertiary))',
                                    color: 'rgb(var(--text-primary))'
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PortfolioManager;
