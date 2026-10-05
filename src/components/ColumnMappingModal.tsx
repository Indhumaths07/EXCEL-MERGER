import React from 'react';
import { X, ArrowRight, Check, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import { ColumnMapping, ColumnType } from '../types/sheet';

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ta';
  mappings: ColumnMapping[];
  columns1: string[];
  columns2: string[];
  onUpdateMapping: (updated: ColumnMapping[]) => void;
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  lang,
  mappings,
  columns1,
  columns2,
  onUpdateMapping,
}) => {
  if (!isOpen) return null;

  const handleTargetChange = (index: number, newTarget: string) => {
    const copy = [...mappings];
    copy[index] = { ...copy[index], targetColumn: newTarget };
    onUpdateMapping(copy);
  };

  const handleFile1Change = (index: number, val: string) => {
    const copy = [...mappings];
    copy[index] = { ...copy[index], file1Column: val === '__NONE__' ? null : val };
    onUpdateMapping(copy);
  };

  const handleFile2Change = (index: number, val: string) => {
    const copy = [...mappings];
    copy[index] = { ...copy[index], file2Column: val === '__NONE__' ? null : val };
    onUpdateMapping(copy);
  };

  const handleTypeChange = (index: number, val: ColumnType) => {
    const copy = [...mappings];
    copy[index] = { ...copy[index], customType: val };
    onUpdateMapping(copy);
  };

  const handleRemoveMapping = (index: number) => {
    const copy = mappings.filter((_, i) => i !== index);
    onUpdateMapping(copy);
  };

  const handleAddMapping = () => {
    const newMapping: ColumnMapping = {
      targetColumn: `Custom_Column_${mappings.length + 1}`,
      file1Column: null,
      file2Column: null,
      detectedType: 'text',
    };
    onUpdateMapping([...mappings, newMapping]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-neutral-700" />
            <h2 className="text-base font-bold text-neutral-900">
              {lang === 'ta'
                ? 'நெடுவரிசை சீரமைப்பு மற்றும் வடிவம் (Column Alignment & Types)'
                : 'Column Alignment & Type Harmonization'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Mapping Table */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-neutral-600">
            {lang === 'ta'
              ? 'கோப்பு 1 மற்றும் கோப்பு 2 நெடுவரிசைகளை ஒரே பெயரில் இணைக்கவும். தரவு வகை தானாக கண்டறியப்பட்டு ஒரே சீராக மாற்றப்படும்.'
              : 'Verify or customize how columns from File 1 and File 2 map into the consolidated output sheet. All values in a column will follow the selected format type consistently.'}
          </p>

          <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100/80 border-b border-neutral-200 font-semibold text-neutral-700">
                  <th className="py-2.5 px-3">File 1 Column</th>
                  <th className="py-2.5 px-3">File 2 Column</th>
                  <th className="py-2.5 px-3">Target Header Name</th>
                  <th className="py-2.5 px-3">Format Type</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {mappings.map((m, idx) => {
                  const effectiveType = m.customType || m.detectedType;
                  const isBothMatched = !!m.file1Column && !!m.file2Column;

                  return (
                    <tr key={idx} className="hover:bg-neutral-50/80">
                      {/* File 1 Col */}
                      <td className="p-2.5">
                        <select
                          value={m.file1Column || '__NONE__'}
                          onChange={(e) => handleFile1Change(idx, e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800 font-mono"
                        >
                          <option value="__NONE__">(Unmapped)</option>
                          {columns1.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* File 2 Col */}
                      <td className="p-2.5">
                        <select
                          value={m.file2Column || '__NONE__'}
                          onChange={(e) => handleFile2Change(idx, e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800 font-mono"
                        >
                          <option value="__NONE__">(Unmapped)</option>
                          {columns2.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Target Col */}
                      <td className="p-2.5">
                        <div className="relative">
                          <input
                            type="text"
                            value={m.targetColumn}
                            onChange={(e) => handleTargetChange(idx, e.target.value)}
                            className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs font-medium text-neutral-900"
                          />
                          {isBothMatched && (
                            <span
                              className="absolute right-2 top-1.5 text-emerald-600"
                              title="Matched from both files"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Format Type */}
                      <td className="p-2.5">
                        <select
                          value={effectiveType}
                          onChange={(e) => handleTypeChange(idx, e.target.value as ColumnType)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs font-medium text-neutral-800"
                        >
                          <option value="text">Text (Clean string)</option>
                          <option value="number">Number (Tabular)</option>
                          <option value="currency">Currency ($ / ₹)</option>
                          <option value="date">Date (Standardized)</option>
                          <option value="percentage">Percentage (%)</option>
                          <option value="boolean">Boolean (Yes/No)</option>
                        </select>
                      </td>

                      {/* Delete */}
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleRemoveMapping(idx)}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                          title="Remove Column"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleAddMapping}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-500" />
            <span>{lang === 'ta' ? 'புதிய நெடுவரிசையைச் சேர்' : 'Add Custom Column'}</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-neutral-200 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {lang === 'ta' ? 'மாற்றங்களைச் சேமித்து முடி' : 'Done & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};
