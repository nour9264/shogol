'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaApple, FaGooglePlay } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t, isArabic } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="Shogol Logo" className="h-14 w-auto object-contain rounded-lg" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {t('footerDesc')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors"
              >
                <FaLinkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">{t('links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="text-gray-300 hover:text-white transition-colors">
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  {t('termsOfUse')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  {t('guaranteeRights')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">{t('pages')}</h3>
            <ul className="space-y-2">
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link href="/register" className="text-gray-300 hover:text-white transition-colors">
                      {t('newRegistration')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                      {t('login')}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                      {isArabic ? 'ملفي الشخصي' : 'My Profile'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/messages" className="text-gray-300 hover:text-white transition-colors">
                      {isArabic ? 'الرسائل' : 'Messages'}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/jobs" className="text-gray-300 hover:text-white transition-colors">
                  {t('browseAllRequests')}
                </Link>
              </li>
              <li>
                <Link href="/freelancers" className="text-gray-300 hover:text-white transition-colors">
                  {isArabic ? 'تصفح المستقلين' : 'Browse Freelancers'}
                </Link>
              </li>
              {isAuthenticated && user?.isClient && (
                <li>
                  <Link href="/post-job" className="text-gray-300 hover:text-white transition-colors">
                    {isArabic ? 'انشر مشروع' : 'Post a Project'}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">{t('downloadApp')}</h3>
            <p className="text-gray-300 text-sm mb-4">
              {t('downloadAppDesc')}
            </p>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 transition-colors"
              >
                <FaApple size={28} />
                <div className={isArabic ? 'text-right' : 'text-left'}>
                  <div className="text-xs text-gray-300">{t('availableOn')}</div>
                  <div className="font-bold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 transition-colors"
              >
                <FaGooglePlay size={28} />
                <div className={isArabic ? 'text-right' : 'text-left'}>
                  <div className="text-xs text-gray-300">{t('availableOn')}</div>
                  <div className="font-bold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>{t('allRightsReserved')} © {currentYear} {isArabic ? 'شغل' : 'SHOGOL'} - {t('professionalPlatform')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

