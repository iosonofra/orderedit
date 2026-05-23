const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Multer: store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.match(/\.xlsx$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Solo file .xlsx sono accettati'), false);
    }
  },
});

const UPLOAD_PATH = path.join(__dirname, '../data/uploads/last_upload.xlsx');
const EXPORTS_DIR = path.join(__dirname, '../data/exports');
const ExcelJS = require('exceljs'); // Needed for perfect style preservation

/**
 * Load the last uploaded buffer from disk (survives server restarts).
 * @returns {Buffer|null}
 */
function loadLastUpload() {
  try {
    if (fs.existsSync(UPLOAD_PATH)) {
      return fs.readFileSync(UPLOAD_PATH);
    }
  } catch (err) {
    console.error('Errore lettura file upload salvato:', err.message);
  }
  return null;
}

function ensureExportsDir() {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }
}

function sanitizeBackupFilename(filename) {
  const raw = String(filename || 'export.xlsx').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
  return raw.toLowerCase().endsWith('.xlsx') ? raw : `${raw}.xlsx`;
}

function backupTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function backupExportBuffer(buffer, filename) {
  ensureExportsDir();
  const safeName = sanitizeBackupFilename(filename);
  const ext = path.extname(safeName) || '.xlsx';
  const base = path.basename(safeName, ext);
  const backupName = `${backupTimestamp()}_${base}${ext}`;
  fs.writeFileSync(path.join(EXPORTS_DIR, backupName), Buffer.from(buffer));
  return backupName;
}

function pruneExportBackups(limit) {
  const max = Number.parseInt(limit, 10);
  if (!Number.isFinite(max) || max < 1) return 0;
  const backups = listExportBackups();
  const overflow = backups.slice(max);
  overflow.forEach((item) => {
    try {
      fs.unlinkSync(path.join(EXPORTS_DIR, item.name));
    } catch {}
  });
  return overflow.length;
}

function listExportBackups() {
  ensureExportsDir();
  return fs.readdirSync(EXPORTS_DIR)
    .filter((name) => /\.xlsx$/i.test(name))
    .map((name) => {
      const fullPath = path.join(EXPORTS_DIR, name);
      const stat = fs.statSync(fullPath);
      return {
        name,
        size: stat.size,
        createdAt: stat.birthtime.toISOString(),
        modifiedAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => String(b.modifiedAt).localeCompare(String(a.modifiedAt)));
}

function normalizeTextForExcel(str) {
  if (typeof str !== 'string') return str;
  // Some editor payloads include an Excel forcing-text prefix ("'").
  // Strip only the first technical prefix and keep user content intact.
  const withoutPrefix = str
    .replace(/^'+/, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  try {
    return withoutPrefix.normalize('NFC');
  } catch {
    return withoutPrefix;
  }
}

function sanitizeExcelFont(font, { preserveBold = true } = {}) {
  if (!font || typeof font !== 'object') return undefined;
  const next = { ...font };
  delete next.strike;
  delete next.underline;
  delete next.italic;
  if (!preserveBold) delete next.bold;
  return Object.keys(next).length > 0 ? next : undefined;
}

function sanitizeExcelTextValue(value) {
  if (typeof value === 'string') return normalizeTextForExcel(value);
  if (value && typeof value === 'object' && Array.isArray(value.richText)) {
    return {
      richText: value.richText.map((run) => {
        const nextRun = { text: normalizeTextForExcel(String(run?.text ?? '')) };
        const font = sanitizeExcelFont(run?.font);
        if (font) nextRun.font = font;
        return nextRun;
      }),
    };
  }
  return value;
}

function sanitizeCellTextStyle(cell, { preserveCellBold = true, sanitizeValue = true } = {}) {
  if (!cell) return;
  const font = sanitizeExcelFont(cell.font, { preserveBold: preserveCellBold });
  if (font) {
    cell.font = font;
  } else if (cell.font) {
    cell.font = undefined;
  }
  if (sanitizeValue) cell.value = sanitizeExcelTextValue(cell.value);
}

function writeSafeCellValue(cell, value) {
  cell.value = sanitizeExcelTextValue(value);
  sanitizeCellTextStyle(cell, { preserveCellBold: false, sanitizeValue: false });
}

function excelCellToComparable(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) {
      return normalizeTextForExcel(value.richText.map(run => String(run?.text ?? '')).join(''));
    }
    if (value.result !== undefined) return normalizeTextForExcel(String(value.result));
    if (value.text !== undefined) return normalizeTextForExcel(String(value.text));
  }
  return normalizeTextForExcel(String(value));
}

function luckyCellToComparable(cell) {
  const v = luckyCellToExcelValue(cell);
  if (v === undefined || v === null) return '';
  if (typeof v === 'object' && Array.isArray(v.richText)) {
    return normalizeTextForExcel(v.richText.map(run => String(run?.text ?? '')).join(''));
  }
  return normalizeTextForExcel(String(v));
}

function sanitizeWorksheetTextPrefixes(worksheet, protectedCols) {
  worksheet.columns.forEach((column) => {
    const font = sanitizeExcelFont(column.font, { preserveBold: false });
    if (font) {
      column.font = font;
    } else if (column.font) {
      column.font = undefined;
    }
  });

  worksheet.eachRow((row, rowNumber) => {
    const rowFont = sanitizeExcelFont(row.font, { preserveBold: rowNumber === 1 });
    if (rowFont) {
      row.font = rowFont;
    } else if (row.font) {
      row.font = undefined;
    }

    row.eachCell((cell, colNumber) => {
      const isHeader = rowNumber === 1;
      sanitizeCellTextStyle(cell, {
        preserveCellBold: isHeader,
        sanitizeValue: !protectedCols.has(colNumber),
      });
    });
  });
}

function getProtectedWorksheetColumns(worksheet) {
  const protectedCols = new Set();
  if (!worksheet) return protectedCols;
  const headerRow = worksheet.getRow(1);
  if (!headerRow) return protectedCols;
  headerRow.eachCell((cell, colNumber) => {
    const label = normalizeTextForExcel(excelCellToComparable(cell.value)).trim().toLowerCase();
    if (label === 'ean') protectedCols.add(colNumber);
  });
  return protectedCols;
}

function eanValueFromExcelCell(cell) {
  if (!cell) return '';
  const value = cell.value;
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return normalizeTextForExcel(value).trim();
  if (typeof value === 'number' && Number.isFinite(value)) {
    // EAN should be text/integer-like; keep integer representation.
    return String(Math.trunc(value));
  }
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) {
      return normalizeTextForExcel(value.richText.map((run) => String(run?.text ?? '')).join('')).trim();
    }
    if (value.result !== undefined && value.result !== null) {
      if (typeof value.result === 'number' && Number.isFinite(value.result)) return String(Math.trunc(value.result));
      return normalizeTextForExcel(String(value.result)).trim();
    }
    if (value.text !== undefined && value.text !== null) {
      return normalizeTextForExcel(String(value.text)).trim();
    }
  }
  return normalizeTextForExcel(String(value)).trim();
}

function columnNameToNumber(name) {
  const letters = String(name || '').toUpperCase();
  let num = 0;
  for (let i = 0; i < letters.length; i++) {
    const code = letters.charCodeAt(i);
    if (code < 65 || code > 90) return 0;
    num = num * 26 + (code - 64);
  }
  return num;
}

function rangeToMerge(range) {
  const match = String(range || '').match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/i);
  if (!match) return null;
  const left = columnNameToNumber(match[1]);
  const top = Number.parseInt(match[2], 10);
  const right = columnNameToNumber(match[3]);
  const bottom = Number.parseInt(match[4], 10);
  if (!left || !right || !top || !bottom) return null;
  return {
    r: top - 1,
    c: left - 1,
    rs: bottom - top + 1,
    cs: right - left + 1,
  };
}

function excelCellToDisplayText(cell) {
  if (!cell || cell.value === undefined || cell.value === null) return '';
  if (typeof cell.text === 'string' && cell.text) return normalizeTextForExcel(cell.text);
  return excelCellToComparable(cell.value);
}

function excelCellToGridCell(cell) {
  const text = excelCellToDisplayText(cell);
  if (!text) return null;
  return { v: text, m: text, w: text, ct: { fa: '@', t: 's' } };
}

function excelWidthToPx(width) {
  const value = Number(width);
  if (!Number.isFinite(value) || value <= 0) return 64;
  return Math.max(24, Math.round(value * 7 + 5));
}

function pxToExcelWidth(px) {
  const value = Number(px);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.max(1, Math.round(((value - 5) / 7) * 100) / 100);
}

async function extractSheetsFromBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  return workbook.worksheets.map((worksheet, idx) => {
    const rowCount = Math.max(worksheet.rowCount || 0, 1);
    const columnCount = Math.max(worksheet.columnCount || 0, 1);
    const data = [];
    const columnWidthsPx = {};

    for (let r = 1; r <= rowCount; r++) {
      const row = worksheet.getRow(r);
      const outRow = [];
      for (let c = 1; c <= columnCount; c++) {
        outRow[c - 1] = excelCellToGridCell(row.getCell(c));
      }
      data[r - 1] = outRow;
    }

    for (let c = 1; c <= columnCount; c++) {
      const column = worksheet.getColumn(c);
      columnWidthsPx[c - 1] = excelWidthToPx(column?.width || worksheet.properties?.defaultColWidth);
    }

    const mergeConfig = {};
    const merges = Array.isArray(worksheet.model?.merges) ? worksheet.model.merges : [];
    merges.forEach((range) => {
      const merge = rangeToMerge(range);
      if (!merge || merge.rs < 1 || merge.cs < 1) return;
      mergeConfig[`${merge.r}_${merge.c}`] = merge;
      if (!Array.isArray(data[merge.r])) data[merge.r] = [];
      const topCell = data[merge.r][merge.c] || { v: '', m: '', w: '', ct: { fa: '@', t: 's' } };
      data[merge.r][merge.c] = { ...topCell, mc: { r: merge.r, c: merge.c, rs: merge.rs, cs: merge.cs } };
      for (let rr = merge.r; rr < merge.r + merge.rs; rr++) {
        for (let cc = merge.c; cc < merge.c + merge.cs; cc++) {
          if (rr === merge.r && cc === merge.c) continue;
          if (!Array.isArray(data[rr])) data[rr] = [];
          const current = data[rr][cc] || { v: '', m: '', w: '', ct: { fa: '@', t: 's' } };
          data[rr][cc] = { ...current, mc: { r: merge.r, c: merge.c } };
        }
      }
    });

    return {
      name: worksheet.name || `Sheet${idx + 1}`,
      index: String(idx),
      status: idx === 0 ? 1 : 0,
      order: idx,
      row: rowCount,
      column: columnCount,
      data,
      config: { merge: mergeConfig, columnWidthsPx },
    };
  });
}

async function extractEanOverridesFromBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const overrides = [];

  workbook.worksheets.forEach((worksheet, idx) => {
    const headerRow = worksheet.getRow(1);
    if (!headerRow) return;

    let eanCol = -1;
    headerRow.eachCell((cell, colNumber) => {
      const label = normalizeTextForExcel(excelCellToComparable(cell.value)).trim().toLowerCase();
      if (label === 'ean') eanCol = colNumber;
    });
    if (eanCol < 1) return;

    const values = [];
    for (let r = 2; r <= worksheet.rowCount; r++) {
      const cell = worksheet.getCell(r, eanCol);
      const ean = eanValueFromExcelCell(cell);
      if (!ean) continue;
      values.push({ r: r - 1, value: ean }); // front-end row index (0-based)
    }

    overrides.push({
      name: worksheet.name,
      index: idx,
      col: eanCol - 1, // front-end col index (0-based)
      values,
    });
  });

  return overrides;
}

function luckyCellToExcelValue(cell) {
  if (cell === undefined) return undefined;
  if (cell === null) return null;

  // LuckySheet usually stores cells as objects; support primitives just in case.
  if (typeof cell !== 'object') return cell;

  // Prefer plain value for style-safe writes.
  let value = cell.v !== undefined ? cell.v : cell.m;

  // Flatten LuckySheet inline rich text to plain text. The original workbook
  // cell style is preserved by ExcelJS as long as we only replace the value.
  if (cell.ct && cell.ct.t === 'inlineStr' && Array.isArray(cell.ct.s)) {
    value = cell.ct.s.map(run => normalizeTextForExcel(String(run?.v ?? ''))).join('');
  }

  // If value is still an object, fallback to display value.
  if (value !== null && typeof value === 'object') {
    value = cell.m !== undefined ? cell.m : '';
  }

  if (typeof value === 'string') {
    value = normalizeTextForExcel(value);
  }

  return value;
}

function luckyCellToExcelBoldRichText(cell) {
  if (!cell || typeof cell !== 'object') return null;
  if (!cell.ct || cell.ct.t !== 'inlineStr' || !Array.isArray(cell.ct.s)) return null;

  const runs = cell.ct.s
    .map((run) => {
      const text = normalizeTextForExcel(String(run?.v ?? ''));
      if (!text) return null;
      const nextRun = { text };
      if (run?.bl === 1 || run?.bl === '1' || run?.bl === true || run?.bl === 'true') {
        nextRun.font = { bold: true };
      }
      return nextRun;
    })
    .filter(Boolean);

  if (runs.length === 0 || !runs.some((run) => run.font?.bold)) return null;
  return { richText: runs };
}

function luckyCellToExcelTextValue(cell) {
  const richTextValue = luckyCellToExcelBoldRichText(cell);
  if (richTextValue) return richTextValue;

  const value = luckyCellToExcelValue(cell);
  if (value === undefined || value === null) return value;
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) {
      return normalizeTextForExcel(value.richText.map(run => String(run?.text ?? '')).join(''));
    }
    if (value.result !== undefined) return normalizeTextForExcel(String(value.result));
    if (value.text !== undefined) return normalizeTextForExcel(String(value.text));
  }
  return typeof value === 'string' ? normalizeTextForExcel(value) : value;
}

function getWorksheetForPatch(workbook, patch) {
  let worksheet = workbook.getWorksheet(patch.name);
  if (!worksheet) {
    worksheet = workbook.worksheets[parseInt(patch.index || '0')];
  }
  return worksheet;
}

function applyWorksheetMerges(worksheet, mergePatch) {
  if (!worksheet || !Array.isArray(mergePatch?.merges)) return;

  const existingMerges = Array.isArray(worksheet.model?.merges) ? [...worksheet.model.merges] : [];
  existingMerges.forEach((range) => {
    try {
      worksheet.unMergeCells(range);
    } catch {}
  });

  mergePatch.merges.forEach((merge) => {
    if (
      !Number.isInteger(merge?.r) ||
      !Number.isInteger(merge?.c) ||
      !Number.isInteger(merge?.rs) ||
      !Number.isInteger(merge?.cs) ||
      merge.rs < 1 ||
      merge.cs < 1
    ) {
      return;
    }

    const top = merge.r + 1;
    const left = merge.c + 1;
    const bottom = merge.r + merge.rs;
    const right = merge.c + merge.cs;
    try {
      worksheet.mergeCellsWithoutStyle(top, left, bottom, right);
    } catch (err) {
      console.warn(`Merge ignorato su ${worksheet.name}: ${err.message}`);
    }
  });
}

function applyWorksheetColumnWidths(worksheet, columnPatch) {
  if (!worksheet || !Array.isArray(columnPatch?.columns)) return;
  columnPatch.columns.forEach((item) => {
    if (!Number.isInteger(item?.c)) return;
    const width = pxToExcelWidth(item.widthPx);
    if (!width) return;
    worksheet.getColumn(item.c + 1).width = width;
  });
}

function applyWorksheetStructureChanges(workbook, changes) {
  if (!Array.isArray(changes)) return;
  changes.forEach((change) => {
    if (!change || !Number.isInteger(change.index) || !Number.isInteger(change.count) || change.count < 1) return;
    let worksheet = workbook.getWorksheet(change.name);
    if (!worksheet) {
      const sheetIndex = Number.parseInt(change.sheetIndex || '0', 10);
      worksheet = workbook.worksheets[Number.isInteger(sheetIndex) ? sheetIndex : 0];
    }
    if (!worksheet) return;

    if (change.type === 'deleteRows') {
      if (change.index < 1) return; // keep header row
      worksheet.spliceRows(change.index + 1, change.count);
      return;
    }

    if (change.type === 'insertRows') {
      if (change.index < 1) return; // keep header row
      worksheet.spliceRows(change.index + 1, 0, ...Array(change.count).fill([]));
      return;
    }

    if (change.type === 'insertColumns') {
      worksheet.spliceColumns(change.index + 1, 0, ...Array(change.count).fill([]));
      return;
    }

    if (change.type === 'deleteColumns') {
      const protectedCols = getProtectedWorksheetColumns(worksheet);
      for (let col = change.index + 1; col <= change.index + change.count; col++) {
        if (protectedCols.has(col)) return;
      }
      worksheet.spliceColumns(change.index + 1, change.count);
    }
  });
}

// POST /api/xlsx/upload
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }
  (async () => {
    // Persist original buffer to disk so it survives server restarts
    fs.writeFileSync(UPLOAD_PATH, req.file.buffer);
    const [sheets, eanOverrides] = await Promise.all([
      extractSheetsFromBuffer(req.file.buffer),
      extractEanOverridesFromBuffer(req.file.buffer),
    ]);
    res.json({ filename: req.file.originalname, status: 'ok', sheets, eanOverrides });
  })().catch((err) => {
    console.error('Upload error:', err);
    res.status(500).json({ error: `Errore durante l'upload del file: ${err.message}` });
  });
});

// POST /api/xlsx/export
router.post('/export', async (req, res) => {
  const { sheets, patches, merges, columns, structure, filename, backup } = req.body;
  const hasSheets = Array.isArray(sheets);
  const hasPatches = Array.isArray(patches);
  const hasMerges = Array.isArray(merges);
  const hasColumns = Array.isArray(columns);
  const hasStructure = Array.isArray(structure);
  if (!hasSheets && !hasPatches && !hasMerges && !hasColumns && !hasStructure) {
    return res.status(400).json({ error: 'Dati export mancanti: sheets, patches, merges, columns o structure richiesti' });
  }
  if (hasSheets && sheets.length > 50) {
    return res.status(400).json({ error: 'Troppi fogli nel payload (max 50)' });
  }
  if (hasPatches && patches.length > 200) {
    return res.status(400).json({ error: 'Troppe patch nel payload (max 200)' });
  }
  if (hasMerges && merges.length > 50) {
    return res.status(400).json({ error: 'Troppe patch merge nel payload (max 50)' });
  }
  if (hasColumns && columns.length > 50) {
    return res.status(400).json({ error: 'Troppe patch colonne nel payload (max 50)' });
  }
  if (hasStructure && structure.length > 100) {
    return res.status(400).json({ error: 'Troppe modifiche struttura nel payload (max 100)' });
  }
  try {
    const lastUploadedBuffer = loadLastUpload();
    if (!lastUploadedBuffer) {
      throw new Error("Nessun file originale trovato. Per favore ricarica il file.");
    }
    
    // Load original workbook to preserve styles exactly
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(lastUploadedBuffer);

    if (hasStructure) {
      applyWorksheetStructureChanges(workbook, structure);
    }

    if (hasPatches) {
      for (const patch of patches) {
        const worksheet = getWorksheetForPatch(workbook, patch);
        if (!worksheet || !Array.isArray(patch.cells)) continue;
        const protectedCols = getProtectedWorksheetColumns(worksheet);

        for (const p of patch.cells) {
          if (!Number.isInteger(p.r) || !Number.isInteger(p.c)) continue;
          if (protectedCols.has(p.c + 1)) continue;
          const nextValue = luckyCellToExcelTextValue(p.cell);
          if (nextValue === undefined) continue;
          const exCell = worksheet.getCell(p.r + 1, p.c + 1);
          writeSafeCellValue(exCell, nextValue);
        }
      }
    } else if (hasSheets) {
      for (const luckySheet of sheets) {
        const worksheet = getWorksheetForPatch(workbook, luckySheet);
        if (!worksheet || !luckySheet.data) continue;
        const protectedCols = getProtectedWorksheetColumns(worksheet);

        luckySheet.data.forEach((row, rNum) => {
          if (!row) return;
          row.forEach((cell, cNum) => {
            if (protectedCols.has(cNum + 1)) return;
            const nextValue = luckyCellToExcelTextValue(cell);
            if (nextValue === undefined) return;
            const exCell = worksheet.getCell(rNum + 1, cNum + 1);
            writeSafeCellValue(exCell, nextValue);
          });
        });
      }
    }

    if (hasMerges) {
      for (const mergePatch of merges) {
        const worksheet = getWorksheetForPatch(workbook, mergePatch);
        applyWorksheetMerges(worksheet, mergePatch);
      }
    }

    if (hasColumns) {
      for (const columnPatch of columns) {
        const worksheet = getWorksheetForPatch(workbook, columnPatch);
        applyWorksheetColumnWidths(worksheet, columnPatch);
      }
    }

    // Final cleanup pass on all editable text columns except protected identifiers.
    workbook.worksheets.forEach((ws) => sanitizeWorksheetTextPrefixes(ws, getProtectedWorksheetColumns(ws)));

    const buffer = await workbook.xlsx.writeBuffer();
    const outName = filename || 'export.xlsx';
    let backupName = '';
    if (backup?.enabled !== false) {
      backupName = backupExportBuffer(buffer, outName);
      pruneExportBackups(backup?.limit);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    if (backupName) res.setHeader('X-OrderEdit-Backup', backupName);
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: `Errore durante l'esportazione: ${err.message}` });
  }
});

// GET /api/xlsx/backups
router.get('/backups', (req, res) => {
  try {
    const backups = listExportBackups();
    const totalBytes = backups.reduce((sum, item) => sum + item.size, 0);
    res.json({ backups, count: backups.length, totalBytes });
  } catch (err) {
    res.status(500).json({ error: `Errore lettura backup: ${err.message}` });
  }
});

// DELETE /api/xlsx/backups
router.delete('/backups', (req, res) => {
  try {
    const backups = listExportBackups();
    backups.forEach((item) => {
      try {
        fs.unlinkSync(path.join(EXPORTS_DIR, item.name));
      } catch {}
    });
    res.json({ deleted: backups.length });
  } catch (err) {
    res.status(500).json({ error: `Errore eliminazione backup: ${err.message}` });
  }
});

module.exports = router;
