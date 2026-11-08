'use client';

// A screenshot in the guide.
//
// The images are not in the repository — they are taken from a running
// organization, and whoever takes them drops the files into `public/help/`. So
// this has to behave sensibly in both states: once the file exists it is a
// captioned screenshot, and until then it is a labelled slot naming the file it
// wants and the screen to capture, rather than a broken-image icon or an
// invisible gap.
//
// That also means the guide can ship before the screenshots do, and each one
// starts appearing the moment its file lands, with no code change.

import { useState } from 'react';

export type GuideFigureSpec = {
  /** Filename inside /public/help, e.g. 'admin-open-period.png'. */
  file: string;
  /** Printed under the image. Says what the reader is looking at. */
  caption: string;
  /** Where to go to take it. Shown only while the file is missing. */
  capture?: string;
};

export default function GuideFigure({ file, caption, capture }: GuideFigureSpec) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <figure
        style={{
          margin: '0 0 24px',
          border: '1px dashed var(--border-input)',
          borderRadius: 10,
          padding: '18px 20px',
          background: 'var(--surface-card)',
        }}
      >
        <figcaption
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            margin: '0 0 6px',
          }}
        >
          Screenshot to come
        </figcaption>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--text-strong-secondary)',
            margin: 0,
            maxWidth: '66ch',
          }}
        >
          {caption}
        </p>
        {capture ? (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            Capture {capture}, save as{' '}
            <code
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '.92em',
              }}
            >
              public/help/{file}
            </code>
            .
          </p>
        ) : null}
      </figure>
    );
  }

  return (
    <figure style={{ margin: '0 0 24px' }}>
      <img
        src={`/help/${file}`}
        alt={caption}
        onError={() => setMissing(true)}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          borderRadius: 10,
          border: '1px solid var(--border-divider)',
          background: 'var(--surface-card)',
        }}
      />
      <figcaption
        style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          margin: '8px 0 0',
          maxWidth: '66ch',
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
