'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft2 } from 'iconsax-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Empty,
  Modal,
  PageHeader,
} from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import TemplateTargets from './TemplateTargets';

/** Appraisal target templates.
 *
 *  The values PES ships are the standard and cannot be edited. An organization
 *  that wants different figures duplicates a template, changes the copy, has a
 *  second person approve it, and puts it in force. That sequence is deliberately
 *  visible on this screen rather than hidden behind one Save button, because a
 *  target set decides every member of staff's grade. */

type Template = {
  id: string;
  name: string;
  scope: 'academic' | 'non_academic';
  isSystem: boolean;
  status: 'draft' | 'ready' | 'archived';
  version: number;
  targetCount: number;
  readyBy: string | null;
  approvedBy: string | null;
  selectable: boolean;
  inForce: boolean;
  chosenExplicitly: boolean;
};

type ScopeBlock = { scope: 'academic' | 'non_academic'; templates: Template[]; inForceId: string | null };

const SCOPE_LABEL: Record<string, string> = {
  academic: 'Academic staff',
  non_academic: 'Non-academic staff',
};

export default function AppraisalTemplatesPage() {
  const [scopes, setScopes] = useState<ScopeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<Template | null>(null);
  const [duplicating, setDuplicating] = useState<Template | null>(null);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/appraisal-v2/templates');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not load templates.');
      setScopes(data.scopes ?? []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(action: string, body: Record<string, unknown>, success: string) {
    setBusy(action + String(body.templateId ?? ''));
    try {
      const res = await apiFetch('/api/appraisal-v2/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'That did not work.');
      notify.success(data.message ?? success);
      await load();
      return data;
    } catch (err: any) {
      notify.error(err.message);
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function confirmDuplicate() {
    if (!duplicating) return;
    const name = newName.trim();
    if (name.length < 3) {
      notify.error('Give the new template a name of at least three characters.');
      return;
    }
    const data = await act('duplicate', { templateId: duplicating.id, name }, 'Draft created.');
    if (data) {
      setDuplicating(null);
      setNewName('');
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pes border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <Link
        href="/appraisal"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-pes underline underline-offset-4 transition-colors hover:text-pes-800"
      >
        <ArrowLeft2 size={16} /> Back to appraisal
      </Link>

      <PageHeader
        title="Appraisal templates"
        subtitle="The target figures an appraisal is scored against. The PES standard is fixed; your organization can define its own."
      />

      {error ? (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-6">
        {scopes.map((block) => (
          <Card key={block.scope}>
            <CardHeader>
              <h2 className="text-lg font-semibold text-strong">{SCOPE_LABEL[block.scope]}</h2>
              <p className="mt-0.5 text-sm text-muted">
                One template is in force at a time. Changing it takes effect when the next
                period is opened.
              </p>
            </CardHeader>
            <CardBody>
              {block.templates.length === 0 ? (
                <Empty title="No templates" description="The PES standard should appear here." />
              ) : (
                <div className="flex flex-col divide-y divide-line">
                  {block.templates.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOpen(t)}
                            className="text-left font-medium text-strong underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                          >
                            {t.name}
                            {t.version > 1 ? ` (v${t.version})` : ''}
                          </button>
                          {t.isSystem ? <Badge tone="neutral">PES standard</Badge> : null}
                          {t.inForce ? <Badge tone="brand">In force</Badge> : null}
                          {t.status === 'draft' ? <Badge tone="warning">Draft</Badge> : null}
                          {t.status === 'ready' && !t.approvedBy ? (
                            <Badge tone="warning">Awaiting approval</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          {t.targetCount} targets
                          {t.readyBy ? ` · marked ready by ${t.readyBy}` : ''}
                          {t.approvedBy ? ` · approved by ${t.approvedBy}` : ''}
                          {t.inForce && !t.chosenExplicitly
                            ? ' · used because no other template has been chosen'
                            : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {t.isSystem ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDuplicating(t);
                              setNewName('');
                            }}
                          >
                            Duplicate to edit
                          </Button>
                        ) : null}

                        {t.status === 'draft' ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setOpen(t)}>
                              Edit targets
                            </Button>
                            <Button
                              size="sm"
                              loading={busy === `markReady${t.id}`}
                              onClick={() =>
                                act('markReady', { templateId: t.id }, 'Marked ready. A second person must approve it.')
                              }
                            >
                              Mark ready
                            </Button>
                          </>
                        ) : null}

                        {t.status === 'ready' && !t.approvedBy && !t.isSystem ? (
                          <Button
                            size="sm"
                            loading={busy === `approve${t.id}`}
                            onClick={() => act('approve', { templateId: t.id }, 'Approved.')}
                          >
                            Approve
                          </Button>
                        ) : null}

                        {!t.isSystem && t.status === 'ready' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={busy === `newVersion${t.id}`}
                            onClick={() =>
                              act('newVersion', { templateId: t.id }, 'New version created as a draft.')
                            }
                          >
                            New version
                          </Button>
                        ) : null}

                        {t.selectable && !t.inForce ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={busy === `putInForce${t.id}`}
                            onClick={() =>
                              act('putInForce', { scope: block.scope, templateId: t.id }, 'Put in force.')
                            }
                          >
                            Put in force
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={Boolean(duplicating)}
        setIsOpen={(o) => (o ? null : setDuplicating(null))}
        title="Duplicate this template"
        description="The copy belongs to your organization and starts as a draft. The PES standard is left untouched."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setDuplicating(null)}>
              Cancel
            </Button>
            <Button loading={busy?.startsWith('duplicate')} onClick={confirmDuplicate}>
              Create draft
            </Button>
          </div>
        }
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-body">Name</span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="For example, Unilag scheme 2026"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-pes-400 focus-visible:shadow-focus"
          />
        </label>
      </Modal>

      {open ? (
        <TemplateTargets
          templateId={open.id}
          name={open.name}
          onClose={() => setOpen(null)}
          onChanged={load}
        />
      ) : null}
    </div>
  );
}
