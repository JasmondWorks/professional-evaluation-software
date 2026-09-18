"use client";

import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/**
 * Compound form field: label + control + hint/error, wired with ids and ARIA.
 * Wrap any control (Input, Select trigger, Textarea, etc.) — pass the generated
 * `id`/`aria-describedby`/`aria-invalid` down via the render prop when needed, or
 * just drop a labelled control inside for simple cases.
 *
 *   <Field label="Email" hint="We never share it." error={errors.email}>
 *     {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid} />}
 *   </Field>
 */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children:
    | React.ReactNode
    | ((f: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode);
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const invalid = !!error;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-danger-600"> *</span>}
        </Label>
      )}
      {typeof children === "function" ? children({ id, describedBy, invalid }) : children}
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
}
