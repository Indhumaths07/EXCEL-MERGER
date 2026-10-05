import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Copy, Check, ShieldCheck } from 'lucide-react';
import { ColumnType, FormattingConfig } from '../types/sheet';
import { exportToExcel, exportToCsv, copyToClipboard } from '../utils/excelExporter';

interface ExportPanelProps {
  lang: 'en' | 'ta';
  columns: string[];
  rows: Record<string, any>[];
  columnTypes: Record<string, ColumnType>;
  config: FormattingConfig;
  defaultName?: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  lang,
  columns,
  rows,
  columnTypes,
  config,
  defaultName = 'Merged_Consolidated_Sheet',
}) => {
  const [fileName, setFileName] = useState(defaultName);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleExcelExport = async () => {
    try {
      setIsExportingExcel(true);
      await exportToExcel(columns, rows, columnTypes, config, fileName);
    } catch (err) {
      console.error('Failed to export Excel', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleCsvExport = () => {
    exportToCsv(columns, rows, fileName);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(columns, rows);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filename Input */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-neutral-600 whitespace-nowrap">
            {lang === 'ta' ? 'கோப்பு பெயர் (File Name):' : 'Output Filename:'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-md px-3 py-1.5 text-xs font-medium text-neutral-900 w-64 focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Copy to Clipboard */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            title="Copy tab-delimited text to paste directly into Excel or Google Sheets"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">
                  {lang === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-500" />
                <span>{lang === 'ta' ? 'நகலெடு (Copy)' : 'Copy to Clipboard'}</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleCsvExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4 text-neutral-600" />
            <span>{lang === 'ta' ? 'CSV பதிவிறக்கு' : 'Download CSV'}</span>
          </button>

          {/* Export Formatted Excel (.xlsx) */}
          <button
            onClick={handleExcelExport}
            disabled={isExportingExcel}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {isExportingExcel
                ? lang === 'ta'
                  ? 'ஏற்றுமதி செய்கிறது...'
                  : 'Generating Excel...'
                : lang === 'ta'
                ? 'வடிவமைக்கப்பட்ட Excel (.xlsx) பதிவிறக்கு'
                : 'Download Formatted Excel (.xlsx)'}
            </span>
          </button>
        </div>
      </div>

      {/* Formatting Consistency Guarantee Note */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          {lang === 'ta'
            ? 'உறுதிமொழி: இறுதி Excel ஆவணத்தில் எழுத்துரு, வரிசை உயரம், தலைப்பு நிறம், தேதி வடிவங்கள் மற்றும் எண் வடிவங்கள் முழுவதும் ஒரே சீராக இருக்கும்.'
            : 'Formatting Consistency Guarantee: Output workbook includes frozen headers, auto-fitted column widths, unified typography, and standardized date & currency formats across all rows.'}
        </span>
      </div>
    </div>
  );
};
