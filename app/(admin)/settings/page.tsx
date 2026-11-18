'use client';

// The organization settings hub.
//
// Organization Settings, Model Access and Pricing used to be three separate
// sidebar items, split across two groups — configuration sitting beside daily
// work, with "Organization" holding both the employee roster and the branding
// screen. They are all rarely-visited setup, so they share one entry now.
//
// A list with rules rather than a grid of cards: three destinations read top to
// bottom, each needing a line of explanation that a nav label never had room
// for.

import Link from 'next/link';
import { ArrowRight2 } from 'iconsax-react';
import { PageHeader } from '@/app/components/ui';

const ROWS = [
  {
    name: 'Organization',
    href: '/organization',
    blurb:
      'Your institution’s name, logo and national coat of arms. Both marks appear on every certificate, badge, Book of Records and Hall of Fame record.',
  },
  {
    name: 'Model access',
    href: '/model-access',
    blurb:
      'Which of the mathematical models your staff may run, and who may run them.',
  },
  {
    name: 'Plan and billing',
    href: '/pricing',
    blurb:
      'Your current plan, what it includes, and how to change it. Your institution type and tier decide which models are available.',
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Settings"
        subtitle="How your organization is set up on PES."
      />

      <ul className="divide-y divide-line border-y border-line">
        {ROWS.map((row) => (
          <li key={row.href}>
            <Link
              href={row.href}
              className="group flex items-center gap-4 py-5 transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
            >
              <div className="min-w-0 flex-1">
                <span className="text-base font-semibold text-strong group-hover:text-pes">
                  {row.name}
                </span>
                <p className="mt-1 text-sm text-body">{row.blurb}</p>
              </div>
              <ArrowRight2
                size={18}
                className="shrink-0 text-muted group-hover:text-pes"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
