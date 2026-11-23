/** Whether an auditor has actually completed onboarding (questionnaire +
 *  documents) for a given org — not just whether they hold the `auditor`
 *  role.
 *
 *  The role is granted the moment an org admin invites someone by name (that
 *  invite IS the authorization to audit), so role alone no longer proves
 *  onboarding happened — it used to, back when a separate 'auditor_pending'
 *  role existed for exactly that purpose. Every endpoint that lets an
 *  auditor actually DO something (score a referred appraisal, see a queue)
 *  needs this check too; a client-side redirect (AuditorOnboardingGate) is a
 *  UX nicety, not a security boundary — it's trivially skipped by calling the
 *  API directly. */
import prisma from '@/app/api/prisma.dev';

export async function isOnboardedAuditor(auditorId: string | null | undefined, orgId: string | null | undefined): Promise<boolean> {
  if (!auditorId || !orgId) return false;
  const active = await prisma.org_auditor.findFirst({
    where: { auditor_id: auditorId, org_id: orgId, status: 'active' },
    select: { id: true },
  });
  return !!active;
}
