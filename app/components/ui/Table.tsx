import React, { ReactNode } from 'react';
import Skeleton from './Skeleton';

export type TableColumn<T> = {
  key: string;
  label: string;
  render?: (item: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
};

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  /** Rows to show while `loading` is true. Defaults to 4. */
  skeletonRows?: number;
  /** Full control over one loading row — return the `<tr>` yourself (so you
   *  can shape cells for this specific table, e.g. an avatar + two lines in
   *  the first column). Called once per skeleton row with its index. When
   *  given, the default per-column skeleton cells below are not rendered. */
  renderSkeletonRow?: (index: number) => ReactNode;
}

// A handful of inset widths so skeleton cells don't all read as one solid
// bar — varying them (and never running edge-to-edge) is what makes this
// look like text loading in a cell rather than a background color.
const SKELETON_WIDTHS = ['70%', '45%', '85%', '55%'];

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found",
  onRowClick,
  skeletonRows = 4,
  renderSkeletonRow,
}: TableProps<T>) {
  const alignCls = (a?: 'left' | 'center' | 'right') =>
    a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left';

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-canvas border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted ${alignCls(col.align)}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) =>
              renderSkeletonRow ? (
                <React.Fragment key={`loading-${i}`}>{renderSkeletonRow(i)}</React.Fragment>
              ) : (
                <tr key={`loading-${i}`}>
                  {columns.map((col, colIndex) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 ${alignCls(col.align)}`}
                    >
                      {/* min-h-8 matches Button's "sm" height (the most common
                          control real cells render — actions, badges) so the
                          row doesn't grow once real content replaces this. The
                          bar itself stays a slim pill, centered inside. */}
                      <div
                        className={`min-h-8 flex items-center ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''}`}
                      >
                        <Skeleton
                          className="h-4 rounded-full"
                          style={{ width: SKELETON_WIDTHS[(i + colIndex) % SKELETON_WIDTHS.length] }}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ),
            )
          ) : data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-canvas transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-4 text-sm text-body ${alignCls(col.align)}`}
                  >
                    {col.render ? col.render(item, rowIndex) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-muted text-sm">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
