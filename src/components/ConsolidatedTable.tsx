import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ColumnType, FormattingConfig, HeaderTheme, MergeStats } from '../types/sheet';

interface ConsolidatedTableProps {
  lang: 'en' | 'ta';
  columns: string[];
  rows: Record<string, any>[];
  columnTypes: Record<string, ColumnType>;
  stats: MergeStats;
  config: FormattingConfig;
}

const THEME_HEADER_CLASSES: Record<HeaderTheme, { bg: string; text: string; border: string }> = {
  slate: { bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-700' },
  navy: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-800' },
  emerald: { bg: 'bg-emerald-900', text: 'text-white', border: 'border-emerald-800' },
  indigo: { bg: 'bg-indigo-900', text: 'text-white', border: 'border-indigo-800' },
  mono: { bg: 'bg-neutral-800', text: 'text-white', border: 'border-neutral-700' },
};

export const ConsolidatedTable: React.FC<ConsolidatedTableProps> = ({
  lang,
  columns,
  rows,
  columnTypes,
  stats,
  config,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Sorting handler
  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortCol(null);
        setSortDir('asc');
      }
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  // Filtered & Sorted Rows
  const processedRows = useMemo(() => {
    let result = [...rows];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Sort
    if (sortCol) {
      result.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined || valA === '') return 1;
        if (valB === null || valB === undefined || valB === '') return -1;

        // Try numeric comparison
        const numA = typeof valA === 'number' ? valA : parseFloat(String(valA).replace(/[\$,€£₹¥%]/g, ''));
        const numB = typeof valB === 'number' ? valB : parseFloat(String(valB).replace(/[\$,€£₹¥%]/g, ''));

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDir === 'asc' ? numA - numB : numB - numA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortDir === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [rows, columns, searchQuery, sortCol, sortDir]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, validCurrentPage, pageSize]);

  const headerStyle = THEME_HEADER_CLASSES[config.headerTheme] || THEME_HEADER_CLASSES.slate;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Top Banner: Stats Bar */}
      <div className="bg-neutral-50 px-5 py-3.5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-neutral-600">
          <div>
            <span className="font-semibold text-neutral-900 font-mono tabular-nums text-sm">
              {stats.totalRows}
            </span>{' '}
            <span>{lang === 'ta' ? 'மொத்த வரிகள் (Merged Rows)' : 'Total Merged Rows'}</span>
          </div>
          <span className="text-neutral-300">·</span>
          <div>
            <span className="font-mono tabular-nums text-neutral-800">{stats.file1Rows}</span>{' '}
            <span>from File 1</span>
          </div>
          <span className="text-neutral-300">·</span>
          <div>
            <span className="font-mono tabular-nums text-neutral-800">{stats.file2Rows}</span>{' '}
            <span>from File 2</span>
          </div>
          {stats.duplicateRowsRemoved > 0 && (
            <>
              <span className="text-neutral-300">·</span>
              <div className="text-amber-700 font-medium">
                <span className="font-mono tabular-nums">{stats.duplicateRowsRemoved}</span>{' '}
                <span>duplicates removed</span>
              </div>
            </>
          )}
          <span className="text-neutral-300">·</span>
          <div>
            <span className="font-mono tabular-nums text-neutral-800">{columns.length}</span>{' '}
            <span>columns</span>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder={lang === 'ta' ? 'அனைத்து தரவுகளிலும் தேட...' : 'Search consolidated data...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-neutral-300 rounded-md pl-8 pr-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="overflow-x-auto max-h-[560px] relative">
        <table className="w-full text-left border-collapse text-xs">
          {/* Header Row */}
          <thead className="sticky top-0 z-20 shadow-xs">
            <tr className={`${headerStyle.bg} ${headerStyle.text}`}>
              <th className="py-2.5 px-3 w-12 text-center text-[10px] font-mono opacity-60 border-r border-white/10 select-none">
                #
              </th>
              {columns.map((col) => {
                const colType = columnTypes[col] || 'text';
                const isSorted = sortCol === col;

                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-2.5 px-3 font-semibold tracking-tight whitespace-nowrap cursor-pointer hover:bg-white/10 select-none transition-colors border-r border-white/10 last:border-r-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        <span className="text-[9px] uppercase font-mono opacity-50 px-1 py-0.2 rounded bg-black/20">
                          {colType}
                        </span>
                      </div>
                      <span className="opacity-70">
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-neutral-200">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-12 text-center text-neutral-500 text-sm"
                >
                  {searchQuery
                    ? `No matching records found for "${searchQuery}".`
                    : 'No records to display.'}
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, rIdx) => {
                const actualRowIndex = (validCurrentPage - 1) * pageSize + rIdx + 1;
                const isEven = rIdx % 2 === 1;

                return (
                  <tr
                    key={rIdx}
                    className={`transition-colors hover:bg-neutral-100/70 ${
                      config.enableZebraStriping && isEven ? 'bg-neutral-50/70' : 'bg-white'
                    }`}
                  >
                    {/* Row Index */}
                    <td className="py-2 px-3 text-center text-[10px] font-mono text-neutral-400 border-r border-neutral-100 select-none">
                      {actualRowIndex}
                    </td>

                    {/* Column Cells with Type-Aware Alignment & Consistent Typography */}
                    {columns.map((col) => {
                      const val = row[col];
                      const colType = columnTypes[col] || 'text';
                      const isSourceTag = col === 'Source_File' || col === 'Source_Status';

                      let alignClass = 'text-left';
                      if (colType === 'number' || colType === 'currency') alignClass = 'text-right font-mono tabular-nums';
                      else if (colType === 'date' || colType === 'boolean') alignClass = 'text-center font-mono';

                      return (
                        <td
                          key={col}
                          className={`py-2 px-3 text-neutral-800 whitespace-nowrap truncate max-w-xs ${alignClass} ${
                            config.enableGridBorders ? 'border-r border-neutral-200/80 last:border-r-0' : ''
                          }`}
                        >
                          {isSourceTag ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                              {String(val ?? '')}
                            </span>
                          ) : (
                            String(val ?? '')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Controls Bar */}
      <div className="bg-white px-5 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-neutral-400">|</span>
          <span>
            Showing <span className="font-mono tabular-nums">{Math.min(processedRows.length, (validCurrentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-mono tabular-nums">{Math.min(processedRows.length, validCurrentPage * pageSize)}</span> of{' '}
            <span className="font-mono tabular-nums font-semibold text-neutral-900">{processedRows.length}</span> rows
          </span>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono tabular-nums">
            Page {validCurrentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
