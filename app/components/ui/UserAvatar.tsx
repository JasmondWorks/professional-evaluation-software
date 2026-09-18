'use client';

import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const SIZES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-32 h-32 text-3xl sm:w-40 sm:h-40 sm:text-4xl',
} as const;

/** A person's photo, falling back to their initials.
 *
 *  One component so the topbar, sidebar, profile and dashboard can never drift
 *  apart on shape, fallback or letter count. The fallback is the person's
 *  initials rather than a generic silhouette: in a staff list of forty people a
 *  silhouette identifies nobody. */
export default function UserAvatar({
  name,
  image,
  size = 'sm',
  className,
  rounded = 'full',
}: {
  name?: string | null;
  image?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
  rounded?: 'full' | 'xl';
}) {
  const shape = rounded === 'full' ? 'rounded-full' : 'rounded-xl';
  const base = cn(
    'shrink-0 overflow-hidden grid place-items-center font-semibold select-none',
    SIZES[size],
    shape,
    className,
  );

  if (image) {
    return (
      // Cloudinary serves these; next/image would need the host allow-listed in
      // next.config, so a plain img keeps deployment simple.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={cn(base, 'object-cover border border-line bg-canvas')}
      />
    );
  }

  return (
    <span className={cn(base, 'bg-pes-100 text-pes-700')} aria-hidden="true">
      {name?.trim() ? getInitials(name) : '?'}
    </span>
  );
}
