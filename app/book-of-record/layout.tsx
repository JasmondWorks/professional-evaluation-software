'use client';

import { usePathname } from 'next/navigation';
import { BackLink } from '@/app/components/ui';
import { RouteTabs } from '@/app/components/ui/tabs';

// Another one-off tab bar — yellow on grey, matching nothing else. Now the
// shared control, on the shared surface.
//
// These pages sit outside the (admin) route group, so they get no sidebar: each
// book is a full-screen piece of artwork with its own cover and page-turn, and
// the client asked for them "beautifully designed". The back link is what keeps
// that from being a dead end — before it, the only way out was the browser
// button, and the only way in was typing the URL.
export default function Nav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // This layout wraps the second book as well as the first, and the tab bar
  // used to point at the first book's two routes from inside the second — so
  // "Performance" while reading the 2nd Book of Records navigated you into the
  // 1st. Each book now gets its own pair.
  const isSecond = pathname.startsWith('/book-of-record/second');

  const items = isSecond
    ? [
        { href: '/book-of-record/second', label: 'Appraisal' },
        { href: '/book-of-record/second/performance', label: 'Performance' },
      ]
    : [
        { href: '/book-of-record', label: 'Appraisal' },
        { href: '/book-of-record/performance', label: 'Performance' },
      ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <nav className="flex w-full items-center gap-4 border-b border-line bg-surface px-4 py-3">
        <BackLink href="/dashboard">Back to dashboard</BackLink>
        <span className="text-sm font-semibold text-strong">
          {isSecond ? '2nd Book of Records' : '1st Book of Records'}
        </span>
        <div className="ml-auto">
          <RouteTabs items={items} />
        </div>
      </nav>
      <div className="w-full flex-1">{children}</div>
    </div>
  );
}
