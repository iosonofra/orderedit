const ExcelJS = require('exceljs');

const HEADERS = [
  'Riferimento ordine',
  'Cliente',
  'Nome del prodotto',
  'Quantità del prodotto',
  'Note',
  'EAN',
  'Nome corriere',
  'ID prodotto',
];
const COLUMN_WIDTHS = [18.29, 24.28515625, 24.86, 21.28515625, 16.85546875, 15.85546875, 14.140625, 12.5703125];

function borderForColumn(index, count) {
  return {
    left: { style: index === 1 ? 'thick' : 'thin', color: { argb: 'FF000000' } },
    right: { style: index === count ? 'thick' : 'thin', color: { argb: 'FF000000' } },
    top: { style: 'thick', color: { argb: 'FF000000' } },
    bottom: { style: 'thick', color: { argb: 'FF000000' } },
  };
}

function createPrestashopWorkbook(rows) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OrderEdit';
  workbook.created = new Date();
  workbook.modified = new Date();
  const worksheet = workbook.addWorksheet('Export', {
    properties: { defaultRowHeight: 14.45 },
    views: [{ state: 'normal', activeCell: 'D2', showGridLines: true, zoomScale: 100 }],
    pageSetup: {
      orientation: 'portrait',
      fitToPage: false,
      fitToWidth: 1,
      fitToHeight: 1,
      scale: 100,
      margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
  });

  COLUMN_WIDTHS.forEach((width, index) => { worksheet.getColumn(index + 1).width = width; });
  const headerRow = worksheet.addRow(HEADERS);
  headerRow.height = 24.95;
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 13, name: 'Times New Roman' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' }, bgColor: { argb: 'FF000000' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = borderForColumn(colNumber, HEADERS.length);
  });

  (rows || []).forEach((source, index) => {
    const values = [source.reference, source.customer, source.productName, source.quantity, '', source.ean, source.carrier, source.productId]
      .map((value) => String(value ?? ''));
    const row = worksheet.addRow(values);
    row.height = 15;
    const fillColor = index % 2 === 0 ? 'FFD9EEF2' : 'FFFFFFFF';
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.numFmt = '@';
      cell.font = { color: { argb: 'FF000000' }, size: 11, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor }, bgColor: { argb: 'FF000000' } };
      cell.alignment = { horizontal: 'left' };
      cell.border = borderForColumn(colNumber, HEADERS.length);
    });
    row.getCell(3).value = {
      richText: [{ font: { bold: true, size: 11, name: 'Calibri' }, text: values[2] }],
    };
  });

  return workbook;
}

async function createPrestashopWorkbookBuffer(rows) {
  return Buffer.from(await createPrestashopWorkbook(rows).xlsx.writeBuffer());
}

function exportFilename(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `export_orders_${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}_${date.getHours()}-${pad(date.getMinutes())}-${pad(date.getSeconds())}.xlsx`;
}

module.exports = { HEADERS, COLUMN_WIDTHS, createPrestashopWorkbook, createPrestashopWorkbookBuffer, exportFilename };
