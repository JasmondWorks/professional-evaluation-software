'use client';

import { useState } from 'react';
import { Button, Empty, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui';
import { ACADEMIC_FORMS } from '@/app/lib/appraisal/instrument';
import { useIsAcademicOrg } from '@/app/lib/useOrgCategory';

/** Blank forms for hand completion.
 *
 *  Academic Forms 8 and 9 only. Forms 10 to 12 are filled online by the appraisee
 *  and the document says they must not be printable. The non-academic forms are
 *  also filled online by the staff themselves (client, 13 Aug), so there is
 *  nothing to print for them either. */
const PRINTABLE_FORM_NUMBERS = [8, 9];

export default function PrintablePanel() {
  const forms = ACADEMIC_FORMS.filter((f) => PRINTABLE_FORM_NUMBERS.includes(f.form));
  const isAcademicOrg = useIsAcademicOrg();

  // Forms 8 and 9 are the academic teaching and research forms. An organization
  // with no academic staff has nothing collected on paper at all.
  if (!isAcademicOrg) {
    return (
      <Empty
        title="Nothing to print"
        description="Every appraisal form for this organization is completed online by the member of staff, so there are no blanks to hand out."
      />
    );
  }

  return (
    <>
      <div className="print:hidden">
        <div className="mb-4 flex justify-end">
          <Button onClick={() => window.print()}>Print</Button>
        </div>


        <p className="mb-6 max-w-2xl text-sm text-muted">
          These are the two forms collected on paper. Everything else, including all
          three non-academic forms, is completed online by the member of staff. A minimum
          of ten completed copies of Form 8 is needed for each course taught before that
          course can be scored.
        </p>
      </div>

      {/* One form per A4 sheet. They previously printed as a continuous stack,
          so Form 8 and Form 9 ran into each other on the same page. */}
      <style>{`@media print { @page { size: A4; margin: 15mm; } }`}</style>

      <div className="space-y-10 print:space-y-0">
        {forms.map((form, i) => (
          <section
            key={form.key}
            className={`break-inside-avoid ${i < forms.length - 1 ? 'print:break-after-page' : ''}`}
          >
            <header className="mb-3 border-b border-line pb-2">
              <h2 className="text-lg font-semibold text-strong">
                Form {form.form}. {form.label}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Academic staff
              </p>
            </header>

            <dl className="mb-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {['Institution', 'Faculty', 'Department', 'Staff surname', 'Course or activity', 'Number assessed'].map(
                (label) => (
                  <div key={label} className="flex items-end gap-2">
                    <dt className="shrink-0 text-muted">{label}</dt>
                    <dd className="min-w-0 flex-1 border-b border-dotted border-line">&nbsp;</dd>
                  </div>
                ),
              )}
            </dl>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-line bg-canvas">
                  <th className="w-10 px-2 py-2 text-left text-xs uppercase tracking-wide text-muted">
                    No.
                  </th>
                  {form.items.some((i) => i.assessor) ? (
                    <th className="px-2 py-2 text-left text-xs uppercase tracking-wide text-muted">
                      Examiner
                    </th>
                  ) : null}
                  <th className="px-2 py-2 text-left text-xs uppercase tracking-wide text-muted">
                    Assessed criterion
                  </th>
                  <th className="w-24 px-2 py-2 text-right text-xs uppercase tracking-wide text-muted">
                    Max score
                  </th>
                  <th className="w-28 px-2 py-2 text-right text-xs uppercase tracking-wide text-muted">
                    Actual score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {form.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-2 py-2.5 tabular-nums text-muted">{i + 1}</td>
                    {form.items.some((it) => it.assessor) ? (
                      <td className="px-2 py-2.5 text-muted">{item.assessor ?? ''}</td>
                    ) : null}
                    <td className="px-2 py-2.5 text-body">{item.label}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-body">{item.max}</td>
                    <td className="px-2 py-2.5" />
                  </tr>
                ))}
                <tr className="border-t border-line font-semibold">
                  <td className="px-2 py-2.5" />
                  {form.items.some((it) => it.assessor) ? <td /> : null}
                  <td className="px-2 py-2.5 text-strong">Aggregate score</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-strong">
                    {form.items.reduce((s, i) => s + i.max, 0)}
                  </td>
                  <td className="px-2 py-2.5" />
                </tr>
              </tbody>
            </table>

            <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
              <div>
                <div className="border-b border-line pb-6" />
                <p className="mt-1 text-muted">Assessor signature</p>
              </div>
              <div>
                <div className="border-b border-line pb-6" />
                <p className="mt-1 text-muted">Date</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
