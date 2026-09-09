'use client';

// The guide's shell and behaviour: contents list, search, role filter, theme
// toggle and scroll spy.
//
// The design bundle shipped these as a small vanilla-JS class operating on
// data- attributes. Ported to React, the attributes stay — the CSS in guide.css
// keys off them, and they are what make a section addressable — but the state
// lives in the component rather than in the DOM.

import { useEffect, useMemo, useRef, useState } from 'react';
import { GUIDE_SECTIONS } from './sections';
import PlansSection from './PlansSection';

const ROLE_CHIPS: { key: string; label: string }[] = [
  { key: 'all', label: 'Everyone' },
  { key: 'employee', label: 'I am a member of staff' },
  { key: 'dept-admin', label: 'Departmental Administrator' },
  { key: 'hod', label: 'Head of Department' },
  { key: 'unit-head', label: 'Faculty / Division Head' },
  { key: 'auditor', label: 'Auditor' },
  { key: 'admin', label: 'Organization Admin' },
  { key: 'super-admin', label: 'Super Admin' },
];

const chipStyle = (on: boolean): React.CSSProperties => ({
  height: 34,
  padding: '0 14px',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 9999,
  cursor: 'pointer',
  border: on ? '1px solid transparent' : '1px solid var(--border-input)',
  background: on ? 'var(--brand-600)' : 'var(--surface-card)',
  color: on ? 'var(--text-on-brand)' : 'var(--text-strong-secondary)',
});

const buttonStyle: React.CSSProperties = {
  alignItems: 'center',
  gap: 8,
  height: 36,
  padding: '0 12px',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-primary)',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-input)',
  borderRadius: 6,
  cursor: 'pointer',
};

export default function GuideClient() {
  const [role, setRole] = useState('all');
  const [query, setQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState(GUIDE_SECTIONS[0]?.id ?? '');
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // A section matches the search on its title or its text. The markup is
  // searched as text so a term in the body still finds the section.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const hit = new Set<string>();
    for (const s of GUIDE_SECTIONS) {
      const text = `${s.title} ${(s.html ?? '').replace(/<[^>]+>/g, ' ')}`.toLowerCase();
      if (text.includes(q)) hit.add(s.id);
    }
    // The plans section is generated rather than stored as markup, so its text
    // is not in `html`. Match it on the words it is actually about.
    if ('plans pricing tier basic standard premium price cost'.includes(q)) hit.add('plans');
    return hit;
  }, [query]);

  const dimmed = (s: (typeof GUIDE_SECTIONS)[number]) =>
    role !== 'all' && !s.roles.includes('all') && !s.roles.includes(role);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const nodes = Array.from(
      mainRef.current?.querySelectorAll<HTMLElement>('[data-sec]') ?? [],
    );
    const seen = new Map<Element, IntersectionObserverEntry>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e);
        let best: IntersectionObserverEntry | null = null;
        seen.forEach((e) => {
          if (!e.isIntersecting) return;
          if (!best || e.boundingClientRect.top < best.boundingClientRect.top) best = e;
        });
        const top = best as IntersectionObserverEntry | null;
        if (top) setActive(top.target.getAttribute('data-sec') ?? '');
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const linkStyle = (id: string, sub: boolean): React.CSSProperties => {
    const on = active === id;
    return {
      display: 'block',
      padding: sub ? '6px 10px 6px 24px' : '6px 10px',
      fontSize: 13,
      lineHeight: 1.4,
      borderRadius: 6,
      background: on ? 'var(--brand-50)' : 'transparent',
      color: on ? 'var(--brand-900)' : sub ? 'var(--text-secondary)' : 'var(--text-strong-secondary)',
      fontWeight: on ? 600 : 400,
    };
  };

  const visibleSections = GUIDE_SECTIONS.filter((s) => !matches || matches.has(s.id));

  return (
    <div className="pes-guide" data-theme={theme ?? undefined}>
      <div data-shell>
        <nav
          data-toc
          data-open={drawerOpen ? 'true' : 'false'}
          aria-label="Table of contents"
          style={{
            position: 'sticky',
            top: 0,
            maxHeight: '100vh',
            overflowY: 'auto',
            background: 'var(--surface-card)',
            borderRight: '1px solid var(--border-divider)',
            padding: '24px 20px 48px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--brand-600)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.2px' }}>
              PES User Guide
            </span>
          </div>

          <label
            htmlFor="pes-search"
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              margin: '0 0 8px',
            }}
          >
            Search
          </label>
          <input
            id="pes-search"
            type="search"
            placeholder="Filter sections…"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              height: 36,
              padding: '0 12px',
              fontFamily: 'inherit',
              fontSize: 14,
              color: 'var(--text-primary)',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-input)',
              borderRadius: 6,
              outline: 'none',
              margin: '0 0 20px',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {visibleSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setDrawerOpen(false)}
                style={linkStyle(s.id, s.id.includes('-'))}
              >
                {s.title}
              </a>
            ))}
            {visibleSections.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0 0' }}>
                Nothing matches “{query}”.
              </p>
            )}
          </div>
        </nav>

        <main data-main ref={mainRef}>
          <header
            data-topbar
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              margin: '0 0 32px',
            }}
          >
            <button
              type="button"
              data-drawer-btn
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
              style={buttonStyle}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Contents
            </button>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              style={{ ...buttonStyle, display: 'inline-flex', color: 'var(--text-strong-secondary)' }}
            >
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </header>

          <div
            style={{
              margin: '0 0 12px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: 'var(--brand-600)',
            }}
          >
            Performance Evaluation Software
          </div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: '-.8px',
              margin: '0 0 12px',
            }}
          >
            PES User Guide
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: 'var(--text-strong-secondary)',
              margin: '0 0 28px',
              maxWidth: '62ch',
              textWrap: 'pretty',
            }}
          >
            Everything the software does, arranged by who does it. Read it end to
            end on your first day, or pick your role below and see only the parts
            that apply to you.
          </p>

          <section
            data-controls
            aria-label="Role filter"
            style={{
              background: 'var(--surface-card)',
              borderRadius: 10,
              boxShadow: 'var(--shadow-2)',
              padding: 20,
              margin: '0 0 48px',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '.04em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                margin: '0 0 4px',
              }}
            >
              Show me what applies to
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: '0 0 14px',
              }}
            >
              Picking a role dims the parts of this guide that are not yours.
              Nothing is deleted — scroll past a dimmed block and it is still
              readable.
            </p>
            <div role="group" aria-label="Role filter chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROLE_CHIPS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={role === c.key}
                  onClick={() => setRole(c.key)}
                  style={chipStyle(role === c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          {visibleSections.map((s) => {
            // React refuses children and dangerouslySetInnerHTML on the same
            // element, so the two kinds of section are rendered separately
            // rather than with a conditional prop spread.
            const props = {
              id: s.id,
              'data-sec': s.id,
              'data-level': s.level,
              'data-dim': dimmed(s) ? 'true' : 'false',
              'data-print-break': s.printBreak ? '' : undefined,
            };
            return s.html === null ? (
              <section key={s.id} {...props}>
                <PlansSection />
              </section>
            ) : (
              <section key={s.id} {...props} dangerouslySetInnerHTML={{ __html: s.html }} />
            );
          })}

          {visibleSections.length === 0 && (
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
              No section of the guide mentions “{query}”.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
