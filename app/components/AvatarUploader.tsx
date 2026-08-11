'use client';

import { useRef, useState } from 'react';
import { Gallery, Trash } from 'iconsax-react';
import { Alert, Button } from '@/app/components/ui';
import UserAvatar from '@/app/components/ui/UserAvatar';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import { patchCurrentUser } from './useCurrentUser';

const MAX_BYTES = 5 * 1024 * 1024;

/** Choose or remove a profile photo.
 *
 *  The picture is shown at the size it will actually appear, with the initials
 *  fallback visible until one is set, so the choice reads as a change to
 *  something real rather than filling in a form field. */
export default function AvatarUploader({
  name,
  image,
}: {
  name?: string | null;
  image?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Shown while the upload is in flight so the new picture appears immediately.
  const [preview, setPreview] = useState<string | null>(null);

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
      const res = await apiFetch('/api/profile-image', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'The image could not be uploaded.');

      // Updates the topbar, sidebar and dashboard at the same moment.
      patchCurrentUser({ image: data.image });
      notify.success('Profile photo updated.');
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
      const res = await apiFetch('/api/profile-image', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'The photo could not be removed.');
      setPreview(null);
      patchCurrentUser({ image: null });
      notify.success('Photo removed. Your initials are shown instead.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const shown = preview ?? image ?? null;

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative">
        <UserAvatar name={name} image={shown} size="xl" rounded="xl" />
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
        aria-label="Choose a profile photo"
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
          {shown ? 'Change photo' : 'Add a photo'}
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
