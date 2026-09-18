'use client';

import { RouteTabs } from '@/app/components/ui/tabs';

// Another one-off tab bar — yellow on grey, matching nothing else. Now the
// shared control, on the shared surface.
export default function Nav({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <nav className="flex w-full justify-center border-b border-line bg-surface px-4 py-3">
        <RouteTabs
          items={[
            { href: '/book-of-record', label: 'Appraisal' },
            { href: '/book-of-record/performance', label: 'Performance' },
          ]}
        />
      </nav>
      <div className="w-full flex-1">{children}</div>
    </div>
  );
}
