import AwardPage from '@/app/components/motivation/AwardPage';

export default function Page({
  params,
  searchParams,
}: {
  params: { user: string };
  searchParams: { award?: string };
}) {
  return <AwardPage kind="cert-2nd" user={params.user} award={searchParams.award} />;
}
