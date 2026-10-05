import {
  ColumnMapping,
  ColumnType,
  DateFormatOption,
  FormattingConfig,
  JoinType,
  MergeMode,
  MergeStats,
  ParsedSheet,
} from '../types/sheet';

// Helper to normalize string for column comparison
export function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[_\s\-./\\]+/g, '')
    .trim();
}

// Calculate similarity between two strings (0 to 1)
export function stringSimilarity(a: string, b: string): number {
  const normA = normalizeKey(a);
  const normB = normalizeKey(b);

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0;

  if (normA.includes(normB) || normB.includes(normA)) {
    return Math.max(normA.length, normB.length) > 0
      ? Math.min(normA.length, normB.length) / Math.max(normA.length, normB.length)
      : 0.8;
  }

  // Common synonym matches in business spreadsheets
  const synonyms: [string, string][] = [
    ['date', 'salesdate'],
    ['date', 'txndate'],
    ['id', 'txnid'],
    ['id', 'empid'],
    ['customer', 'client'],
    ['customername', 'client'],
    ['customername', 'fullname'],
    ['name', 'fullname'],
    ['name', 'employeename'],
    ['units', 'unitssold'],
    ['quantity', 'qty'],
    ['price', 'rate'],
    ['unitprice', 'unitrate'],
    ['amount', 'grossamount'],
    ['revenue', 'amount'],
    ['revenue', 'grossamount'],
    ['totalrevenue', 'grossamount'],
    ['status', 'paymentstatus'],
    ['status', 'orderstatus'],
    ['salary', 'basesalary'],
  ];

  for (const [s1, s2] of synonyms) {
    if ((normA === s1 && normB === s2) || (normA === s2 && normB === s1)) {
      return 0.9;
    }
  }

  // Bigram Dice coefficient
  const getBigrams = (s: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.substring(i, i + 2));
    }
    return bigrams;
  };

  const bgA = getBigrams(normA);
  const bgB = getBigrams(normB);
  let intersection = 0;
  bgA.forEach((bg) => {
    if (bgB.has(bg)) intersection++;
  });

  return (2 * intersection) / (bgA.size + bgB.size || 1);
}

// Infer column type based on sample values
export function inferColumnType(values: any[]): ColumnType {
  const nonEmpties = values.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ''
  );
  if (nonEmpties.length === 0) return 'text';

  let dateCount = 0;
  let numberCount = 0;
  let currencyCount = 0;
  let boolCount = 0;

  for (const val of nonEmpties.slice(0, 30)) {
    if (val instanceof Date) {
      dateCount++;
      continue;
    }

    const str = String(val).trim();

    // Check boolean
    if (/^(true|false|yes|no)$/i.test(str)) {
      boolCount++;
      continue;
    }

    // Check currency
    if (/^[\$€£₹¥]\s*[\d,]+(\.\d+)?$/.test(str) || /^[\d,]+(\.\d+)?\s*[\$€£₹¥]$/.test(str)) {
      currencyCount++;
      continue;
    }

    // Check date pattern
    if (
      /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(str) ||
      /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(str) ||
      /^[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}/.test(str)
    ) {
      const parsed = Date.parse(str);
      if (!isNaN(parsed)) {
        dateCount++;
        continue;
      }
    }

    // Check pure number
    const numClean = str.replace(/,/g, '');
    if (!isNaN(Number(numClean)) && numClean !== '') {
      numberCount++;
      continue;
    }
  }

  const threshold = nonEmpties.length * 0.5;
  if (dateCount >= threshold) return 'date';
  if (currencyCount >= threshold) return 'currency';
  if (numberCount >= threshold) return 'number';
  if (boolCount >= threshold) return 'boolean';

  return 'text';
}

// Generate initial column mappings between two sheets
export function generateColumnMappings(
  sheet1: ParsedSheet,
  sheet2: ParsedSheet
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  const usedCols2 = new Set<string>();

  // 1. Process File 1 columns and find best match in File 2
  sheet1.columns.forEach((col1) => {
    let bestMatch: string | null = null;
    let highestSim = 0;

    sheet2.columns.forEach((col2) => {
      if (usedCols2.has(col2)) return;
      const sim = stringSimilarity(col1, col2);
      if (sim > highestSim && sim >= 0.6) {
        highestSim = sim;
        bestMatch = col2;
      }
    });

    if (bestMatch) {
      usedCols2.add(bestMatch);
    }

    // Determine type from available samples
    const sampleValues1 = sheet1.rows.map((r) => r[col1]);
    const sampleValues2 = bestMatch ? sheet2.rows.map((r) => r[bestMatch!]) : [];
    const detectedType = inferColumnType([...sampleValues1, ...sampleValues2]);

    mappings.push({
      targetColumn: col1,
      file1Column: col1,
      file2Column: bestMatch,
      detectedType,
    });
  });

  // 2. Add remaining unmapped File 2 columns
  sheet2.columns.forEach((col2) => {
    if (!usedCols2.has(col2)) {
      const sampleValues2 = sheet2.rows.map((r) => r[col2]);
      const detectedType = inferColumnType(sampleValues2);

      mappings.push({
        targetColumn: col2,
        file1Column: null,
        file2Column: col2,
        detectedType,
      });
    }
  });

  return mappings;
}

// Normalize a Date object or date-like string to a standard string
export function formatStandardDate(val: any, targetFormat: DateFormatOption): string {
  if (val === null || val === undefined || val === '') return '';

  let d: Date | null = null;

  if (val instanceof Date) {
    d = val;
  } else if (typeof val === 'number' && val > 20000 && val < 60000) {
    // Excel serial date representation (approx 1954 to 2064)
    d = new Date(Math.round((val - 25569) * 86400 * 1000));
  } else {
    const str = String(val).trim();
    // Check if format is DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmyMatch) {
      const p1 = parseInt(dmyMatch[1], 10);
      const p2 = parseInt(dmyMatch[2], 10);
      const year = parseInt(dmyMatch[3], 10);

      // If p1 > 12, it must be DD/MM/YYYY
      if (p1 > 12 && p2 <= 12) {
        d = new Date(year, p2 - 1, p1);
      } else if (p2 > 12 && p1 <= 12) {
        // MM/DD/YYYY
        d = new Date(year, p1 - 1, p2);
      } else {
        // Default parse
        const timestamp = Date.parse(str);
        if (!isNaN(timestamp)) d = new Date(timestamp);
      }
    } else {
      const timestamp = Date.parse(str);
      if (!isNaN(timestamp)) d = new Date(timestamp);
    }
  }

  if (!d || isNaN(d.getTime())) {
    return String(val); // fallback to raw string if unparseable
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mmm = monthNames[d.getMonth()];

  switch (targetFormat) {
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'DD-MMM-YYYY':
      return `${dd}-${mmm}-${yyyy}`;
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

// Normalize numeric values
export function formatStandardNumber(
  val: any,
  decimals: number,
  isCurrency: boolean = false,
  currencySymbol: string = '$'
): string | number {
  if (val === null || val === undefined || val === '') return '';

  let numVal: number;
  if (typeof val === 'number') {
    numVal = val;
  } else {
    // Strip existing currency signs, spaces, and commas
    const cleaned = String(val).replace(/[\$,€£₹¥\s]/g, '');
    numVal = parseFloat(cleaned);
  }

  if (isNaN(numVal)) {
    return String(val);
  }

  const formattedNum = numVal.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (isCurrency) {
    return `${currencySymbol}${formattedNum}`;
  }

  return formattedNum;
}

// Consistent cell formatting applied across every single cell in the merged document
export function formatCellValue(
  rawVal: any,
  colType: ColumnType,
  config: FormattingConfig
): any {
  if (rawVal === null || rawVal === undefined || rawVal === '' || rawVal === 'NULL' || rawVal === 'NaN') {
    return config.emptyCellPlaceholder;
  }

  if (config.trimWhitespace && typeof rawVal === 'string') {
    rawVal = rawVal.trim().replace(/\s+/g, ' ');
  }

  const effectiveType = colType;

  switch (effectiveType) {
    case 'date':
      return formatStandardDate(rawVal, config.dateFormat);

    case 'currency':
      return formatStandardNumber(rawVal, config.decimalPlaces, true, config.currencySymbol);

    case 'number':
      return formatStandardNumber(rawVal, config.decimalPlaces, false);

    case 'percentage':
      if (typeof rawVal === 'number') {
        const pct = rawVal <= 1 ? rawVal * 100 : rawVal;
        return `${pct.toFixed(1)}%`;
      }
      return String(rawVal);

    case 'boolean':
      if (typeof rawVal === 'boolean') {
        return rawVal ? 'Yes' : 'No';
      }
      if (/^(true|1|yes)$/i.test(String(rawVal).trim())) return 'Yes';
      if (/^(false|0|no)$/i.test(String(rawVal).trim())) return 'No';
      return String(rawVal);

    case 'text':
    default:
      return String(rawVal);
  }
}

// Execute the Merge Process
export function executeMerge(
  sheet1: ParsedSheet,
  sheet2: ParsedSheet,
  file1Name: string,
  file2Name: string,
  mappings: ColumnMapping[],
  mode: MergeMode,
  joinType: JoinType,
  joinKeyCol1: string,
  joinKeyCol2: string,
  config: FormattingConfig
): {
  columns: string[];
  columnTypes: Record<string, ColumnType>;
  rows: Record<string, any>[];
  stats: MergeStats;
} {
  const columnTypeMap: Record<string, ColumnType> = {};
  mappings.forEach((m) => {
    columnTypeMap[m.targetColumn] = m.customType || m.detectedType;
  });

  let rawMergedRows: Record<string, any>[] = [];
  let file1RowCount = sheet1.rows.length;
  let file2RowCount = sheet2.rows.length;

  if (mode === 'append') {
    // 1. Process File 1 rows
    sheet1.rows.forEach((r1) => {
      const row: Record<string, any> = {};

      if (config.addSourceColumn) {
        row['Source_File'] = `File 1 (${file1Name})`;
      }

      mappings.forEach((m) => {
        const val = m.file1Column ? r1[m.file1Column] : '';
        row[m.targetColumn] = formatCellValue(val, columnTypeMap[m.targetColumn], config);
      });

      rawMergedRows.push(row);
    });

    // 2. Process File 2 rows
    sheet2.rows.forEach((r2) => {
      const row: Record<string, any> = {};

      if (config.addSourceColumn) {
        row['Source_File'] = `File 2 (${file2Name})`;
      }

      mappings.forEach((m) => {
        const val = m.file2Column ? r2[m.file2Column] : '';
        row[m.targetColumn] = formatCellValue(val, columnTypeMap[m.targetColumn], config);
      });

      rawMergedRows.push(row);
    });
  } else {
    // Horizontal Key Join Mode
    const f2Map = new Map<string, Record<string, any>>();
    sheet2.rows.forEach((r2) => {
      const keyVal = String(r2[joinKeyCol2] ?? '').trim().toLowerCase();
      if (keyVal) {
        f2Map.set(keyVal, r2);
      }
    });

    const joinedKeysUsed = new Set<string>();

    sheet1.rows.forEach((r1) => {
      const keyVal = String(r1[joinKeyCol1] ?? '').trim().toLowerCase();
      const match2 = f2Map.get(keyVal);

      if (joinType === 'inner' && !match2) {
        return; // skip non-matching
      }

      const row: Record<string, any> = {};
      if (config.addSourceColumn) {
        row['Source_Status'] = match2 ? 'Matched Both' : `File 1 Only`;
      }

      // Add File 1 columns
      sheet1.columns.forEach((c1) => {
        const type = columnTypeMap[c1] || inferColumnType([r1[c1]]);
        row[c1] = formatCellValue(r1[c1], type, config);
      });

      // Add File 2 columns (prefixed if duplicate name)
      sheet2.columns.forEach((c2) => {
        if (c2 === joinKeyCol2) return; // avoid duplicate key column
        const targetColName = sheet1.columns.includes(c2) ? `${c2}_(File2)` : c2;
        const val = match2 ? match2[c2] : '';
        const type = columnTypeMap[targetColName] || inferColumnType([val]);
        row[targetColName] = formatCellValue(val, type, config);
      });

      if (match2) joinedKeysUsed.add(keyVal);
      rawMergedRows.push(row);
    });

    // If Full Outer Join, append unmatched File 2 rows
    if (joinType === 'full') {
      sheet2.rows.forEach((r2) => {
        const keyVal = String(r2[joinKeyCol2] ?? '').trim().toLowerCase();
        if (joinedKeysUsed.has(keyVal)) return;

        const row: Record<string, any> = {};
        if (config.addSourceColumn) {
          row['Source_Status'] = 'File 2 Only';
        }

        sheet1.columns.forEach((c1) => {
          row[c1] = c1 === joinKeyCol1 ? r2[joinKeyCol2] : config.emptyCellPlaceholder;
        });

        sheet2.columns.forEach((c2) => {
          if (c2 === joinKeyCol2) return;
          const targetColName = sheet1.columns.includes(c2) ? `${c2}_(File2)` : c2;
          const type = columnTypeMap[targetColName] || 'text';
          row[targetColName] = formatCellValue(r2[c2], type, config);
        });

        rawMergedRows.push(row);
      });
    }
  }

  // Deduplication handling
  let duplicatesRemoved = 0;
  let finalRows = rawMergedRows;

  if (config.removeDuplicates) {
    const seen = new Set<string>();
    finalRows = rawMergedRows.filter((row) => {
      let hash = '';
      if (config.dedupKeyColumn && row[config.dedupKeyColumn] !== undefined) {
        hash = String(row[config.dedupKeyColumn]).trim().toLowerCase();
      } else {
        // Hash all columns except Source_File
        const keys = Object.keys(row).filter((k) => k !== 'Source_File' && k !== 'Source_Status');
        hash = keys.map((k) => String(row[k])).join('|||');
      }

      if (hash && seen.has(hash)) {
        duplicatesRemoved++;
        return false;
      }
      if (hash) seen.add(hash);
      return true;
    });
  }

  // Determine final list of columns
  const finalColumns: string[] = [];
  if (config.addSourceColumn) {
    finalColumns.push(mode === 'append' ? 'Source_File' : 'Source_Status');
  }

  if (mode === 'append') {
    mappings.forEach((m) => {
      if (!finalColumns.includes(m.targetColumn)) {
        finalColumns.push(m.targetColumn);
      }
    });
  } else {
    // Horizontal columns
    Object.keys(finalRows[0] || {}).forEach((col) => {
      if (!finalColumns.includes(col)) {
        finalColumns.push(col);
      }
    });
  }

  const matchedColumnsCount = mappings.filter((m) => m.file1Column && m.file2Column).length;
  const unmatchedColumnsCount = mappings.length - matchedColumnsCount;

  return {
    columns: finalColumns,
    columnTypes: columnTypeMap,
    rows: finalRows,
    stats: {
      totalRows: finalRows.length,
      file1Rows: file1RowCount,
      file2Rows: file2RowCount,
      duplicateRowsRemoved: duplicatesRemoved,
      matchedColumnsCount,
      unmatchedColumnsCount,
    },
  };
}
