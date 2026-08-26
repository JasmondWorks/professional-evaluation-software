/**
 * Backfill for appraisal target templates.
 *
 *   npx tsx scripts/backfill-appraisal-templates.ts            # report only
 *   npx tsx scripts/backfill-appraisal-templates.ts --apply
 *   DATABASE_URL=<neon> npx tsx scripts/backfill-appraisal-templates.ts --apply
 *
 * Two jobs:
 *
 *   1. Create the two system templates from the shipped constants.
 *
 *   2. For every organization whose existing period targets differ from those
 *      constants, keep the difference. The client asked on 26 August 2026 that
 *      edited targets be converted into a custom template named so it is
 *      obvious they are not the standard, rather than reset, because resetting
 *      would silently move results already recorded.
 *
 * Nobody's score may move. Existing appraisal_target rows are never touched;
 * this only creates templates and points each organization at the right one, and
 * binds past periods to whatever they were actually scored against.
 */
import { PrismaClient } from '@prisma/client';
import {
  ensureSystemTemplates,
  standardRowsFor,
  type TemplateScope,
} from '../app/lib/appraisal/templates';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const MIGRATED_NAME = 'Custom scheme (migrated from edited targets)';

type Key = string;
const keyOf = (r: { position: string | null; post: string | null; cadre: string | null; category: string | null }) =>
  `${r.position ?? ''}|${r.post ?? ''}|${r.cadre ?? ''}|${r.category ?? ''}`;

function standardMap(scope: TemplateScope): Map<Key, number> {
  return new Map(standardRowsFor(scope).map((r) => [keyOf(r), Number(r.target)]));
}

async function main() {
  const target = (process.env.DATABASE_URL ?? '').includes('neon.tech') ? 'Neon' : 'local';
  console.log(`\nAppraisal templates backfill — ${target} database — ${APPLY ? 'APPLYING' : 'dry run'}\n`);

  // ---- 1. system templates -------------------------------------------------
  let systemIds: Record<TemplateScope, string>;
  if (APPLY) {
    systemIds = await ensureSystemTemplates();
    console.log('System templates ready:');
    for (const [scope, id] of Object.entries(systemIds)) {
      const n = await prisma.appraisal_template_target.count({ where: { template_id: id } });
      console.log(`  ${scope.padEnd(13)} ${n} targets`);
    }
  } else {
    console.log('System templates would be created for: academic, non_academic');
    for (const scope of ['academic', 'non_academic'] as TemplateScope[]) {
      console.log(`  ${scope.padEnd(13)} ${standardRowsFor(scope).length} targets`);
    }
    systemIds = { academic: '', non_academic: '' };
  }

  // ---- 2. organizations with edited targets --------------------------------
  const orgs = await prisma.org.findMany({ select: { name: true, category: true } });
  console.log(`\nChecking ${orgs.length} organization(s) for edited targets:\n`);

  for (const org of orgs) {
    // The most recent period is what its current targets reflect.
    const period = await prisma.appraisal_period.findFirst({
      where: { org: org.name },
      orderBy: { starts_on: 'desc' },
      select: { id: true, starts_on: true },
    });
    if (!period) {
      console.log(`  ${org.name}: no periods, nothing to migrate`);
      continue;
    }

    const rows = await prisma.appraisal_target.findMany({ where: { org: org.name, period_id: period.id } });
    if (rows.length === 0) {
      console.log(`  ${org.name}: no targets recorded, nothing to migrate`);
      continue;
    }

    for (const scope of ['academic', 'non_academic'] as TemplateScope[]) {
      const mine = rows.filter((r) => r.model === scope);
      if (mine.length === 0) continue;

      const standard = standardMap(scope);
      const differences: string[] = [];
      for (const r of mine) {
        const k = keyOf(r);
        const std = standard.get(k);
        const val = Number(r.target);
        if (std === undefined) differences.push(`${k} added (${val})`);
        else if (std !== val) differences.push(`${k} ${std} to ${val}`);
      }
      for (const [k, std] of standard) {
        if (!mine.some((r) => keyOf(r) === k)) differences.push(`${k} removed (was ${std})`);
      }

      if (differences.length === 0) {
        console.log(`  ${org.name} / ${scope}: matches the standard`);
        if (APPLY) {
          await prisma.org_template_choice.upsert({
            where: { org_scope: { org: org.name, scope } },
            update: {},
            create: { org: org.name, scope, template_id: systemIds[scope], chosen_by: 'backfill' },
          });
        }
        continue;
      }

      console.log(`  ${org.name} / ${scope}: ${differences.length} difference(s)`);
      for (const d of differences.slice(0, 4)) console.log(`      ${d}`);
      if (differences.length > 4) console.log(`      and ${differences.length - 4} more`);

      if (!APPLY) continue;

      const existing = await prisma.appraisal_template.findFirst({
        where: { org: org.name, scope, name: MIGRATED_NAME },
      });
      if (existing) {
        console.log('      already migrated, left alone');
        continue;
      }

      // Born ready and approved: these figures are already in use and scores
      // have been recorded against them. Blocking them behind an approval
      // would leave the organization unable to open its next period.
      const created = await prisma.appraisal_template.create({
        data: {
          scope,
          name: MIGRATED_NAME,
          org: org.name,
          is_system: false,
          status: 'ready',
          created_by: 'backfill',
          ready_at: new Date(),
          ready_by: 'backfill',
          approved_at: new Date(),
          approved_by: 'backfill',
        },
      });

      await prisma.appraisal_template_target.createMany({
        data: mine.map((r) => ({
          template_id: created.id,
          position: r.position,
          post: r.post,
          cadre: r.cadre,
          category: r.category,
          target: r.target,
        })),
        skipDuplicates: true,
      });

      await prisma.org_template_choice.upsert({
        where: { org_scope: { org: org.name, scope } },
        update: { template_id: created.id, chosen_by: 'backfill' },
        create: { org: org.name, scope, template_id: created.id, chosen_by: 'backfill' },
      });

      console.log(`      created "${MIGRATED_NAME}" with ${mine.length} targets and put it in force`);
    }

    // Bind past periods to what they were actually scored against, so the badge
    // can show it and history stays truthful.
    if (APPLY) {
      const choices = await prisma.org_template_choice.findMany({ where: { org: org.name } });
      const byScope = Object.fromEntries(choices.map((c) => [c.scope, c.template_id]));
      await prisma.appraisal_period.updateMany({
        where: { org: org.name, academic_template_id: null },
        data: { academic_template_id: byScope.academic ?? null },
      });
      await prisma.appraisal_period.updateMany({
        where: { org: org.name, non_academic_template_id: null },
        data: { non_academic_template_id: byScope.non_academic ?? null },
      });
    }
  }

  console.log(
    APPLY
      ? '\nDone. No appraisal_target row was modified, so no recorded score has moved.\n'
      : '\nDry run. Re-run with --apply to make these changes.\n',
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
