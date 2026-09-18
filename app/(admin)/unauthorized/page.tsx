'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldSlash } from 'iconsax-react';
import { Button, Card, CardBody } from '@/app/components/ui';

/** Where a role-gated route sends somebody who is signed in but not entitled.
 *
 *  This is not an error to apologise for — most people land here from a link that
 *  belongs to a different role, so it says whose page it is and offers the way
 *  back rather than leaving a bare red line on an empty screen. */
export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardBody className="flex flex-col items-center p-8 text-center sm:p-10">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-warning-50 text-warning-700">
            <ShieldSlash size={28} variant="Bulk" />
          </span>

          <h1 className="text-2xl font-semibold text-strong">This page isn&apos;t yours to open</h1>
          <p className="mt-2 max-w-sm text-sm text-body">
            Your account is signed in, but this part of the platform belongs to a different
            role. Nothing has gone wrong, and nothing was changed.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button href="/dashboard">Back to dashboard</Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Go back
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted">
            Need access? Ask your organization administrator — they decide which parts of the
            platform each role can reach. You can also check{' '}
            <Link href="/profile" className="font-medium text-pes hover:underline">
              your profile
            </Link>{' '}
            to see the role you are signed in with.
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
