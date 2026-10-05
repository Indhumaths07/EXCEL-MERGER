import React from 'react';
import {
  SlidersHorizontal,
  TableProperties,
  Calendar,
  DollarSign,
  Palette,
  Check,
  Split,
  FileCheck,
  Type,
  Filter,
} from 'lucide-react';
import {
  DateFormatOption,
  FormattingConfig,
  HeaderTheme,
  JoinType,
  MergeMode,
  ColumnMapping,
} from '../types/sheet';

interface MergeControlsProps {
  lang: 'en' | 'ta';
  mode: MergeMode;
  setMode: (mode: MergeMode) => void;
  joinType: JoinType;
  setJoinType: (type: JoinType) => void;
  joinKeyCol1: string;
  setJoinKeyCol1: (col: string) => void;
  joinKeyCol2: string;
  setJoinKeyCol2: (col: string) => void;
  columns1: string[];
  columns2: string[];
  mappings: ColumnMapping[];
  onOpenMappingModal: () => void;
  config: FormattingConfig;
  updateConfig: (patch: Partial<FormattingConfig>) => void;
}

export const MergeControls: React.FC<MergeControlsProps> = ({
  lang,
  mode,
  setMode,
  joinType,
  setJoinType,
  joinKeyCol1,
  setJoinKeyCol1,
  joinKeyCol2,
  setJoinKeyCol2,
  columns1,
  columns2,
  mappings,
  onOpenMappingModal,
  config,
  updateConfig,
}) => {
  const matchedCount = mappings.filter((m) => m.file1Column && m.file2Column).length;
  const totalCols = mappings.length;

  const headerThemes: { id: HeaderTheme; name: string; bg: string; border: string }[] = [
    { id: 'slate', name: 'Slate Pro', bg: 'bg-slate-800', border: 'border-slate-800' },
    { id: 'navy', name: 'Executive Navy', bg: 'bg-slate-900', border: 'border-slate-900' },
    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-900', border: 'border-emerald-900' },
    { id: 'indigo', name: 'Royal Indigo', bg: 'bg-indigo-900', border: 'border-indigo-900' },
    { id: 'mono', name: 'Monochrome', bg: 'bg-neutral-800', border: 'border-neutral-800' },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Top Bar: Merge Mode & Column Alignment Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        {/* Merge Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {lang === 'ta' ? 'இணைப்பு வகை:' : 'Merge Mode:'}
          </span>
          <div className="inline-flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 text-xs font-medium">
            <button
              onClick={() => setMode('append')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                mode === 'append'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'வரிசைகளைச் சேர் (Append Rows)' : 'Append Rows (Vertical)'}</span>
            </button>
            <button
              onClick={() => setMode('join')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                mode === 'join'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'பத்தியை இணை (Key Join)' : 'Key Join (Horizontal)'}</span>
            </button>
          </div>
        </div>

        {/* Column Alignment Inspector Trigger */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-neutral-600">
            <span className="font-semibold text-neutral-900 font-mono">{matchedCount}</span> of{' '}
            <span className="font-mono">{totalCols}</span> columns matched
          </div>
          <button
            onClick={onOpenMappingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <span>{lang === 'ta' ? 'நெடுவரிசை மேப்பிங் அமைப்புகள்' : 'Inspect Column Mapping'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Join Mode Extra Controls */}
      {mode === 'join' && (
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-700">
              {lang === 'ta' ? 'இணைப்பு முறை (Join Type):' : 'Join Type:'}
            </span>
            <select
              value={joinType}
              onChange={(e) => setJoinType(e.target.value as JoinType)}
              className="bg-white border border-neutral-300 rounded px-2.5 py-1 font-medium text-neutral-800"
            >
              <option value="left">Left Join (All File 1 rows + matching File 2)</option>
              <option value="inner">Inner Join (Only matching rows in both)</option>
              <option value="full">Full Outer Join (All rows from both files)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-700">File 1 Key:</span>
            <select
              value={joinKeyCol1}
              onChange={(e) => setJoinKeyCol1(e.target.value)}
              className="bg-white border border-neutral-300 rounded px-2.5 py-1 text-neutral-800 font-mono"
            >
              {columns1.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-700">File 2 Key:</span>
            <select
              value={joinKeyCol2}
              onChange={(e) => setJoinKeyCol2(e.target.value)}
              className="bg-white border border-neutral-300 rounded px-2.5 py-1 text-neutral-800 font-mono"
            >
              {columns2.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Formatting Consistency Engine Controls (Core Requirement) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-neutral-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            {lang === 'ta'
              ? 'வடிவமைப்பை சீரமைக்கும் கட்டுப்பாடுகள் (Consistent Formatting Engine)'
              : 'Consistent Formatting Engine Controls'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* 1. Header Styling Theme */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600">
              {lang === 'ta' ? 'தலைப்பு வண்ணம் (Header Theme):' : 'Header Style Theme:'}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {headerThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateConfig({ headerTheme: theme.id })}
                  className={`w-7 h-7 rounded-md ${theme.bg} flex items-center justify-center transition-all ${
                    config.headerTheme === theme.id
                      ? 'ring-2 ring-offset-2 ring-neutral-900 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={theme.name}
                >
                  {config.headerTheme === theme.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Date Format Standardization */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{lang === 'ta' ? 'தேதி வடிவம் (Date Format):' : 'Standard Date Format:'}</span>
            </label>
            <select
              value={config.dateFormat}
              onChange={(e) => updateConfig({ dateFormat: e.target.value as DateFormatOption })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 font-mono"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (2024-01-15)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (15/01/2024)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (01/15/2024)</option>
              <option value="DD-MMM-YYYY">DD-MMM-YYYY (15-Jan-2024)</option>
            </select>
          </div>

          {/* 3. Number & Currency Precision */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
              <span>{lang === 'ta' ? 'தசம ஸ்தானங்கள் & நாணயம்:' : 'Decimals & Currency:'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={config.decimalPlaces}
                onChange={(e) => updateConfig({ decimalPlaces: Number(e.target.value) })}
                className="bg-neutral-50 border border-neutral-300 rounded-md px-2 py-1.5 text-xs text-neutral-800 font-mono"
              >
                <option value={0}>0 Decimals (100)</option>
                <option value={1}>1 Decimal (100.0)</option>
                <option value={2}>2 Decimals (100.00)</option>
                <option value={4}>4 Decimals (100.0000)</option>
              </select>
              <select
                value={config.currencySymbol}
                onChange={(e) => updateConfig({ currencySymbol: e.target.value })}
                className="bg-neutral-50 border border-neutral-300 rounded-md px-2 py-1.5 text-xs text-neutral-800 font-mono"
              >
                <option value="$">$ (USD)</option>
                <option value="₹">₹ (INR)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>
          </div>

          {/* 4. Document Font & Typography */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-neutral-400" />
              <span>{lang === 'ta' ? 'எழுத்துரு (Document Font):' : 'Document Typography:'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={config.fontFamily}
                onChange={(e) => updateConfig({ fontFamily: e.target.value as any })}
                className="bg-neutral-50 border border-neutral-300 rounded-md px-2 py-1.5 text-xs text-neutral-800"
              >
                <option value="Calibri">Calibri</option>
                <option value="Arial">Arial</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Segoe UI">Segoe UI</option>
              </select>
              <select
                value={config.fontSize}
                onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
                className="bg-neutral-50 border border-neutral-300 rounded-md px-2 py-1.5 text-xs text-neutral-800 font-mono"
              >
                <option value={10}>10 pt (Dense)</option>
                <option value={11}>11 pt (Standard)</option>
                <option value={12}>12 pt (Comfortable)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Formatting Toggles */}
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-700">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.enableZebraStriping}
              onChange={(e) => updateConfig({ enableZebraStriping: e.target.checked })}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span>{lang === 'ta' ? 'வரிக்கு வரி மாற்று பின்னணி (Zebra Striping)' : 'Zebra Striped Rows'}</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.enableGridBorders}
              onChange={(e) => updateConfig({ enableGridBorders: e.target.checked })}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span>{lang === 'ta' ? 'கட்டம் கோடுகள் (Grid Borders)' : 'Cell Grid Borders'}</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.trimWhitespace}
              onChange={(e) => updateConfig({ trimWhitespace: e.target.checked })}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span>{lang === 'ta' ? 'கூடுதல் இடைவெளியை நீக்கு (Trim Spaces)' : 'Trim Extra Spaces'}</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.addSourceColumn}
              onChange={(e) => updateConfig({ addSourceColumn: e.target.checked })}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span>{lang === 'ta' ? 'மூல கோப்பு நெடுவரிசை (Source File Tag)' : 'Add Origin File Tag Column'}</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.removeDuplicates}
              onChange={(e) => updateConfig({ removeDuplicates: e.target.checked })}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span>{lang === 'ta' ? 'போலி வரிகளை நீக்கு (Deduplicate)' : 'Remove Duplicate Rows'}</span>
          </label>
        </div>
      </div>
    </div>
  );
};
