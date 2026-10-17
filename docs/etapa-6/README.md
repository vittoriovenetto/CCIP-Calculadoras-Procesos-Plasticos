# Etapa 6 — Maquinarias reales y cálculos de compatibilidad

Base: Etapa 5 en PR #14. **Sin merge ni deploy.** Las 73 resinas, fuentes de Etapa 3, historial, V1 archivada y siete motores de cálculo se conservan.

## Inventario con fuentes oficiales
| Proceso | Fabricante y equipo | Alcance de los datos | Fuente |
|---|---|---|---|
| Inyección | ARBURG ALLROUNDER 370 S 700-290 / Ø30 mm | Configuración de unidad/husillo | https://www.arburg.com/media/daten/publications/technical_data/hydraulic_machines/allrounder_s/ARBURG_ALLROUNDER_370S_multi-component_TD_528998_fr.pdf |
| Extrusión | battenfeld-cincinnati uniEX | Rango de familia 35–90 mm y 10–800 kg/h; NO de un modelo concreto | https://www.battenfeld-cincinnati.com/products/detail/uniex |
| Película soplada | Reifenhäuser EVO FFS | Rango de serie: dados 160–200 mm, extrusoras 50–90 mm, 3–5 capas; combinaciones no verificadas | https://reifenhauser.com/en/lines-components/extrusion-lines/blown-film-lines/evo-ffs |
| Soplado | Kautex KBB 40 | Datos específicos de columna KBB 40; 250 kN, 250 mm carrera, 610×430 mm molde máximo | https://www.kautex-group.com/en/machine/kbb/ |
| Termoformado | GEISS T11 | Configurable; 1000×900 mm es mínimo nominal, NO máximo; borde 20 mm por lado | https://www.geiss-ttt.com/en/products/thermoforming-systems/t11-thermoforming-machine/ |
| Secado | motan LUXOR HD LHD 30 | Tolva nominal 30 L, aire 25 m³/h, potencia conectada 2 kW, calentador 1,5 kW; no son valores útiles/netos | https://www.motan.com/fileadmin/data/products/pdf/drying/luxor-s/es_LUXOR-S.pdf |

### Política de datos
- La identidad de una **configuración** nunca debe confundirse con una **serie**.
- No se asignan a un modelo individual los extremos de capacidad de una familia de equipos.
- Las variantes de husillo y accionamiento modifican volumen de disparo, presión y caudal; una ficha no permite presuponer capacidades simultáneas.
- La potencia nominal instalada o conectada no equivale al consumo real, a la potencia térmica del polímero o al coste energético.
- El máximo tamaño de molde no es el máximo de envase, y las dimensiones mínimas configurables no constituyen máximos de termoformadora.
- Ninguna ficha de maquinaria demuestra compatibilidad material/máquina/proceso, rendimiento real o aptitud para diseño final.

## Integración técnica
Solo la configuración ARBURG (Ø30 mm, carrera 150 mm) permite precargar datos en la calculadora, **tras confirmación explícita del usuario de que su máquina coincide**. Las entradas manuales se respetan. El usuario puede mantener datos propios y desactivar la variante sin perderlos.

Para esa configuración se comparan:
1. Shot calculado en cm³ frente a volumen publicado de 106 cm³.
2. Carrera calculada en mm frente a carrera máxima publicada de 150 mm.
3. Fuerza calculada con factor en **tf**, convertida mediante 1 tf = 9.80665 kN, frente a 700 kN.

Son cribados numéricos, **no validación industrial**. Sin presión de cavidad/factor o volumen documentado, la comparación correspondiente queda pendiente. Si diámetro o carrera no coinciden con la variante, se suspenden comparaciones.

Para extrusión, película, soplado, termoformado y secado se presentan fichas y límites documentales; no se fuerzan comparaciones de cantidades físicamente distintas.

## Estado e historial
Se conserva estado de equipo por proceso en la sesión. El snapshot congela fabricante, modelo, variante, ficha y cualquier comparación calculada. Las exportaciones anteriores conservan su contenido sin recalcular y las nuevas incorporan la procedencia del equipo. No se altera el motor matemático de los siete procesos.

## Validación
- `npm test`: pruebas estructurales, equivalencia de unidades y bloqueo de precarga indebida.
- `python tests/browser_smoke.py`: pruebas de toda la calculadora.
- `python tests/browser_stage2.py`, `python tests/browser_stage3.py`, `python tests/browser_stage4.py`, `python tests/browser_stage6.py`: regresiones y nueva selección.
- `npm run build:pages` y `python tests/browser_pages_cache.py`: revisión de distribución sin publicar.

## Pendientes técnicos
Fichas de configuraciones adicionales de extrusoras, líneas sopladas, soplado/termoformado y secadores; comprobación de combinaciones reales de accionamiento, variantes, energía, moldes y seguridad. El catálogo no sustituye los manuales de equipo ni pruebas en instalaciones.

La publicación y fusión están expresamente excluidas.