import PublicProfile from '@/components/pages/freelancers/PublicProfile';
import { userService } from '@/services/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FreelancerProfilePage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  let profileData = null;

  try {
    const response = await userService.getFreelancerDetails(id);
    profileData = response.data;
  } catch (error) {
    console.error("Failed to fetch profile on server", error);
  }

  return <PublicProfile initialProfile={profileData} />;
}




