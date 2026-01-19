import FreelancerList from '@/components/pages/freelancers/FreelancerList';
import { userService } from '@/services/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FreelancersPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const searchTerm = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const nationality = typeof searchParams.nationality === 'string' ? searchParams.nationality : undefined;
  const minRating = typeof searchParams.minRating === 'string' ? parseFloat(searchParams.minRating) : undefined;
  const skillIds = typeof searchParams.skillIds === 'string'
    ? searchParams.skillIds.split(',').map(Number)
    : undefined;

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const pageSize = 12;

  let initialData = {
    freelancers: [] as any[],
    totalPages: 1,
    totalCount: 0,
    pageNumber: page,
    pageSize: pageSize
  };

  try {
    const response = await userService.searchFreelancers({
      searchTerm,
      nationality,
      minRating,
      skillIds,
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
    <FreelancerList
      initialFreelancers={initialData.freelancers || []}
      initialPagination={{
        pageNumber: page,
        pageSize: pageSize,
        totalPages: initialData.totalPages || 1,
        totalCount: initialData.totalCount || 0
      }}
    />
  );
}
