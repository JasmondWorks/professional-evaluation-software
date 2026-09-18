// The user guide, at /help.
//
// Public on purpose: someone evaluating PES should be able to read what it does
// and what each plan includes before they have an account, and someone locked
// out of theirs should be able to reach the troubleshooting section. It is
// outside middleware.ts's matcher, so no role cookie is required.

import type { Metadata } from 'next';
import { Suspense } from 'react';
import GuideClient from './GuideClient';
import './guide.css';

export const metadata: Metadata = {
  title: 'PES User Guide',
  description:
    'How Performance Evaluation Software works, by role: setup, the appraisal, performance and stress cycles, the fourteen mathematical models, and what each plan includes.',
};

export default function HelpPage() {
  // The guide reads ?role= and ?type= to open on the reader's own part of it,
  // which needs a Suspense boundary — without one, useSearchParams opts the
  // whole page out of static rendering.
  return (
    <Suspense fallback={null}>
      <GuideClient />
    </Suspense>
  );
}
