import { loadPdf } from './export-vendor.js';
import { exportCopy } from './export-data.js';

export async function generatePdf(data) {
  const pdfMake = await loadPdf(), tr = exportCopy(data.language);
  const string = value => value === null || value === undefined ? data.unavailable : String(value);
  // Evitar palabras/URLs sin cortes que excedan el ancho de la tabla. U+200B
  // es un punto de salto invisible; no modifica el snapshot ni el XLSX.
  const wrap = value => string(value).replace(/[^\s]{36,}/gu, word => word.match(/.{1,28}/gu).join('\u200b'));
  const cell = value => ({ text: wrap(value), margin: [0, 3, 0, 3] });
  const table = (headings, rows, widths) => ({ margin: [0, 6, 0, 14], table: { headerRows: 1, dontBreakRows: true, widths,
    body: [headings.map(text => ({ text, bold: true, color: 'white', fillColor: '#203f68', margin: [0, 4, 0, 4] })),
      ...rows.flatMap(row => {
        const parts=Math.max(1,...row.map(value=>Math.ceil(string(value).length/300)));
        return Array.from({length:parts},(_,i)=>row.map(value=>cell(string(value).slice(i*300,(i+1)*300))));
      })] }, layout: 'lightHorizontalLines' });
  const heading = text => ({ text, style: 'section', margin: [0, 14, 0, 5] });
  const observations = [];
  for (const [key, value, url] of [...data.observations, ...data.sources]) {
    observations.push({ text: wrap(key), bold: true, color: '#203f68', margin: [0, 5, 0, 1] });
    // Párrafos largos pueden continuar en otra página; nunca se fuerzan a una fila indivisible.
    for (const paragraph of string(value).match(/[^]{1,1500}/g) || ['']) observations.push({ text: wrap(paragraph), link: url || undefined, margin: [0, 0, 0, 3] });
  }
  const content = [
    { text: 'CCIP · INTEC', style: 'brand' }, { text: data.title, style: 'title' },
    { text: wrap(data.name), bold: true, fontSize: 12, margin: [0, 8, 0, 8] },
    heading(data.report_labels?.summary||tr('1. Información del caso', '1. Case information')), table([tr('Campo', 'Field'), tr('Valor', 'Value')], data.summary, [135, '*']),
    heading(data.report_labels?.parameters||tr('2. Parámetros de entrada', '2. Input parameters')),
    table([tr('Parámetro', 'Parameter'), tr('Valor original', 'Original value'), tr('Unidad', 'Unit'), tr('Origen', 'Origin')], data.parameters.map(p => [p.label, p.original || data.unavailable, p.unit, p.origin]), [120, 90, 65, '*']),
    heading(data.report_labels?.results||tr('3. Resultados', '3. Results')),
    table([tr('Resultado', 'Result'), tr('Valor', 'Value'), tr('Unidad', 'Unit'), tr('Fórmula / modelo', 'Formula / model')], data.results.map(r => [r.label + (r.estimated ? tr(' (estimación)', ' (estimate)') : ''), r.value, r.unit, r.formula]), [115, 80, 65, '*'])
  ];
  if (data.profile.length) content.push(heading(tr('Perfil físico L1/L2/L3', 'Physical L1/L2/L3 profile')),
    { text: (data.record.injection_profile?.approximate ? data.record.injection_profile?.estimate_basis==='mixture_model'?tr('Estimación con densidad de formulación. ','Estimate using formulation density. '):tr('Estimación con densidad de familia. ', 'Estimate using family density. ') : '') + tr('Volumen de dosificación sin margen ni colchón añadido. Recorridos en mm; no son velocidades ni presiones.', 'Metered volume without added margin or cushion. Strokes in mm; not velocities or pressures.') },
    table(['L', '%', 'cm³', 'g', 'Δs mm', 'Σ mm', tr('Inicio', 'Start'), tr('Fin', 'End')], data.profile, [26, 24, 65, 65, 65, 65, '*', '*']));
  content.push(heading(data.report_labels?.sources||tr('4. Observaciones, límites y fuentes', '4. Observations, limitations and sources')), ...observations);
  const definition = { pageSize: 'A4', pageMargins: [36, 36, 36, 45], defaultStyle: { font: 'CaseFont', fontSize: 8, lineHeight: 1.2 },
    styles: { brand: { bold: true, color: '#c8102e', fontSize: 14 }, title: { bold: true, color: '#203f68', fontSize: 16 }, section: { bold: true, color: '#c8102e', fontSize: 11 } },
    footer: (current, total) => ({ text: `CCIP · ${tr('Página', 'Page')} ${current} / ${total}`, alignment: 'center', fontSize: 8, margin: [0, 14, 0, 0] }), content };
  return await pdfMake.createPdf(definition).getBlob();
}
