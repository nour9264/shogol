import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import StarRating from '../../components/Common/StarRating';
import { getImageUrl } from '../../utils/helpers';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        <div className="card">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
            <Link to="/profile/edit" className="btn btn-outline">
              <FaEdit className="ml-2" />
              تعديل
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <img
              src={getImageUrl(user.profilePictureUrl)}
              alt={user.firstName}
              className="w-32 h-32 avatar"
            />

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="mb-4">
                <StarRating rating={user.rating} />
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-600">المشاريع المكتملة:</span>
                  <span className="font-bold ml-2">{user.completedJobsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {user.bio && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold mb-4">نبذة عني</h3>
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

