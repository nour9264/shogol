'use client';

import Link from 'next/link';
import { FaMapMarkerAlt, FaBriefcase, FaCheckCircle } from 'react-icons/fa';
import { getImageUrl, truncateText } from '@/utils/helpers';
import StarRating from '../Common/StarRating';
import type { Freelancer } from '@/types';
import styles from './FreelancerCard.module.css';

interface FreelancerCardProps {
  freelancer: Freelancer;
}

const FreelancerCard = ({ freelancer }: FreelancerCardProps) => {
  return (
    <Link href={`/freelancers/${freelancer.id}`} className="card-bordered hover:shadow-medium block">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <img
            src={getImageUrl(freelancer.profilePictureUrl)}
            alt={freelancer.fullName}
            className="w-20 h-20 avatar"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ccc\' d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/%3E%3C/svg%3E';
            }}
          />
          {freelancer.rating >= 4.5 && (
            <div className="absolute -top-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-white" size={14} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1 hover:text-primary-600 transition-colors" style={{ color: 'rgb(var(--text-primary))' }}>
            {freelancer.fullName}
          </h3>
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
            <FaMapMarkerAlt size={12} />
            <span>{freelancer.nationality || 'غير محدد'}</span>
          </div>
          <StarRating rating={freelancer.rating} size="sm" />
        </div>
      </div>

      {freelancer.bio && (
        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'rgb(var(--text-secondary))' }}>
          {truncateText(freelancer.bio, 100)}
        </p>
      )}

      {freelancer.skills && freelancer.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {freelancer.skills.slice(0, 4).map((skill) => (
            <span
              key={skill.id}
              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
            >
              {skill.nameAr}
            </span>
          ))}
          {freelancer.skills.length > 4 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              +{freelancer.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: 'rgb(var(--border-primary))' }}>
        <div className="flex items-center gap-2 text-sm">
          <FaBriefcase className="text-primary-500" />
          <span style={{ color: 'rgb(var(--text-secondary))' }}>
            <span className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{freelancer.completedJobsCount}</span> مشروع مكتمل
          </span>
        </div>
      </div>
    </Link>
  );
};

export default FreelancerCard;

