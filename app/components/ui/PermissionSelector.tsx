'use client';

// Renders the permission hierarchy from PERMISSION_TREE and enforces the
// parent/child relationship: a scope child can only be set when its parent is
// on, and turning a parent off clears its children. Used by both the Create
// Role page and the employee wizard so the structure + rules live in one place.
//
// `value` is a { permissionKey: boolean } map; `onChange` receives a patch of
// the keys that changed, which the parent merges into its own state.

import { PERMISSION_TREE, PermissionKey } from '../utils/roles';

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
          <div key={parent.key} className="border-b border-gray-100 p-4 flex flex-col">
            <label className="flex cursor-pointer">
              <input
                type="checkbox"
                checked={parentOn}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange({ [parent.key]: true });
                  } else {
                    // Turning the parent off clears all its scope children.
                    const patch: Record<string, boolean> = { [parent.key]: false };
                    parent.children.forEach((c) => (patch[c.key] = false));
                    onChange(patch);
                  }
                }}
                className="h-6 w-6 mt-1 me-3 shrink-0"
              />
              <span className="w-10/12">
                <span className="text-lg block">{parent.label}</span>
                <span className="text-gray-600 text-sm">{parent.description}</span>
              </span>
            </label>

            {parent.children.length > 0 && (
              <div
                className={`flex flex-wrap gap-x-6 gap-y-1 ms-9 my-2 text-sm ${
                  parentOn ? 'text-gray-500' : 'text-gray-300'
                }`}
              >
                {parent.children.map((child) => (
                  <label
                    key={child.key}
                    className={`flex items-center gap-1 ${
                      parentOn ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!parentOn}
                      checked={parentOn && on(child.key)}
                      onChange={(e) => onChange({ [child.key]: e.target.checked })}
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
