'use client';

import { useState } from 'react';
import { BackLink, PageHeader } from '@/app/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { appraisalTitle, useIsAcademicOrg } from '@/app/lib/useOrgCategory';
import AppraisalSetup from '@/app/(admin)/appraisal/AppraisalSetup';
import ResultsPanel from '@/app/(admin)/appraisal/ResultsPanel';
import SubmissionsPanel from '@/app/(admin)/appraisal/SubmissionsPanel';

/** The appraisal model's home. Everything the organization admin does for
 *  appraisal lives here rather than as separate nav links, matching how the
 *  stress model is organised. */
const TABS = [
  { key: 'setup', label: 'Setup', hint: 'Period, targets and courses' },
  { key: 'submissions', label: 'Submissions', hint: 'Departments that have submitted' },
  { key: 'results', label: 'Results', hint: 'Evaluate and release' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function AppraisalModelPage() {
  const [tab, setTab] = useState<TabKey>('setup');
  // An institution of learning appraises academic and non-academic staff under
  // one model. Everyone else has one kind of staff, so it is just the appraisal.
  const isAcademicOrg = useIsAcademicOrg();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <BackLink href="/models">Back to models</BackLink>

      <PageHeader
        title={appraisalTitle(isAcademicOrg)}
        subtitle="Open the period, set the targets, then run and release the evaluation. Departments enter the scores."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} syncParam="tab" defaultValue="setup">
        <TabsList aria-label="Appraisal sections" className="mb-6">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} title={t.hint}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="setup" className="mt-0">
          <AppraisalSetup />
        </TabsContent>
        <TabsContent value="submissions" className="mt-0">
          <SubmissionsPanel onGoToSetup={() => setTab('setup')} />
        </TabsContent>
        <TabsContent value="results" className="mt-0">
          <ResultsPanel onGoToSetup={() => setTab('setup')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
