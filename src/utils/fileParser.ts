import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import { ParsedSheet } from '../types/sheet';

export async function parseSpreadsheetFile(file: File): Promise<ParsedSheet[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv' || extension === 'tsv' || extension === 'txt') {
    return parseCsvFile(file);
  }

  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  }

  // Fallback try Excel first, then CSV
  try {
    return await parseExcelFile(file);
  } catch {
    return await parseCsvFile(file);
  }
}

async function parseCsvFile(file: File): Promise<ParsedSheet[]> {
  const text = await file.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('File contains no tabular data.'));
          return;
        }

        const rawColumns = results.meta.fields || [];
        const columns = rawColumns
          .map((c) => String(c || '').trim())
          .filter((c) => c.length > 0);

        if (columns.length === 0) {
          reject(new Error('No valid header columns found.'));
          return;
        }

        // Clean rows
        const cleanedRows = results.data.map((row) => {
          const cleanRow: Record<string, any> = {};
          columns.forEach((col) => {
            cleanRow[col] = row[col] !== undefined ? row[col] : '';
          });
          return cleanRow;
        });

        const sheetName = file.name.replace(/\.[^/.]+$/, '') || 'Sheet1';

        resolve([
          {
            name: sheetName,
            columns,
            rows: cleanedRows,
            totalRows: cleanedRows.length,
          },
        ]);
      },
      error: (err: Error) => {
        reject(new Error(`Failed to parse CSV: ${err.message}`));
      },
    });
  });
}

async function parseExcelFile(file: File): Promise<ParsedSheet[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const parsedSheets: ParsedSheet[] = [];

  workbook.eachSheet((worksheet) => {
    if (!worksheet.actualRowCount || worksheet.actualRowCount === 0) {
      return;
    }

    let headerRowIndex = 1;
    let headers: string[] = [];

    // Find first non-empty row as header
    for (let r = 1; r <= Math.min(10, worksheet.rowCount); r++) {
      const row = worksheet.getRow(r);
      const rowValues = (row.values as any[]) || [];
      const nonEmpties = rowValues.filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
      if (nonEmpties.length > 0) {
        headerRowIndex = r;
        // row.values is 1-indexed in ExcelJS (values[0] is undefined)
        headers = rowValues
          .slice(1)
          .map((v, idx) => {
            if (v === null || v === undefined) return `Column_${idx + 1}`;
            if (typeof v === 'object') {
              if (v.text) return String(v.text).trim();
              if (v.result) return String(v.result).trim();
            }
            return String(v).trim();
          })
          .filter((h) => h.length > 0);
        break;
      }
    }

    if (headers.length === 0) return;

    // Deduplicate duplicate column names
    const seenNames = new Map<string, number>();
    const finalHeaders = headers.map((h) => {
      const lower = h.toLowerCase();
      const count = seenNames.get(lower) || 0;
      seenNames.set(lower, count + 1);
      return count > 0 ? `${h}_${count + 1}` : h;
    });

    const rows: Record<string, any>[] = [];

    for (let r = headerRowIndex + 1; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
      const rowObj: Record<string, any> = {};
      let hasData = false;

      finalHeaders.forEach((colName, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        let val = cell.value;

        // Unpack formula or rich text
        if (val && typeof val === 'object') {
          if ('result' in val) {
            val = (val as any).result;
          } else if ('richText' in val) {
            val = (val as any).richText.map((rt: any) => rt.text).join('');
          } else if ('text' in val) {
            val = (val as any).text;
          } else if (val instanceof Date) {
            // keep Date instance
          }
        }

        if (val !== null && val !== undefined && String(val).trim() !== '') {
          hasData = true;
        }

        rowObj[colName] = val ?? '';
      });

      if (hasData) {
        rows.push(rowObj);
      }
    }

    if (finalHeaders.length > 0) {
      parsedSheets.push({
        name: worksheet.name,
        columns: finalHeaders,
        rows,
        totalRows: rows.length,
      });
    }
  });

  if (parsedSheets.length === 0) {
    throw new Error('No readable data sheets found in this Excel file.');
  }

  return parsedSheets;
}
