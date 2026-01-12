'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import Loading from '@/components/Common/Loading';
import StarRating from '@/components/Common/StarRating';
import Badge from '@/components/Common/Badge';
import Link from 'next/link';
import { FaMapMarkerAlt, FaBriefcase, FaEnvelope, FaGlobe, FaCertificate, FaImages } from 'react-icons/fa';
import { getImageUrl, getProficiencyText, formatDate } from '@/utils/helpers';
import type { Freelancer } from '@/types';
import styles from './FreelancerProfile.module.css';

const FreelancerProfile = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params?.id as string;
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchFreelancerDetails();
    }
  }, [id]);

  const fetchFreelancerDetails = async () => {
    try {
      const response = await userService.getFreelancerDetails(id);
      setFreelancer(response.data);
    } catch (error) {
      console.error('Error fetching freelancer:', error);
    }
    setLoading(false);
  };

  const handleMessageClick = () => {
    if (isAuthenticated && freelancer) {
      const params = new URLSearchParams({
        user: id,
      });
      if (freelancer.fullName) {
        params.append('name', freelancer.fullName);
      }
      if (freelancer.profilePictureUrl) {
        params.append('avatar', freelancer.profilePictureUrl);
      }
      router.push(`/messages?${params.toString()}`);
    } else {
      router.push('/login');
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!freelancer) return <div className="text-center py-16">المستقل غير موجود</div>;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card text-center">
              <img
                src={getImageUrl(freelancer.profilePictureUrl)}
                alt={freelancer.fullName}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
              />
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{freelancer.fullName}</h2>
              <StarRating rating={freelancer.rating} size="lg" />
              <div className="flex items-center justify-center gap-2 mt-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                <FaMapMarkerAlt />
                <span>{freelancer.nationality || 'غير محدد'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                <FaBriefcase />
                <span>{freelancer.completedJobsCount} مشروع مكتمل</span>
              </div>
              <button onClick={handleMessageClick} className="btn btn-primary w-full mt-6">
                <FaEnvelope className="ml-2" />
                إرسال رسالة
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {freelancer.bio && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>نبذة عني</h3>
                <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'rgb(var(--text-secondary))' }}>{freelancer.bio}</p>
              </div>
            )}

            {freelancer.skills && freelancer.skills.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>المهارات</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {freelancer.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                      <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{skill.nameAr}</span>
                      {skill.proficiencyLevel && (
                        <Badge variant="primary">{getProficiencyText(skill.proficiencyLevel)}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {freelancer.languages && freelancer.languages.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  <FaGlobe className="text-primary-500" />
                  اللغات
                </h3>
                <div className="flex flex-wrap gap-3">
                  {freelancer.languages.map((lang) => (
                    <div key={lang.id} className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                      <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{lang.languageName}</span>
                      {lang.proficiencyLevel && (
                        <span className="text-sm text-gray-500 mr-2">
                          ({getProficiencyText(lang.proficiencyLevel)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {freelancer.portfolios && freelancer.portfolios.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  <FaImages className="text-primary-500" />
                  معرض الأعمال
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {freelancer.portfolios.map((portfolio) => (
                    <div key={portfolio.id} className="border rounded-lg overflow-hidden" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                      {portfolio.imageUrl && (
                        <img
                          src={getImageUrl(portfolio.imageUrl)}
                          alt={portfolio.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{portfolio.title}</h4>
                        {portfolio.description && (
                          <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>{portfolio.description}</p>
                        )}
                        {portfolio.projectUrl && (
                          <a
                            href={portfolio.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                          >
                            عرض المشروع ←
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {freelancer.certificates && freelancer.certificates.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  <FaCertificate className="text-primary-500" />
                  الشهادات
                </h3>
                <div className="space-y-3">
                  {freelancer.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                      <div>
                        <h4 className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{cert.title}</h4>
                        {cert.issuer && <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{cert.issuer}</p>}
                        {cert.issueDate && (
                          <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>{formatDate(cert.issueDate)}</p>
                        )}
                      </div>
                      {cert.certificateFileUrl && (
                        <a
                          href={getImageUrl(cert.certificateFileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm"
                        >
                          عرض
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;



