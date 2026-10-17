import { loadExcel } from './export-vendor.js';
import { exportCopy } from './export-data.js';

export async function generateExcel(data) {
  const ExcelJS = await loadExcel(), tr = exportCopy(data.language);
  const book = new ExcelJS.Workbook();
  book.creator = 'CCIP'; book.created = new Date(data.record.export_metadata.exported_at);
  const sheet = (name, headings, rows, widths) => {
    const ws = book.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.columns = widths.map(width => ({ width }));
    ws.addRow(headings);
    for (const row of rows) {
      // Strings son celdas de texto explícitas, nunca objetos {formula: ...}.
      const expanded = row.map(x => x === null || x === undefined ? data.unavailable : typeof x === 'number' && Number.isFinite(x) ? x : String(x));
      // Excel admite 32767 caracteres por celda: conservar textos largos en filas consecutivas.
      const parts = Math.max(1, ...expanded.map(x => typeof x === 'string' ? Math.ceil(x.length / 30000) : 1));
      for (let i = 0; i < parts; i++) ws.addRow(expanded.map(x => typeof x === 'string' ? x.slice(i * 30000, (i + 1) * 30000) : i ? null : x));
    }
    ws.getRow(1).eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203F68' } }; cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
    ws.eachRow((row, index) => { row.eachCell(cell => {
      cell.alignment = { vertical: 'top', wrapText: true };
      if (typeof cell.value === 'number') cell.numFmt = '0.###############';
      if (index > 1) cell.font = { name: 'Calibri', size: 11, color: { argb: index % 2 ? 'FF203F68' : 'FF222B36' } };
    }); });
    return ws;
  };
  sheet(data.report_labels?.summary||tr('Resumen', 'Summary'), [tr('Campo', 'Field'), tr('Valor', 'Value')], data.summary, [34, 90]);
  sheet(data.report_labels?.parameters||tr('Parámetros', 'Parameters'), [tr('Parámetro', 'Parameter'), tr('Valor', 'Value'), tr('Unidad', 'Unit'), tr('Procedencia', 'Provenance'), tr('Entrada original', 'Original input'), 'source_id'],
    data.parameters.map(p => [p.label, p.value, p.unit, p.origin, p.original, p.source_id]), [35, 24, 18, 55, 30, 18]);
  sheet(data.report_labels?.results||tr('Resultados', 'Results'), [tr('Resultado', 'Result'), tr('Valor', 'Value'), tr('Unidad', 'Unit'), tr('Fórmula', 'Formula'), tr('Estimación', 'Estimate')],
    data.results.map(r => [r.label, r.value, r.unit, r.formula, r.estimated ? tr('Sí', 'Yes') : '']), [45, 25, 20, 65, 20]);
  sheet(data.report_labels?.sources||tr('Fuentes y observaciones', 'Sources and observations'), [tr('Referencia / tipo', 'Reference / type'), tr('Contenido / condiciones', 'Content / conditions'), 'URL'],
    [...data.sources, ...data.observations], [50, 110, 70]);
  if (data.profile.length) sheet(tr('Perfil L1 L2 L3', 'L1 L2 L3 profile'), [tr('Tramo', 'Stage'), '%', 'cm³', 'g', 'Δs [mm]', tr('Acumulado [mm]', 'Cumulative [mm]'), tr('Inicio [mm]', 'Start [mm]'), tr('Fin [mm]', 'End [mm]')], data.profile, [18, 16, 24, 24, 24, 24, 24, 24]);
  const buffer = await book.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
