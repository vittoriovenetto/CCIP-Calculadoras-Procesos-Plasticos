import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

test('logo comercial INTEC conserva exactamente el PNG original documentado', () => {
  const metadata = JSON.parse(readFileSync(new URL('../docs/fuentes/logo-intec-comercial.json', import.meta.url)));
  const image = readFileSync(new URL('../src/assets/logo-intec-comercial.png', import.meta.url));
  assert.equal(metadata.manual_url, 'https://identidad.intec.edu.do/manual-de-uso/logo');
  assert.equal(metadata.asset_url, 'https://identidad.intec.edu.do/images/descargas/INTEC_LOGO_COMERCIAL_FULL_RGB.png');
  assert.equal(createHash('sha256').update(image).digest('hex'), '0f87ef7f0cc6469c4ce86912340207552f90f0c7b6982e87a63dc4adfd675de8');
  assert.equal(metadata.asset_sha256, createHash('sha256').update(image).digest('hex'));
  assert.equal(image.readUInt32BE(16), 801);
  assert.equal(image.readUInt32BE(20), 900);
  assert.equal(image[25], 6); // PNG RGBA: contorno blanco y transparencia originales.
});
