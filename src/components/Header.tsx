import React from 'react';
import { Layers, RotateCcw, Globe } from 'lucide-react';

interface HeaderProps {
  lang: 'en' | 'ta';
  setLang: (lang: 'en' | 'ta') => void;
  onReset: () => void;
  hasFiles: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  onReset,
  hasFiles,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            SheetMerge Pro
          </span>
        </div>

        {/* Zone 2: Clean minimal label */}
        <div className="hidden md:flex items-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Stock & Sales Consolidator
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
            title="Switch Language / மொழியை மாற்றவும்"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-mono">{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Reset All */}
          {hasFiles && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'மீட்டமை' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
