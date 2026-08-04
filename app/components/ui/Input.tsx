import React, { InputHTMLAttributes, useId } from "react";
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
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, containerClassName, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-body">
          {label}
          {props.required && <span className="text-danger-600"> *</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(errorId, hintId) || undefined}
        className={cn(inputBase, className)}
        {...props}
      />
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
