'use client';

// Shared role dropdown: system presets on top, org custom roles below a clear
// divider. Used by both the Add-Employee form and the Assign-Role modal so the
// options stay identical. A native <select> can't space/style options or show
// the divider, hence this listbox.

import { useEffect, useRef, useState } from 'react';

export type RoleOption = { value: string; label: string };

export default function RoleSelect({
  value,
  presetRoles,
  customRoles,
  onSelect,
  tabIndex,
  hasError,
}: {
  value: string;
  presetRoles: RoleOption[];
  customRoles: { name: string }[];
  onSelect: (value: string) => void;
  tabIndex?: number;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel =
    [...presetRoles, ...customRoles.map((r) => ({ value: r.name, label: r.name }))].find(
      (o) => o.value === value,
    )?.label ?? '';

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function choose(v: string) {
    onSelect(v);
    setOpen(false);
  }

  const optionClass = (v: string) =>
    `w-full text-left px-5 py-3 text-base transition-colors hover:bg-canvas ${
      value === v ? 'bg-pes-50 text-pes-700 font-semibold' : 'text-body'
    }`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        tabIndex={tabIndex}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
          else if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`w-full flex items-center justify-between font-medium text-lg py-3 px-6 border rounded-sm outline-0 text-left transition-colors ${
          hasError ? 'border-danger-600' : open ? 'border-gray-400' : 'border-line'
        } ${selectedLabel ? 'text-strong' : 'text-muted'}`}
      >
        <span className="truncate">{selectedLabel || 'Select a role'}</span>
        <svg
          className={`w-5 h-5 text-muted shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 w-full bg-white border border-line rounded-lg shadow-xl py-2 max-h-72 overflow-y-auto"
        >
          {presetRoles.map((o) => (
            <li key={o.value}>
              <button type="button" onClick={() => choose(o.value)} className={optionClass(o.value)}>
                {o.label}
              </button>
            </li>
          ))}

          {customRoles.length > 0 && (
            <>
              <li className="flex items-center gap-3 px-5 pt-4 pb-2 select-none" aria-hidden>
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Custom Roles
                </span>
                <span className="h-px flex-1 bg-gray-200" />
              </li>
              {customRoles.map((r) => (
                <li key={r.name}>
                  <button type="button" onClick={() => choose(r.name)} className={optionClass(r.name)}>
                    {r.name}
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
