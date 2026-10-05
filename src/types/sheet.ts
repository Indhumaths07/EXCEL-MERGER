export type MergeMode = 'append' | 'join' | 'retail_side_by_side';

export type JoinType = 'left' | 'inner' | 'full';

export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'percentage' | 'boolean';

export type HeaderTheme = 'slate' | 'navy' | 'emerald' | 'indigo' | 'mono';

export type DateFormatOption = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'DD-MMM-YYYY';

export interface LocationDef {
  code: string;
  fullName: string;
  aliases: string[];
}

export interface RetailMatrixRow {
  color: string;
  toonLabel: string;
  size: string;
  quantities: Record<string, number>;
  total: number;
}

export interface RetailReportData {
  reportDate: string;
  stockRows: RetailMatrixRow[];
  salesRows: RetailMatrixRow[];
  locationCodes: string[];
  locations: LocationDef[];
  stockLocationTotals: Record<string, number>;
  salesLocationTotals: Record<string, number>;
  stockGrandTotal: number;
  salesGrandTotal: number;
}

export interface ParsedSheet {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface UploadedFileState {
  file: File;
  name: string;
  size: number;
  type: string;
  sheets: ParsedSheet[];
  activeSheetIndex: number;
  isLoading: boolean;
  error?: string;
}

export interface ColumnMapping {
  targetColumn: string;
  file1Column: string | null;
  file2Column: string | null;
  detectedType: ColumnType;
  customType?: ColumnType;
}

export interface FormattingConfig {
  headerTheme: HeaderTheme;
  fontFamily: 'Calibri' | 'Arial' | 'Plus Jakarta Sans' | 'Segoe UI';
  fontSize: number;
  enableZebraStriping: boolean;
  enableGridBorders: boolean;
  dateFormat: DateFormatOption;
  decimalPlaces: number;
  currencySymbol: string;
  trimWhitespace: boolean;
  addSourceColumn: boolean;
  removeDuplicates: boolean;
  dedupKeyColumn?: string;
  emptyCellPlaceholder: string; // e.g. "" or "-" or "N/A"
}

export interface MergeStats {
  totalRows: number;
  file1Rows: number;
  file2Rows: number;
  duplicateRowsRemoved: number;
  matchedColumnsCount: number;
  unmatchedColumnsCount: number;
}
