'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlay, FaCheckCircle, FaUsers, FaBriefcase, FaChartLine, FaHandshake, FaRegClock } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/api';
import { formatCurrency } from '@/utils/helpers';
import styles from './Home.module.css';

interface JobSuggestion {
  id: number;
  title: string;
  budget: number;
  descriptionPreview: string;
}

const Home = () => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<JobSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await jobService.autocomplete(searchQuery, 8);
        setSuggestions(response.data.suggestions || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectJob(suggestions[selectedIndex].id);
        } else if (searchQuery) {
          router.push(`/jobs?search=${encodeURIComponent(searchQuery)}`);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const handleSelectJob = (jobId: number) => {
    setShowDropdown(false);
    setSearchQuery('');
    router.push(`/jobs/${jobId}`);
  };

  const handleSearch = () => {
    if (searchQuery) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Mock services - ideally these would come from an API or be fully translated
  const services = [
    {
      title: isArabic ? 'تطوير المواقع الإلكترونية' : 'Web Development',
      description: isArabic ? 'تصميم وتطوير مواقع احترافية متجاوبة مع جميع الأجهزة' : 'Design and development of professional responsive websites',
      image: '/brain/56fc3de5-a872-4795-b75b-2954057e2851/service_web_dev_1768351845166.png',
      priceRange: '500 - 5000',
      count: 234
    },
    {
      title: isArabic ? 'تطوير تطبيقات الجوال' : 'Mobile App Development',
      description: isArabic ? 'تطبيقات iOS و Android احترافية بأحدث التقنيات' : 'Professional iOS and Android apps with latest technologies',
      image: '/brain/56fc3de5-a872-4795-b75b-2954057e2851/service_mobile_app_1768351858018.png',
      priceRange: '1000 - 10000',
      count: 156
    },
    {
      title: isArabic ? 'التصميم الجرافيكي' : 'Graphic Design',
      description: isArabic ? 'تصاميم إبداعية للهوية البصرية والمواد التسويقية' : 'Creative designs for visual identity and marketing materials',
      image: '/brain/56fc3de5-a872-4795-b75b-2954057e2851/service_design_1768351874223.png',
      priceRange: '100 - 2000',
      count: 412
    },
    {
      title: isArabic ? 'التسويق الرقمي' : 'Digital Marketing',
      description: isArabic ? 'استراتيجيات تسويقية متكاملة لنمو أعمالك' : 'Integrated marketing strategies for your business growth',
      image: '/brain/56fc3de5-a872-4795-b75b-2954057e2851/service_marketing_1768351891115.png',
      priceRange: '300 - 3000',
      count: 189
    }
  ];

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url('/brain/56fc3de5-a872-4795-b75b-2954057e2851/hero_background_1768351805488.png')`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-teal-900/90"></div>

        {/* Content */}
        <div className="relative z-10 container-custom text-center text-white px-4 py-32">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('platformName')}
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>

          {/* Search Bar */}
          <div ref={searchRef} className="relative z-20 rounded-2xl shadow-2xl p-3 max-w-2xl mx-auto bg-white/10 backdrop-blur-md">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <FaSearch className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/70`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchQuery.length >= 2 && suggestions.length > 0 && setShowDropdown(true)}
                  placeholder={t('searchServices')}
                  className={`w-full ${isArabic ? 'px-12' : 'px-12'} py-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50`}
                />
              </div>
              <button onClick={handleSearch} className="btn bg-teal-500 hover:bg-teal-600 text-white px-8 border-0">
                {t('search')}
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-3 right-3 mt-2 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 transition-colors border" style={{ backgroundColor: 'rgb(var(--bg-secondary))', borderColor: 'rgb(var(--border-primary))' }}>
                {loading && (
                  <div className="p-4 text-center text-sm transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {t('searching')}
                  </div>
                )}

                {!loading && suggestions.length === 0 && searchQuery.length >= 2 && (
                  <div className="p-4 text-center text-sm transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {t('noResults')}
                  </div>
                )}

                {!loading && suggestions.length > 0 && (
                  <ul className="py-2">
                    {suggestions.map((job, index) => (
                      <li
                        key={job.id}
                        onClick={() => handleSelectJob(job.id)}
                        className="px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0"
                        style={{
                          backgroundColor: index === selectedIndex ? 'rgb(var(--primary-50))' : 'transparent',
                          borderColor: 'rgb(var(--border-primary))'
                        }}
                        onMouseOver={(e) => { if (index !== selectedIndex) e.currentTarget.style.backgroundColor = 'rgb(var(--bg-hover))'; }}
                        onMouseOut={(e) => { if (index !== selectedIndex) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div className="flex items-start justify-between gap-3 text-right">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium mb-1 line-clamp-1 transition-colors" style={{ color: 'rgb(var(--text-primary))' }}>
                              {job.title}
                            </h4>
                            <p className="text-sm line-clamp-2 transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
                              {job.descriptionPreview}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-block px-2 py-1 text-sm font-semibold rounded transition-colors" style={{ backgroundColor: 'rgb(var(--success-bg))', color: 'rgb(var(--success-text))' }}>
                              {formatCurrency(job.budget)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <FaBriefcase className="text-teal-300" />
              <span>{t('newProjects')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <FaUsers className="text-teal-300" />
              <span>{t('technicalSupport')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <FaCheckCircle className="text-teal-300" />
              <span>{t('transparency')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 transition-colors" style={{ color: 'rgb(var(--text-primary))' }}>
            <span className="relative inline-block">
              {t('whyRequestQuoteTitle')}
              <span className="absolute -bottom-6 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-70"></span>
            </span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Video */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer order-2 md:order-1">
              <img
                src="/brain/56fc3de5-a872-4795-b75b-2954057e2851/video_thumbnail_1768351819788.png"
                alt="Video"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaPlay className="text-red-600 text-2xl ml-1" />
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="order-1 md:order-2">
              <div className="text-right mb-10">
                <h3 className="text-2xl font-bold mb-3 transition-colors" style={{ color: 'rgb(var(--primary-500))' }}>{t('infoTitle')}</h3>
                <h4 className="text-3xl md:text-4xl font-extrabold mb-6 transition-colors" style={{ color: 'rgb(var(--text-primary))' }}>
                  <span className="relative inline-block">
                    {t('whyRequestQuoteTitle')}
                    <span className="absolute -bottom-6 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-70"></span>
                  </span>
                </h4>
              </div>

              <div className="mb-10 space-y-6 text-right">
                <p className="text-xl md:text-2xl leading-relaxed transition-colors font-medium opacity-90" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('firstReason')}
                </p>
                <p className="text-xl md:text-2xl leading-relaxed transition-colors font-medium opacity-90" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('secondReason')}
                </p>
                <p className="text-xl md:text-2xl leading-relaxed transition-colors font-medium opacity-90" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('thirdReason')}
                </p>
                <p className="text-xl md:text-2xl leading-relaxed transition-colors font-medium opacity-90" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('fourthReason')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div
                  className="flex flex-col items-center justify-center p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border h-64 cursor-pointer"
                  style={{
                    backgroundColor: 'rgb(var(--bg-secondary))',
                    borderColor: 'rgb(var(--border-primary))'
                  }}
                >
                  <FaChartLine className="text-5xl md:text-6xl mb-6 text-teal-500 group-hover:scale-110 transition-transform duration-300" />
                  <h5 className="font-bold text-lg md:text-xl mb-2 transition-colors group-hover:text-teal-600" style={{ color: 'rgb(var(--text-primary))' }}>{t('marketPrice')}</h5>
                </div>

                <div
                  className="flex flex-col items-center justify-center p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border h-64 cursor-pointer"
                  style={{
                    backgroundColor: 'rgb(var(--bg-secondary))',
                    borderColor: 'rgb(var(--border-primary))'
                  }}
                >
                  <FaRegClock className="text-5xl md:text-6xl mb-6 text-teal-500 group-hover:scale-110 transition-transform duration-300" />
                  <h5 className="font-bold text-lg md:text-xl mb-2 transition-colors group-hover:text-teal-600" style={{ color: 'rgb(var(--text-primary))' }}>{t('saveTime')}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Sections - Premium Interactive Design */}
      <section className="py-16 md:py-24 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
        <div className="container-custom relative z-10">
          <div className="flex justify-center overflow-hidden">
            <div className="relative w-full max-w-6xl">
              <img
                src="/images/workflow_curved.png"
                alt={t('howItWorks')}
                className="w-full h-auto object-contain transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
        <div className="container-custom">
          <div className="text-center mb-4">
            <p className="mb-2 transition-colors" style={{ color: 'rgb(var(--primary-500))' }}>{t('someServices')}</p>
            <h2 className="text-3xl md:text-4xl font-bold transition-colors" style={{ color: 'rgb(var(--text-primary))' }}>
              <span className="relative inline-block">
                {t('servicesTitle')}
                <span className="absolute -bottom-6 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-70"></span>
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {services.map((service, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border group hover:-translate-y-2 cursor-pointer"
                style={{
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  borderColor: 'rgb(var(--border-primary))'
                }}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm dark:bg-black/60 dark:text-white">
                    <span className="text-yellow-500 mr-1">★</span> 4.9 (52)
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 text-right">
                  {/* User Info Row */}
                  <div className="flex items-center justify-end gap-3 mb-3 pb-3 border-b" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                    <div className="text-xs">
                      <span className="block font-bold text-sm mb-0.5" style={{ color: 'rgb(var(--text-primary))' }}>عدنان السوري</span>
                      <span className="opacity-80" style={{ color: 'rgb(var(--text-secondary))' }}>مصمم مواقع . جافا سكربت</span>
                    </div>
                    <div className="w-9 h-9 rounded-full overflow-hidden border shadow-sm" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`} alt="User" />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-bold text-lg mb-2 line-clamp-1 transition-colors group-hover:text-teal-600" style={{ color: 'rgb(var(--text-primary))' }}>
                    {service.title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2 leading-relaxed opacity-80" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {service.description}.
                  </p>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed text-xs font-medium" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                    <div className="flex items-center gap-1 font-bold text-sm" style={{ color: 'rgb(var(--primary-500))' }}>
                      <FaBriefcase />
                      <span>{service.priceRange}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-60" style={{ color: 'rgb(var(--text-tertiary))' }}>
                      <FaRegClock />
                      <span>{t('unknown')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/jobs" className="btn bg-teal-500 hover:bg-teal-600 text-white px-12 py-4 text-lg border-0">
              {t('browseAll')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
