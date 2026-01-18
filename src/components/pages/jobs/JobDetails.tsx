'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ReviewModal from '@/components/Common/ReviewModal';
import { jobService, proposalService, reviewService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Loading from '@/components/Common/Loading';
import Badge from '@/components/Common/Badge';
import StarRating from '@/components/Common/StarRating';
import Link from 'next/link';
import {
  FaMoneyBillWave,
  FaClock,
  FaCalendar,
  FaPaperclip,
  FaUser,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaStar,
} from 'react-icons/fa';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getImageUrl,
  getStatusColor,
  getStatusText,
} from '@/utils/helpers';
import type { JobRequest, Proposal } from '@/types';
import styles from './JobDetails.module.css';

const JobDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isFreelancer, isClient, isAuthenticated } = useAuth();
  const { isArabic } = useLanguage();
  const { success, error: showError } = useToast();

  const [job, setJob] = useState<JobRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [proposalData, setProposalData] = useState({
    description: '',
    proposedPrice: '',
    proposedDurationInDays: '',
  });

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27) {
        if (showProposalModal) {
          e.preventDefault();
          setShowProposalModal(false);
        }
        if (showDeleteModal) {
          e.preventDefault();
          setShowDeleteModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showProposalModal, showDeleteModal]);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobService.getJobDetails(parseInt(id));
      setJob(response.data);
    } catch (error) {
      showError(isArabic ? 'فشل تحميل تفاصيل المشروع' : 'Failed to load project details');
    }
    setLoading(false);
  };

  const handleDeleteJob = async () => {
    setDeleting(true);
    try {
      await jobService.deleteJob(parseInt(id));
      success(isArabic ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully');
      router.push('/my-jobs');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '';

      // Handle specific error messages from API
      if (errorMessage.includes('offer has been accepted')) {
        showError(isArabic
          ? 'لا يمكن حذف المشروع. تم قبول عرض لهذا المشروع.'
          : 'Cannot delete job request. An offer has been accepted for this project.');
      } else if (errorMessage.includes('contract exists')) {
        showError(isArabic
          ? 'لا يمكن حذف المشروع. يوجد عقد لهذا المشروع.'
          : 'Cannot delete job request. A contract exists for this project.');
      } else if (errorMessage.includes('not found')) {
        showError(isArabic
          ? 'المشروع غير موجود'
          : 'Job request not found');
      } else {
        showError(errorMessage || (isArabic ? 'فشل حذف المشروع' : 'Failed to delete project'));
      }

      // Refresh job details to get updated status
      fetchJobDetails();
    }
    setDeleting(false);
    setShowDeleteModal(false);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposalData.description || !proposalData.proposedPrice || !proposalData.proposedDurationInDays) {
      showError(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setSubmittingProposal(true);
    try {
      await proposalService.createProposal({
        jobRequestId: parseInt(id),
        description: proposalData.description,
        proposedPrice: parseFloat(proposalData.proposedPrice),
        proposedDurationInDays: parseInt(proposalData.proposedDurationInDays),
      });

      success(isArabic ? 'تم إرسال العرض بنجاح' : 'Proposal submitted successfully');
      setShowProposalModal(false);
      fetchJobDetails();
    } catch (error: any) {
      showError(error.response?.data?.message || (isArabic ? 'فشل إرسال العرض' : 'Failed to submit proposal'));
    }
    setSubmittingProposal(false);
  };

  const handleAcceptProposal = async (proposalId: number) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من قبول هذا العرض؟' : 'Are you sure you want to accept this proposal?')) return;

    try {
      await proposalService.acceptProposal(proposalId);
      success(isArabic ? 'تم قبول العرض بنجاح' : 'Proposal accepted successfully');
      fetchJobDetails();
    } catch (error) {
      showError(isArabic ? 'فشل قبول العرض' : 'Failed to accept proposal');
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    setSubmittingReview(true);
    try {
      if (!job) return;
      await reviewService.addReview({
        jobRequestId: job.id,
        rating,
        comment
      });
      success(isArabic ? 'تم إرسال التقييم بنجاح' : 'Review submitted successfully');
      setShowReviewModal(false);
      // Ideally refresh job details or review status here if needed
      fetchJobDetails();
    } catch (error: any) {
      showError(error.response?.data?.message || (isArabic ? 'فشل إرسال التقييم' : 'Failed to submit review'));
    }
    setSubmittingReview(false);
  };

  if (loading) return <Loading fullScreen />;
  if (!job) return <div className="text-center py-16">{isArabic ? 'المشروع غير موجود' : 'Project not found'}</div>;

  const isOwner = user?.id === job.clientId;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
        isSubmitting={submittingReview}
      />
      <div className="container-custom">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Action Buttons for Client */}
            {isClient && isOwner && job.status === 'Completed' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 flex items-center justify-between border border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {isArabic ? 'تقييم المستقل' : 'Rate Freelancer'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isArabic ? 'شارك تجربتك مع هذا المستقل' : 'Share your experience with this freelancer'}
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors shadow-lg shadow-yellow-400/20 flex items-center gap-2"
                >
                  <FaStar />
                  {isArabic ? 'تقييم' : 'Rate'}
                </button>
              </div>
            )}

            <div className="card mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{job.title}</h1>
                    {/* Job Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : job.status === 'InProgress'
                        ? 'bg-blue-100 text-blue-800'
                        : job.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {job.status === 'Pending'
                        ? (isArabic ? 'قيد الانتظار' : 'Pending')
                        : job.status === 'InProgress'
                          ? (isArabic ? 'قيد التنفيذ' : 'In Progress')
                          : job.status === 'Completed'
                            ? (isArabic ? 'مكتمل' : 'Completed')
                            : job.status === 'Cancelled'
                              ? (isArabic ? 'ملغي' : 'Cancelled')
                              : job.status
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                    <div className="flex items-center gap-1">
                      <FaCalendar />
                      <span>{formatRelativeTime(job.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser />
                      <span>{job.proposalsCount || 0} {isArabic ? 'عرض' : 'proposals'}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusColor(job.status) as any}>
                  {getStatusText(job.status)}
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                  <FaMoneyBillWave className="text-2xl text-green-600" />
                  <div>
                    <div className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{isArabic ? 'الميزانية' : 'Budget'}</div>
                    <div className="font-bold text-lg text-green-700">{formatCurrency(job.budget)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <FaClock className="text-2xl text-blue-600" />
                  <div>
                    <div className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{isArabic ? 'المدة' : 'Duration'}</div>
                    <div className="font-bold text-lg text-blue-700">{job.durationInDays} {isArabic ? 'يوم' : 'days'}</div>
                  </div>
                </div>

                {job.deadline && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <FaCalendar className="text-2xl text-red-600" />
                    <div>
                      <div className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{isArabic ? 'الموعد النهائي' : 'Deadline'}</div>
                      <div className="font-bold text-sm text-red-700">{formatDate(job.deadline)}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{isArabic ? 'التفاصيل' : 'Details'}</h3>
                <p className="leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'rgb(var(--text-secondary))' }}>{job.description}</p>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{isArabic ? 'المهارات المطلوبة' : 'Required Skills'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium border border-primary-100"
                      >
                        {isArabic ? skill.nameAr : skill.nameEn || skill.nameAr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.attachments && job.attachments.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>{isArabic ? 'المرفقات' : 'Attachments'}</h3>
                  <div className="space-y-2">
                    {job.attachments.map((attachment) => {
                      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(attachment.fileName);
                      return isImage ? (
                        <div key={attachment.id} className="rounded-lg overflow-hidden border mb-3" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                          <div className="relative h-64 sm:h-80 w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                            <img
                              src={getImageUrl(attachment.fileUrl)}
                              alt={attachment.fileName}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="p-3 text-sm flex justify-between items-center" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                            <span className="truncate max-w-[70%]" style={{ color: 'rgb(var(--text-primary))' }}>{attachment.fileName}</span>
                            <a
                              href={getImageUrl(attachment.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 font-medium text-xs flex items-center gap-1"
                            >
                              <FaPaperclip size={12} /> {isArabic ? 'فتح الصورة' : 'Open Image'}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <a
                          key={attachment.id}
                          href={getImageUrl(attachment.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 rounded-lg hover:opacity-90 transition-colors border"
                          style={{ backgroundColor: 'rgb(var(--bg-tertiary))', borderColor: 'rgb(var(--border-primary))' }}
                        >
                          <FaPaperclip style={{ color: 'rgb(var(--text-secondary))' }} />
                          <span style={{ color: 'rgb(var(--text-primary))' }}>{attachment.fileName}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {job.proposals && job.proposals.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isArabic ? 'العروض' : 'Proposals'} ({job.proposals.length})
                </h2>

                <div className="space-y-4">
                  {job.proposals.map((proposal: Proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-6" style={{ backgroundColor: 'rgb(var(--bg-secondary))', borderColor: 'rgb(var(--border-secondary))' }}>
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={getImageUrl(proposal.freelancerAvatar)}
                          alt={proposal.freelancerName}
                          className="w-16 h-16 avatar"
                        />
                        <div className="flex-1">
                          <Link
                            href={`/freelancers/${proposal.freelancerId}`}
                            className="text-lg font-bold hover:text-primary-600 transition-colors"
                            style={{ color: 'rgb(var(--text-primary))' }}
                          >
                            {proposal.freelancerName}
                          </Link>
                          <div className="flex items-center gap-4 mt-1">
                            <StarRating rating={proposal.freelancerRating} size="sm" />
                            <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                              {proposal.freelancerCompletedJobs} {isArabic ? 'مشروع مكتمل' : 'completed projects'}
                            </span>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(proposal.status) as any}>
                          {getStatusText(proposal.status)}
                        </Badge>
                      </div>

                      <p className="mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>{proposal.description}</p>

                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex gap-6">
                          <div>
                            <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{isArabic ? 'السعر المقترح' : 'Proposed Price'}</span>
                            <div className="font-bold text-lg text-green-600">
                              {formatCurrency(proposal.proposedPrice)}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{isArabic ? 'المدة المقترحة' : 'Proposed Duration'}</span>
                            <div className="font-bold text-lg text-blue-600">
                              {proposal.proposedDurationInDays} {isArabic ? 'يوم' : 'days'}
                            </div>
                          </div>
                        </div>

                        {isOwner && proposal.status === 'Pending' && (
                          <button
                            onClick={() => handleAcceptProposal(proposal.id)}
                            className="btn btn-primary"
                          >
                            {isArabic ? 'قبول العرض' : 'Accept Proposal'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {/* Project Owner Card - only show to non-owners */}
            {!isOwner && (
              <div className="card mb-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
                  {isArabic ? 'صاحب المشروع' : 'Project Owner'}
                </h3>
                <div className="text-center">
                  <img
                    src={getImageUrl(job.clientAvatar || null)}
                    alt={job.clientName || 'Client'}
                    className="w-24 h-24 avatar mx-auto mb-4"
                  />
                  <h4 className="font-bold text-lg mb-1" style={{ color: 'rgb(var(--text-primary))' }}>{job.clientName}</h4>
                  {job.clientCompany && <p className="text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>{job.clientCompany}</p>}
                  {isAuthenticated && (
                    <Link
                      href={`/messages?user=${job.clientId}${job.clientName ? `&name=${encodeURIComponent(job.clientName)}` : ''}${job.clientAvatar ? `&avatar=${encodeURIComponent(job.clientAvatar)}` : ''}`}
                      className="btn btn-outline w-full flex items-center justify-center gap-2"
                    >
                      <FaEnvelope />
                      <span>{isArabic ? 'إرسال رسالة' : 'Send Message'}</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Owner Actions - Edit & Delete */}
            {isAuthenticated && isOwner && (
              <div className="card mb-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
                  {isArabic ? 'إدارة المشروع' : 'Manage Project'}
                </h3>
                <div className="space-y-3">
                  {/* Edit & Delete - Only show for Pending status */}
                  {job.status === 'Pending' ? (
                    <>
                      <Link
                        href={`/jobs/edit/${job.id}`}
                        className="btn btn-outline w-full flex items-center justify-center gap-2"
                      >
                        <FaEdit />
                        <span>{isArabic ? 'تعديل المشروع' : 'Edit Project'}</span>
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="btn bg-red-500 text-white hover:bg-red-600 w-full flex items-center justify-center gap-2"
                      >
                        <FaTrash />
                        <span>{isArabic ? 'حذف المشروع' : 'Delete Project'}</span>
                      </button>
                    </>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm text-center">
                        {job.status === 'InProgress'
                          ? (isArabic
                            ? '⚠️ لا يمكن تعديل أو حذف المشروع. تم قبول عرض لهذا المشروع.'
                            : '⚠️ Cannot edit or delete. An offer has been accepted for this project.')
                          : job.status === 'Completed'
                            ? (isArabic
                              ? '⚠️ لا يمكن تعديل أو حذف المشروع. تم إكمال هذا المشروع.'
                              : '⚠️ Cannot edit or delete. This project has been completed.')
                            : (isArabic
                              ? '⚠️ لا يمكن تعديل أو حذف هذا المشروع.'
                              : '⚠️ This project cannot be edited or deleted.')
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Freelancer Submit Proposal */}
            {isAuthenticated && isFreelancer && job.status === 'Pending' && !isOwner && (
              <div className="card mb-6">
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="btn btn-primary w-full"
                >
                  {isArabic ? 'أرسل عرضك' : 'Submit Proposal'}
                </button>
              </div>
            )}

            {/* Login prompt for guests */}
            {!isAuthenticated && (
              <div className="card">
                <p className="mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {isArabic ? 'سجل الدخول لإرسال عرضك' : 'Login to submit your proposal'}
                </p>
                <Link href="/login" className="btn btn-primary w-full">
                  {isArabic ? 'تسجيل الدخول' : 'Login'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl max-w-lg w-full p-8 shadow-xl" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'rgb(var(--text-primary))' }}>
              {isArabic ? 'إرسال عرض' : 'Submit Proposal'}
            </h3>
            <form
              onSubmit={handleSubmitProposal}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
                  const tagName = (e.target as HTMLElement).tagName.toLowerCase();
                  if (tagName === 'textarea') return;
                  e.preventDefault();
                  const form = e.currentTarget;
                  if (form && typeof form.requestSubmit === 'function') {
                    form.requestSubmit();
                  }
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="label">
                    {isArabic ? 'وصف العرض' : 'Proposal Description'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={proposalData.description}
                    onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                    className="input min-h-[150px]"
                    placeholder={isArabic ? 'اشرح كيف ستنجز هذا المشروع...' : 'Explain how you will complete this project...'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      {isArabic ? 'السعر المقترح (ريال)' : 'Proposed Price (SAR)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={proposalData.proposedPrice}
                      onChange={(e) => setProposalData({ ...proposalData, proposedPrice: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="label">
                      {isArabic ? 'المدة المقترحة (يوم)' : 'Proposed Duration (days)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={proposalData.proposedDurationInDays}
                      onChange={(e) =>
                        setProposalData({ ...proposalData, proposedDurationInDays: e.target.value })
                      }
                      className="input"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="btn btn-outline flex-1"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={submittingProposal} className="btn btn-primary flex-1">
                    {submittingProposal
                      ? (isArabic ? 'جاري الإرسال...' : 'Submitting...')
                      : (isArabic ? 'إرسال العرض' : 'Submit Proposal')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl max-w-md w-full p-8 text-center shadow-xl" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-3xl text-red-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
              {isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h3>
            <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
              {isArabic
                ? 'هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this project? This action cannot be undone.'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline flex-1"
                disabled={deleting}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={deleting}
                className="btn bg-red-500 text-white hover:bg-red-600 flex-1"
              >
                {deleting
                  ? (isArabic ? 'جاري الحذف...' : 'Deleting...')
                  : (isArabic ? 'نعم، احذف' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;




