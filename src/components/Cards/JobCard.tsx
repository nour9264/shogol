'use client';

import Link from 'next/link';
import { FaClock, FaMoneyBillWave, FaUser, FaCalendar } from 'react-icons/fa';
import { formatCurrency, formatRelativeTime, truncateText, getImageUrl } from '@/utils/helpers';
import Badge from '../Common/Badge';
import type { JobRequest } from '@/types';
import styles from './JobCard.module.css';

interface JobCardProps {
  job: JobRequest;
}

const JobCard = ({ job }: JobCardProps) => {
  return (
    <Link href={`/jobs/${job.id}`} className="card-bordered hover:shadow-medium block">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2 hover:text-primary-600 transition-colors" style={{ color: 'rgb(var(--text-primary))' }}>
            {job.title}
          </h3>
          <p className="text-sm line-clamp-2" style={{ color: 'rgb(var(--text-secondary))' }}>
            {truncateText(job.description, 120)}
          </p>
        </div>
        <Badge variant="info">{job.status === 'Pending' ? 'مفتوح' : 'مغلق'}</Badge>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
            >
              {skill.nameAr}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              +{job.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
        <div className="flex items-center gap-2">
          <FaMoneyBillWave className="text-green-600" />
          <span className="font-medium">{formatCurrency(job.budget)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-blue-600" />
          <span>{job.durationInDays} يوم</span>
        </div>
        <div className="flex items-center gap-2">
          <FaUser className="text-purple-600" />
          <span>{job.proposalsCount || 0} عرض</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
        <div className="flex items-center gap-2">
          <img
            src={getImageUrl(job.clientAvatar || null)}
            alt={job.clientName || 'Client'}
            className="w-8 h-8 avatar"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ccc\' d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/%3E%3C/svg%3E';
            }}
          />
          <div>
            <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{job.clientName}</p>
            {job.clientCompany && <p className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>{job.clientCompany}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>
          <FaCalendar />
          <span>{formatRelativeTime(job.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;

