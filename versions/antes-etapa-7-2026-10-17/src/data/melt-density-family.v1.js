// Referencias aportadas por el usuario el 2026-10-15; no propiedades de grado.
// Las consultas independientes a las fuentes respondieron HTTP 403.
const reiloy = {
  publisher: 'Reiloy USA', title: 'Preventive Maintenance Booklet (2018)',
  url: 'https://reiloyusa.com/assets/template/Medien/Dateien/reiloy-usa-preventive-maintenance-booklet-2018.pdf',
  locator: 'Página 16, tabla Injection Screw Design Guidelines',
  verification_basis: 'user_supplied_reference_with_citation', checked_on: '2026-10-15', independent_access: 'http_403'
};
const conditions = {
  temperature_C: 'not_specified', pressure_MPa: 'not_specified',
  applicability: 'Estimación preliminar por familia para diseño de husillos de inyección; sin corrección pVT. No certificada para un grado comercial. Las temperaturas críticas de la tabla no son condiciones de medición de densidad.'
};
export const familyMeltDensities = {
  schema_version: '1.0.0',
  scope: 'family_reference',
  entries: [
    ...[['HDPE',0.73],['LDPE',0.76],['LLDPE',0.70],['PP',0.75],['PET',1.10],['ABS',0.97],['PC',1.02],['PVC',1.22,'rigid'],['PVC',1.20,'flexible']].map(([family,value,variant]) => ({
      family, ...(variant ? {variant} : {}), value, unit: 'g/cm3', phase: 'melt', approximate: true,
      status: 'reference_generic_estimate', source: {...reiloy}, conditions: {...conditions}
    })),
    { family: 'PA6', value: 0.96, unit: 'g/cm3', phase: 'melt', approximate: true,
      status: 'reference_generic_estimate',
      source: {publisher:'López-Barrón et al.', title:'Film Processability, Morphology, and Properties of Polyamide-6/Low Density Polyethylene Blends (2007), Journal of Plastic Film & Sheeting', url:'https://doi.org/10.1177/8756087907083481', locator:'DOI: 10.1177/8756087907083481', verification_basis:'user_supplied_reference_with_citation', checked_on:'2026-10-15', independent_access:'http_403'},
      conditions: {temperature_C:250, pressure_MPa:'not_specified', applicability:'Dato bibliográfico a 250 °C; estimación preliminar, no caracterización universal de PA6, sin modelo pVT ni extrapolación.'}
    }
  ]
};
