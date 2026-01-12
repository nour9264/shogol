'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { FaBell, FaEnvelope, FaUser, FaSignOutAlt, FaBars, FaTimes, FaSun, FaMoon, FaGlobe } from 'react-icons/fa';
import { notificationService } from '@/services/api';
import { getImageUrl } from '@/utils/helpers';
import styles from './Header.module.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t, isArabic } = useLanguage();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadNotifications(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    setDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ش</span>
            </div>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">شغل</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              {t('home')}
            </Link>
            <Link href="/jobs" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              {t('jobs')}
            </Link>
            <Link href="/freelancers" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              {t('freelancers')}
            </Link>
            <Link href="/my-jobs" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              {t('requests')}
            </Link>
            <Link href="/contact" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              {t('contact')}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? <FaSun size={18} className="text-yellow-400" /> : <FaMoon size={18} className="text-indigo-500" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm font-medium"
              title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <FaGlobe size={14} />
              <span>{isArabic ? 'EN' : 'ع'}</span>
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {isAuthenticated ? (
              <>
                {user?.isClient && (
                  <Link href="/post-job" className="btn btn-primary">
                    {t('postJob')}
                  </Link>
                )}

                <Link href="/notifications" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <FaBell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>

                <Link href="/messages" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <FaEnvelope size={20} />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <img
                      src={getImageUrl(user?.profilePictureUrl)}
                      alt={user?.firstName || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-gray-700 dark:text-gray-200">{user?.firstName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user?.isClient 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {user?.isClient ? t('client') : t('freelancer')}
                      </span>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-strong py-2 z-50 border dark:border-gray-700">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaUser className="text-gray-500 dark:text-gray-400" />
                          <span>{t('profile')}</span>
                        </Link>
                        <Link
                          href="/my-jobs"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaEnvelope className="text-gray-500 dark:text-gray-400" />
                          <span>{user?.isClient ? t('myJobs') : t('myProposals')}</span>
                        </Link>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-right text-red-600 dark:text-red-400"
                        >
                          <FaSignOutAlt />
                          <span>{t('logout')}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  {t('login')}
                </Link>
                <Link href="/register" className="btn btn-primary">
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          <button onClick={toggleMobileMenu} className="md:hidden p-2 text-gray-700 dark:text-gray-200">
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col gap-4">
              {/* Mobile Theme & Language Toggles */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-indigo-500" />}
                  <span className="text-sm">{isDark ? t('lightMode') : t('darkMode')}</span>
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <FaGlobe />
                  <span className="text-sm">{isArabic ? 'English' : 'العربية'}</span>
                </button>
              </div>

              <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors" onClick={toggleMobileMenu}>
                {t('home')}
              </Link>
              <Link href="/jobs" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors" onClick={toggleMobileMenu}>
                {t('jobs')}
              </Link>
              <Link href="/freelancers" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors" onClick={toggleMobileMenu}>
                {t('freelancers')}
              </Link>
              <Link href="/my-jobs" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors" onClick={toggleMobileMenu}>
                {t('requests')}
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors" onClick={toggleMobileMenu}>
                {t('contact')}
              </Link>

              {isAuthenticated ? (
                <>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  {/* User Info with Type Badge */}
                  <div className="flex items-center gap-3 py-2">
                    <img
                      src={getImageUrl(user?.profilePictureUrl)}
                      alt={user?.firstName || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-200 block">{user?.firstName} {user?.lastName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                        user?.isClient 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {user?.isClient ? t('client') : t('freelancer')}
                      </span>
                    </div>
                  </div>
                  <Link href="/profile" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors" onClick={toggleMobileMenu}>
                    {t('profile')}
                  </Link>
                  <Link href="/notifications" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-2" onClick={toggleMobileMenu}>
                    {t('notifications')}
                    {unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                  <Link href="/messages" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors" onClick={toggleMobileMenu}>
                    {t('messages')}
                  </Link>
                  <button onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors text-right">
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline dark:border-gray-600 dark:text-gray-200 w-full" onClick={toggleMobileMenu}>
                    {t('login')}
                  </Link>
                  <Link href="/register" className="btn btn-primary w-full" onClick={toggleMobileMenu}>
                    {t('register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

