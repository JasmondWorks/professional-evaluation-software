"use client";

// A compact 1–N rating cell for the theme/feeling matrices. Shows the chosen
// number (or a dash), and on tap opens a small number pad — much quicker to fill
// than 90 dropdowns. Answered cells read green at a glance. The pad is
// fixed-positioned so the wide, horizontally-scrolling table never clips it, and
// only one pad is open at a time (managed by the parent via `open`).

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const PAD_W = 168;
const PAD_H = 96;

export default function RatingCell({
  value,
  onChange,
  open,
  onOpen,
  onClose,
  max = 10,
}: {
  value?: number;
  onChange: (n: number) => void;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  max?: number;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    let left = r.left + r.width / 2 - PAD_W / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - PAD_W - 8));
    let top = r.bottom + 6;
    if (top + PAD_H > window.innerHeight) top = r.top - PAD_H - 6; // flip up near the bottom
    setPos({ top, left });
  }, [open]);

  // Close on scroll/resize so the pad never drifts away from its cell.
  useEffect(() => {
    if (!open) return;
    const close = () => onClose();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, onClose]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        aria-label={value ? `Rated ${value} of ${max}` : "Not rated"}
        className={`mx-auto flex h-9 w-12 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
          value
            ? "border-green-400 bg-green-50 text-green-700"
            : "border-line text-muted hover:border-gray-400"
        }`}
      >
        {value ?? "–"}
      </button>
      {open && pos && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div
            className="fixed z-50 grid grid-cols-5 gap-1 rounded-lg border border-line bg-white p-1.5 shadow-xl"
            style={{ top: pos.top, left: pos.left, width: PAD_W }}
          >
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  onChange(n);
                  onClose();
                }}
                className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                  value === n ? "bg-pes text-white" : "text-body hover:bg-line/50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
