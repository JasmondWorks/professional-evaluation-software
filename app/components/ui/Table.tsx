import React, { ReactNode } from 'react';

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
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found",
  onRowClick,
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
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={`loading-${i}`}>
                <td colSpan={columns.length} className="p-0">
                  <div className="h-12 w-full bg-canvas animate-pulse my-0.5 rounded-sm"></div>
                </td>
              </tr>
            ))
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
