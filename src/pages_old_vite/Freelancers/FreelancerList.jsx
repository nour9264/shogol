import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { userService } from '../../services/api';
import FreelancerCard from '../../components/Cards/FreelancerCard';
import Loading from '../../components/Common/Loading';
import { debounce } from '../../utils/helpers';

const FreelancerList = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    nationality: '',
    skillIds: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    fetchFreelancers();
  }, [pagination.pageNumber, filters]);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const response = await userService.searchFreelancers({
        searchTerm,
        ...filters,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      });

      setFreelancers(response.data.freelancers);
      setPagination({
        ...pagination,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      });
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    }
    setLoading(false);
  };

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
    setPagination({ ...pagination, pageNumber: 1 });
    fetchFreelancers();
  }, 500);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تصفح المشتغلين</h1>
          <p className="text-gray-600">ابحث عن محترفين موهوبين لمشروعك</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن مستقل..."
                onChange={(e) => handleSearch(e.target.value)}
                className="input pr-12"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center gap-2"
            >
              <FaFilter />
              تصفية
            </button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <label className="label">الحد الأدنى للتقييم</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  className="input"
                >
                  <option value="">الكل</option>
                  <option value="4.5">4.5+ نجوم</option>
                  <option value="4.0">4.0+ نجوم</option>
                  <option value="3.5">3.5+ نجوم</option>
                  <option value="3.0">3.0+ نجوم</option>
                </select>
              </div>

              <div>
                <label className="label">الجنسية</label>
                <select
                  value={filters.nationality}
                  onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}
                  className="input"
                >
                  <option value="">الكل</option>
                  <option value="السعودية">السعودية</option>
                  <option value="مصر">مصر</option>
                  <option value="الإمارات">الإمارات</option>
                  <option value="الأردن">الأردن</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            عرض <span className="font-bold text-gray-900">{freelancers.length}</span> من{' '}
            <span className="font-bold text-gray-900">{pagination.totalCount}</span> مستقل
          </p>
        </div>

        {loading ? (
          <Loading />
        ) : freelancers.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {freelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, pageNumber: pagination.pageNumber - 1 })}
                  disabled={pagination.pageNumber === 1}
                  className="btn btn-outline disabled:opacity-50"
                >
                  السابق
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPagination({ ...pagination, pageNumber: index + 1 })}
                      className={`w-10 h-10 rounded-lg font-medium ${
                        pagination.pageNumber === index + 1
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPagination({ ...pagination, pageNumber: pagination.pageNumber + 1 })}
                  disabled={pagination.pageNumber === pagination.totalPages}
                  className="btn btn-outline disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد مستقلين</h3>
            <p className="text-gray-600">جرب تغيير معايير البحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerList;

