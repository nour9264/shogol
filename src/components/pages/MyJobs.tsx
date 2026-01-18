'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { jobService, proposalService, reviewService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import ProtectedRoute from '@/components/Common/ProtectedRoute';
import Loading from '@/components/Common/Loading';
import Badge from '@/components/Common/Badge';
import ReviewModal from '@/components/Common/ReviewModal';
import {
  FaBriefcase,
  FaMoneyBillWave,
  FaClock,
  FaCalendar,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaHourglassHalf,
  FaRocket,
  FaCheckCircle,
  FaClipboardList,
  FaBell,
  FaEnvelope,
  FaUser,
  FaStar,
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

  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedJobId) return;

    setSubmittingReview(true);
    try {
      await reviewService.addReview({
        jobRequestId: selectedJobId,
        rating,
        comment
      });
      success('تم إرسال التقييم بنجاح');
      setShowReviewModal(false);
      setSelectedJobId(null);
      // Ideally refresh job list or update local state to show review is submitted
      fetchMyJobs();
    } catch (error: any) {
      showError(error.response?.data?.message || 'فشل إرسال التقييم');
    }
    setSubmittingReview(false);
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
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedJobId(null);
        }}
        onSubmit={handleReviewSubmit}
        isSubmitting={submittingReview}
      />
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
            <div className="card sticky top-24 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
                  <FaClipboardList className="text-xl" />
                </div>
                <h3 className="font-bold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                  {isClient ? 'طلباتي' : 'عروضي'}
                </h3>
              </div>

              <nav className="space-y-1">
                {(['active', 'in_progress', 'completed'] as TabType[]).map((tab) => {
                  const isActive = activeTab === tab;
                  const icons = {
                    active: FaHourglassHalf,
                    in_progress: FaRocket,
                    completed: FaCheckCircle,
                  };
                  const TabIcon = icons[tab];

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full text-right px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-bold shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <TabIcon className={`text-lg ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500 transition-colors'}`} />
                        <span>{tabLabels[tab]}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${isActive
                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                        }`}>
                        {isClient
                          ? filterByStatus(jobs, tab).length
                          : filterByStatus(proposals, tab).length}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <hr className="my-6 border-gray-100 dark:border-gray-700" />

              <nav className="space-y-1">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                  <FaUser className="text-lg text-gray-400" />
                  الحساب الشخصي
                </Link>
                <Link href="/notifications" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                  <FaBell className="text-lg text-gray-400" />
                  الإشعارات
                </Link>
                <Link href="/messages" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                  <FaEnvelope className="text-lg text-gray-400" />
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
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                      <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaBriefcase className="text-4xl text-primary-300 dark:text-primary-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {isClient ? 'لا توجد طلبات هنا' : 'لا توجد عروض هنا'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                        {activeTab === 'active'
                          ? (isClient ? 'لم تقم بإضافة أي طلبات بعد. ابدأ بإضافة مشروعك الأول الآن!' : 'لم تقدم أي عروض بعد. تصفح المشاريع المتاحة وابدأ في التقديم!')
                          : activeTab === 'in_progress'
                            ? 'لا توجد مشاريع قيد التنفيذ حالياً.'
                            : 'لم يتم العثور على مشاريع مكتملة.'}
                      </p>
                      {isClient ? (
                        <Link
                          href="/post-job"
                          className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:-translate-y-1 transition-all"
                        >
                          <FaPlus />
                          إضافة طلب جديد
                        </Link>
                      ) : (
                        <Link
                          href="/jobs"
                          className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:-translate-y-1 transition-all"
                        >
                          <FaBriefcase />
                          تصفح المشاريع
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredJobs.map((job) => (
                        <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow relative">
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

                          <div className="flex items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="btn btn-outline text-sm flex items-center gap-2"
                              >
                                <FaEye />
                                عرض التفاصيل
                              </Link>
                              {activeTab === 'completed' && job.status === 'Completed' && (
                                <button
                                  onClick={() => {
                                    setSelectedJobId(job.id);
                                    setShowReviewModal(true);
                                  }}
                                  className="btn bg-yellow-400 hover:bg-yellow-500 text-black text-sm flex items-center gap-2 shadow-sm font-bold"
                                >
                                  <FaStar />
                                  تقييم المستقل
                                </button>
                              )}
                            </div>
                            {job.status === 'Pending' && (
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/jobs/edit/${job.id}`}
                                  className="btn btn-outline text-sm flex items-center gap-2"
                                >
                                  <FaEdit />
                                  تعديل
                                </Link>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="btn border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 text-sm flex items-center gap-2"
                                >
                                  <FaTrash />
                                  حذف
                                </button>
                              </div>
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



