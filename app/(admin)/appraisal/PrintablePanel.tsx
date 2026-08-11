'use client';

import { useState } from 'react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui';
import { ACADEMIC_FORMS, AppraisalModel, NON_ACADEMIC_FORMS } from '@/app/lib/appraisal/instrument';

/** Blank forms for hand completion.
 *
 *  Only Forms 8 and 9 may be printed. The model is explicit that Forms 10 to 12
 *  are filled online by the appraisee and must not be printable, so they are not
 *  offered here. */
const PRINTABLE_FORM_NUMBERS = [8, 9];

export default function PrintablePanel() {
  const [model, setModel] = useState<AppraisalModel>('academic');
  const source = model === 'academic' ? ACADEMIC_FORMS : NON_ACADEMIC_FORMS;
  const forms = source.filter((f) => PRINTABLE_FORM_NUMBERS.includes(f.form));

  return (
    <>
      <div className="print:hidden">
        <div className="mb-4 flex justify-end">
          <Button onClick={() => window.print()}>Print</Button>
        </div>

        <div className="mb-6 max-w-xs">
          <label className="mb-1 block text-sm font-medium text-body" htmlFor="model">
            Staff type
          </label>
          <Select value={model} onValueChange={(v) => setModel(v as AppraisalModel)}>
            <SelectTrigger id="model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academic">Academic staff</SelectItem>
              <SelectItem value="non_academic">Non-academic staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="mb-6 max-w-2xl text-sm text-muted">
          Forms 10 to 12 are completed online by the appraisee and are deliberately not
          printable. A minimum of ten completed copies of Form 8 is needed for each course
          taught before that course can be scored.
        </p>
      </div>

      <div className="space-y-10">
        {forms.map((form) => (
          <section key={form.key} className="break-inside-avoid">
            <header className="mb-3 border-b border-line pb-2">
              <h2 className="text-lg font-semibold text-strong">
                Form {form.form}. {form.label}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {model === 'academic' ? 'Academic staff' : 'Non-academic staff'}
              </p>
            </header>

            <dl className="mb-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {['Institution', 'Faculty', 'Department', 'Staff surname', 'Course or activity', 'Number assessed'].map(
                (label) => (
                  <div key={label} className="flex items-end gap-2">
                    <dt className="shrink-0 text-muted">{label}</dt>
                    <dd className="min-w-0 flex-1 border-b border-dotted border-rule-hard">&nbsp;</dd>
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
                <tr className="border-t border-rule-hard font-semibold">
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
