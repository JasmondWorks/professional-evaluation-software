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
  return (
    <div className="w-full overflow-x-auto rounded-md border border-line bg-white">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-canvas text-muted border-b border-line">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`py-3 px-4 font-medium text-sm ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-strong">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={`loading-${i}`} className="border-b border-gray-50">
                <td colSpan={columns.length} className="p-0 border-none">
                  <div className="h-12 w-full bg-canvas animate-pulse my-0.5 rounded-sm"></div>
                </td>
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`border-b border-gray-50 hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((col) => (
                  <td 
                    key={col.key} 
                    className={`py-3 px-4 text-sm font-semibold ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {col.render ? col.render(item, rowIndex) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-muted text-sm">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
