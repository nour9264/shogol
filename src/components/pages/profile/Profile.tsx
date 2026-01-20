'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaEdit, FaEye } from 'react-icons/fa';
import { getImageUrl, DEFAULT_AVATAR } from '@/utils/helpers';
import ProtectedRoute from '@/components/Common/ProtectedRoute';
import SkillsManager from './SkillsManager';
import BioManager from './BioManager';
import CoverImageManager from './CoverImageManager';
import PortfolioManager from './PortfolioManager';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="container-custom max-w-4xl">
        <div className="card">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 text-left rtl:text-right">
            <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{t('profile')}</h1>
            <div className="flex flex-wrap gap-3">
              {(user.isFreelancer || user.userType === 'Freelancer') && (
                <Link href={`/freelancers/${user.id}`} className="btn btn-outline" target="_blank">
                  <FaEye className="ml-2" />
                  {t('viewPublicProfile')}
                </Link>
              )}
              <Link href="/profile/edit" className="btn btn-outline">
                <FaEdit className="ml-2" />
                {t('edit')}
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <img
              src={getImageUrl(user.profilePictureUrl)}
              alt={user.firstName || 'User'}
              className="w-32 h-32 avatar"
              onError={(e) => {
                e.currentTarget.onerror = null; // Prevent infinite loop
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />

            <div className="flex-1 text-left rtl:text-right">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                {user.firstName} {user.lastName}
              </h2>
              <p className="mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>{user.email}</p>
            </div>
          </div>

          {/* Bio section - Only for non-freelancers (clients) */}
          {!user.isFreelancer && user.userType !== 'Freelancer' && user.bio && (
            <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgb(var(--border-primary))' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>{t('aboutMe')}</h3>
              <p className="leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>{user.bio}</p>
            </div>
          )}
        </div>

        {/* Freelancer-only sections */}
        {(user.isFreelancer || user.userType === 'Freelancer') && (
          <>
            {/* Cover Image Manager */}
            <div className="mt-6">
              <CoverImageManager />
            </div>

            {/* Skills Manager */}
            <div className="mt-6">
              <SkillsManager />
            </div>

            {/* Bio Manager */}
            <div className="mt-6">
              <BioManager />
            </div>

            {/* Portfolio Manager */}
            <div className="mt-6">
              <PortfolioManager />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}

