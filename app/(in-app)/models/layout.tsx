'use client';

// One guard for all fourteen model pages.
//
// The models index only renders the cards a plan includes; typing the URL
// bypassed that entirely and opened the page. This sits above every page under
// /models and asks the server the same question the API routes ask — so a page
// that loads is a page whose data will load too, and one the plan excludes says
// so instead of failing later with an empty table.
//
// This is presentation. The enforcement is requireEntitlement / requireModel in
// the routes: a page the plan excludes must not merely be hidden.

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useModelAccess } from '@/app/components/useModelAccess';
import { modelForPath } from '@/app/lib/models/catalog';

export default function ModelsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const access = useModelAccess();

  // The index itself lists what is available; it is not a model.
  const model = pathname === '/models' ? null : modelForPath(pathname);

  if (!model) return <>{children}</>;

  if (access.loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pes border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!access.models.includes(model.key)) {
    return (
      <div className="p-8 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-dashed border-line p-12 text-center shadow-sm">
          <h1 className="text-lg font-medium text-strong mb-2">{model.label} is not available</h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            This model is not included in your organization&apos;s plan, or your
            administrator has not given your role access to it.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/models"
              className="text-sm font-medium text-pes-600 hover:text-pes-700"
            >
              Back to models
            </Link>
            <span className="text-line">•</span>
            <Link
              href="/pricing"
              className="text-sm font-medium text-pes-600 hover:text-pes-700"
            >
              See plans
            </Link>
            <span className="text-line">•</span>
            <Link
              href="/help#plans"
              className="text-sm font-medium text-pes-600 hover:text-pes-700"
            >
              What each plan includes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
