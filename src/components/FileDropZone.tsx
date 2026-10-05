import React, { useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Trash2, Sparkles, Layers } from 'lucide-react';
import { UploadedFileState } from '../types/sheet';
import { SAMPLE_DATASETS, SampleDataset } from '../data/sampleDatasets';

interface FileDropZoneProps {
  lang: 'en' | 'ta';
  file1: UploadedFileState | null;
  file2: UploadedFileState | null;
  onFile1Upload: (file: File) => void;
  onFile2Upload: (file: File) => void;
  onFile1Remove: () => void;
  onFile2Remove: () => void;
  onFile1SheetChange: (index: number) => void;
  onFile2SheetChange: (index: number) => void;
  onLoadSample: (sample: SampleDataset) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  lang,
  file1,
  file2,
  onFile1Upload,
  onFile2Upload,
  onFile1Remove,
  onFile2Remove,
  onFile1SheetChange,
  onFile2SheetChange,
  onLoadSample,
}) => {
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, target: 1 | 2) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (target === 1) onFile1Upload(e.dataTransfer.files[0]);
      else onFile2Upload(e.dataTransfer.files[0]);
    }
  };

  const renderCard = (
    fileNumber: 1 | 2,
    fileState: UploadedFileState | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    onUpload: (file: File) => void,
    onRemove: () => void,
    onSheetChange: (index: number) => void
  ) => {
    const isLoaded = !!fileState && fileState.sheets.length > 0;
    const activeSheet = isLoaded ? fileState.sheets[fileState.activeSheetIndex] : null;

    return (
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, fileNumber)}
        className={`flex-1 border rounded-xl p-5 transition-all bg-white ${
          isLoaded
            ? 'border-neutral-300 shadow-xs'
            : 'border-dashed border-neutral-300 hover:border-neutral-400 bg-neutral-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.tsv,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onUpload(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                fileNumber === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {fileNumber}
            </span>
            <span className="font-semibold text-neutral-900 text-sm">
              {fileNumber === 1
                ? lang === 'ta'
                  ? 'முதல் கோப்பு (File 1 / Base Sheet)'
                  : 'File 1: Base Sheet'
                : lang === 'ta'
                ? 'இரண்டாம் கோப்பு (File 2 / Merge Sheet)'
                : 'File 2: Merge Sheet'}
            </span>
          </div>

          {isLoaded && (
            <button
              onClick={onRemove}
              className="text-xs text-neutral-400 hover:text-red-600 flex items-center gap-1 transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'நீக்கு' : 'Remove'}</span>
            </button>
          )}
        </div>

        {!isLoaded ? (
          /* Empty / Upload State */
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center py-8 px-4 text-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center text-neutral-500 mb-3 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-800 mb-1">
              {lang === 'ta'
                ? 'கோப்பை இங்கே இழுத்து விடவும் அல்லது தேர்ந்தெடுக்கவும்'
                : 'Drop file here or click to browse'}
            </p>
            <p className="text-xs text-neutral-500 font-mono">
              Excel (.xlsx, .xls) or CSV (.csv, .tsv)
            </p>
            <button
              type="button"
              className="mt-4 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 shadow-2xs"
            >
              {lang === 'ta' ? 'கோப்பை தேர்வு செய்' : 'Select File'}
            </button>
          </div>
        ) : (
          /* Loaded State */
          <div className="space-y-3">
            <div className="flex items-start justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div className="flex items-start gap-2.5 min-w-0">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate" title={fileState.name}>
                    {fileState.name}
                  </p>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    {(fileState.size / 1024).toFixed(1)} KB · {activeSheet?.totalRows ?? 0} rows ·{' '}
                    {activeSheet?.columns.length ?? 0} columns
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'தயாராக உள்ளது' : 'Ready'}</span>
              </span>
            </div>

            {/* Sheet Selector if multiple sheets in workbook */}
            {fileState.sheets.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <label className="text-neutral-500 font-medium">
                  {lang === 'ta' ? 'தாள் (Sheet):' : 'Select Sheet:'}
                </label>
                <select
                  value={fileState.activeSheetIndex}
                  onChange={(e) => onSheetChange(Number(e.target.value))}
                  className="bg-white border border-neutral-300 rounded px-2 py-1 text-neutral-800 text-xs font-medium"
                >
                  {fileState.sheets.map((sheet, idx) => (
                    <option key={sheet.name} value={idx}>
                      {sheet.name} ({sheet.totalRows} rows)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick 3-Row Mini Preview */}
            {activeSheet && activeSheet.rows.length > 0 && (
              <div className="border border-neutral-200 rounded-md overflow-hidden bg-white text-xs">
                <div className="bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 border-b border-neutral-200 flex justify-between">
                  <span>{lang === 'ta' ? 'மாதிரி முன்னோட்டம் (முதல் 3 வரிகள்)' : 'Sample Preview (First 3 rows)'}</span>
                  <span className="font-mono text-neutral-500">{activeSheet.columns.length} cols</span>
                </div>
                <div className="overflow-x-auto max-h-28">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        {activeSheet.columns.slice(0, 5).map((col) => (
                          <th key={col} className="p-1.5 text-[11px] font-medium text-neutral-700 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                        {activeSheet.columns.length > 5 && (
                          <th className="p-1.5 text-[11px] font-medium text-neutral-400">
                            +{activeSheet.columns.length - 5} more
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                      {activeSheet.rows.slice(0, 3).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-neutral-50/50">
                          {activeSheet.columns.slice(0, 5).map((col) => (
                            <td key={col} className="p-1.5 text-neutral-600 whitespace-nowrap truncate max-w-[120px]">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                          {activeSheet.columns.length > 5 && (
                            <td className="p-1.5 text-neutral-400">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 2 Drop Cards side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCard(1, file1, inputRef1, onFile1Upload, onFile1Remove, onFile1SheetChange)}
        {renderCard(2, file2, inputRef2, onFile2Upload, onFile2Remove, onFile2SheetChange)}
      </div>

      {/* One-click Sample Datasets Loader */}
      {(!file1 || !file2) && (
        <div className="bg-neutral-100/70 border border-neutral-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-700">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {lang === 'ta'
                ? 'சோதனை செய்ய மாதிரி கோப்புகளை உடனடியாக ஏற்றலாம்:'
                : 'Need instant test data? Load pre-configured sample files:'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {SAMPLE_DATASETS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onLoadSample(sample)}
                className="px-2.5 py-1.5 font-medium bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-neutral-500" />
                <span>{lang === 'ta' ? sample.tamilTitle : sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
