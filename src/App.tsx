import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle,
  FileCheck2,
  Split,
  TableProperties,
} from 'lucide-react';
import {
  ColumnMapping,
  FormattingConfig,
  JoinType,
  MergeMode,
  UploadedFileState,
} from './types/sheet';
import { Header } from './components/Header';
import { FileDropZone } from './components/FileDropZone';
import { MergeControls } from './components/MergeControls';
import { ColumnMappingModal } from './components/ColumnMappingModal';
import { ConsolidatedTable } from './components/ConsolidatedTable';
import { ExportPanel } from './components/ExportPanel';
import { RetailSideBySideView } from './components/RetailSideBySideView';
import { parseSpreadsheetFile } from './utils/fileParser';
import { generateColumnMappings, executeMerge } from './utils/mergeEngine';
import { SAMPLE_DATASETS, SampleDataset } from './data/sampleDatasets';
import {
  DEFAULT_LOCATIONS,
  processFileWithRenamedHeaders,
  isRetailStockOrSalesReport,
} from './utils/retailStockEngine';

const DEFAULT_CONFIG: FormattingConfig = {
  headerTheme: 'slate',
  fontFamily: 'Calibri',
  fontSize: 11,
  enableZebraStriping: true,
  enableGridBorders: true,
  dateFormat: 'YYYY-MM-DD',
  decimalPlaces: 2,
  currencySymbol: '$',
  trimWhitespace: true,
  addSourceColumn: true,
  removeDuplicates: false,
  emptyCellPlaceholder: '-',
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [file1, setFile1] = useState<UploadedFileState | null>(null);
  const [file2, setFile2] = useState<UploadedFileState | null>(null);

  const [mode, setMode] = useState<MergeMode>('retail_side_by_side');
  const [joinType, setJoinType] = useState<JoinType>('left');
  const [joinKeyCol1, setJoinKeyCol1] = useState<string>('');
  const [joinKeyCol2, setJoinKeyCol2] = useState<string>('');

  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [config, setConfig] = useState<FormattingConfig>(DEFAULT_CONFIG);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

  // Active sheets
  const activeSheet1 = file1?.sheets[file1.activeSheetIndex] || null;
  const activeSheet2 = file2?.sheets[file2.activeSheetIndex] || null;

  // Auto-detect if uploaded files are retail stock & sales reports
  useEffect(() => {
    if (activeSheet1 && activeSheet2) {
      if (isRetailStockOrSalesReport(activeSheet1) || isRetailStockOrSalesReport(activeSheet2)) {
        setMode('retail_side_by_side');
      } else if (mode === 'retail_side_by_side') {
        setMode('append');
      }
    }
  }, [activeSheet1, activeSheet2]);

  // Process File 1 and File 2 with renamed location headers: ZERO DATA ALTERATION
  const renamedSheet1 = useMemo(() => {
    if (!activeSheet1) return null;
    return processFileWithRenamedHeaders(activeSheet1, DEFAULT_LOCATIONS);
  }, [activeSheet1]);

  const renamedSheet2 = useMemo(() => {
    if (!activeSheet2) return null;
    return processFileWithRenamedHeaders(activeSheet2, DEFAULT_LOCATIONS);
  }, [activeSheet2]);

  // Generate / regenerate column mappings when active sheets change
  useEffect(() => {
    if (activeSheet1 && activeSheet2) {
      const generated = generateColumnMappings(activeSheet1, activeSheet2);
      setMappings(generated);

      const defaultKey1 =
        activeSheet1.columns.find((c) => /id|code|key|no/i.test(c)) || activeSheet1.columns[0] || '';
      const defaultKey2 =
        activeSheet2.columns.find((c) => /id|code|key|no/i.test(c)) || activeSheet2.columns[0] || '';

      setJoinKeyCol1(defaultKey1);
      setJoinKeyCol2(defaultKey2);
    } else {
      setMappings([]);
    }
  }, [activeSheet1, activeSheet2]);

  // Handle File Uploads
  const handleFileUpload = async (file: File, target: 1 | 2) => {
    try {
      const sheets = await parseSpreadsheetFile(file);
      const state: UploadedFileState = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        sheets,
        activeSheetIndex: 0,
        isLoading: false,
      };

      if (target === 1) setFile1(state);
      else setFile2(state);
    } catch (err: any) {
      alert(`Could not parse file: ${err?.message || 'Invalid spreadsheet file'}`);
    }
  };

  // Load sample dataset
  const handleLoadSample = (sample: SampleDataset) => {
    const dummyFile1 = new File([], sample.file1.name, { type: 'application/vnd.ms-excel' });
    const dummyFile2 = new File([], sample.file2.name, { type: 'application/vnd.ms-excel' });

    setFile1({
      file: dummyFile1,
      name: sample.file1.name,
      size: 14200,
      type: 'sample',
      sheets: [sample.file1.sheet],
      activeSheetIndex: 0,
      isLoading: false,
    });

    setFile2({
      file: dummyFile2,
      name: sample.file2.name,
      size: 15100,
      type: 'sample',
      sheets: [sample.file2.sheet],
      activeSheetIndex: 0,
      isLoading: false,
    });

    if (sample.isRetailReport) {
      setMode('retail_side_by_side');
    } else {
      setMode('append');
    }
  };

  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    setMappings([]);
  };

  const updateConfig = (patch: Partial<FormattingConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  // Execute Merge Computation for generic modes
  const mergeResult = useMemo(() => {
    if (!activeSheet1 || !activeSheet2 || mappings.length === 0 || mode === 'retail_side_by_side') {
      return null;
    }

    return executeMerge(
      activeSheet1,
      activeSheet2,
      file1?.name || 'File1',
      file2?.name || 'File2',
      mappings,
      mode,
      joinType,
      joinKeyCol1,
      joinKeyCol2,
      config
    );
  }, [activeSheet1, activeSheet2, file1?.name, file2?.name, mappings, mode, joinType, joinKeyCol1, joinKeyCol2, config]);

  const bothFilesUploaded = !!file1 && !!file2;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Bar Header */}
      <Header
        lang={lang}
        setLang={setLang}
        onReset={handleReset}
        hasFiles={!!file1 || !!file2}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Simple Clean Title Strip */}
        <div className="flex items-center justify-between pb-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            {lang === 'ta'
              ? 'இருப்பு & விற்பனை அறிக்கை (Stock & Sales Consolidator)'
              : 'Stock & Sales Consolidator'}
          </h1>
        </div>

        {/* 1. File Upload Drop Zones */}
        <section aria-label="Upload Files">
          <FileDropZone
            lang={lang}
            file1={file1}
            file2={file2}
            onFile1Upload={(f) => handleFileUpload(f, 1)}
            onFile2Upload={(f) => handleFileUpload(f, 2)}
            onFile1Remove={() => setFile1(null)}
            onFile2Remove={() => setFile2(null)}
            onFile1SheetChange={(idx) =>
              setFile1((prev) => (prev ? { ...prev, activeSheetIndex: idx } : null))
            }
            onFile2SheetChange={(idx) =>
              setFile2((prev) => (prev ? { ...prev, activeSheetIndex: idx } : null))
            }
            onLoadSample={handleLoadSample}
          />
        </section>

        {/* 2. Format / Merge Mode Selector Bar when files are loaded */}
        {bothFilesUploaded && activeSheet1 && activeSheet2 && (
          <div className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-500 uppercase tracking-wider">
                {lang === 'ta' ? 'அறிக்கை முறை:' : 'Mode:'}
              </span>
              <div className="inline-flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 font-medium">
                <button
                  onClick={() => setMode('retail_side_by_side')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    mode === 'retail_side_by_side'
                      ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ta'
                      ? 'பக்கவாட்டு அறிக்கை (Side-by-Side)'
                      : 'Side-by-Side (Photo Layout)'}
                  </span>
                </button>

                <button
                  onClick={() => setMode('append')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    mode === 'append'
                      ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  <TableProperties className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'வரிசைகளைச் சேர் (Append)' : 'Append Rows'}</span>
                </button>

                <button
                  onClick={() => setMode('join')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    mode === 'join'
                      ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'கிடைமட்ட சேர்க்கை (Join)' : 'Key Join'}</span>
                </button>
              </div>
            </div>

            {mode === 'retail_side_by_side' && (
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Headers: KP, KR, SLM, NKL, KUM, TVM, MLR, GD</span>
              </span>
            )}
          </div>
        )}

        {/* 3. Retail Side-by-Side View (Mode: retail_side_by_side) */}
        {bothFilesUploaded && mode === 'retail_side_by_side' && renamedSheet1 && renamedSheet2 && (
          <RetailSideBySideView
            lang={lang}
            sheet1Data={renamedSheet1}
            sheet2Data={renamedSheet2}
            file1Name={file1?.name || 'Stock_Report'}
            file2Name={file2?.name || 'Sales_Report'}
          />
        )}

        {/* 4. Generic Merge Controls & Table (Mode: append | join) */}
        {bothFilesUploaded && activeSheet1 && activeSheet2 && mode !== 'retail_side_by_side' && (
          <section aria-label="Merge Controls" className="space-y-6">
            <MergeControls
              lang={lang}
              mode={mode}
              setMode={setMode}
              joinType={joinType}
              setJoinType={setJoinType}
              joinKeyCol1={joinKeyCol1}
              setJoinKeyCol1={setJoinKeyCol1}
              joinKeyCol2={joinKeyCol2}
              setJoinKeyCol2={setJoinKeyCol2}
              columns1={activeSheet1.columns}
              columns2={activeSheet2.columns}
              mappings={mappings}
              onOpenMappingModal={() => setIsMappingModalOpen(true)}
              config={config}
              updateConfig={updateConfig}
            />

            {mergeResult && (
              <section aria-label="Consolidated Sheet">
                <div className="space-y-2 mb-2">
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-neutral-800" />
                    <span>
                      {lang === 'ta'
                        ? 'இணைக்கப்பட்ட ஒருங்கிணைந்த தாள் (Live Consolidated Sheet)'
                        : 'Consolidated Single Sheet Preview'}
                    </span>
                  </h2>
                </div>

                <ConsolidatedTable
                  lang={lang}
                  columns={mergeResult.columns}
                  rows={mergeResult.rows}
                  columnTypes={mergeResult.columnTypes}
                  stats={mergeResult.stats}
                  config={config}
                />
              </section>
            )}

            {mergeResult && (
              <section aria-label="Export Actions">
                <ExportPanel
                  lang={lang}
                  columns={mergeResult.columns}
                  rows={mergeResult.rows}
                  columnTypes={mergeResult.columnTypes}
                  config={config}
                  defaultName="Consolidated_Merged_Document"
                />
              </section>
            )}
          </section>
        )}
      </main>

      {/* Column Mapping Modal */}
      {activeSheet1 && activeSheet2 && (
        <ColumnMappingModal
          isOpen={isMappingModalOpen}
          onClose={() => setIsMappingModalOpen(false)}
          lang={lang}
          mappings={mappings}
          columns1={activeSheet1.columns}
          columns2={activeSheet2.columns}
          onUpdateMapping={(updated) => setMappings(updated)}
        />
      )}

      {/* Custom Footer */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-4 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm font-semibold text-neutral-800">
          Made by Two Fellows😎
        </div>
      </footer>
    </div>
  );
}
