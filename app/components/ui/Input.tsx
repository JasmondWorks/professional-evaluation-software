"use client";

import React, { InputHTMLAttributes, useId, useState } from "react";
import { Eye, EyeSlash } from "iconsax-react";
import { cn } from "@/lib/utils";

export const inputBase =
  "w-full h-10 px-3 rounded-lg bg-surface border border-line text-strong text-sm " +
  "placeholder:text-muted transition-shadow " +
  "focus:outline-none focus:border-pes-400 focus:shadow-focus " +
  "disabled:bg-line/40 disabled:text-muted disabled:cursor-not-allowed " +
  "aria-[invalid=true]:border-danger-600 aria-[invalid=true]:focus:shadow-[0_0_0_3px_rgb(220_38_38_/_0.16)]";

type InputProps = {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

/**
 * The canonical text input: label, hint, and error are wired with the right
 * `htmlFor` / `aria-describedby` / `aria-invalid` so screen readers announce the
 * field and its problem. Use this instead of bare `<input>` for consistency.
 *
 * `type="password"` gets a built-in show/hide toggle for free — every
 * password field in the app should pass that type rather than reaching for a
 * separate component.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, containerClassName, id, type, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-body">
          {label}
          {props.required && <span className="text-danger-600"> *</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword ? (revealed ? "text" : "password") : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(errorId, hintId) || undefined}
          className={cn(inputBase, isPassword && "pr-10", className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            tabIndex={-1}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute right-0 top-0 grid h-10 w-10 place-items-center text-muted hover:text-body focus:outline-none focus-visible:text-pes"
          >
            {revealed ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p id={errorId} className="text-[13px] text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
