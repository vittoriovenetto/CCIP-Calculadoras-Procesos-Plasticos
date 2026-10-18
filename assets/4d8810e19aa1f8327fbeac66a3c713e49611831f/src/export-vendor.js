const loaded = new Map();
function script(file, global) {
  if (!loaded.has(file)) loaded.set(file, new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = new URL(`./vendor/${file}`, import.meta.url).href;
    tag.onload = () => globalThis[global] ? resolve(globalThis[global]) : reject(Error('Biblioteca no disponible.'));
    tag.onerror = () => { tag.remove(); loaded.delete(file); reject(Error('No se pudo cargar la biblioteca local.')); };
    document.head.append(tag);
  }));
  return loaded.get(file);
}
export const loadExcel = () => script('exceljs-4.4.0.min.js', 'ExcelJS');
let pdf;
export function loadPdf() {
  if (!pdf) pdf = (async () => {
    const library = await script('pdfmake-0.3.11.min.js', 'pdfMake');
    const fonts = {};
    for (const name of ['DejaVuSans.ttf', 'DejaVuSans-Bold.ttf']) {
      const response = await fetch(new URL(`./vendor/${name}`, import.meta.url));
      if (!response.ok) throw Error('Fuente PDF no disponible.');
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 16384) binary += String.fromCharCode(...bytes.subarray(i, i + 16384));
      fonts[name] = btoa(binary);
    }
    library.addVirtualFileSystem(fonts);
    library.addFonts({ CaseFont: { normal: 'DejaVuSans.ttf', bold: 'DejaVuSans-Bold.ttf', italics: 'DejaVuSans.ttf', bolditalics: 'DejaVuSans-Bold.ttf' } });
    return library;
  })().catch(error => { pdf = null; throw error; });
  return pdf;
}
