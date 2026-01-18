'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import { getImageUrl, DEFAULT_AVATAR } from '@/utils/helpers';
import { FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaStar, FaClock, FaEnvelope, FaPhone, FaUser, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface Skill {
    id: number;
    nameAr: string;
    nameEn?: string;
}

interface SkillCategory {
    id: number;
    nameAr: string;
    nameEn?: string;
    skills: Skill[];
}

interface Portfolio {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    projectUrl: string;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    clientName?: string;
    clientAvatar?: string;
}

interface FreelancerDetails {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profilePictureUrl: string;
    address: string | null;
    bio: string;
    gender: string;
    nationality: string;
    lastOnlineAt: string;
    createdAt: string;
    averageRating: number;
    completedJobsCount: number;
    reviews: Review[];
    portfolios: Portfolio[];
    skillCategories: SkillCategory[];
    title?: string;
}

const PublicProfile = () => {
    const params = useParams();
    const router = useRouter();
    const { t, isArabic } = useLanguage();
    const { isAuthenticated, user } = useAuth();
    const [profile, setProfile] = useState<FreelancerDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchProfile(params.id as string);
        }
    }, [params.id]);

    const fetchProfile = async (id: string) => {
        try {
            const response = await userService.getFreelancerDetails(id);
            console.log('Freelancer Details:', response.data);

            // Fetch all reviews separately to ensure we get the complete list
            try {
                const reviewsResponse = await userService.getFreelancerReviews(id);
                console.log('All Reviews:', reviewsResponse.data);
                // Merge the complete reviews list with the profile data
                setProfile({
                    ...response.data,
                    reviews: reviewsResponse.data || response.data.reviews
                });
            } catch (reviewError) {
                console.error('Failed to fetch reviews, using profile reviews:', reviewError);
                setProfile(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
                <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>لم يتم العثور على الملف الشخصي</h2>
                <button onClick={() => router.back()} className="btn btn-primary">{t('cancel')}</button>
            </div>
        );
    }

    const allSkills = profile.skillCategories?.flatMap(cat => cat.skills) || [];

    // Calculate average rating from reviews (client-side fallback)
    const calculatedAverageRating = profile.reviews && profile.reviews.length > 0
        ? profile.reviews.reduce((sum, review) => sum + review.rating, 0) / profile.reviews.length
        : profile.averageRating || 0;

    // Debug logging
    console.log('Reviews:', profile.reviews);
    console.log('Backend averageRating:', profile.averageRating);
    console.log('Calculated averageRating:', calculatedAverageRating);
    console.log('Individual ratings:', profile.reviews?.map(r => r.rating));

    return (
        <div className="min-h-screen pb-20 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>

            {/* Hero / Cover Section */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-90"></div>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)' }}></div>
            </div>

            <div className="container mx-auto px-4 -mt-24 md:-mt-32 relative z-10">
                <div className="flex flex-col md:flex-row gap-6">

                    {/* Left Sidebar (Profile Card) */}
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                        <div className="rounded-2xl shadow-xl overflow-hidden backdrop-blur-md border border-opacity-20"
                            style={{
                                backgroundColor: 'rgb(var(--bg-secondary))',
                                borderColor: 'rgb(var(--border-primary))'
                            }}>

                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full p-1 bg-gradient-to-tr from-primary-500 to-purple-500">
                                    <img
                                        src={getImageUrl(profile.profilePictureUrl)}
                                        alt={profile.fullName}
                                        className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800"
                                        onError={(e) => e.currentTarget.src = DEFAULT_AVATAR}
                                    />
                                    <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 ${true ? 'bg-green-500' : 'bg-gray-400'}`} title={t('online')}></div>
                                </div>

                                <h1 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>
                                    {profile.fullName}
                                </h1>
                                <p className="text-primary-500 font-medium mb-4 flex items-center gap-2">
                                    {profile.skillCategories?.[0]?.nameAr || (isArabic ? 'مستقل' : 'Freelancer')}
                                </p>

                                <div className="flex items-center gap-1 mb-6 text-yellow-400 text-lg">
                                    <span className="font-bold text-xl">{calculatedAverageRating.toFixed(1)}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < Math.round(calculatedAverageRating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                                        ))}
                                    </div>
                                    <span className="text-xs opacity-70 ml-1" style={{ color: 'rgb(var(--text-secondary))' }}>({profile.reviews?.length || 0})</span>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-2 mb-6 text-sm">
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 flex flex-col items-center">
                                        <span className="font-bold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>{profile.completedJobsCount}</span>
                                        <span className="text-xs opacity-70" style={{ color: 'rgb(var(--text-secondary))' }}>{t('completedProjectsCount')}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 flex flex-col items-center">
                                        <span className="font-bold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>100%</span>
                                        <span className="text-xs opacity-70" style={{ color: 'rgb(var(--text-secondary))' }}>{t('completionRate')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            router.push(`/login?redirect=/freelancers/${profile.id}`);
                                            return;
                                        }
                                        if (user?.id === profile.id) {
                                            return;
                                        }
                                        const query = new URLSearchParams({
                                            user: profile.id,
                                            name: profile.fullName,
                                            avatar: profile.profilePictureUrl || ''
                                        }).toString();
                                        router.push(`/messages?${query}`);
                                    }}
                                    className="w-full py-3 rounded-xl btn-primary font-bold shadow-lg shadow-primary-500/30 transform hover:-translate-y-1 transition-all mb-3"
                                >
                                    {t('contactMe')}
                                </button>
                                <div className="flex gap-2 w-full">
                                    <button className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        {t('copyLink')}
                                    </button>
                                </div>
                            </div>

                            <div className="border-t px-6 py-4" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 opacity-70" style={{ color: 'rgb(var(--text-secondary))' }}>
                                            <FaMapMarkerAlt /> {t('location')}
                                        </span>
                                        <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{profile.nationality || t('unspecified')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 opacity-70" style={{ color: 'rgb(var(--text-secondary))' }}>
                                            <FaCalendarAlt /> {t('joinedSince')}
                                        </span>
                                        <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                                            {new Date(profile.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 opacity-70" style={{ color: 'rgb(var(--text-secondary))' }}>
                                            <FaClock /> {t('lastOnline')}
                                        </span>
                                        <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                                            {profile.lastOnlineAt ? new Date(profile.lastOnlineAt).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : t('unknown')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="border-t px-6 py-4" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                                    <FaGraduationCap className="text-primary-500" /> {t('skills')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {allSkills.length > 0 ? allSkills.map((skill) => (
                                        <span key={skill.id} className="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                                            {(isArabic ? skill.nameAr : (skill.nameEn || skill.nameAr))}
                                        </span>
                                    )) : (
                                        <p className="text-xs opacity-60" style={{ color: 'rgb(var(--text-secondary))' }}>{t('noSkills')}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Main Content */}
                    <div className="flex-1 space-y-6">

                        {/* About Me */}
                        <div className="rounded-2xl p-6 shadow-md" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                                <FaUser className="text-primary-500" /> {t('aboutMe')}
                            </h2>
                            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'rgb(var(--text-secondary))' }}>
                                {profile.bio || t('noBio')}
                            </p>
                        </div>

                        {/* Portfolio Slider */}
                        <div className="rounded-2xl p-6 shadow-md overflow-hidden relative" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                                    <FaBriefcase className="text-primary-500" /> {t('portfolio')}
                                </h2>
                                <span className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 opacity-70" style={{ color: 'rgb(var(--text-primary))' }}>
                                    {profile.portfolios?.length || 0} {t('worksCount')}
                                </span>
                            </div>

                            {(!profile.portfolios || profile.portfolios.length === 0) ? (
                                <div className="text-center py-12 opacity-60 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <p style={{ color: 'rgb(var(--text-secondary))' }}>{t('noWorks')}</p>
                                </div>
                            ) : (
                                <PortfolioSlider portfolios={profile.portfolios} slideButtonText={t('viewProject')} />
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="rounded-2xl p-6 shadow-md" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                                <FaStar className="text-primary-500" /> {t('reviewsRatings')}
                            </h2>
                            {(!profile.reviews || profile.reviews.length === 0) ? (
                                <div className="text-center py-12 opacity-60 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <p style={{ color: 'rgb(var(--text-secondary))' }}>{t('noReviews')}</p>
                                </div>
                            ) : (
                                <ReviewSlider reviews={profile.reviews} />
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Custom Review Slider Component
const ReviewSlider = ({ reviews }: { reviews: Review[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { isArabic } = useLanguage();

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

    useEffect(() => {
        if (reviews.length <= 1) return;
        const interval = setInterval(nextSlide, 8000); // Slower interval for reading reviews
        return () => clearInterval(interval);
    }, [reviews.length]);

    const currentReview = reviews[currentIndex];

    return (
        <div className="relative bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-gray-100 dark:border-white/10">
            {/* Navigation Buttons */}
            {reviews.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-400 hover:text-primary-500 transition-colors z-10 ${isArabic ? '-right-3' : '-left-3'}`}
                    >
                        <svg className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-400 hover:text-primary-500 transition-colors z-10 ${isArabic ? '-left-3' : '-right-3'}`}
                    >
                        <svg className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </>
            )}

            {/* Content Transition Wrapper */}
            <div className="flex flex-col items-center text-center transition-opacity duration-300">

                {/* Avatar & Info */}
                <div className="mb-3 relative">
                    <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-primary-400 to-purple-400 mx-auto">
                        <img
                            src={getImageUrl(currentReview.clientAvatar)}
                            alt={currentReview.clientName || 'Client'}
                            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800"
                            onError={(e) => e.currentTarget.src = DEFAULT_AVATAR}
                        />
                    </div>
                </div>

                <h4 className="font-bold text-base mb-0.5" style={{ color: 'rgb(var(--text-primary))' }}>
                    {currentReview.clientName || (isArabic ? 'عميل' : 'Client')}
                </h4>

                <span className="text-xs opacity-60 mb-2 block" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {new Date(currentReview.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>

                <div className="flex text-yellow-400 text-sm mb-3 justify-center">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < currentReview.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                    ))}
                </div>

                <div className="relative px-6">
                    <span className="absolute top-0 left-0 text-3xl text-primary-200 dark:text-primary-900 opacity-50 font-serif">"</span>
                    <p className="text-sm leading-relaxed italic" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {currentReview.comment}
                    </p>
                    <span className="absolute bottom-0 right-0 text-3xl text-primary-200 dark:text-primary-900 opacity-50 font-serif">"</span>
                </div>
            </div>

            {/* Dots */}
            {reviews.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {reviews.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-primary-500' : 'w-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-primary-300'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Custom Aesthetic Slider Component
const PortfolioSlider = ({ portfolios, slideButtonText }: { portfolios: Portfolio[], slideButtonText: string }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => setActiveIndex((prev) => (prev + 1) % portfolios.length);
    const prevSlide = () => setActiveIndex((prev) => (prev - 1 + portfolios.length) % portfolios.length);

    // Auto-play
    useEffect(() => {
        if (portfolios.length <= 1) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [portfolios.length]);

    return (
        <div className="relative group">
            {/* Main Display Area - Compact but visually strong */}
            <div className="relative h-64 sm:h-80 md:h-[26rem] w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                {portfolios.map((item, index) => (
                    <div
                        key={item.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out transform group ${index === activeIndex ? 'opacity-100 scale-100 z-20 translate-x-0 blur-0' :
                            'opacity-0 scale-105 z-10 blur-sm pointer-events-none'
                            }`}
                    >
                        {/* Background Image with Blur for atmosphere */}
                        <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110" style={{ backgroundImage: `url(${getImageUrl(item.imageUrl)})` }}></div>

                        {/* Main Image - Centered and Clean */}
                        <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.title}
                            className="w-full h-full object-contain relative z-10"
                            onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Project+Image'}
                        />

                        {/* Content Overlay - Hidden by default, shown on hover */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 md:p-8 z-30 flex flex-col items-start transition-all duration-300 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                            <h3 className="text-white font-bold text-2xl md:text-3xl mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{item.title}</h3>
                            {item.description && <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-4 max-w-2xl drop-shadow-md text-right">{item.description}</p>}

                            {item.projectUrl && (
                                <a
                                    href={item.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-primary-500/50 transform hover:-translate-y-1"
                                >
                                    <FaBriefcase /> {slideButtonText}
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows - Only show if more than 1 item */}
                {portfolios.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.preventDefault(); prevSlide(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white transition-all transform hover:scale-110 border border-white/10 opacity-0 group-hover:opacity-100 md:-translate-x-4 md:group-hover:translate-x-0"
                            title="Previous"
                        >
                            <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); nextSlide(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white transition-all transform hover:scale-110 border border-white/10 opacity-0 group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0"
                            title="Next"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>

                        {/* Dots Indicators - Clean and minimal */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex gap-2 p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {portfolios.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-6 bg-primary-500 shadow-lg shadow-primary-500/50' : 'w-2 bg-white/50 hover:bg-white'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails Navigation Strip - "Cool Factor" details */}
            {portfolios.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x justify-center">
                    {portfolios.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative h-16 w-28 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all duration-300 border-2 snap-center transform hover:scale-105 ${idx === activeIndex ? 'border-primary-500 ring-2 ring-primary-500/30 scale-105 shadow-lg opacity-100' : 'border-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
                        >
                            <img src={getImageUrl(item.imageUrl)} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
