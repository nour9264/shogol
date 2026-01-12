'use client';

import React from 'react';
import Link from 'next/link';
import { FaSearch, FaRocket, FaShieldAlt, FaClock, FaUsers, FaBriefcase, FaFileAlt, FaPlus } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import styles from './Home.module.css';
import type { TranslationKey } from '@/context/LanguageContext';

const Home = () => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const { isAuthenticated, user } = useAuth();

  const features: Array<{ icon: React.ReactNode; titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      icon: <FaRocket className="text-4xl text-primary-500" />,
      titleKey: 'newConcept',
      descKey: 'newConceptDesc',
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-500" />,
      titleKey: 'comprehensiveServices',
      descKey: 'comprehensiveServicesDesc',
    },
    {
      icon: <FaClock className="text-4xl text-blue-500" />,
      titleKey: 'valueForTime',
      descKey: 'valueForTimeDesc',
    },
    {
      icon: <FaUsers className="text-4xl text-purple-500" />,
      titleKey: 'freedomInDealings',
      descKey: 'freedomInDealingsDesc',
    },
  ];

  const stats: Array<{ number: string; labelKey: TranslationKey }> = [
    { number: '+10,000', labelKey: 'completedProjects' },
    { number: '+5,000', labelKey: 'professionalFreelancers' },
    { number: '+3,000', labelKey: 'satisfiedClients' },
    { number: '98%', labelKey: 'successRate' },
  ];

  return (
    <div
      style={{ backgroundColor: 'rgb(var(--bg-primary))', transition: 'background-color 300ms' }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('platformTitle')}
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              {t('platformSubtitle')}
            </p>

            <div className="rounded-2xl shadow-strong p-3 max-w-2xl mx-auto" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rtl:right-4 ltr:left-4" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    className="w-full px-12 py-4 bg-transparent rounded-lg focus:outline-none placeholder:opacity-50"
                    style={{
                      color: 'rgb(var(--text-primary))',
                    }}
                  />
                </div>
                <button className="btn btn-primary px-8">
                  {t('searchBtn')}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {isAuthenticated ? (
                <>
                  {/* Logged in user buttons */}
                  {user?.isClient ? (
                    <>
                      <Link href="/post-job" className="btn bg-white text-primary-600 hover:bg-gray-100 flex items-center gap-2">
                        <FaPlus />
                        {isArabic ? 'انشر مشروع جديد' : 'Post New Project'}
                      </Link>
                      <Link href="/my-jobs" className="btn border-2 border-white text-white hover:bg-white/10 flex items-center gap-2">
                        <FaBriefcase />
                        {isArabic ? 'مشاريعي' : 'My Projects'}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/jobs" className="btn bg-white text-primary-600 hover:bg-gray-100 flex items-center gap-2">
                        <FaSearch />
                        {isArabic ? 'تصفح المشاريع' : 'Browse Projects'}
                      </Link>
                      <Link href="/my-jobs" className="btn border-2 border-white text-white hover:bg-white/10 flex items-center gap-2">
                        <FaFileAlt />
                        {isArabic ? 'عروضي' : 'My Proposals'}
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Guest user buttons */}
                  <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
                    {t('startAsFreelancer')}
                  </Link>
                  <Link href="/post-job" className="btn border-2 border-white text-white hover:bg-white/10">
                    {t('postYourProject')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>{t('whyRequestQuote')}</h2>
            <p className="text-lg" style={{ color: 'rgb(var(--text-secondary))' }}>
              {t('uniqueExperience')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-xl p-6 text-center hover:shadow-lg transition-all" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{t(feature.titleKey)}</h3>
                <p style={{ color: 'rgb(var(--text-secondary))' }}>{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className=" py-16 transition-colors">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-primary-600 dark:text-primary-400">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>{t('howItWorks')}</h2>
            <p className="text-lg" style={{ color: 'rgb(var(--text-secondary))' }}>
              {t('threeSimpleSteps')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card rounded-xl p-8 text-center shadow-soft">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{t('postYourProjectStep')}</h3>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('postYourProjectStepDesc')}
              </p>
            </div>

            <div className="card rounded-xl p-8 text-center shadow-soft">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{t('receiveOffers')}</h3>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('receiveOffersDesc')}
              </p>
            </div>

            <div className="card rounded-xl p-8 text-center shadow-soft">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{t('completeProject')}</h3>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('completeProjectDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 text-white py-20">
        <div className="container-custom text-center">
          {isAuthenticated ? (
            <>
              <div className="flex flex-col items-center gap-3 mb-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  {isArabic ? `مرحباً ${user?.firstName}!` : `Welcome ${user?.firstName}!`}
                </h2>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${user?.isClient
                  ? 'bg-blue-500/20 text-blue-100 border border-blue-400/30'
                  : 'bg-green-500/20 text-green-100 border border-green-400/30'
                  }`}>
                  {user?.isClient ? t('client') : t('freelancer')}
                </span>
              </div>
              <p className="text-xl mb-8 text-white/90">
                {user?.isClient
                  ? (isArabic ? 'ابدأ بنشر مشروعك واحصل على أفضل العروض من المستقلين' : 'Start posting your project and get the best offers from freelancers')
                  : (isArabic ? 'تصفح المشاريع المتاحة وقدم عروضك للعملاء' : 'Browse available projects and submit your proposals')
                }
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {user?.isClient ? (
                  <>
                    <Link href="/post-job" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg flex items-center gap-2">
                      <FaPlus />
                      {isArabic ? 'انشر مشروع' : 'Post a Project'}
                    </Link>
                    <Link href="/freelancers" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg flex items-center gap-2">
                      <FaUsers />
                      {isArabic ? 'تصفح المستقلين' : 'Browse Freelancers'}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/jobs" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg flex items-center gap-2">
                      <FaBriefcase />
                      {isArabic ? 'تصفح المشاريع' : 'Browse Projects'}
                    </Link>
                    <Link href="/profile" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg flex items-center gap-2">
                      <FaFileAlt />
                      {isArabic ? 'ملفي الشخصي' : 'My Profile'}
                    </Link>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('readyToStart')}
              </h2>
              <p className="text-xl mb-8 text-white/90">
                {t('joinThousands')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  {t('startNowFree')}
                </Link>
                <Link href="/about" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                  {t('learnMore')}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

