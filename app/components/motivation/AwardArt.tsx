'use client';

// The award artwork from the Figma set, in /public.
//
// The hexagonal variants are the ones the client chose (`*-var1.png`), gold for
// 1st class, silver for 2nd, bronze for 3rd. Each has a blank white band across
// the upper half meant to carry the award and the recipient — the art is not
// self-explanatory without it — so the text is laid over that band rather than
// printed underneath the image.
//
// The Books of Records and the certificates have their own art, and their own
// proportions, so they are separate cases rather than one image with a class.

import Image from 'next/image';

export type ArtKind =
  | 'badge-1st'
  | 'badge-2nd'
  | 'badge-3rd'
  | 'book-1st'
  | 'book-2nd'
  | 'cert-1st'
  | 'cert-2nd'
  | 'cert-3rd';

const SOURCES: Record<ArtKind, string> = {
  'badge-1st': '/1st-var1.png',
  'badge-2nd': '/2nd-var1.png',
  'badge-3rd': '/3rd-var1.png',
  'book-1st': '/1st-book.png',
  'book-2nd': '/2nd-book.png',
  'cert-1st': '/1st-class-cert.png',
  'cert-2nd': '/2nd-class-cert.png',
  'cert-3rd': '/3rd-class-cert.png',
};

const LABELS: Record<ArtKind, string> = {
  'badge-1st': '1st class',
  'badge-2nd': '2nd class',
  'badge-3rd': '3rd class',
  'book-1st': '1st Book of Records',
  'book-2nd': '2nd Book of Records',
  'cert-1st': '1st class certificate',
  'cert-2nd': '2nd class certificate',
  'cert-3rd': '3rd class certificate',
};

export function artLabel(kind: ArtKind): string {
  return LABELS[kind];
}

type Props = {
  kind: ArtKind;
  /** Printed across the badge's blank band. */
  title?: string;
  recipient?: string;
  size?: number;
};

export default function AwardArt({ kind, title, recipient, size = 160 }: Props) {
  const isBadge = kind.startsWith('badge-');

  return (
    <figure className="m-0 inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src={SOURCES[kind]}
          alt={LABELS[kind]}
          fill
          sizes={`${size}px`}
          className="object-contain"
        />

        {/* The blank band sits in the upper half of the hexagon. Only the badges
            have one; writing over a certificate would land on its own wording. */}
        {isBadge && (title || recipient) && (
          <div
            className="absolute inset-x-0 flex flex-col items-center justify-center px-[14%] text-center"
            style={{ top: '22%', height: '20%' }}
          >
            {title && (
              <span
                className="w-full truncate font-semibold leading-tight text-black"
                style={{ fontSize: Math.max(8, size * 0.075) }}
              >
                {title}
              </span>
            )}
            {recipient && (
              <span
                className="w-full truncate leading-tight text-black/70"
                style={{ fontSize: Math.max(7, size * 0.06) }}
              >
                {recipient}
              </span>
            )}
          </div>
        )}
      </div>
      <figcaption className="text-xs text-muted">{LABELS[kind]}</figcaption>
    </figure>
  );
}
