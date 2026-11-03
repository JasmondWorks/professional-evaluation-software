'use client';

import { useRef, useState } from 'react';
import { Gallery, Trash } from 'iconsax-react';
import Image from 'next/image';
import { Alert, Button } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';

const MAX_BYTES = 5 * 1024 * 1024;

/** Which of the two marks this uploader manages. Page 1 of the specification
 *  asks for both the institution's own logo and the national coat of arms, and
 *  they appear side by side on every award document. */
type Mark = 'logo' | 'coat-of-arms';

const COPY: Record<Mark, { noun: string; add: string; change: string }> = {
  logo: { noun: 'logo', add: 'Add a logo', change: 'Change logo' },
  'coat-of-arms': {
    noun: 'coat of arms',
    add: 'Add the coat of arms',
    change: 'Change the coat of arms',
  },
};

/** Choose or remove one of the organization's marks. Mirrors AvatarUploader,
 *  but targets `/api/org-logo` (admin-only, org-scoped) instead of the personal
 *  profile photo endpoint.
 *
 *  A new logo appears in the sidebar on the next token refresh, since the
 *  sidebar reads it from the JWT rather than a live record. Both marks reach
 *  the award artwork immediately, which reads the org record directly. */
export default function OrgLogoUploader({
  orgName,
  logo,
  mark = 'logo',
}: {
  orgName?: string | null;
  logo?: string | null;
  mark?: Mark;
}) {
  const copy = COPY[mark];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  // `logo` arrives from the parent's own fetch, which resolves after this
  // component has already mounted — a plain useState(logo) would freeze on
  // whatever `logo` was at that first render (usually still null) and never
  // pick up the real value once it loads. `override` only exists to track a
  // change made locally in this session (upload/remove); undefined means
  // "defer to the prop", so the prop keeps working as the source of truth.
  const [override, setOverride] = useState<string | null | undefined>(undefined);

  async function upload(file: File) {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('That file is not an image. Choose a JPG, PNG, WEBP or GIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('That image is larger than 5MB. Choose a smaller one.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setBusy('upload');

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('mark', mark);
      const res = await apiFetch('/api/org-logo', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `The ${copy.noun} could not be uploaded.`);

      setOverride(data.logo);
      notify.success(`Organization ${copy.noun} updated.`);
    } catch (err: any) {
      setError(err.message);
      setPreview(null);
    } finally {
      URL.revokeObjectURL(localUrl);
      setBusy(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function remove() {
    setBusy('remove');
    setError(null);
    try {
      const res = await apiFetch(`/api/org-logo?mark=${mark}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `The ${copy.noun} could not be removed.`);
      setPreview(null);
      setOverride(null);
      notify.success(`${copy.noun.charAt(0).toUpperCase()}${copy.noun.slice(1)} removed.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const shown = preview ?? (override !== undefined ? override : logo ?? null);
  const initial = (orgName || 'PES').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative">
        {shown ? (
          <Image
            src={shown}
            alt=""
            width={128}
            height={128}
            className="h-32 w-32 rounded-xl border border-line object-contain bg-surface"
          />
        ) : (
          <div className="h-32 w-32 rounded-xl bg-pes text-white grid place-items-center text-3xl font-semibold">
            {initial}
          </div>
        )}
        {busy === 'upload' ? (
          <span className="absolute inset-0 grid place-items-center rounded-xl bg-strong/50">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </span>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        aria-label={`Choose an organization ${copy.noun}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          loading={busy === 'upload'}
          onClick={() => inputRef.current?.click()}
        >
          <Gallery size={16} className="mr-1.5" />
          {shown ? copy.change : copy.add}
        </Button>

        {shown ? (
          <Button size="sm" variant="ghost" loading={busy === 'remove'} onClick={remove}>
            <Trash size={16} className="mr-1.5" />
            Remove
          </Button>
        ) : null}
      </div>

      <p className="text-xs text-muted">JPG, PNG, WEBP or GIF, up to 5MB.</p>

      {error ? (
        <Alert tone="danger" className="w-full">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
