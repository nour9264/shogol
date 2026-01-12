import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../../services/api';
import Loading from '../../components/Common/Loading';
import StarRating from '../../components/Common/StarRating';
import Badge from '../../components/Common/Badge';
import { FaMapMarkerAlt, FaBriefcase, FaEnvelope } from 'react-icons/fa';
import { getImageUrl, getProficiencyText } from '../../utils/helpers';

const FreelancerProfile = () => {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancerDetails();
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

  if (loading) return <Loading fullScreen />;
  if (!freelancer) return <div className="text-center py-16">المستقل غير موجود</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <img
                src={getImageUrl(freelancer.profilePictureUrl)}
                alt={freelancer.fullName}
                className="w-32 h-32 avatar mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{freelancer.fullName}</h2>
              {freelancer.accountType === 'Company' && freelancer.companyName && (
                <p className="text-gray-600 mb-4">{freelancer.companyName}</p>
              )}
              <StarRating rating={freelancer.rating} size="lg" />
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
                <FaMapMarkerAlt />
                <span>{freelancer.nationality || 'غير محدد'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
                <FaBriefcase />
                <span>{freelancer.completedJobsCount} مشروع مكتمل</span>
              </div>
              <button className="btn btn-primary w-full mt-6">
                <FaEnvelope className="ml-2" />
                إرسال رسالة
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {freelancer.bio && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4">نبذة عني</h3>
                <p className="text-gray-700 leading-relaxed">{freelancer.bio}</p>
              </div>
            )}

            {/* Skills */}
            {freelancer.skills && freelancer.skills.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4">المهارات</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {freelancer.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{skill.nameAr}</span>
                      <Badge variant="primary">{getProficiencyText(skill.proficiencyLevel)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {freelancer.portfolios && freelancer.portfolios.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4">معرض الأعمال</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {freelancer.portfolios.map((portfolio) => (
                    <div key={portfolio.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {portfolio.imageUrl && (
                        <img
                          src={getImageUrl(portfolio.imageUrl)}
                          alt={portfolio.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-2">{portfolio.title}</h4>
                        {portfolio.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{portfolio.description}</p>
                        )}
                      </div>
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

