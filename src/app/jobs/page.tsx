import JobList from '@/components/pages/jobs/JobList';
import { jobService } from '@/services/api';
import { JobRequest } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const searchTerm = typeof searchParams.q === 'string' ? searchParams.q : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'Pending';
  const minBudget = typeof searchParams.minBudget === 'string' ? parseFloat(searchParams.minBudget) : undefined;
  const maxBudget = typeof searchParams.maxBudget === 'string' ? parseFloat(searchParams.maxBudget) : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const pageSize = 12;

  let initialData = {
    jobRequests: [] as JobRequest[],
    totalPages: 1,
    totalCount: 0,
    pageNumber: page,
    pageSize: pageSize
  };

  try {
    const response = await jobService.searchJobs({
      searchTerm,
      status,
      minBudget,
      maxBudget,
      pageNumber: page,
      pageSize,
    });

    if (response.data) {
      initialData = {
        ...initialData,
        ...response.data
      };
    }
  } catch (e) {
    console.error("Server fetch failed", e);
  }

  return (
    <JobList
      initialJobs={initialData.jobRequests || []}
      initialPagination={{
        pageNumber: page,
        pageSize: pageSize,
        totalPages: initialData.totalPages || 0,
        totalCount: initialData.totalCount || 0
      }}
    />
  );
}

