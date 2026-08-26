/**
 * Walks the appraisal template lifecycle against a throwaway organization.
 *
 *   npx tsx scripts/template-walkthrough.ts
 *
 * Checks each of the client's seven answers is actually enforced, not just
 * written down.
 */
import { PrismaClient } from '@prisma/client';
import {
  approveTemplate,
  duplicateTemplate,
  ensureSystemTemplates,
  listTemplates,
  markTemplateReady,
  newTemplateVersion,
  putInForce,
  scopesForCategory,
  setTemplateTarget,
  templateInForce,
  type Viewer,
} from '../app/lib/appraisal/templates';
import { openPeriod, closePeriod } from '../app/lib/appraisal/service';

const prisma = new PrismaClient();
const ORG = '__templates__';

const estab: Viewer = { org: ORG, name: 'Estab Officer', role: 'admin', productCategory: 'academic' };
const second: Viewer = { org: ORG, name: 'Second Officer', role: 'admin', productCategory: 'academic' };
const company: Viewer = { org: ORG, name: 'Estab Officer', role: 'admin', productCategory: 'company' };

let pass = 0;
let fail = 0;
let step = 0;

function say(who: string, what: string) {
  step++;
  console.log(`\n${String(step).padStart(2, '0')}. [${who}]  ${what}`);
}
function expect(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`      ${ok ? 'as expected' : '>>> UNEXPECTED'}  ${label}: got ${JSON.stringify(got)}${ok ? '' : `, expected ${JSON.stringify(want)}`}`);
}
async function refused(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    fail++;
    console.log(`      >>> UNEXPECTED  ${label}: was allowed`);
  } catch (err: any) {
    pass++;
    console.log(`      as expected  ${label} refused`);
    console.log(`         ${err.message}`);
  }
}

async function cleanup() {
  for (const p of await prisma.appraisal_period.findMany({ where: { org: ORG }, select: { id: true } })) {
    await prisma.appraisal_period.delete({ where: { id: p.id } });
  }
  await prisma.org_template_choice.deleteMany({ where: { org: ORG } });
  await prisma.appraisal_template.deleteMany({ where: { org: ORG } });
  await prisma.org.deleteMany({ where: { name: ORG } });
}

async function main() {
  await cleanup();
  await prisma.org.create({ data: { name: ORG, category: 'academic', plan: 'premium', evaluation: [] } });
  await ensureSystemTemplates();

  // -------------------------------------------------------------------------
  say('System', 'An institution of learning runs both schemes.');
  expect('scopes for academic', scopesForCategory('academic'), ['academic', 'non_academic']);
  expect('scopes for company', scopesForCategory('company'), ['non_academic']);
  expect('scopes for public', scopesForCategory('public'), ['non_academic']);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Lists academic templates before doing anything.');
  const before = await listTemplates(estab, 'academic');
  expect('one template, the standard', before.templates.length, 1);
  expect('it is the system one', before.templates[0].isSystem, true);
  expect('it is selectable', before.templates[0].selectable, true);
  console.log(`      "${before.templates[0].name}" with ${before.templates[0].targetCount} targets`);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Tries to edit the PES standard directly.');
  await refused('editing the standard', () =>
    setTemplateTarget(estab, {
      templateId: before.templates[0].id,
      position: 'lecturer_i',
      category: 'teaching',
      target: 999,
    }),
  );

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Duplicates the standard to make their own.');
  const draft = await duplicateTemplate(estab, {
    templateId: before.templates[0].id,
    name: 'Unilag scheme',
  });
  expect('status', draft.status, 'draft');
  const copied = await prisma.appraisal_template_target.count({ where: { template_id: draft.id } });
  expect('copied a complete set', copied, before.templates[0].targetCount);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Changes one target in the draft.');
  await setTemplateTarget(estab, {
    templateId: draft.id,
    position: 'lecturer_i',
    category: 'teaching',
    target: 200,
  });
  const changed = await prisma.appraisal_template_target.findFirst({
    where: { template_id: draft.id, position: 'lecturer_i', category: 'teaching' },
  });
  expect('new value', Number(changed?.target), 200);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Tries to put the draft in force before it is ready.');
  await refused('a draft in force', () =>
    putInForce(estab, { scope: 'academic', templateId: draft.id }),
  );

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Marks it ready.');
  const ready = await markTemplateReady(estab, draft.id);
  expect('status', ready.status, 'ready');
  expect('who marked it', ready.ready_by, 'Estab Officer');

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Tries to edit it now that it is ready.');
  await refused('editing a ready template', () =>
    setTemplateTarget(estab, {
      templateId: draft.id,
      position: 'lecturer_i',
      category: 'teaching',
      target: 300,
    }),
  );

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Tries to put it in force without approval.');
  await refused('unapproved in force', () =>
    putInForce(estab, { scope: 'academic', templateId: draft.id }),
  );

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Tries to approve their own template.');
  await refused('self-approval', () => approveTemplate(estab, draft.id));

  // -------------------------------------------------------------------------
  say('A second officer', 'Approves it.');
  const approved = await approveTemplate(second, draft.id);
  expect('approved by', approved.approved_by, 'Second Officer');

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Puts it in force for the academic scheme.');
  const forced = await putInForce(estab, { scope: 'academic', templateId: draft.id });
  expect('applies from', forced.appliesFrom, 'immediately');
  const now = await listTemplates(estab, 'academic');
  expect('in force is the custom one', now.inForceId, draft.id);
  expect('the standard is no longer in force', now.templates.find((t) => t.isSystem)?.inForce, false);

  // -------------------------------------------------------------------------
  say('System', 'The non-academic scheme is untouched by that choice.');
  const nonAcad = await templateInForce(ORG, 'non_academic');
  expect('still the standard', nonAcad.is_system, true);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Opens a period. It is scored against what is in force.');
  const period = await openPeriod(estab, {
    frequency: 'yearly',
    startsOn: new Date('2026-01-01'),
    endsOn: new Date('2026-12-31'),
  });
  expect('bound to the custom academic template', period.academic_template_id, draft.id);
  expect('bound to the standard for non-academic', period.non_academic_template_id, nonAcad.id);

  const seeded = await prisma.appraisal_target.findFirst({
    where: { org: ORG, period_id: period.id, position: 'lecturer_i', category: 'teaching' },
  });
  expect('the period got the edited figure', Number(seeded?.target), 200);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Changing the choice mid-period does not move this period.');
  const systemAcademic = now.templates.find((t) => t.isSystem)!;
  const swap = await putInForce(estab, { scope: 'academic', templateId: systemAcademic.id });
  expect('applies from', swap.appliesFrom, 'next_period');
  const stillThere = await prisma.appraisal_target.findFirst({
    where: { org: ORG, period_id: period.id, position: 'lecturer_i', category: 'teaching' },
  });
  expect('open period keeps its target', Number(stillThere?.target), 200);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'A used template is versioned, not edited.');
  const v2 = await newTemplateVersion(estab, draft.id);
  expect('version', v2.version, 2);
  expect('status', v2.status, 'draft');
  const v1 = await prisma.appraisal_template.findUniqueOrThrow({ where: { id: draft.id } });
  expect('version 1 untouched', v1.status, 'ready');

  // -------------------------------------------------------------------------
  say('A company', 'Has no academic scheme at all.');
  await refused('listing academic templates', () => listTemplates(company, 'academic'));

  // -------------------------------------------------------------------------
  await closePeriod(estab, period.id);
  const closed = await prisma.appraisal_period.findUniqueOrThrow({ where: { id: period.id } });
  say('System', 'A closed period still records what it was scored against.');
  expect('template still recorded', closed.academic_template_id, draft.id);

  await cleanup();
  console.log(`\n${pass} checks passed, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main()
  .catch(async (err) => {
    console.error('\nWALKTHROUGH FAILED:', err);
    await cleanup();
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
