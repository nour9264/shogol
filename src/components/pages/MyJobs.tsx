'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { jobService, proposalService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import ProtectedRoute from '@/components/Common/ProtectedRoute';
import Loading from '@/components/Common/Loading';
import Badge from '@/components/Common/Badge';
import {
  FaBriefcase,
  FaMoneyBillWave,
  FaClock,
  FaCalendar,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
} from 'react-icons/fa';
import {
  formatCurrency,
  formatRelativeTime,
  getStatusColor,
  getStatusText,
  getImageUrl,
} from '@/utils/helpers';
import type { JobRequest, Proposal, Skill } from '@/types';
import styles from './MyJobs.module.css';

type TabType = 'active' | 'in_progress' | 'completed';

const MyJobs = () => {
  const { user, isClient, isFreelancer } = useAuth();
  const { success, error: showError } = useToast();

  // State for Client (Job Requests)
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // State for Freelancer (Proposals)
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('active');

  useEffect(() => {
    if (isClient) {
      fetchMyJobs();
    }
    if (isFreelancer) {
      fetchMyProposals();
    }
  }, [isClient, isFreelancer]);

  const fetchMyJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await jobService.getMyJobs(1, 50);
      setJobs(response.data.jobRequests || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoadingJobs(false);
  };

  const fetchMyProposals = async () => {
    setLoadingProposals(true);
    try {
      const response = await proposalService.getMyProposals(1, 50);
      console.log('📥 Raw proposals response:', response.data);

      // Handle .NET serialization format
      let proposalsList: Proposal[] = [];

      if (Array.isArray(response.data)) {
        proposalsList = response.data;
      } else if (response.data.$values) {
        proposalsList = response.data.$values;
      } else if (response.data.proposals) {
        proposalsList = response.data.proposals;
      }

      console.log('✅ Parsed proposals:', proposalsList);
      console.log('📊 Proposal statuses:', proposalsList.map(p => ({ id: p.id, status: p.status })));

      setProposals(proposalsList);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
    setLoadingProposals(false);
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;

    try {
      await jobService.deleteJob(jobId);
      success('تم حذف المشروع بنجاح');
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '';

      // Handle specific error messages from API
      if (errorMessage.includes('offer has been accepted')) {
        showError('لا يمكن حذف المشروع. تم قبول عرض لهذا المشروع.');
      } else if (errorMessage.includes('contract exists')) {
        showError('لا يمكن حذف المشروع. يوجد عقد لهذا المشروع.');
      } else if (errorMessage.includes('not found')) {
        showError('المشروع غير موجود');
      } else {
        showError(errorMessage || 'فشل حذف المشروع');
      }

      // Refresh job list to get updated statuses
      fetchMyJobs();
    }
  };

  const handleWithdrawProposal = async (proposalId: number) => {
    if (!window.confirm('هل أنت متأكد من سحب هذا العرض؟')) return;

    try {
      await proposalService.withdrawProposal(proposalId);
      success('تم سحب العرض بنجاح');
      setProposals(proposals.filter(p => p.id !== proposalId));
    } catch (error: any) {
      showError(error.response?.data?.message || 'فشل سحب العرض');
    }
  };

  // Filter jobs/proposals by tab
  const filterByStatus = (items: any[], tab: TabType) => {
    switch (tab) {
      case 'active':
        return items.filter(item => item.status === 'Pending');
      case 'in_progress':
        return items.filter(item => item.status === 'InProgress' || item.status === 'Accepted');
      case 'completed':
        return items.filter(item => item.status === 'Completed' || item.status === 'Cancelled' || item.status === 'Rejected');
      default:
        return items;
    }
  };

  const filteredJobs = filterByStatus(jobs, activeTab);
  const filteredProposals = filterByStatus(proposals, activeTab);

  const tabLabels = {
    active: isClient ? 'بانتظار العروض' : 'بانتظار الموافقة',
    in_progress: 'قيد التنفيذ',
    completed: 'المكتملة',
  };

  const isLoading = (isClient && loadingJobs) || (isFreelancer && loadingProposals);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      {/* Hero Header */}
      <div className="bg-gradient-primary text-white py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={getImageUrl(user?.profilePictureUrl)}
                alt={user?.firstName}
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
                <p className="text-white/80">{isClient ? 'صاحب مشاريع' : 'مستقل'}</p>
              </div>
            </div>
            {isClient && (
              <Link href="/post-job" className="btn bg-white text-primary-600 hover:bg-gray-100">
                <FaPlus className="ml-2" />
                إضافة طلب جديد
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>{isClient ? 'طلباتي' : 'عروضي'}</h3>

              <nav className="space-y-2">
                {(['active', 'in_progress', 'completed'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-right px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${activeTab === tab
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'hover:bg-gray-50'
                      }`}
                    style={activeTab !== tab ? { color: 'rgb(var(--text-secondary))' } : {}}
                  >
                    <span>{tabLabels[tab]}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab ? 'bg-primary-200' : 'bg-gray-200'
                      }`}>
                      {isClient
                        ? filterByStatus(jobs, tab).length
                        : filterByStatus(proposals, tab).length}
                    </span>
                  </button>
                ))}
              </nav>

              <hr className="my-4" />

              <nav className="space-y-2">
                <Link href="/profile" className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
                  الحساب الشخصي
                </Link>
                <Link href="/notifications" className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
                  الإشعارات
                </Link>
                <Link href="/messages" className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
                  الرسائل
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">
              <h2 className="text-xl font-bold mb-6" style={{ color: 'rgb(var(--text-primary))' }}>
                {tabLabels[activeTab]}
              </h2>

              {/* Client View - Job Requests */}
              {isClient && (
                <>
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <FaBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
                      <p className="mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>لا توجد طلبات في هذه الفئة</p>
                      <Link href="/post-job" className="btn btn-primary">
                        إضافة طلب جديد
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredJobs.map((job) => (
                        <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4 gap-4">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="text-lg font-bold hover:text-primary-600 transition-colors"
                                style={{ color: 'rgb(var(--text-primary))' }}
                              >
                                {job.title}
                              </Link>
                              <p className="text-sm mt-1 line-clamp-2 break-all" style={{ color: 'rgb(var(--text-secondary))' }}>{job.description}</p>
                            </div>
                            <Badge variant={getStatusColor(job.status) as any}>
                              {getStatusText(job.status)}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                            <div className="flex items-center gap-1">
                              <FaMoneyBillWave className="text-green-500" />
                              <span>{formatCurrency(job.budget)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaClock className="text-blue-500" />
                              <span>{job.durationInDays} يوم</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaCalendar className="text-gray-400" />
                              <span>{formatRelativeTime(job.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaBriefcase className="text-primary-500" />
                              <span>{job.proposalsCount || 0} عرض</span>
                            </div>
                          </div>

                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.map((skill: Skill) => (
                                <span
                                  key={skill.id}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {skill.nameAr}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                            <Link
                              href={`/jobs/${job.id}`}
                              className="btn btn-outline text-sm flex items-center gap-2"
                            >
                              <FaEye />
                              عرض التفاصيل
                            </Link>
                            {job.status === 'Pending' && (
                              <>
                                <Link
                                  href={`/jobs/edit/${job.id}`}
                                  className="btn btn-outline text-sm flex items-center gap-2"
                                >
                                  <FaEdit />
                                  تعديل
                                </Link>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="btn text-red-600 border-red-200 hover:bg-red-50 text-sm flex items-center gap-2"
                                >
                                  <FaTrash />
                                  حذف
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Freelancer View - Proposals */}
              {isFreelancer && (
                <>
                  {filteredProposals.length === 0 ? (
                    <div className="text-center py-12">
                      <FaBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
                      <p className="mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>لا توجد عروض في هذه الفئة</p>
                      <Link href="/jobs" className="btn btn-primary">
                        تصفح المشاريع
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProposals.map((proposal) => (
                        <div key={proposal.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4 gap-4">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/jobs/${proposal.jobRequestId}`}
                                className="text-lg font-bold hover:text-primary-600 transition-colors"
                                style={{ color: 'rgb(var(--text-primary))' }}
                              >
                                عرضك على الطلب
                              </Link>
                              <p className="text-sm mt-1 line-clamp-2 break-all" style={{ color: 'rgb(var(--text-secondary))' }}>{proposal.description}</p>
                            </div>
                            <Badge variant={getStatusColor(proposal.status) as any}>
                              {getStatusText(proposal.status)}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                            <div className="flex items-center gap-1">
                              <FaMoneyBillWave className="text-green-500" />
                              <span>قيمة العرض: {formatCurrency(proposal.proposedPrice)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaClock className="text-blue-500" />
                              <span>مدة التنفيذ: {proposal.proposedDurationInDays} يوم</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaCalendar className="text-gray-400" />
                              <span>{formatRelativeTime(proposal.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                            <Link
                              href={`/jobs/${proposal.jobRequestId}`}
                              className="btn btn-outline text-sm flex items-center gap-2"
                            >
                              <FaEye />
                              عرض تفاصيل الطلب
                            </Link>
                            {proposal.status === 'Pending' && (
                              <button
                                onClick={() => handleWithdrawProposal(proposal.id)}
                                className="btn text-red-600 border-red-200 hover:bg-red-50 text-sm flex items-center gap-2"
                              >
                                <FaTrash />
                                سحب العرض
                              </button>
                            )}
                            {proposal.status === 'Accepted' && (
                              <button
                                onClick={async () => {
                                  if (confirm('هل أنت متأكد من تسليم الطلب؟ (Confirm Job Delivery?)')) {
                                    try {
                                      await jobService.markJobAsCompleted(proposal.jobRequestId);
                                      success('تم تسليم الطلب بنجاح (Job Delivered Successfully)');
                                      // Refresh lists
                                      fetchMyJobs();
                                      fetchMyProposals();
                                    } catch (error) {
                                      showError('فشل تسليم الطلب');
                                    }
                                  }
                                }}
                                className="btn btn-primary text-sm"
                              >
                                تسليم الطلب
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MyJobsPage() {
  return (
    <ProtectedRoute>
      <MyJobs />
    </ProtectedRoute>
  );
}



