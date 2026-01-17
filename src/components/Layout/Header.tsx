'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { FaBell, FaEnvelope, FaUser, FaSignOutAlt, FaBars, FaTimes, FaSun, FaMoon, FaGlobe } from 'react-icons/fa';
import { useNotifications } from '@/hooks/useNotifications';
import { getImageUrl } from '@/utils/helpers';
import styles from './Header.module.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t, isArabic } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use the notifications hook for real-time unread count
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    router.push('/login');
    setDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="shadow-md sticky top-0 z-50 transition-colors border-b" style={{ backgroundColor: 'rgb(var(--bg-secondary))', borderColor: 'rgb(var(--border-secondary))' }}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Shogol Logo" className="h-14 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: '/', label: t('home') },
              { href: '/jobs', label: t('jobs') },
              { href: '/freelancers', label: t('freelancers') },
              { href: '/my-jobs', label: t('requests') },
              { href: '/contact', label: t('contact') },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-bold transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${isActive(link.href)
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-[rgb(var(--text-primary))]'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              style={{ backgroundColor: 'rgb(var(--bg-tertiary))', color: 'rgb(var(--text-primary))' }}
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? <FaSun size={18} className="text-yellow-400" /> : <FaMoon size={18} className="text-indigo-500" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-sm font-medium"
              style={{ backgroundColor: 'rgb(var(--bg-tertiary))', color: 'rgb(var(--text-primary))' }}
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

                <Link href="/notifications" className="relative p-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link href="/messages" className="relative p-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
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
                      <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{user?.firstName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user?.isClient
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

        {
          mobileMenuOpen && (
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

                {[
                  { href: '/', label: t('home') },
                  { href: '/jobs', label: t('jobs') },
                  { href: '/freelancers', label: t('freelancers') },
                  { href: '/my-jobs', label: t('requests') },
                  { href: '/contact', label: t('contact') },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-bold transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${isActive(link.href)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-[rgb(var(--text-primary))]'
                      }`}
                    onClick={toggleMobileMenu}
                  >
                    {link.label}
                  </Link>
                ))}

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
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${user?.isClient
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
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {unreadCount}
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
          )
        }
      </div >
    </header >
  );
};

export default Header;

