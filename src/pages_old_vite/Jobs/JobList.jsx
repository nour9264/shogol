import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { jobService } from '../../services/api';
import JobCard from '../../components/Cards/JobCard';
import Loading from '../../components/Common/Loading';
import { debounce } from '../../utils/helpers';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minBudget: '',
    maxBudget: '',
    status: 'Pending',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    fetchJobs();
  }, [pagination.pageNumber, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobService.searchJobs({
        searchTerm,
        ...filters,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      });

      setJobs(response.data.jobRequests);
      setPagination({
        ...pagination,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  };

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
    setPagination({ ...pagination, pageNumber: 1 });
    fetchJobs();
  }, 500);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, pageNumber: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تصفح الإعلانات</h1>
          <p className="text-gray-600">اعثر على المشروع المثالي لمهاراتك</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن مشروع..."
                onChange={(e) => handleSearch(e.target.value)}
                className="input pr-12"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center gap-2"
            >
              <FaFilter />
              تصفية
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <label className="label">الحد الأدنى للميزانية</label>
                <input
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                  className="input"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="label">الحد الأقصى للميزانية</label>
                <input
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                  className="input"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="label">الحالة</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input"
                >
                  <option value="">الكل</option>
                  <option value="Pending">مفتوح</option>
                  <option value="InProgress">قيد التنفيذ</option>
                  <option value="Completed">مكتمل</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            عرض <span className="font-bold text-gray-900">{jobs.length}</span> من{' '}
            <span className="font-bold text-gray-900">{pagination.totalCount}</span> مشروع
          </p>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <Loading />
        ) : jobs.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, pageNumber: pagination.pageNumber - 1 })}
                  disabled={pagination.pageNumber === 1}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPagination({ ...pagination, pageNumber: index + 1 })}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
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
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد مشاريع</h3>
            <p className="text-gray-600">جرب تغيير معايير البحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;

