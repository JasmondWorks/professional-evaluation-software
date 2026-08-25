'use client';

import { useEffect, useState } from 'react';
import { ArrowDown2, ArrowRight2 } from 'iconsax-react';
import Link from 'next/link';
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, Empty, Field, Modal,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '@/app/utils/auth';
import { notify } from '@/lib/toast';
import { POSITIONS, NON_ACADEMIC_CADRES, modelFor, stageOf } from '@/app/lib/appraisal/instrument';

type Entry = {
  id: number;
  pesuser_name: string;
  dept: string | null;
  model: string;
  position: string | null;
  cadre: string | null;
  status: string;
  grade: string | null;
  rtp: string | null;
  formsCompleted: number;
  submitted_at: string | null;
};

type Staff = { id: number; name: string; role: string; dept: string | null };

const STATUS_TONE: Record<string, 'neutral' | 'brand' | 'success' | 'warning' | 'danger'> = {
  draft: 'neutral',
  submitted: 'warning',
  verified: 'brand',
  awaiting_staff: 'warning',
  referred_to_auditor: 'danger',
  hod_reviewed: 'brand',
  approved: 'success',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Not submitted',
  submitted: 'Awaiting HOD',
  awaiting_staff: 'Awaiting staff response',
  referred_to_auditor: 'With auditor',
  hod_reviewed: 'Reviewed',
  approved: 'Approved',
};

export default function EntriesPanel() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [who, setWho] = useState('');
  const [staffType, setStaffType] = useState<'academic' | 'non_academic'>('academic');
  const [position, setPosition] = useState('lecturer_i');
  const [cadre, setCadre] = useState('grade_8');
  const [busy, setBusy] = useState(false);
  // Departments collapse by default. A flat list of every member of staff is the
  // thing the client found unwelcoming, so this opens one department at a time.
  const [openDept, setOpenDept] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const periodRes = await apiFetch('/api/appraisal-v2/period');
      const periodData = await periodRes.json();
      if (!periodRes.ok) throw new Error(periodData.error);
      if (!periodData.period) {
        setPeriodId(null);
        setEntries([]);
        return;
      }
      setPeriodId(periodData.period.id);

      const [eRes, sRes] = await Promise.all([
        apiFetch(`/api/appraisal-v2/entry?periodId=${periodData.period.id}`),
        apiFetch('/api/appraisal-v2/staff'),
      ]);
      const eData = await eRes.json();
      const sData = await sRes.json();
      if (!eRes.ok) throw new Error(eData.error);
      setEntries(eData.entries);
      if (sRes.ok) setStaff(sData.staff);
    } catch (err: any) {
      setError(err.message ?? 'Could not load appraisals.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // The client's rule: only academic staff inside an ACADEMIC institution use
  // the academic model. Everyone in a company or public-sector organization uses
  // the non-academic one, whatever they are called. The product category is
  // carried in the token, so read it rather than assuming.
  const [productCategory, setProductCategory] = useState<string>('academic');
  useEffect(() => {
    const t = getAccessToken();
    if (!t) return;
    try {
      setProductCategory((jwtDecode(t) as any)?.productCategory ?? 'academic');
    } catch {
      /* leave the default */
    }
  }, []);

  const model = modelFor(productCategory, staffType);
  const staffTypeApplies = productCategory === 'academic';

  async function create() {
    setBusy(true);
    try {
      const res = await apiFetch('/api/appraisal-v2/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pesuserName: who,
          model,
          ...(model === 'academic' ? { position } : { cadre }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success(`Appraisal started for ${who}.`);
      setAdding(false);
      setWho('');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>

      {error ? <Alert tone="danger" className="mb-6">{error}</Alert> : null}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-pes border-t-transparent" />
        </div>
      ) : !periodId ? (
        <Empty
          title="No appraisal period is open"
          description="Appraisals belong to a period. Open one in Appraisal Setup to begin."
          action={
            <Link href="/appraisal">
              <Button variant="secondary">Go to Appraisal Setup</Button>
            </Link>
          }
        />
      ) : entries.length === 0 ? (
        <Empty
          title="Nobody is being appraised yet"
          description="Start an appraisal for a member of staff and their forms will appear here."
          action={<Button onClick={() => setAdding(true)}>Start an appraisal</Button>}
        />
      ) : (
        <div className="space-y-3">
          {[...new Set(entries.map((e) => e.dept ?? 'Unassigned'))].sort().map((dept) => {
            const rows = entries.filter((e) => (e.dept ?? 'Unassigned') === dept);
            const submitted = rows.filter((e) => e.submitted_at).length;
            const open = openDept === dept;
            return (
              <Card key={dept}>
                <CardHeader>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenDept(open ? null : dept)}
                    className="flex w-full items-center gap-2 text-left focus:outline-none focus-visible:shadow-focus"
                  >
                    {open ? (
                      <ArrowDown2 size={18} className="shrink-0 text-muted" />
                    ) : (
                      <ArrowRight2 size={18} className="shrink-0 text-muted" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-strong">{dept}</span>
                      <span className="block text-sm text-muted">
                        {submitted} of {rows.length} submitted
                      </span>
                    </span>
                  </button>
                </CardHeader>

                {open ? (
                  <CardBody className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-line bg-canvas">
                            {['Staff member', 'Forms entered', 'Submitted on', 'Status', 'Grade', ''].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-xs uppercase tracking-wide text-muted">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {rows.map((e) => (
                            <tr key={e.id} className="hover:bg-canvas/60">
                              <td className="px-4 py-3 font-medium text-strong">{e.pesuser_name}</td>
                              <td className="px-4 py-3 tabular-nums text-body">
                                {e.formsCompleted} of {e.model === 'academic' ? 5 : 3}
                              </td>
                              <td className="px-4 py-3 tabular-nums text-body">
                                {e.submitted_at
                                  ? new Date(e.submitted_at).toLocaleDateString()
                                  : <span className="text-muted">not yet</span>}
                              </td>
                              <td className="px-4 py-3">
                                <Badge tone={STATUS_TONE[e.status] ?? 'neutral'}>
                                  {stageOf(e.status).label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                {e.grade ? (
                                  <span className="font-medium text-strong">{e.grade}</span>
                                ) : (
                                  <span className="text-muted">not released</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Link
                                  href={`/appraisal/entries/${e.id}`}
                                  className="text-sm font-medium text-pes underline underline-offset-4 hover:text-pes-800"
                                >
                                  Open
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={adding}
        setIsOpen={setAdding}
        title="Start an appraisal"
        footer={
          <div className="flex items-center gap-3">
            <Button
              onClick={() => (who ? create() : setError("Choose a member of staff first."))}
              aria-disabled={!who}
              className={!who ? "opacity-50" : undefined}
              loading={busy}
            >
              Start
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            {!who ? <span className="text-sm text-muted">Choose a member of staff first.</span> : null}
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Staff member">
            {(f) => (
              <Select value={who} onValueChange={setWho}>
                <SelectTrigger id={f.id}>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                      {s.dept ? ` · ${s.dept}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          {staffTypeApplies ? (
          <Field
            label="Staff type"
            hint="Academic staff use four categories across five forms. Everyone else uses three."
          >
            {(f) => (
              <Select value={staffType} onValueChange={(v) => setStaffType(v as any)}>
                <SelectTrigger id={f.id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic staff</SelectItem>
                  <SelectItem value="non_academic">Non-academic staff</SelectItem>
                </SelectContent>
              </Select>
            )}
          </Field>
          ) : (
            <p className="text-sm text-muted">
              Everyone here is appraised the same way, on three forms covering
              activity, training quality and fault solving.
            </p>
          )}

          {model === 'academic' ? (
            <Field label="Position" hint="Position selects the annual target.">
              {(f) => (
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger id={f.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          ) : (
            <Field label="Grade" hint="Grade selects the annual target.">
              {(f) => (
                <Select value={cadre} onValueChange={setCadre}>
                  <SelectTrigger id={f.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NON_ACADEMIC_CADRES.flatMap((band) =>
                      band.grades.map((g) => (
                        <SelectItem key={g} value={g}>
                          {`Grade ${g.replace('grade_', '')} · ${band.group}`}
                        </SelectItem>
                      )),
                    )}
                  </SelectContent>
                </Select>
              )}
            </Field>
          )}
        </div>
      </Modal>
    </>
  );
}
