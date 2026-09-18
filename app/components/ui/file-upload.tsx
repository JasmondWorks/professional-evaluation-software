"use client";

import * as React from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drag-and-drop / click file upload with a token-themed dropzone and a selected
 * files list. Controlled via `onFilesChange`. Presentational only — wire the
 * actual upload in the parent.
 */
export function FileUpload({
  onFilesChange,
  accept,
  multiple = false,
  hint,
  className,
}: {
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: React.ReactNode;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);

  const setAndEmit = (next: File[]) => {
    setFiles(next);
    onFilesChange?.(next);
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    setAndEmit(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
  };

  const removeAt = (i: number) => setAndEmit(files.filter((_, idx) => idx !== i));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
          "focus-visible:outline-none focus-visible:shadow-focus",
          dragging ? "border-pes-400 bg-pes-50" : "border-line bg-canvas hover:border-pes-200",
        )}
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-pes-50 text-pes-700">
          <UploadCloud className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-strong">
          Drop {multiple ? "files" : "a file"} here, or <span className="text-pes-700">browse</span>
        </span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
              <FileIcon className="h-4 w-4 text-muted shrink-0" />
              <span className="truncate text-body flex-1">{f.name}</span>
              <span className="text-xs text-muted shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${f.name}`}
                className="text-muted hover:text-danger-600 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
