import { leanTranslations } from "./i18n-lean.js";
import { auditTranslations } from "./i18n-audit.js";
import { extraTranslations } from "./i18n-extended.js";
// Browser-only ES/EN localization. Display-layer translations never change
// property keys, units, stored material data or mathematical calculations.
export const translations = {
"Máquina: el caso queda fuera de un límite publicado; verifica la configuración real.":"Machine: the case falls outside a published limit; verify the actual configuration.",
"Especificación del equipo confirmada":"Confirmed machine specification",
"Entrada reutilizada de un cálculo identificado":"Input reused from an identified calculation",
"25 °C · supuesto operativo editable; no dato de fabricante":"25 °C · editable operating assumption; not manufacturer data",
"Definición del Cp documentado":"Definition of documented Cp",
"Dato puntual: no equivale al promedio":"Point measurement: not an interval mean",
"Promedio integral del intervalo exacto Ti–Tf":"Integral mean over the exact Ti–Tf interval",
"Aproximación constante sustentada en el intervalo":"Documented constant approximation over the interval",
"La evidencia corresponde a fase sólida sin transiciones ni calor latente en este intervalo.":"The evidence covers the solid phase without transitions or latent heat in this interval.",
"Confirmo la fuente, definición e intervalo del valor actual de Cp; es una declaración del usuario, no una certificación CCIP.":"I confirm the source, definition and interval of the current Cp value; this is a user declaration, not CCIP certification.",
"Fuente / método de densidad aparente manual":"Source / method for manual bulk density",
"Resultados de secado pendientes":"Pending drying results",
"Resultados nominales del polímero; no certifican capacidad ni potencia de una máquina.":"Nominal polymer results; they do not certify machine capacity or power.",
"La guía del componente virgen no se aplica a esta formulación. El secado de mezclas requiere evidencia específica y permanece pendiente.":"The virgin-component guideline does not apply to this formulation. Mixture drying requires specific evidence and remains pending.",
"Secado de esta formulación: no hay instrucciones validadas para la mezcla; solicita ensayos y recomendaciones de su formulación exacta. No se aplica la guía del componente virgen.":"Drying this formulation: no validated mixture instructions are available; obtain tests and recommendations for this exact formulation. The virgin-component guideline does not apply.",
"Caudal de polímero: introduce o mide el caudal real en kg/h; sin él no se calcula inventario ni potencia.":"Polymer throughput: enter or measure the actual feed rate in kg/h; inventory and power require it.",
"Tiempo de residencia: introduce un tiempo positivo en h de la ficha del grado o de un ensayo de tu material.":"Residence time: enter a positive time in h from the grade datasheet or a test of your material.",
"Densidad aparente: documenta un valor positivo en kg/L, presentación pellets/polvo, fuente y condiciones compatibles. Obtén la densidad a granel mediante ficha o ensayo; no uses densidad sólida ni fundida.":"Bulk density: document a positive value in kg/L, pellets/powder form, source and compatible conditions. Obtain bulk density from a datasheet or test; do not use solid or melt density.",
"Temperatura final: supera la recomendación de secado del grado; solicita justificación del fabricante o validación específica.":"Final temperature: exceeds the grade drying recommendation; obtain manufacturer justification or specific validation.",
"Temperaturas de calentamiento: documenta ambas temperaturas por encima de −273.15 °C y una temperatura final no menor que la inicial.":"Heating temperatures: document both temperatures above −273.15 °C and a final temperature no lower than the initial one.",
"Cp constante: aproximación declarada para fase sólida sin transición; la potencia es una estimación sensible del polímero, no potencia eléctrica del secador.":"Constant Cp: declared approximation for a solid phase without transitions; power estimates polymer sensible heating, not dryer electrical power.",
"Calor específico medio: un Cp puntual no demuestra el promedio del calentamiento. Documenta fase sólida sin transición, definición, intervalo, fuente y confirma la evidencia del valor actual. La entrada se conserva; la potencia queda pendiente.":"Mean specific heat: a point Cp does not establish the heating mean. Document a solid phase without transitions, definition, interval and source, and confirm evidence for the current value. The input is retained; power remains pending.",
"Cp puntual o sin intervalo medio sustentado: introduce evidencia térmica compatible antes de calcular potencia.":"Point Cp or unsupported mean interval: provide compatible thermal evidence before calculating power.",
"Secado condicionado por equipo, humedad inicial, punto de rocío y almacenamiento; confirma compatibilidad antes de aplicar recomendaciones.":"Drying depends on equipment, initial moisture, dew point and storage; confirm compatibility before applying recommendations.",
"Extremo superior de rango de ficha · supuesto nominal":"Upper datasheet range bound · nominal assumption",
"Calor específico medio: para calcular potencia sensible, documenta Cp de fase sólida, intervalo que incluya ambas temperaturas y fuente/método. El valor sin evidencia se conserva en la entrada, pero NO participa en el cálculo.":"Mean specific heat: to calculate sensible heating power, provide solid-phase Cp, a temperature interval covering both temperatures, and its source/method. The unsupported input is retained but does NOT enter the calculation.",
"Caudal REAL de alimentación de la línea. Introducir o medir; nunca se infiere del grado ni se precarga.":"Actual production-line feed rate. Enter or measure it; never infer it from the resin grade or prefill it.",
"Temperatura real de entrada de la granza. 25 °C es solo un supuesto inicial editable, no una propiedad del fabricante.":"Actual pellet inlet temperature. 25 °C is only an editable starting assumption, not a manufacturer property.",
"Referencia de GitHub no válida para este repositorio.":"Invalid GitHub reference for this repository.",
"Propuesta de material no válida.":"Invalid material proposal.",
"Propuesta demasiado grande.":"Proposal is too large.",
"Campos de propuesta desconocidos.":"Unknown proposal fields.",
"JSON demasiado profundo.":"JSON nesting is too deep.",
"Clave JSON no permitida.":"JSON key is not allowed.",
"La propuesta no puede suplantar una ficha comercial ni una fuente verificada.":"A proposal cannot impersonate a commercial datasheet or verified source.",
"Completa identidad, procedencia, fuente y declaración de aporte no verificado.":"Complete identity, provenance, source and the unverified contribution declaration.",
"Indica la justificación de la propuesta.":"Provide the proposal justification.",
"Fecha de propuesta no válida.":"Invalid proposal date.",
"La actualización requiere una revisión base.":"The update requires a base revision.",
"Un aporte nuevo no tiene revisión compartida base.":"A new contribution has no shared base revision.",
"Aporte compartido duplicado.":"Duplicate shared contribution.",
"Conflicto de revisión compartida.":"Shared revision conflict.",
"El Issue no contiene una propuesta CCIP válida.":"The Issue does not contain a valid CCIP proposal.",
"Falta el JSON estructurado de la propuesta.":"The structured proposal JSON is missing.",
"JSON de propuesta no válido.":"Invalid proposal JSON.",
"GitHub limita las consultas o requiere permisos. La propuesta no está confirmada.":"GitHub is limiting requests or requires permissions. The proposal is not confirmed.",
"No se pudo confirmar la propuesta en GitHub.":"The proposal could not be confirmed on GitHub.",
"La respuesta de GitHub no corresponde a esta contribución.":"The GitHub response does not correspond to this contribution.",
"El contenido de GitHub no coincide con la propuesta preparada.":"The GitHub content does not match the prepared proposal.",
"No hay espacio para guardar el respaldo de propuestas.":"There is no space to save the proposal backup.",
"Calculadora":"Calculator",
"Materiales":"Materials",
"Biblioteca y comparación":"Library and comparison",
"Subfamilia":"Subfamily",
"Código / identificador":"Code / identifier",
"Lote":"Batch",
"Procedencia documentada":"Documented provenance",
"Presentación física":"Physical form",
"Formulación conocida":"Known formulation",
"Tipo de material":"Material type",
"Sin especificar":"Unspecified",
"Virgen":"Virgin",
"Reciclado":"Recycled",
"Mezcla virgen/reciclado":"Virgin/recycled blend",
"Origen del reciclado":"Recycled origin",
"Regranulado interno":"Internal regrind",
"Reciclado comercial":"Commercial recycled",
"Observaciones del material":"Material observations",
"Declaro este aporte como dato de usuario no verificado por CCIP.":"I declare this contribution as user data not verified by CCIP.",
"Aplicaciones declaradas por el usuario":"Applications declared by the user",
"Norma de ensayo":"Test standard",
"Temperatura de ensayo (°C)":"Test temperature (°C)",
"Presión de ensayo (MPa)":"Test pressure (MPa)",
"Carga de ensayo (kg)":"Test load (kg)",
"Acondicionamiento":"Preconditioning",
"Estado de la muestra":"Sample state",
"Fecha de ensayo":"Test date",
"Documenta fuente y condiciones de la propiedad antes de autocompletar.":"Document the property source and conditions before autofilling.",
"Metadatos de material no válidos.":"Invalid material metadata.",
"Resistencia a tracción":"Tensile strength",
"Módulo de tracción":"Tensile modulus",
"Resistencia a flexión":"Flexural strength",
"Módulo de flexión":"Flexural modulus",
"Elongación a rotura":"Elongation at break",
"Resistencia al impacto":"Impact strength",
"Dureza Shore D":"Shore D hardness",
"Temperatura de transición vítrea":"Glass transition temperature",
"Temperatura de cristalización":"Crystallization temperature",
"Temperatura de deflexión térmica":"Heat deflection temperature",
"Temperatura Vicat":"Vicat temperature",
"Conductividad térmica":"Thermal conductivity",
"Estimación · densidad de formulación":"Estimate · formulation density",
"Estimación de mezcla":"Mixture estimate",
"Dato manual de formulación":"Manual formulation data",
"Densidad fundida estimada — referencia de familia":"Estimated melt density — family reference",
"Formulación V/R para análisis: compatibilidad y prestaciones requieren validación del caso.":"V/R formulation for analysis: compatibility and performance require case validation.",
"Los porcentajes de la formulación no son válidos; no se aplican propiedades del grado virgen.":"The formulation percentages are invalid; virgin-grade properties are not applied.",
"La propiedad no corresponde a esta formulación o a las condiciones declaradas. Los resultados dependientes quedan pendientes.":"The property does not belong to this formulation or the declared conditions. Dependent results remain pending.",
"La composición V/R no demuestra aptitud del producto ni autoriza transferir propiedades del componente virgen.":"V/R composition does not establish product suitability or allow transferring virgin-component properties.",
"Estimación con densidad de formulación; modelo ideal o modificación manual identificada. No es una propiedad certificada de grado ni una validación industrial.":"Estimate using formulation density; ideal model or identified manual modification. This is not a certified grade property or industrial validation.",

"Formato de exportación":"Export format",
"Exportar estado activo":"Export active state", ...extraTranslations, ...auditTranslations, ...leanTranslations,
"Calculadora de procesos de transformación termoplásticos":"Thermoplastic processing calculator",
"CCIP | Calculadora de procesos de transformación termoplásticos":"CCIP | Thermoplastic processing calculator",
"CCIP · INTEC · Procesos 1: inyección":"CCIP · INTEC · Processes 1: injection molding",
"Manual de uso":"User manual",
"Manual de uso en preparación":"User manual in preparation",
"Cerrar":"Close",
"Créditos académicos":"Academic credits",
"Seleccionar proceso":"Select process",
"Identidad institucional CCIP e INTEC":"CCIP and INTEC institutional identity",
"Logo comercial del Instituto Tecnológico de Santo Domingo (INTEC)":"Commercial logo of Instituto Tecnológico de Santo Domingo (INTEC)",
"Calculadoras de procesos plásticos":"Plastic process calculators",
"Calculadoras de Procesos Plásticos":"Plastic Process Calculators",
"CCIP · INTEC · TRANSFORMACIÓN DE POLÍMEROS":"CCIP · INTEC · POLYMER PROCESSING",
"Selecciona el proceso y el nivel. Calcula con datos de tu caso y consulta las ayudas «?» y las fuentes cuando las necesites.":"Choose a process and detail level. Calculate with your own data and consult the “?” help and sources when needed.",
"Procesos":"Processes","Estimaciones académicas. Contrasta los resultados con fichas, mediciones y límites del equipo.":"Educational estimates. Compare results against technical data, measurements and equipment limits.",
"MÓDULO ACTIVO":"ACTIVE MODULE","Nivel de cálculo":"Calculation level","Básico":"Basic","Técnico":"Technical","Avanzado":"Advanced",
"Material del caso":"Selected material","Familia":"Family","Fabricante":"Manufacturer","Grado comercial":"Commercial grade",
"Selecciona fabricante":"Select manufacturer","Material personalizado / sin ficha":"Custom material / no datasheet",
"Parámetros del caso":"Case inputs","Los valores precargados son ejemplos editables. Las propiedades sin fuente quedan pendientes. Consulta «?» con cursor, teclado o toque.":"Prefilled values are editable examples. Unreferenced material properties stay pending. Open “?” help by mouse, keyboard or touch.",
"Calcular":"Calculate","Limpiar":"Clear","Guardar cálculo":"Save calculation","Exportar JSON":"Export JSON",
"Resultados principales":"Key results","Todos los resultados y ecuaciones":"All results and equations",
"Advertencias, hipótesis y límites":"Warnings, assumptions and limits","Hipótesis y límites":"Assumptions and limits",
"Historial local":"Local history","Recuperar":"Restore","Aún no hay cálculos guardados en este navegador.":"No calculations saved in this browser yet.",
"Pendientes":"Pending","Pendiente":"Pending","Estimación académica":"Educational estimate","Requiere datos válidos para este resultado":"Valid inputs are required",
"Utilización geométrica del husillo":"Theoretical screw utilization",
"Supera la capacidad geométrica indicada. ":"Exceeds the given theoretical capacity. ",
"Verifica los límites reales del equipo; el porcentaje no certifica idoneidad.":"Verify real equipment limits; the percentage does not certify suitability.",
"Ficha, compatibilidad, pVT y fuentes":"Datasheet, compatibility, pVT and sources",
"Ficha: valores, unidades, fase y condiciones":"Datasheet: values, units, phase and conditions",
"Datos típicos/recomendados: no son certificación de lote ni validación industrial.":"Typical/recommended values do not certify a batch or validate industrial use.",
"Sin ficha: entrada manual de propiedades verificadas.":"No datasheet: enter verified properties manually.",
"Sin registros":"No records","Eliminar":"Delete",
"Moldeo por inyección":"Injection molding","Extrusión":"Extrusion","Película soplada":"Blown film",
"Soplado de envases":"Blow molding","Termoformado":"Thermoforming","Secado":"Drying",
"Secado y acondicionamiento":"Drying and conditioning","Producción y costos":"Production and costs",
"Pieza y molde":"Part and mold","Máquina y dosificación":"Machine and metering","Condiciones de proceso":"Process conditions",
"Geometría del producto":"Product geometry","Material y producción":"Material and production",
"Energía y residencia":"Energy and residence","Película y producción":"Film and production",
"Dado y estiramiento":"Die and draw","Geometría del envase":"Container geometry",
"Expansión y producción":"Blow ratio and production","Lámina consumida":"Sheet material use",
"Ciclo y deformación":"Cycle and deformation","Tolva y alimentación":"Hopper and feed",
"Calentamiento sensible":"Sensible heating","Producción":"Production","Costos directos":"Direct costs",
"Otros parámetros":"Other parameters",
"Método de dosificación":"Metering method","Número de cavidades":"Number of cavities",
"Masa por pieza":"Mass per part","Masa de colada y canales":"Runner and sprue mass",
"Volumen de fundido por pieza":"Melt-equivalent volume per part",
"Volumen de canales":"Runner volume","Densidad del fundido":"Melt density",
"Margen de shot adicional":"Additional shot allowance","Diámetro nominal de husillo":"Nominal screw diameter",
"Carrera máxima":"Maximum stroke","Colchón objetivo residual":"Target residual cushion",
"Área total proyectada":"Total projected area","Presión media de cavidad":"Average cavity pressure",
"Factor de seguridad":"Safety factor","Caudal volumétrico inyección":"Injection volumetric flow rate",
"Capacidad de plastificación":"Plasticizing capacity","Geometría":"Geometry",
"Ancho de lámina":"Sheet width","Espesor de lámina":"Sheet thickness",
"Diámetro exterior":"Outer diameter","Diámetro interior":"Inner diameter",
"Velocidad de línea":"Line speed","Densidad del producto":"Product density",
"Pérdida total":"Total loss","Energía específica":"Specific energy","Inventario retenido":"Material hold-up",
"Ancho plegado":"Layflat width","Espesor de una pared":"Single-wall thickness",
"Densidad de película":"Film density","Diámetro del dado":"Die diameter",
"Abertura del dado":"Die gap","Diámetro del cuerpo":"Body diameter",
"Altura cuerpo cilíndrico":"Cylinder height","Espesor uniforme supuesto":"Assumed uniform wall thickness",
"Densidad sólida":"Solid density","Diámetro del parisón":"Parison diameter",
"Ancho de recorte":"Blank width","Largo de recorte":"Blank length",
"Espesor inicial":"Initial thickness","Tiempo de ciclo":"Cycle time",
"Cavidades/ciclo":"Cavities per cycle","Relación de áreas":"Surface area ratio",
"Caudal de polímero":"Polymer throughput","Tiempo de residencia":"Residence time",
"Densidad aparente de granza":"Pellet bulk density","Temperatura inicial":"Initial temperature",
"Temperatura final":"Final temperature","Calor específico medio":"Mean specific heat",
"Piezas por ciclo":"Parts per cycle","Rechazos":"Reject rate",
"Costo del material":"Material price","Potencia media":"Average power",
"Tarifa energía":"Energy tariff","Mano de obra directa":"Direct labor",
"Masa total sin reserva":"Total mass before allowance","Shot calculado (masa)":"Shot mass",
"Shot calculado (volumen)":"Shot volume",
"Capacidad volumétrica teórica del husillo":"Theoretical screw volumetric capacity",
"Utilización volumétrica teórica":"Theoretical volumetric utilization",
"Carrera calculada del husillo":"Calculated screw stroke",
"Recorrido remanente al dosificar al máximo":"Remaining theoretical stroke",
"Fuerza de cierre teórica":"Theoretical clamping force",
"Fuerza de cierre con factor":"Clamping force with factor",
"Tiempo de llenado ideal":"Ideal fill time","Tiempo de plastificación estimado":"Estimated plasticizing time",
"Producción neta ideal":"Ideal net production","Área transversal":"Cross-sectional area",
"Masa por metro de producto":"Mass per meter","Alimentación con pérdida indicada":"Feed required including losses",
"Potencia específica estimada":"Estimated electric power",
"Tiempo de residencia nominal":"Nominal residence time",
"Diámetro ideal de burbuja":"Ideal bubble diameter",
"Área transversal total de la película":"Total film cross section",
"Producción ideal":"Ideal production","Relación de soplado (BUR)":"Blow-up ratio (BUR)",
"Relación ideal de estiramiento (DDR)":"Ideal draw-down ratio (DDR)",
"Volumen geométrico cilíndrico":"Geometric cylinder volume",
"Superficie de cilindro cerrado":"Closed cylinder area",
"Masa de pared ideal":"Ideal wall mass","Expansión diametral":"Diameter expansion",
"Material para producción nominal":"Nominal material throughput",
"Superficie de lámina consumida":"Sheet area consumed",
"Masa de lámina por ciclo":"Sheet mass per cycle",
"Espesor medio geométrico ideal":"Ideal mean thickness",
"Ciclos teóricos por hora":"Theoretical cycles per hour",
"Piezas teóricas por hora":"Theoretical parts per hour",
"Consumo de lámina":"Sheet material consumption",
"Masa mínima de material en tolva":"Minimum material in hopper",
"Volumen útil mínimo de tolva":"Minimum usable hopper volume",
"Potencia térmica sensible mínima":"Minimum sensible heating power",
"Piezas buenas teóricas":"Theoretical accepted parts",
"Consumo de material":"Material consumption",
"Costo de material":"Material cost","Costo energético":"Energy cost",
"Costo horario directo parcial":"Partial direct hourly cost",
"Costo directo parcial por pieza buena":"Partial direct cost per accepted part",
"Elige un valor validado":"Choose a validated value","Sin confirmar":"Unconfirmed",
"Presentación real del material":"Actual material form",
"Condiciones y justificación del caso / cambios manuales":"Case conditions / manual override justification",
"Lote / formulación / mediciones locales":"Batch / formulation / local measurements",
"Sin dato":"No value","Sin ficha":"No datasheet",
"Enlace de fuente no disponible.":"Source link unavailable.",
"Temperatura recomendada de procesado":"Recommended processing temperature",
"Temperatura de fusión":"Melting point",
"Densidad del sólido":"Solid density","Densidad aparente":"Bulk density",
"Calor específico":"Specific heat","Temperatura de secado":"Drying temperature",
"Tiempo de secado":"Drying time","Humedad objetivo":"Target moisture",
"Humedad máxima de proceso":"Maximum processing moisture",
"Viscosidad intrínseca (IV)":"Intrinsic viscosity (IV)",
"Gravimétrico":"Gravimetric","Volumétrico":"Volumetric",
"Lámina":"Sheet","Tubo":"Tube"
};
const originalNodes = new WeakMap(), originalAttrs = new WeakMap();
const localeKey = "ccip-language-v1";
let memoryLanguage;
export const getLanguage = () => {
  if (memoryLanguage) return memoryLanguage;
  try { return localStorage.getItem(localeKey) === "en" ? "en" : "es"; } catch { return "es"; }
};
let watcher;
let titleSource, titleLast;
export function setLanguage(lang) {
  memoryLanguage = lang === "en" ? "en" : "es";
  try { localStorage.setItem(localeKey,memoryLanguage); } catch {}
  translateDocument();
  if (typeof document !== 'undefined') document.dispatchEvent(new Event('ccip-language-change'));
}
export function t(value, lang = getLanguage()) {
  const raw = String(value), word = raw.trim();
  if (lang !== "en") return raw;
  if (Object.hasOwn(translations,word)) return translations[word];
  for (const [pattern,render] of patterns) { const match = word.match(pattern); if (match) return render(match); }
  // Stable fragments in composed technical text; never transform data keys/values.
  if (word.includes(' · ') || word.includes(': ') || word.includes('; ')) {
    return word.split(/(\s*·\s*|: |; )/).map(part => t(part,lang)).join('');
  }
  return raw;
}
const patterns = [
  [/^(.+): introduce un valor para este cálculo\.$/,m=>t(m[1],'en')+': enter a value for this calculation.'],
  [/^Elige explícitamente un tiempo entre (.+) y (.+) h; no se usa un promedio\.$/,m=>'Explicitly choose a time between '+m[1]+' and '+m[2]+' h; no average is selected.'],
  [/^([\d.,– -]+) % masa$/,m=>m[1]+' wt %'],
  [/^(⚠\s*)(.+)$/,m=>m[1]+t(m[2],'en')],
  [/^(.+): referencia sin verificación oficial; no autocompletar$/,m=>t(m[1],'en')+': reference without official verification; no autofill'],
  [/^(Valor típico|Recomendación|Rango seleccionado por usuario|Dato ingresado por usuario) \[(.+)\]$/,m=>t(m[1],'en')+' ['+m[2]+']'],
  [/^Referencia \[(.+)\]$/,m=>'Reference ['+m[1]+']'],
  [/^Explicar (.+)$/,m=>'Explain '+t(m[1],'en')],
  [/^Agregar \/ editar material propio \((\d+)\)$/,m=>'Add / edit custom material ('+m[1]+')'],
  [/^Advertencias \((\d+)\), hipótesis y límites$/,m=>'Warnings ('+m[1]+'), assumptions and limits'],
  [/^Valor fuera de rango: (.+)$/,m=>'Value out of range: '+t(m[1],'en')],
  [/^(.+): introduce (.+)\. Los resultados dependientes quedan pendientes\.$/,m=>t(m[1],'en')+': enter '+m[2].replace('una opción del selector','a selector option').replace(' y ',' and ').replace(', entero',', integer')+'. Dependent results remain pending.'],
  [/^(.+): el resultado excede el rango numérico; revisa la escala de las entradas\.$/,m=>t(m[1],'en')+': result exceeds numeric range; check input scale.'],
  [/^(.+): (valor manual .+|Confirma .+|El proceso .+|La fase .+|Selecciona explícitamente .+)$/,m=>t(m[1],'en')+': '+t(m[2],'en')],
  [/^Usar referencia en (.+)$/,m=>'Use reference for '+t(m[1],'en')],
  [/^(.+) — Genérico \(grado desconocido\)$/,m=>t(m[1],'en')+' — Generic (unknown grade)'],
  [/^(.+) · Genérico sin propiedades de ficha; introduce valores medidos o documentados\.$/,m=>m[1]+' · Generic material without datasheet properties; enter measured or documented values.'],
  [/^(\d+) opciones · catálogo (.+) · revisión (.+)$/,m=>m[1]+' options · catalog '+m[2]+' · revision '+m[3]],
  [/^(\d+) grados · biblioteca (.+) · revisión (.+)$/,m=>m[1]+' grades · library '+m[2]+' · revision '+m[3]],
  [/^Tiempo elegido dentro de (.+)$/,m=>'Time selected within '+t(m[1],'en')],
  [/^Abrir (?:fuente del fabricante|referencia declarada|fuente) \[(.+)\]$/,m=>'Open declared reference ['+m[1]+']'],
  [/^(.+) \(rango; no es un valor único\)$/,m=>t(m[1],'en')+' (range; not a single value)'],
  [/^(.*)fuente \[(.+)\]\. Densidad fundida y Cp pendientes en esta biblioteca\.$/,m=>m[1].replace('Genérico (grado desconocido)','Generic (unknown grade)')+'source ['+m[2]+']. Melt density and Cp pending in this library.'],
  [/^Fuente \[(.+)\]: (.+) · Biblioteca (.+) · Revisión (.+)$/,m=>'Source ['+m[1]+']: '+t(m[2],'en')+' · Library '+m[3]+' · Revision '+m[4]],
  [/^Método: (.+) · Condiciones: (.+)$/,m=>'Method: '+t(m[1],'en')+' · Conditions: '+t(m[2],'en')],
  [/^Intervalo T validado: (.+) · Intervalo P validado: (.+) · Datos\/coeficientes: pendientes\.$/,m=>'Validated T interval: '+t(m[1],'en')+' · Validated P interval: '+t(m[2],'en')+' · Data/coefficients: pending.'],
  [/^Presiones representadas: (.+)\. No constituyen un dominio numérico calibrado\.$/,m=>'Displayed pressures: '+t(m[1],'en')+'. They are not a calibrated numeric domain.'],
  [/^Digitalización orientativa pVT, fuente (.+)$/,m=>'Approximate pVT digitization, source '+m[1]],
  [/^(.*) Incertidumbre: (.*)\.$/,m=>t(m[1],'en')+' Uncertainty: '+t(m[2],'en')+'.'],
  [/^Estado: (.+); fase: (.+); intervalo: (.+)$/,m=>'Status: '+t(m[1],'en')+'; phase: '+t(m[2],'en')+'; interval: '+t(m[3],'en')],
  [/^(.+) · referencia: (.+)$/,m=>t(m[1],'en')+' · reference: '+t(m[2],'en')],
  [/^(.*)Supera la capacidad geométrica indicada\. (.+)$/,m=>m[1]+'Exceeds the given theoretical capacity. '+t(m[2],'en')],
  [/^Pendiente: requiere volumen de shot, diámetro y carrera disponibles\.$/,()=> 'Pending: requires shot volume, diameter and available stroke.'],
  [/^([\d., -]+) (moneda\/h|moneda\/pza|moneda\/kg|moneda\/kWh|pzas\/h|ciclos\/h|envases\/h|und)$/,m=>m[1]+' '+unitEnglish(m[2])],
  [/^(moneda\/h|moneda\/pza|moneda\/kg|moneda\/kWh|pzas\/h|ciclos\/h|envases\/h|und)$/,m=>unitEnglish(m[1])],
  [/^(.+) \(([^()]*)\)$/,m=>t(m[1],'en')+' ('+unitEnglish(t(m[2],'en'))+')']
];
const unitEnglish = unit => ({'moneda/h':'currency/h','moneda/pza':'currency/part','moneda/kg':'currency/kg','moneda/kWh':'currency/kWh','pzas/h':'parts/h','ciclos/h':'cycles/h','envases/h':'containers/h','und':'units'})[unit] || unit;
export function translateDocument() {
  if (typeof document === 'undefined') return;
  watcher?.disconnect();
  const lang = getLanguage();document.documentElement.lang = lang;
  if (!titleSource || document.title !== titleLast) titleSource = document.title;
  titleLast = t(titleSource,lang);document.title = titleLast;
  const walk = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walk.nextNode())) {
    if (node.parentElement?.closest('script,style,textarea,[data-i18n-ignore]')) continue;
    let entry = originalNodes.get(node);
    if (!entry || node.nodeValue !== entry.last) entry = {source:node.nodeValue};
    const word = entry.source.trim();if (!word) continue;
    entry.last = entry.source.replace(word,t(word,lang));
    if (node.nodeValue !== entry.last) node.nodeValue = entry.last;
    originalNodes.set(node,entry);
  }
  for (const el of document.querySelectorAll('[title],[aria-label],[placeholder],img[alt]')) {
    if (el.closest('[data-i18n-ignore]')) continue;
    const entries = originalAttrs.get(el) || {};
    for (const attr of ['title','aria-label','placeholder','alt']) {
      if (!el.hasAttribute(attr)) continue;
      if (!entries[attr] || el.getAttribute(attr) !== entries[attr].last) entries[attr] = {source:el.getAttribute(attr)};
      const entry = entries[attr];entry.last = t(entry.source,lang);if (el.getAttribute(attr) !== entry.last) el.setAttribute(attr,entry.last);
    }
    originalAttrs.set(el,entries);
  }
  watcher?.observe(document.body,{childList:true,characterData:true,subtree:true});
}
export function initI18n() {
  const picker = document.getElementById('language');
  if (picker) {picker.value = getLanguage();picker.addEventListener('change',e=>setLanguage(e.target.value));}
  watcher = new MutationObserver(translateDocument);translateDocument();
}
