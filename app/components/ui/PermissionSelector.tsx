'use client';

// Renders the permission hierarchy from PERMISSION_TREE and enforces the
// parent/child relationship: a scope child can only be set when its parent is
// on, and turning a parent off clears its children. Used by both the Create
// Role page and the employee wizard so the structure + rules live in one place.
//
// `value` is a { permissionKey: boolean } map; `onChange` receives a patch of
// the keys that changed, which the parent merges into its own state.

import { PERMISSION_TREE, PermissionKey } from '../utils/roles';
import { Checkbox } from './checkbox';

type Value = Partial<Record<string, boolean>>;

export default function PermissionSelector({
  value,
  onChange,
}: {
  value: Value;
  onChange: (patch: Record<string, boolean>) => void;
}) {
  const on = (k: PermissionKey) => value[k] === true;

  return (
    <div className="flex flex-col">
      {PERMISSION_TREE.map((parent) => {
        const parentOn = on(parent.key);
        return (
          <div key={parent.key} className="border-b border-line last:border-0 p-4 flex flex-col">
            <label className="flex gap-3 cursor-pointer">
              <Checkbox
                checked={parentOn}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange({ [parent.key]: true });
                  } else {
                    // Turning the parent off clears all its scope children.
                    const patch: Record<string, boolean> = { [parent.key]: false };
                    parent.children.forEach((c) => (patch[c.key] = false));
                    onChange(patch);
                  }
                }}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-strong">{parent.label}</span>
                <span className="block text-body text-sm">{parent.description}</span>
              </span>
            </label>

            {parent.children.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 ms-7 mt-3 text-sm">
                {parent.children.map((child) => (
                  <label
                    key={child.key}
                    className={`flex items-center gap-2 ${
                      parentOn ? 'cursor-pointer text-body' : 'cursor-not-allowed text-muted/60'
                    }`}
                  >
                    <Checkbox
                      disabled={!parentOn}
                      checked={parentOn && on(child.key)}
                      onCheckedChange={(checked) => onChange({ [child.key]: checked === true })}
                    />
                    <span>{child.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
