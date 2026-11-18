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

import { useRef } from 'react';
import Image from 'next/image';
import Button from '@/app/components/ui/Button';

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
  /** Show a print button under the art. The client asked that a member of staff
   *  be able to take their award away, which for a certificate means paper. */
  printable?: boolean;
  /** Printed across the badge's blank band, or the certificate's ruled lines. */
  title?: string;
  recipient?: string;
  /** Certificates carry a date and the awarding body on their two lower rules. */
  date?: string;
  issuer?: string;
  size?: number;
  /** The institution's own logo, and the national coat of arms.
   *
   *  Page 1 of the specification puts both on "all documents — award
   *  certificates, Books of records and Hall of Fame record", set once by the
   *  software administrator alongside the institutional name. Until now the
   *  artwork printed only `issuer` as text, so the marks never appeared on
   *  anything a member of staff took away.
   *
   *  Both are optional and independent: an organization that has uploaded one
   *  and not the other gets the one it has, centred, rather than a gap. */
  logoUrl?: string | null;
  coatOfArmsUrl?: string | null;
};

/** The two marks, laid along one horizontal band inside the frame.
 *
 *  Plain <img> rather than next/image: these are remote, and the print window
 *  below is handed raw outerHTML, where a next/image srcset pointing at
 *  /_next/image has no loader to run. A direct src prints as-is. */
function Marks({
  logoUrl,
  coatOfArmsUrl,
  top,
  height,
}: {
  logoUrl?: string | null;
  coatOfArmsUrl?: string | null;
  /** Where the band sits, as a percentage of the frame. */
  top: string;
  height: string;
}) {
  const marks = [
    { src: coatOfArmsUrl, alt: 'National coat of arms' },
    { src: logoUrl, alt: 'Institution logo' },
  ].filter((m): m is { src: string; alt: string } => Boolean(m.src));

  if (marks.length === 0) return null;

  return (
    <div
      className="absolute inset-x-0 flex items-center justify-center"
      style={{ top, height, gap: '6%', padding: '0 8%' }}
    >
      {marks.map((m) => (
        // data-award-mark is what the print stylesheet keys off to stop the
        // `.frame img { width: 100% }` rule from blowing these up to the full
        // width of the page. Shorter than the band itself (82% rather than
        // 100%) so the marks don't sit flush against its top and bottom edges.
        <img
          key={m.alt}
          data-award-mark=""
          src={m.src}
          alt={m.alt}
          style={{ height: '82%', width: 'auto', objectFit: 'contain' }}
        />
      ))}
    </div>
  );
}

export default function AwardArt({
  kind,
  title,
  recipient,
  date,
  issuer,
  printable = false,
  size = 160,
  logoUrl,
  coatOfArmsUrl,
}: Props) {
  const frame = useRef<HTMLDivElement>(null);

  // Printing one award rather than the page around it: the artwork is opened in
  // its own window at its own size and sent to the printer. No library, and no
  // screenshot of a scaled-down preview, so it comes out at full quality.
  const print = () => {
    const node = frame.current;
    if (!node) return;
    const w = window.open('', '_blank', 'width=1100,height=850');
    if (!w) return;

    // The frame's layout — every absolutely-positioned name/title/mark on it —
    // comes from Tailwind utility classes, not inline styles. outerHTML copies
    // the class names but not the stylesheet that gives them meaning, so the
    // popup needs its own copy of this page's stylesheets or the whole frame
    // collapses to default document flow. Cloning the <link>/<style> tags is
    // what makes the print preview match what's on screen.
    const styleTags = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((el) => el.outerHTML)
      .join('\n');

    w.document.write(`<!doctype html><html><head><title>${
      [title, recipient].filter(Boolean).join(' - ') || 'Award'
    }</title>${styleTags}<style>
      @page { size: landscape; margin: 10mm; }
      body { margin: 0; display: flex; align-items: center; justify-content: center; }
      .frame { position: relative; width: 100%; max-width: 1000px; }
      .frame img { width: 100%; height: auto; display: block; }
      /* The logo and coat of arms are also <img> inside .frame, and the rule
         above would stretch each one across the whole sheet. They size off
         their band's height instead, exactly as on screen. */
      .frame img[data-award-mark] { width: auto; height: 100%; display: inline-block; object-fit: contain; }
      .overlay { position: absolute; text-align: center; color: #000; }
    </style></head><body>${node.outerHTML}</body></html>`);
    w.document.close();

    // The artwork has to be decoded before the print dialog freezes the page.
    // The window's own `load` event is not trustworthy here: `window.open('')`
    // already opens (and loads) about:blank, so a later document.write/close
    // does not reliably refire `load` in every browser before the cloned
    // stylesheets and the remote logo/coat-of-arms images — slower than the
    // local certificate PNG — have actually finished loading. Wait on those
    // directly instead, with a timeout so one slow or failed load never blocks
    // printing forever.
    const links = Array.from(
      w.document.querySelectorAll('link[rel="stylesheet"]'),
    ) as HTMLLinkElement[];
    const whenLinkLoaded = (link: HTMLLinkElement) =>
      link.sheet
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            link.addEventListener('load', () => resolve(), { once: true });
            link.addEventListener('error', () => resolve(), { once: true });
          });
    const images = Array.from(w.document.images);
    const whenImageLoaded = (img: HTMLImageElement) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          });
    const ready = Promise.all([
      ...links.map(whenLinkLoaded),
      ...images.map(whenImageLoaded),
    ]);
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));

    Promise.race([ready, timeout]).then(() => {
      w.focus();
      w.print();
    });
  };
  const isBadge = kind.startsWith('badge-');
  const isCert = kind.startsWith('cert-');

  // The certificate art is landscape and leaves its blanks in fixed places: a
  // ruled line for the recipient under "This certificate is presented to", a
  // caption line beneath it for what the award is, and Signature / Date rules
  // at the foot. Percentages rather than pixels so it scales with `size`.
  if (isCert) {
    const width = size;
    const height = size * 0.818; // the template's own 933x763 ratio
    return (
      <figure className="m-0 inline-flex flex-col items-center gap-2">
        <div ref={frame} className="relative" style={{ width, height }}>
          <Image
            src={SOURCES[kind]}
            alt={LABELS[kind]}
            fill
            sizes={`${width}px`}
            className="object-contain"
          />
          {/* Along the head of the certificate, above its own wording. The
              template's first ruled line is at 50%, so this band is clear. */}
          <Marks
            logoUrl={logoUrl}
            coatOfArmsUrl={coatOfArmsUrl}
            top="7%"
            height="11%"
          />
          {recipient && (
            <span
              className="absolute inset-x-[18%] text-center font-semibold leading-tight text-black"
              style={{ top: '50%', fontSize: Math.max(9, width * 0.032) }}
            >
              {recipient}
            </span>
          )}
          {title && (
            <span
              className="absolute inset-x-[16%] text-center leading-tight text-black/80"
              style={{ top: '63%', fontSize: Math.max(7, width * 0.021) }}
            >
              {title}
            </span>
          )}
          {issuer && (
            <span
              className="absolute text-center leading-tight text-black/70"
              style={{ left: '13%', width: '24%', top: '75.5%', fontSize: Math.max(6, width * 0.018) }}
            >
              {issuer}
            </span>
          )}
          {date && (
            <span
              className="absolute text-center leading-tight text-black/70"
              style={{ left: '63%', width: '24%', top: '75.5%', fontSize: Math.max(6, width * 0.018) }}
            >
              {date}
            </span>
          )}
        </div>
        <figcaption className="text-xs text-muted">{LABELS[kind]}</figcaption>
        {printable && (
          <Button
            variant="outline"
            size="sm"
            onClick={print}
            className="border-pes text-pes hover:bg-pes-50"
          >
            Print this certificate
          </Button>
        )}
      </figure>
    );
  }

  return (
    <figure className="m-0 inline-flex flex-col items-center gap-2">
      <div ref={frame} className="relative" style={{ width: size, height: size }}>
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

        {/* Below the band on a badge, not inside it — the band already carries
            the award and the recipient, and the hexagon has no other clear
            ground. Smaller than on a certificate because the badge itself is
            rendered small. */}
        {isBadge && (
          <Marks
            logoUrl={logoUrl}
            coatOfArmsUrl={coatOfArmsUrl}
            top="45%"
            height="9%"
          />
        )}
      </div>
      <figcaption className="text-xs text-muted">{LABELS[kind]}</figcaption>
      {printable && (
        <Button
          variant="outline"
          size="sm"
          onClick={print}
          className="border-pes text-pes hover:bg-pes-50"
        >
          Print this badge
        </Button>
      )}
    </figure>
  );
}
