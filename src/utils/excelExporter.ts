import ExcelJS from 'exceljs';
import { ColumnType, FormattingConfig, HeaderTheme } from '../types/sheet';

interface HeaderColorDef {
  headerBg: string; // ARGB hex (without #)
  headerFg: string;
  zebraBg: string;
  borderColor: string;
}

const THEME_PALETTES: Record<HeaderTheme, HeaderColorDef> = {
  slate: {
    headerBg: 'FF1E293B', // Slate 800
    headerFg: 'FFFFFFFF',
    zebraBg: 'FFF8FAFC',  // Slate 50
    borderColor: 'FFE2E8F0', // Slate 200
  },
  navy: {
    headerBg: 'FF0F172A', // Navy / Slate 900
    headerFg: 'FFFFFFFF',
    zebraBg: 'FFF0F7FF',  // Soft Ice Blue
    borderColor: 'FFCBD5E1', // Slate 300
  },
  emerald: {
    headerBg: 'FF064E3B', // Emerald 900
    headerFg: 'FFFFFFFF',
    zebraBg: 'FFF0FDF4',  // Emerald 50
    borderColor: 'FFA7F3D0', // Emerald 200
  },
  indigo: {
    headerBg: 'FF312E81', // Indigo 900
    headerFg: 'FFFFFFFF',
    zebraBg: 'FFEEF2FF',  // Indigo 50
    borderColor: 'FFC7D2FE', // Indigo 200
  },
  mono: {
    headerBg: 'FF262626', // Neutral 800
    headerFg: 'FFFFFFFF',
    zebraBg: 'FFF5F5F5',  // Neutral 100
    borderColor: 'FFE5E5E5', // Neutral 200
  },
};

export async function exportToExcel(
  columns: string[],
  rows: Record<string, any>[],
  columnTypes: Record<string, ColumnType>,
  config: FormattingConfig,
  fileName: string = 'Merged_Consolidated_Sheet.xlsx'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SheetMerge Pro';
  workbook.lastModifiedBy = 'SheetMerge Pro';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Consolidated_Data', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const theme = THEME_PALETTES[config.headerTheme] || THEME_PALETTES.slate;

  // Setup columns
  worksheet.columns = columns.map((colName) => ({
    header: colName,
    key: colName,
    // Will compute width dynamically
  }));

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: config.fontFamily,
      size: config.fontSize + 1,
      bold: true,
      color: { argb: theme.headerFg },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: theme.headerBg },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: false,
    };
    cell.border = {
      bottom: { style: 'medium', color: { argb: theme.borderColor } },
      top: { style: 'thin', color: { argb: theme.headerBg } },
      left: { style: 'thin', color: { argb: theme.headerBg } },
      right: { style: 'thin', color: { argb: theme.headerBg } },
    };
  });

  // Calculate Column Max Lengths for Auto-fit
  const colLengths: Record<string, number> = {};
  columns.forEach((col) => {
    colLengths[col] = Math.max(col.length, 10);
  });

  // Add Data Rows with consistent formatting
  rows.forEach((rowData, index) => {
    const row = worksheet.addRow(rowData);
    row.height = 22;
    const isEven = index % 2 === 1;

    columns.forEach((colName) => {
      const cell = row.getCell(colName);
      const val = rowData[colName];
      const colType = columnTypes[colName] || 'text';

      // Update max length for auto-width
      const strVal = String(val ?? '');
      if (strVal.length > (colLengths[colName] || 0)) {
        colLengths[colName] = Math.min(strVal.length, 50); // cap max at 50 to prevent monstrous cols
      }

      // Font consistency
      cell.font = {
        name: config.fontFamily,
        size: config.fontSize,
        color: { argb: 'FF1E293B' },
      };

      // Alignment consistency
      if (colType === 'number' || colType === 'currency') {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if (colType === 'date' || colType === 'boolean') {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Zebra background
      if (config.enableZebraStriping && isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: theme.zebraBg },
        };
      }

      // Grid borders
      if (config.enableGridBorders) {
        cell.border = {
          top: { style: 'thin', color: { argb: theme.borderColor } },
          bottom: { style: 'thin', color: { argb: theme.borderColor } },
          left: { style: 'thin', color: { argb: theme.borderColor } },
          right: { style: 'thin', color: { argb: theme.borderColor } },
        };
      }
    });
  });

  // Apply auto-fitted column widths
  worksheet.columns.forEach((column) => {
    if (column.key) {
      const maxLen = colLengths[column.key] || 12;
      column.width = Math.max(maxLen + 4, 12);
    }
  });

  // Write and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

export function exportToCsv(
  columns: string[],
  rows: Record<string, any>[],
  fileName: string = 'Merged_Consolidated_Sheet.csv'
): void {
  // UTF-8 BOM so Excel and other programs recognize non-ASCII characters properly
  let csvContent = '\uFEFF';

  // Header row
  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '';
    const s = String(str).replace(/"/g, '""');
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return `"${s}"`;
    }
    return s;
  };

  csvContent += columns.map(escapeCsv).join(',') + '\r\n';

  // Data rows
  rows.forEach((row) => {
    const line = columns.map((col) => escapeCsv(row[col])).join(',');
    csvContent += line + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
}

export async function copyToClipboard(
  columns: string[],
  rows: Record<string, any>[]
): Promise<boolean> {
  try {
    let tsv = columns.join('\t') + '\n';
    rows.forEach((r) => {
      tsv += columns.map((c) => String(r[c] ?? '').replace(/\t/g, ' ')).join('\t') + '\n';
    });
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (e) {
    console.error('Failed to copy to clipboard', e);
    return false;
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
