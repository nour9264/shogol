import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService, proposalService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Common/Loading';
import Badge from '../../components/Common/Badge';
import StarRating from '../../components/Common/StarRating';
import Modal from '../../components/Common/Modal';
import { 
  FaMoneyBillWave, 
  FaClock, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaPaperclip,
  FaUser,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { 
  formatCurrency, 
  formatDate, 
  formatRelativeTime, 
  getImageUrl, 
  getStatusColor, 
  getStatusText 
} from '../../utils/helpers';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFreelancer, isClient, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalData, setProposalData] = useState({
    description: '',
    proposedPrice: '',
    proposedDurationInDays: '',
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobService.getJobDetails(id);
      setJob(response.data);
    } catch (error) {
      showError('فشل تحميل تفاصيل المشروع');
    }
    setLoading(false);
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    
    if (!proposalData.description || !proposalData.proposedPrice || !proposalData.proposedDurationInDays) {
      showError('يرجى ملء جميع الحقول');
      return;
    }

    setSubmittingProposal(true);
    try {
      await proposalService.createProposal({
        jobRequestId: parseInt(id),
        ...proposalData,
        proposedPrice: parseFloat(proposalData.proposedPrice),
        proposedDurationInDays: parseInt(proposalData.proposedDurationInDays),
      });
      
      success('تم إرسال العرض بنجاح');
      setShowProposalModal(false);
      fetchJobDetails();
    } catch (error) {
      showError(error.response?.data?.message || 'فشل إرسال العرض');
    }
    setSubmittingProposal(false);
  };

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا العرض؟')) return;

    try {
      await proposalService.acceptProposal(proposalId);
      success('تم قبول العرض بنجاح');
      fetchJobDetails();
    } catch (error) {
      showError('فشل قبول العرض');
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!job) return <div className="text-center py-16">المشروع غير موجود</div>;

  const isOwner = user?.id === job.clientId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="card mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaCalendar />
                      <span>{formatRelativeTime(job.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser />
                      <span>{job.proposalsCount} عرض</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusColor(job.status)}>
                  {getStatusText(job.status)}
                </Badge>
              </div>

              {/* Job Details */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <FaMoneyBillWave className="text-2xl text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">الميزانية</div>
                    <div className="font-bold text-lg">{formatCurrency(job.budget)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <FaClock className="text-2xl text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">المدة</div>
                    <div className="font-bold text-lg">{job.durationInDays} يوم</div>
                  </div>
                </div>

                {job.deadline && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                    <FaCalendar className="text-2xl text-red-600" />
                    <div>
                      <div className="text-sm text-gray-600">الموعد النهائي</div>
                      <div className="font-bold text-sm">{formatDate(job.deadline)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">التفاصيل</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">المهارات المطلوبة</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                      >
                        {skill.nameAr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {job.attachments && job.attachments.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">المرفقات</h3>
                  <div className="space-y-2">
                    {job.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={getImageUrl(attachment.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FaPaperclip className="text-gray-500" />
                        <span className="text-gray-700">{attachment.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Proposals */}
            {job.proposals && job.proposals.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  العروض ({job.proposals.length})
                </h2>

                <div className="space-y-4">
                  {job.proposals.map((proposal) => (
                    <div key={proposal.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={getImageUrl(proposal.freelancerAvatar)}
                          alt={proposal.freelancerName}
                          className="w-16 h-16 avatar"
                        />
                        <div className="flex-1">
                          <Link
                            to={`/freelancers/${proposal.freelancerId}`}
                            className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {proposal.freelancerName}
                          </Link>
                          <div className="flex items-center gap-4 mt-1">
                            <StarRating rating={proposal.freelancerRating} size="sm" />
                            <span className="text-sm text-gray-600">
                              {proposal.freelancerCompletedJobs} مشروع مكتمل
                            </span>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(proposal.status)}>
                          {getStatusText(proposal.status)}
                        </Badge>
                      </div>

                      <p className="text-gray-700 mb-4">{proposal.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-6">
                          <div>
                            <span className="text-sm text-gray-600">السعر المقترح</span>
                            <div className="font-bold text-lg text-green-600">
                              {formatCurrency(proposal.proposedPrice)}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">المدة المقترحة</span>
                            <div className="font-bold text-lg text-blue-600">
                              {proposal.proposedDurationInDays} يوم
                            </div>
                          </div>
                        </div>

                        {isOwner && proposal.status === 'Pending' && (
                          <button
                            onClick={() => handleAcceptProposal(proposal.id)}
                            className="btn btn-primary"
                          >
                            قبول العرض
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Client Card */}
            <div className="card mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">صاحب المشروع</h3>
              <div className="text-center">
                <img
                  src={getImageUrl(job.clientAvatar)}
                  alt={job.clientName}
                  className="w-24 h-24 avatar mx-auto mb-4"
                />
                <h4 className="font-bold text-lg text-gray-900 mb-1">{job.clientName}</h4>
                {job.clientCompany && (
                  <p className="text-gray-600 text-sm mb-4">{job.clientCompany}</p>
                )}
                <Link to={`/messages?user=${job.clientId}`} className="btn btn-outline w-full">
                  إرسال رسالة
                </Link>
              </div>
            </div>

            {/* Actions */}
            {isAuthenticated && (
              <div className="card">
                {isFreelancer && job.status === 'Pending' && !isOwner && (
                  <button
                    onClick={() => setShowProposalModal(true)}
                    className="btn btn-primary w-full mb-3"
                  >
                    أرسل عرضك
                  </button>
                )}

                {isOwner && (
                  <>
                    <Link to={`/jobs/edit/${job.id}`} className="btn btn-outline w-full mb-3">
                      <FaEdit className="ml-2" />
                      تعديل
                    </Link>
                    <button className="btn bg-red-500 text-white hover:bg-red-600 w-full">
                      <FaTrash className="ml-2" />
                      حذف
                    </button>
                  </>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div className="card">
                <p className="text-gray-600 mb-4">سجل الدخول لإرسال عرضك</p>
                <Link to="/login" className="btn btn-primary w-full">
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      <Modal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        title="إرسال عرض"
      >
        <form onSubmit={handleSubmitProposal}>
          <div className="space-y-4">
            <div>
              <label className="label">
                وصف العرض <span className="text-red-500">*</span>
              </label>
              <textarea
                value={proposalData.description}
                onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                className="input min-h-[150px]"
                placeholder="اشرح كيف ستنجز هذا المشروع..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  السعر المقترح (ريال) <span className="text-red-500">*</span>
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
                  المدة المقترحة (يوم) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={proposalData.proposedDurationInDays}
                  onChange={(e) => setProposalData({ ...proposalData, proposedDurationInDays: e.target.value })}
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
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submittingProposal}
                className="btn btn-primary flex-1"
              >
                {submittingProposal ? 'جاري الإرسال...' : 'إرسال العرض'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetails;

