import ExcelJS from 'exceljs';
import { LocationDef, ParsedSheet } from '../types/sheet';

export const DEFAULT_LOCATIONS: LocationDef[] = [
  { code: 'KP', fullName: 'Koottapalli', aliases: ['koottapalli', 'kootapalli', 'kp'] },
  { code: 'KR', fullName: 'Karur', aliases: ['karur', 'kr'] },
  { code: 'SLM', fullName: 'Salem', aliases: ['salem', 'slm', 'selam'] },
  { code: 'NKL', fullName: 'Namkkal', aliases: ['namkkal', 'namakkal', 'nkl', 'nmk'] },
  { code: 'KUM', fullName: 'Kumbakonam', aliases: ['kumbakonam', 'kum'] },
  { code: 'TVM', fullName: 'Tiruvannamalai', aliases: ['tiruvannamlai', 'tiruvannamalai', 'thiruvannamalai', 'tvm', 'tir'] },
  { code: 'MLR', fullName: 'Mallur', aliases: ['mallur', 'mlr'] },
  { code: 'GD', fullName: 'GM Warehouse', aliases: ['gm warhouse', 'gm warehouse', 'gd', 'gmw'] },
];

export function mapHeaderToLocation(header: string, customLocations = DEFAULT_LOCATIONS): string | null {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const loc of customLocations) {
    if (loc.code.toLowerCase() === clean) return loc.code;
    for (const alias of loc.aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean === cleanAlias || clean.includes(cleanAlias) || cleanAlias.includes(clean)) {
        return loc.code;
      }
    }
  }

  return null;
}

export interface RenamedSheetData {
  originalSheetName: string;
  originalColumns: string[];
  renamedColumns: string[];
  columnMap: { original: string; renamed: string; isLocation: boolean }[];
  rows: Record<string, any>[];
  totalRows: number;
}

// Rename only location column headers, leave data and count 100% unchanged
export function processFileWithRenamedHeaders(
  sheet: ParsedSheet,
  locations = DEFAULT_LOCATIONS
): RenamedSheetData {
  const columnMap = sheet.columns.map((col) => {
    const locCode = mapHeaderToLocation(col, locations);
    return {
      original: col,
      renamed: locCode ? locCode : col,
      isLocation: !!locCode,
    };
  });

  const renamedColumns = columnMap.map((c) => c.renamed);

  // Map rows: NO DATA CHANGE - keep exact counts, numbers, strings, blanks
  const rows = sheet.rows.map((origRow) => {
    const newRow: Record<string, any> = {};
    columnMap.forEach(({ original, renamed }) => {
      // Exactly copy value as-is, no rounding, no conversion, no filter
      newRow[renamed] = origRow[original];
    });
    return newRow;
  });

  return {
    originalSheetName: sheet.name,
    originalColumns: sheet.columns,
    renamedColumns,
    columnMap,
    rows,
    totalRows: rows.length,
  };
}

export function isRetailStockOrSalesReport(sheet: ParsedSheet): boolean {
  const normCols = sheet.columns.map((c) => c.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const hasColor = normCols.some((c) => c.includes('color') || c.includes('colour'));
  const hasSize = normCols.some((c) => c.includes('size'));
  const hasToon = normCols.some((c) => c.includes('toon') || c.includes('label') || c.includes('item') || c.includes('style'));

  let locationMatches = 0;
  sheet.columns.forEach((col) => {
    if (mapHeaderToLocation(col)) locationMatches++;
  });

  return (hasColor || hasSize || hasToon) && locationMatches >= 2;
}

// Side-by-side export into ONE single Excel sheet with 100% unmodified data
export async function exportSideBySideToSingleSheet(
  sheet1Data: RenamedSheetData,
  sheet2Data: RenamedSheetData,
  sheet1Title = 'STOCK REPORT',
  sheet2Title = 'SALES REPORT',
  reportDate = '02.10.2026',
  fileName = 'Stock_and_Sales_Consolidated_Sheet.xlsx'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SheetMerge Pro';

  const worksheet = workbook.addWorksheet('Stock & Sales Single Sheet', {
    views: [{ showGridLines: true }],
  });

  const leftCols = sheet1Data.renamedColumns;
  const rightCols = sheet2Data.renamedColumns;

  // Title Row (Row 1)
  const row1 = worksheet.getRow(1);
  row1.height = 26;

  // Left Title: STOCK REPORT - [Date]
  worksheet.mergeCells(1, 1, 1, leftCols.length);
  const leftTitleCell = worksheet.getCell(1, 1);
  leftTitleCell.value = `${sheet1Title} - ${reportDate}`;
  leftTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF0F172A' } };
  leftTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Gap Column (Column leftCols.length + 1)
  const gapCol = leftCols.length + 1;
  worksheet.getColumn(gapCol).width = 4;

  // Right Title: SALES REPORT - [Date]
  const rightStartCol = leftCols.length + 2;
  const rightEndCol = rightStartCol + rightCols.length - 1;
  worksheet.mergeCells(1, rightStartCol, 1, rightEndCol);
  const rightTitleCell = worksheet.getCell(1, rightStartCol);
  rightTitleCell.value = `${sheet2Title} - ${reportDate}`;
  rightTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF0F172A' } };
  rightTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Header Row (Row 2)
  const row2 = worksheet.getRow(2);
  row2.height = 24;

  const headerBgArgb = 'FF0F4D40'; // Deep Forest Teal from image
  const headerFgArgb = 'FFFFFFFF';

  // Left Headers (Cols A to L)
  leftCols.forEach((colName, idx) => {
    const cell = worksheet.getCell(2, idx + 1);
    cell.value = colName;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: headerFgArgb } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBgArgb } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E293B' } },
      bottom: { style: 'thin', color: { argb: 'FF1E293B' } },
      left: { style: 'thin', color: { argb: 'FF1E293B' } },
      right: { style: 'thin', color: { argb: 'FF1E293B' } },
    };
  });

  // Right Headers (Cols N to Y)
  rightCols.forEach((colName, idx) => {
    const cell = worksheet.getCell(2, rightStartCol + idx);
    cell.value = colName;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: headerFgArgb } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBgArgb } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E293B' } },
      bottom: { style: 'thin', color: { argb: 'FF1E293B' } },
      left: { style: 'thin', color: { argb: 'FF1E293B' } },
      right: { style: 'thin', color: { argb: 'FF1E293B' } },
    };
  });

  // Color shading map
  const colorShades: Record<string, string> = {
    'SMOKE GREY': 'FFF1F5F9',
    'LIGHT BEIGE': 'FFFDF4E3',
    'CREAM': 'FFFFFBEB',
    'HALF WHITE': 'FFF8FAFC',
  };

  const maxRows = Math.max(sheet1Data.rows.length, sheet2Data.rows.length);

  // Populate data rows - EXACT DATA, NO CHANGE IN COUNTS OR VALUES
  for (let r = 0; r < maxRows; r++) {
    const rowNum = 3 + r;
    const excelRow = worksheet.getRow(rowNum);
    excelRow.height = 20;

    // 1. Left Table Row (Stock)
    if (r < sheet1Data.rows.length) {
      const rowData = sheet1Data.rows[r];
      const colorVal = String(rowData['Color'] || rowData[leftCols[0]] || '').toUpperCase().trim();
      const isTotalRow = colorVal.includes('TOTAL');
      const bgArgb = isTotalRow ? 'FFFDE68A' : colorShades[colorVal] || 'FFFFFFFF';

      leftCols.forEach((colName, idx) => {
        const cell = worksheet.getCell(rowNum, idx + 1);
        const rawVal = rowData[colName];
        cell.value = rawVal !== undefined && rawVal !== null ? rawVal : '';
        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: isTotalRow || idx === leftCols.length - 1,
        };
        cell.alignment = {
          horizontal: idx <= 1 ? 'left' : 'center',
          vertical: 'middle',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: isTotalRow ? 'FFD97706' : 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: isTotalRow ? 'FFD97706' : 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: isTotalRow ? 'FFD97706' : 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: isTotalRow ? 'FFD97706' : 'FFCBD5E1' } },
        };
        if (isTotalRow) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
        } else if (idx <= 1 && bgArgb !== 'FFFFFFFF') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
        }
      });
    }

    // 2. Right Table Row (Sales)
    if (r < sheet2Data.rows.length) {
      const rowData = sheet2Data.rows[r];
      const colorVal = String(rowData['Color'] || rowData[rightCols[0]] || '').toUpperCase().trim();
      const isTotalRow = colorVal.includes('TOTAL');
      const bgArgb = isTotalRow ? 'FFFDE68A' : colorShades[colorVal] || 'FFFFFFFF';

      rightCols.forEach((colName, idx) => {
        const cell = worksheet.getCell(rowNum, rightStartCol + idx);
        const rawVal = rowData[colName];
        cell.value = rawVal !== undefined && rawVal !== null ? rawVal : '';
        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: isTotalRow || idx === rightCols.length - 1,
        };
        cell.alignment = {
          horizontal: idx <= 1 ? 'left' : 'center',
          vertical: 'middle',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: isTotalRow ? 'FFD97706' : 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: isTotalRow ? 'FFD97706' : 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: isTotalRow ? 'FFD97706' : 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: isTotalRow ? 'FFD97706' : 'FFCBD5E1' } },
        };
        if (isTotalRow) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
        } else if (idx <= 1 && bgArgb !== 'FFFFFFFF') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
        }
      });
    }
  }

  // Merge vertical cells for Column 1 (Color) and Column 2 (Toon Label) so each appears 1 time only
  function applyMergeToColumn(
    rows: Record<string, any>[],
    colKey: string,
    targetColIndex: number,
    startRowOffset: number = 3
  ) {
    let currentVal: any = null;
    let rangeStart = -1;

    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][colKey];
      const strVal = String(val ?? '').trim();
      const isTotal = strVal.toUpperCase().includes('TOTAL');

      if (isTotal) {
        if (rangeStart !== -1 && currentVal && i - 1 > rangeStart) {
          try {
            worksheet.mergeCells(rangeStart + startRowOffset, targetColIndex, i - 1 + startRowOffset, targetColIndex);
            const mergedCell = worksheet.getCell(rangeStart + startRowOffset, targetColIndex);
            mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };
          } catch (e) {
            console.error('Merge error', e);
          }
        }
        rangeStart = -1;
        currentVal = null;
        continue;
      }

      if (rangeStart === -1) {
        if (strVal !== '') {
          rangeStart = i;
          currentVal = val;
        }
      } else {
        if (strVal === String(currentVal ?? '').trim() || strVal === '') {
          // Continue same group
        } else {
          // Value changed - merge previous group if it spanned more than 1 row
          if (i - 1 > rangeStart) {
            try {
              worksheet.mergeCells(rangeStart + startRowOffset, targetColIndex, i - 1 + startRowOffset, targetColIndex);
              const mergedCell = worksheet.getCell(rangeStart + startRowOffset, targetColIndex);
              mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };
            } catch (e) {
              console.error('Merge error', e);
            }
          }
          rangeStart = i;
          currentVal = val;
        }
      }
    }

    if (rangeStart !== -1 && currentVal && rows.length - 1 > rangeStart) {
      try {
        worksheet.mergeCells(rangeStart + startRowOffset, targetColIndex, rows.length - 1 + startRowOffset, targetColIndex);
        const mergedCell = worksheet.getCell(rangeStart + startRowOffset, targetColIndex);
        mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };
      } catch (e) {
        console.error('Merge error', e);
      }
    }
  }

  // Merge Column 1 (Color) and Column 2 (Toon Label) for Left Table (Stock)
  applyMergeToColumn(sheet1Data.rows, leftCols[0], 1, 3);
  if (leftCols.length > 1) {
    applyMergeToColumn(sheet1Data.rows, leftCols[1], 2, 3);
  }

  // Merge Column 1 (Color) and Column 2 (Toon Label) for Right Table (Sales)
  applyMergeToColumn(sheet2Data.rows, rightCols[0], rightStartCol, 3);
  if (rightCols.length > 1) {
    applyMergeToColumn(sheet2Data.rows, rightCols[1], rightStartCol + 1, 3);
  }

  // Auto-fit column widths
  worksheet.getColumn(1).width = 16; // Color
  worksheet.getColumn(2).width = 14; // Toon Label
  worksheet.getColumn(3).width = 11; // Size
  for (let c = 4; c <= leftCols.length; c++) {
    worksheet.getColumn(c).width = 8;
  }

  worksheet.getColumn(rightStartCol).width = 16;
  worksheet.getColumn(rightStartCol + 1).width = 14;
  worksheet.getColumn(rightStartCol + 2).width = 11;
  for (let c = rightStartCol + 3; c <= rightEndCol; c++) {
    worksheet.getColumn(c).width = 8;
  }

  // Trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
