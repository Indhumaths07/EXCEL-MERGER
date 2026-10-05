import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { RenamedSheetData, exportSideBySideToSingleSheet } from '../utils/retailStockEngine';

interface RetailSideBySideViewProps {
  lang: 'en' | 'ta';
  sheet1Data: RenamedSheetData;
  sheet2Data: RenamedSheetData;
  file1Name: string;
  file2Name: string;
}

// Compute vertical rowspans so Column 1 (Color) and Column 2 (Toon Label) appear only 1 time per group
function computeSpans(rows: Record<string, any>[], cols: string[]) {
  const col0Key = cols[0];
  const col1Key = cols[1];

  const col0Spans: number[] = new Array(rows.length).fill(1);
  const col1Spans: number[] = new Array(rows.length).fill(1);

  let i = 0;
  while (i < rows.length) {
    const val0 = String(rows[i][col0Key] ?? '').trim();
    const isTotal = val0.toUpperCase().includes('TOTAL');

    if (isTotal) {
      col0Spans[i] = 1;
      col1Spans[i] = 1;
      i++;
      continue;
    }

    // Find extent of same Color
    let j = i + 1;
    while (j < rows.length) {
      const nextVal0 = String(rows[j][col0Key] ?? '').trim();
      const nextIsTotal = nextVal0.toUpperCase().includes('TOTAL');
      if (nextIsTotal) break;
      if (nextVal0 === val0 || nextVal0 === '') {
        j++;
      } else {
        break;
      }
    }

    const span0 = j - i;
    col0Spans[i] = span0;
    for (let k = i + 1; k < j; k++) {
      col0Spans[k] = 0; // 0 means do not render cell
    }

    // Find extent of same Toon Label within this group
    let p = i;
    while (p < j) {
      const val1 = String(rows[p][col1Key] ?? '').trim();
      let q = p + 1;
      while (q < j) {
        const nextVal1 = String(rows[q][col1Key] ?? '').trim();
        if (nextVal1 === val1 || nextVal1 === '') {
          q++;
        } else {
          break;
        }
      }
      const span1 = q - p;
      col1Spans[p] = span1;
      for (let k = p + 1; k < q; k++) {
        col1Spans[k] = 0;
      }
      p = q;
    }

    i = j;
  }

  return { col0Spans, col1Spans };
}

export const RetailSideBySideView: React.FC<RetailSideBySideViewProps> = ({
  lang,
  sheet1Data,
  sheet2Data,
  file1Name,
  file2Name,
}) => {
  const [reportDate, setReportDate] = useState('02.10.2026');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportSideBySideToSingleSheet(
        sheet1Data,
        sheet2Data,
        'STOCK REPORT',
        'SALES REPORT',
        reportDate,
        `Consolidated_Stock_and_Sales_${reportDate.replace(/\./g, '_')}.xlsx`
      );
    } catch (e) {
      console.error('Failed to export side by side Excel', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const leftCols = sheet1Data.renamedColumns;
  const rightCols = sheet2Data.renamedColumns;

  // Compute 1-time appearance spans for both tables
  const leftSpans = useMemo(() => computeSpans(sheet1Data.rows, leftCols), [sheet1Data.rows, leftCols]);
  const rightSpans = useMemo(() => computeSpans(sheet2Data.rows, rightCols), [sheet2Data.rows, rightCols]);

  const getColorBg = (val: any) => {
    const s = String(val ?? '').toUpperCase().trim();
    if (s.includes('TOTAL')) return 'bg-amber-200 text-neutral-900 font-bold';
    if (s.includes('GREY') || s.includes('GRAY')) return 'bg-slate-100/90 text-slate-900 font-semibold';
    if (s.includes('BEIGE')) return 'bg-amber-50 text-amber-950 font-semibold';
    if (s.includes('CREAM')) return 'bg-yellow-50/90 text-yellow-950 font-semibold';
    if (s.includes('WHITE')) return 'bg-stone-50 text-stone-900 font-semibold';
    return 'bg-white text-neutral-900';
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Controls & Actions */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h2 className="text-base font-bold text-neutral-900">
              {lang === 'ta'
                ? 'இருப்பு & விற்பனை அறிக்கை (Side-by-Side)'
                : 'Stock & Sales Report (Side-by-Side)'}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Date Input */}
            <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-500 text-[11px]">Date:</span>
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="bg-transparent border-none text-xs font-mono font-semibold text-neutral-800 focus:outline-none w-24"
              />
            </div>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-4 h-4 text-neutral-500" />
              <span>{lang === 'ta' ? 'அச்சிடு (Print)' : 'Print / A4 View'}</span>
            </button>

            {/* Download Excel */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {isExporting
                  ? 'Generating Excel...'
                  : lang === 'ta'
                  ? 'Excel (.xlsx) பதிவிறக்கு'
                  : 'Download Excel (.xlsx)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Sheet Preview Container (Matching User's Photo) */}
      <div className="bg-white border border-neutral-300 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto max-h-[740px] print:max-h-none print:overflow-visible">
          <div className="min-w-[1280px] p-4 bg-neutral-100/50">
            <div className="grid grid-cols-2 gap-4">
              {/* 1. LEFT TABLE: STOCK REPORT */}
              <div className="bg-white border border-neutral-300 rounded-lg overflow-hidden shadow-2xs">
                {/* Table Title Banner */}
                <div className="bg-neutral-800 text-white px-3 py-2 text-center text-xs font-bold uppercase tracking-wider">
                  STOCK REPORT - {reportDate}
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-teal-900 text-white font-semibold text-[11px] border-b border-teal-950">
                      {leftCols.map((col, idx) => (
                        <th
                          key={idx}
                          className={`py-1.5 px-2 border-r border-teal-800/60 font-mono ${
                            idx <= 1 ? 'text-center' : 'text-center'
                          } ${col === 'TOTAL' ? 'bg-teal-950 font-bold' : ''}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
                    {sheet1Data.rows.map((row, rIdx) => {
                      const colorVal = row['Color'] || row[leftCols[0]];
                      const isTotal = String(colorVal || '').toUpperCase().includes('TOTAL');

                      const col0Span = leftSpans.col0Spans[rIdx];
                      const col1Span = leftSpans.col1Spans[rIdx];

                      return (
                        <tr
                          key={rIdx}
                          className={isTotal ? 'bg-amber-200 font-bold text-neutral-900' : 'hover:bg-neutral-50'}
                        >
                          {/* Column 0: Color - Only renders 1 time per group */}
                          {col0Span > 0 && (
                            <td
                              rowSpan={col0Span}
                              className={`py-1 px-2 border-r border-neutral-200 text-center align-middle font-sans font-medium whitespace-nowrap ${getColorBg(
                                colorVal
                              )}`}
                            >
                              {colorVal !== undefined && colorVal !== null ? String(colorVal) : ''}
                            </td>
                          )}

                          {/* Column 1: Toon Label - Only renders 1 time per group */}
                          {col1Span > 0 && (
                            <td
                              rowSpan={col1Span}
                              className={`py-1 px-2 border-r border-neutral-200 text-center align-middle font-mono whitespace-nowrap text-neutral-700 ${getColorBg(
                                colorVal
                              )}`}
                            >
                              {row[leftCols[1]] !== undefined && row[leftCols[1]] !== null
                                ? String(row[leftCols[1]])
                                : ''}
                            </td>
                          )}

                          {/* Columns 2 onwards: Size, Locations, Total */}
                          {leftCols.slice(2).map((col) => {
                            const val = row[col];
                            const isSizeCol = col.toLowerCase().includes('size');

                            return (
                              <td
                                key={col}
                                className={`py-1 px-2 border-r border-neutral-200 whitespace-nowrap text-center ${
                                  isSizeCol ? 'font-semibold text-neutral-800' : 'tabular-nums'
                                } ${col === 'TOTAL' ? 'font-bold bg-neutral-100/60' : ''}`}
                              >
                                {val !== undefined && val !== null ? String(val) : ''}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 2. RIGHT TABLE: SALES REPORT */}
              <div className="bg-white border border-neutral-300 rounded-lg overflow-hidden shadow-2xs">
                {/* Table Title Banner */}
                <div className="bg-neutral-800 text-white px-3 py-2 text-center text-xs font-bold uppercase tracking-wider">
                  SALES REPORT - {reportDate}
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-teal-900 text-white font-semibold text-[11px] border-b border-teal-950">
                      {rightCols.map((col, idx) => (
                        <th
                          key={idx}
                          className={`py-1.5 px-2 border-r border-teal-800/60 font-mono ${
                            idx <= 1 ? 'text-center' : 'text-center'
                          } ${col === 'TOTAL' ? 'bg-teal-950 font-bold' : ''}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
                    {sheet2Data.rows.map((row, rIdx) => {
                      const colorVal = row['Color'] || row[rightCols[0]];
                      const isTotal = String(colorVal || '').toUpperCase().includes('TOTAL');

                      const col0Span = rightSpans.col0Spans[rIdx];
                      const col1Span = rightSpans.col1Spans[rIdx];

                      return (
                        <tr
                          key={rIdx}
                          className={isTotal ? 'bg-amber-200 font-bold text-neutral-900' : 'hover:bg-neutral-50'}
                        >
                          {/* Column 0: Color - Only renders 1 time per group */}
                          {col0Span > 0 && (
                            <td
                              rowSpan={col0Span}
                              className={`py-1 px-2 border-r border-neutral-200 text-center align-middle font-sans font-medium whitespace-nowrap ${getColorBg(
                                colorVal
                              )}`}
                            >
                              {colorVal !== undefined && colorVal !== null ? String(colorVal) : ''}
                            </td>
                          )}

                          {/* Column 1: Toon Label - Only renders 1 time per group */}
                          {col1Span > 0 && (
                            <td
                              rowSpan={col1Span}
                              className={`py-1 px-2 border-r border-neutral-200 text-center align-middle font-mono whitespace-nowrap text-neutral-700 ${getColorBg(
                                colorVal
                              )}`}
                            >
                              {row[rightCols[1]] !== undefined && row[rightCols[1]] !== null
                                ? String(row[rightCols[1]])
                                : ''}
                            </td>
                          )}

                          {/* Columns 2 onwards: Size, Locations, Total */}
                          {rightCols.slice(2).map((col) => {
                            const val = row[col];
                            const isSizeCol = col.toLowerCase().includes('size');

                            return (
                              <td
                                key={col}
                                className={`py-1 px-2 border-r border-neutral-200 whitespace-nowrap text-center ${
                                  isSizeCol ? 'font-semibold text-neutral-800' : 'tabular-nums'
                                } ${col === 'TOTAL' ? 'font-bold bg-neutral-100/60' : ''}`}
                              >
                                {val !== undefined && val !== null ? String(val) : ''}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
