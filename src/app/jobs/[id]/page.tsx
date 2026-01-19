import JobDetails from '@/components/pages/jobs/JobDetails';
import { jobService } from '@/services/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  let initialJob = null;

  try {
    const response = await jobService.getJobDetails(parseInt(id));
    initialJob = response.data;
  } catch (error) {
    console.error("Server-side fetch failed for job details", error);
  }

  return <JobDetails initialJob={initialJob} />;
}




