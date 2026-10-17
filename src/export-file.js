import { prepareExport, exportFilename } from './export-data.js';

export async function exportFile(snapshot, format, options) {
  const data = prepareExport(snapshot, options);
  let blob;
  if (format === 'xlsx') blob = await (await import('./export-excel.js')).generateExcel(data);
  else if (format === 'pdf') blob = await (await import('./export-pdf.js')).generatePdf(data);
  else if (format === 'json') blob = new Blob([JSON.stringify(data.record, null, 2)], { type: 'application/json' });
  else throw Error('Formato desconocido.');
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = exportFilename(data, format); a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
