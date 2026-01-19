'use client';

import { useState, useEffect, useCallback, Suspense } from 'react'; // Added Suspense
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { jobService } from '@/services/api';
import JobCard from '@/components/Cards/JobCard';
import Loading from '@/components/Common/Loading';
import { debounce } from '@/utils/helpers';
import type { JobRequest } from '@/types';
// import styles from './JobList.module.css'; // Removed unused import if not verified, but keeping if styles are used elsewhere. 

interface Filters {
  minBudget: string;
  maxBudget: string;
  status: string;
}

interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

interface JobListProps {
  initialJobs: JobRequest[];
  initialPagination: Pagination;
}

const JobListContent = ({ initialJobs, initialPagination }: JobListProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<Filters>({
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    status: searchParams.get('status') || 'Pending',
  });

  const [jobs, setJobs] = useState<JobRequest[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);

  // Create a query string generator
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      // Reset page when filters change (unless updating page itself)
      if (name !== 'page') {
        params.set('page', '1');
      }

      return params.toString();
    },
    [searchParams]
  );

  // Function to update URL
  const updateUrl = (newParams: URLSearchParams) => {
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Get values directly from URL to ensure sync
      const currentSearch = searchParams.get('q') || '';
      const currentStatus = searchParams.get('status') || 'Pending';
      const currentMin = searchParams.get('minBudget');
      const currentMax = searchParams.get('maxBudget');
      const currentPage = parseInt(searchParams.get('page') || '1');

      const response = await jobService.searchJobs({
        searchTerm: currentSearch,
        status: currentStatus,
        minBudget: currentMin ? parseFloat(currentMin) : undefined,
        maxBudget: currentMax ? parseFloat(currentMax) : undefined,
        pageNumber: currentPage,
        pageSize: pagination.pageSize,
      });

      setJobs(response.data.jobRequests || []);
      setPagination(prev => ({
        ...prev,
        pageNumber: currentPage,
        totalPages: response.data.totalPages || 1,
        totalCount: response.data.totalCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  }, [searchParams, pagination.pageSize]);

  // Fetch when URL params change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Sync local state when URL changes (handling browser back/forward)
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setFilters({
      minBudget: searchParams.get('minBudget') || '',
      maxBudget: searchParams.get('maxBudget') || '',
      status: searchParams.get('status') || 'Pending',
    });
  }, [searchParams]);

  const handleSearch = debounce((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    updateUrl(params);
  }, 500);

  // Update local state immediately for input UI
  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value })); // Update local UI immediately
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    updateUrl(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    updateUrl(params);
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>تصفح الإعلانات</h1>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>اعثر على المشروع المثالي لمهاراتك</p>
        </div>

        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                placeholder="ابحث عن مشروع..."
                onChange={onSearchInputChange}
                className="input pr-12"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-outline flex items-center gap-2 ${showFilters ? 'bg-primary-50 text-primary-600' : ''}`}
            >
              <FaFilter />
              تصفية
            </button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t" style={{ borderColor: 'rgb(var(--border-secondary))' }}>
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

        <div className="mb-6">
          <p style={{ color: 'rgb(var(--text-secondary))' }}>
            عرض <span className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{jobs.length}</span> من{' '}
            <span className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{pagination.totalCount}</span> مشروع
          </p>
        </div>

        {loading ? (
          <Loading />
        ) : jobs.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.pageNumber - 1)}
                  disabled={pagination.pageNumber === 1}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${pagination.pageNumber === index + 1
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-primary-50'
                        }`}
                      style={pagination.pageNumber !== index + 1 ? {
                        backgroundColor: 'rgb(var(--bg-secondary))',
                        color: 'rgb(var(--text-primary))',
                        border: '1px solid rgb(var(--border-secondary))'
                      } : {}}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
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
            <h3 className="text-xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>لا توجد مشاريع</h3>
            <p style={{ color: 'rgb(var(--text-secondary))' }}>جرب تغيير معايير البحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap in Suspense for Next.js build time compatibility
const JobList = (props: JobListProps) => (
  <Suspense fallback={<Loading />}>
    <JobListContent {...props} />
  </Suspense>
);

export default JobList;

