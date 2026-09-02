import AwardPage from '@/app/components/motivation/AwardPage';

// The badge the achievements list links to. It showed "COMPETENCE" for
// everyone; the award now comes through so a badge can say what it is for.
export default function Page({
  params,
  searchParams,
}: {
  params: { user: string };
  searchParams: { award?: string };
}) {
  return (
    <AwardPage
      kind="badge-1st"
      user={params.user}
      award={searchParams.award || 'Competence'}
    />
  );
}
