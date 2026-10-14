// Datos exclusivamente sintéticos para comprobar aritmética; no describen materiales ni equipos.
export const fixtures = {
  inyeccion: { method: "mass", cavities: 2, partMass: 30, runnerMass: 5, partVolume: 35, runnerVolume: 5, meltDensity: 0.8, shotMargin: 10, screwD: 20, screwMaxStroke: 400, targetCushion: 20, projectedArea: 100, cavityPressure: 50, clampFactor: 1.2, injectionFlow: 100, plasticizingRate: 20 },
  extrusion: { shape: "sheet", width: 500, thickness: 1, outerD: 20, innerD: 10, lineSpeed: 10, density: 0.92, lossPct: 20, secEnergy: 0.2, holdUpKg: 10 },
  pelicula: { layflat: 500, filmGauge: 50, lineSpeed: 18, density: 0.92, dieDiameter: 200, dieGap: 1 },
  soplado: { bodyD: 80, bodyH: 200, wall: 1, density: 1, parisonD: 20, unitsHour: 100 },
  termoformado: { blankW: 400, blankL: 300, initialT: 1, cycleSec: 20, cavities: 2, density: 1, drawAreaRatio: 3 },
  secado: { throughput: 50, residence: 3, bulkDensity: 0.5, startT: 20, targetT: 80, specificHeat: 2 },
  costos: { cycleSec: 30, cavities: 2, partMass: 30, scrapPct: 10, resinCost: 2, powerKw: 5, energyCost: 0.2, laborHour: 3 }
};
export const variants = [
  ...Object.entries(fixtures),
  ["inyeccion", { ...fixtures.inyeccion, method: "volume" }],
  ["extrusion", { ...fixtures.extrusion, shape: "tube" }]
];
