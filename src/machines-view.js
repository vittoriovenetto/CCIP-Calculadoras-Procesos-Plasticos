// DOM-only equipment view: never interpret maker/model text as markup.
import {machinesFor,catalogReadiness} from './machines.js';
const labels={
cylinder_nominal_diameter_mm:['Diámetro nominal del cilindro','Nominal cylinder diameter'],drive_torque_Nm:['Par de accionamiento','Drive torque'],machine_length_mm:['Longitud de la máquina','Machine length'],machine_width_mm:['Ancho de la máquina','Machine width'],machine_height_mm:['Altura de la máquina','Machine height'],
forming_max_width_mm:['Ancho máximo de conformado','Maximum forming width'],forming_max_length_mm:['Largo máximo de conformado','Maximum forming length'],tool_max_width_mm:['Ancho máximo de herramienta','Maximum tool width'],tool_max_length_mm:['Largo máximo de herramienta','Maximum tool length'],sheet_thickness_mm:['Intervalo de espesor de lámina','Sheet thickness range'],max_cycle_cpm:['Velocidad máxima de ciclos (estándar)','Maximum cycle rate (standard)'],bfs_max_cycle_cpm:['Velocidad máxima de ciclos (BFS)','Maximum cycle rate (BFS)'],punching_force_kN:['Fuerza de troquelado en estación','Punching-station force'],bfs_punching_force_kN:['Fuerza de troquelado BFS','BFS punching force'],
max_injection_speed_mm_s:['Velocidad máxima de inyección','Maximum injection speed'],roll_width_mm:['Ancho del rodillo','Roller width'],hauloff_speed_m_min:['Intervalo de velocidad de arrastre','Take-off speed range'],motor_installed_kW:['Potencia nominal del motor','Installed motor rating'],screw_count:['Número de husillos','Number of screws'],layer_count:['Número de capas','Number of layers'],supply_voltage_V:['Tensión de alimentación','Supply voltage'],supply_frequency_Hz:['Frecuencia de alimentación','Supply frequency'],bubble_max_diameter_range_mm:['Diámetro máximo: rango publicado sin variante individual','Maximum diameter: published range without individual variant'],heating_zone_count:['Zonas de calentamiento','Heating zones'],shot_mass_reference_g:['Masa de disparo: polímero de referencia no especificado','Shot mass: reference polymer unspecified'],mold_opening_stroke_mm:['Apertura del molde (no carrera de inyección)','Mould opening (not injection stroke)'],injection_time_PP_reference_s:['Referencia temporal: 5 g de PP','Time reference: 5 g PP'],machine_mass_kg:['Masa de la máquina','Machine mass'],width_300_as_published_mm:['Ancho plegado declarado: discrepancia pendiente','Stated folding width: discrepancy pending'],width_180_as_published_mm:['Ancho de película declarado: discrepancia pendiente','Stated film width: discrepancy pending'],injection_pressure_published:['Presión de inyección en unidad original','Injection pressure in original unit'],clamp_force_published_tons:['Cierre en unidad original no normalizada','Clamp force in unnormalized original unit'],platen_width_mm:['Ancho de plato','Platen width'],platen_height_mm:['Alto de plato','Platen height'],tiebar_horizontal_mm:['Distancia horizontal entre columnas','Horizontal tie-bar clearance'],tiebar_vertical_mm:['Distancia vertical entre columnas','Vertical tie-bar clearance'],line_speed_max_m_min:['Velocidad máxima de línea','Maximum line speed'],product_max_volume_L:['Capacidad máxima del envase','Maximum container capacity'],hopper_useful_L:['Volumen útil de tolva','Useful hopper volume'],dew_point_C:['Punto de rocío','Dew point'],forming_useful_area_mm2:['Área útil de conformado','Useful forming area'],minimum_cycle_s:['Tiempo mínimo de ciclo','Minimum cycle time'],
shot_mass_ABS_g:['Masa de disparo referida a ABS (no volumen)','Shot mass referenced to ABS (not volume)'],
screw_speed_rpm:['Velocidad del husillo','Screw speed'],die_diameter_mm:['Diámetro de dado estándar','Standard die diameter'],die_gap_mm:['Abertura del dado','Die gap'],bubble_max_diameter_mm:['Diámetro máximo de burbuja','Maximum bubble diameter'],film_max_layflat_mm:['Ancho plegado máximo','Maximum layflat width'],film_min_thickness_um:['Espesor mínimo de película','Minimum film thickness'],film_max_thickness_um:['Espesor máximo de película','Maximum film thickness'],output_max_kg_h:['Rendimiento condicionado','Conditional output'],hauloff_max_speed_m_min:['Velocidad máxima de arrastre','Maximum haul-off speed'],sheet_max_width_mm:['Ancho máximo de lámina','Maximum sheet width'],sheet_max_length_mm:['Largo máximo de lámina','Maximum sheet length'],sheet_max_thickness_mm:['Espesor máximo de lámina','Maximum sheet thickness'],sheet_max_area_mm2:['Área nominal máxima de lámina','Maximum nominal sheet area'],forming_max_height_mm:['Altura máxima de conformado','Maximum forming height'],mold_min_thickness_mm:['Espesor mínimo de molde','Minimum mould thickness'],temperature_range_C:['Intervalo de temperatura','Temperature range'],

clamp_force_kN:['Fuerza de cierre','Clamping force'],screw_diameter_mm:['Diámetro de husillo','Screw diameter'],
screw_max_stroke_mm:['Carrera máxima de husillo','Maximum screw stroke'],shot_volume_cm3:['Volumen máximo de disparo','Maximum shot volume'],
max_injection_pressure_bar:['Presión máxima de inyección (no de cavidad)','Maximum injection pressure (not cavity pressure)'],
max_injection_flow_cm3_s:['Caudal máximo condicionado','Conditional maximum injection rate'],
plasticizing_rate_PS_kg_h:['Plastificación para PS solamente','Plasticizing rate for PS only'],
screw_diameter_range_mm:['Diámetros de la serie','Series screw diameters'],
screw_L_over_D:['Relación L/D','L/D ratio'],
output_series_range_kg_h:['Producción de la serie (no de una unidad)','Series output (not one unit)'],
die_diameter_range_mm:['Diámetro de dados (serie)','Die diameter range'],
extruder_diameter_range_mm:['Diámetros de extrusora (serie)','Extruder diameter range'],
layer_count_range:['Número de capas (serie)','Number of layers (series)'],
clamp_max_stroke_mm:['Carrera de cierre','Clamping stroke'],
mold_max_width_mm:['Ancho máximo de molde','Maximum mould width'],mold_max_length_mm:['Longitud máxima de molde','Maximum mould length'],
min_nominal_sheet_width_mm:['Ancho nominal mínimo configurable','Minimum configurable nominal sheet width'],
min_nominal_sheet_length_mm:['Largo nominal mínimo configurable','Minimum configurable nominal sheet length'],
clamping_rim_mm:['Margen de sujeción por lado','Clamping rim per side'],standard_tool_height_mm:['Altura estándar de herramienta','Standard tool height'],
hopper_nominal_L:['Volumen nominal de tolva (no útil)','Nominal hopper volume (not usable volume)'],
process_airflow_m3_h:['Caudal de aire','Airflow'],max_temperature_C:['Temperatura máxima','Maximum temperature'],
heater_installed_kW:['Potencia del calentador instalado','Installed heater power'],connected_power_kW:['Potencia eléctrica conectada (no consumo)','Connected power (not consumption)'],
ABS_reference_output_kg_h:['Rendimiento referencial ABS','ABS reference output']
};
const node=(parent,tag,content,cls)=>{
 const n=document.createElement(tag);if(content!==null&&content!==undefined)n.textContent=String(content);
 if(cls)n.className=cls;parent.append(n);return n;
};
const messages={
 cycle_reference_not_production:['Velocidad máxima de ciclos: referencia del modo elegido, no productividad garantizada para pieza, material o herramienta. No se precarga como tiempo de ciclo.','Maximum cycle rate is a reference for the selected mode, not guaranteed productivity for a part, material or tool. It is not prefilled as cycle time.'],
 series_not_individual:['Serie configurable: sus extremos no definen una máquina concreta.','Configurable series: its endpoints do not define an individual machine.'],
 confirm_variant:['Confirma la variante real antes de comparar límites.','Confirm the actual variant before comparing limits.'],
 screw_configuration_mismatch:['Husillo/carrera no coinciden con esta variante; comparaciones suspendidas.','Screw/stroke do not match this configuration; comparisons suspended.'],
 pressure_roles_separate:['Presión de inyección de máquina ≠ presión hidráulica, de boquilla o media de cavidad.','Machine injection pressure ≠ hydraulic, nozzle or mean cavity pressure.'],
 no_output_from_rpm:['Las rpm y el diámetro del husillo no determinan por sí solos el caudal másico.','Screw rpm and diameter alone do not determine mass output.'],
 installed_not_consumption:['Potencia instalada/conectada ≠ consumo medio ni potencia térmica útil del polímero.','Installed/connected power ≠ average consumption or useful polymer heating power.'],
 film_geometry_only:['BUR y DDR son geométricos; no validan estabilidad de burbuja ni condiciones industriales.','BUR and DDR are geometric; they do not validate bubble stability or industrial conditions.'],
 die_configuration_mismatch:['El dado del caso difiere del estándar de la ficha; verifica la opción instalada.','The case die differs from the datasheet standard; verify the installed option.'],
 mould_not_container:['Dimensiones máximas del molde ≠ dimensiones máximas del envase.','Maximum mould dimensions ≠ maximum container dimensions.'],
 nominal_not_useful_area:['Dimensión de lámina, área nominal y área útil de conformado son distintas; verificar herramienta y orientación.','Sheet size, nominal area and useful forming area differ; verify tooling and orientation.'],
 hopper_nominal_not_useful:['Tolva nominal: superar su volumen es insuficiente; quedar por debajo NO demuestra volumen útil disponible.','Nominal hopper: exceeding its volume fails screening; staying below does NOT establish available useful volume.'],
 hot_air_surface_only:['Este secador de aire caliente elimina humedad superficial; no equivale a secado deshumidificante profundo de una resina higroscópica.','This hot-air dryer removes surface moisture; it is not equivalent to deep dehumidifying drying of a hygroscopic resin.'],
 resin_guideline_not_machine_rating:['La recomendación de resina no certifica capacidad del secador ni humedad residual.','Resin recommendations certify neither dryer capacity nor residual moisture.'],
 screening_not_approval:['Comprobación académica: verifica equipo, material, molde y proceso. Cumplir límites no certifica aptitud industrial.','Educational screening: verify equipment, material, mould and process. Meeting limits does not certify industrial suitability.']
};
const checkLabels={
 'Velocidad de ciclos':'Cycle rate',
 'Ancho de conformado':'Forming width','Largo de conformado':'Forming length','Ancho de herramienta':'Tool width','Largo de herramienta':'Tool length','Ciclos teóricos por hora':'Theoretical cycles per hour',
 'Masa de shot para ABS':'Shot mass for ABS','Velocidad de inyección':'Injection speed','Presión de inyección de máquina':'Machine injection pressure','Ancho del molde':'Mould width','Largo del molde':'Mould length','Espesor del molde':'Mould thickness','Velocidad de husillo':'Screw speed','Carrera de apertura requerida':'Required opening stroke','Altura de conformado':'Forming height',
 'Shot calculado (volumen)':'Calculated shot volume','Carrera calculada del husillo':'Calculated screw stroke','Fuerza de cierre con factor':'Clamping force with factor','Caudal volumétrico inyección':'Injection volume flow','Capacidad de plastificación':'Plasticizing capacity','Alimentación con pérdida indicada':'Feed including stated loss','Velocidad de línea':'Line speed','Diámetro ideal de burbuja':'Ideal bubble diameter','Ancho plegado':'Layflat width','Espesor de una pared':'Single-wall thickness','Producción ideal':'Ideal output','Ancho de recorte':'Blank width','Largo de recorte':'Blank length','Espesor inicial':'Initial thickness','Superficie de lámina consumida':'Consumed sheet area','Volumen útil mínimo de tolva':'Minimum useful hopper volume','Temperatura final':'Final temperature','Caudal de polímero':'Polymer throughput'
};
export function renderMachineAssessment(root,assessment) {
 if(!root)return;root.replaceChildren();if(!assessment)return;
 const en=document.documentElement.lang==='en',tr=(es,enText)=>en?enText:es;
 for(const check of assessment.checks||[]){
  const line=node(root,'div',null,'machine-check');line.dataset.machineStatus=check.status;
  node(line,'span',en?checkLabels[check.label]||check.label:check.label);
  node(line,'strong',check.actual.toFixed(2)+' / '+(check.lower_limit!=null?check.lower_limit+'–':'')+check.limit+' '+check.unit);
  node(line,'small',['above_published_limit','below_published_limit'].includes(check.status)
    ?tr('Fuera de un límite publicado; revisar caso y equipo','Outside a published limit; review case and equipment')
    :check.status==='below_nominal_not_verified'?tr('Debajo del nominal; capacidad útil pendiente de verificación','Below nominal; useful capacity remains unverified')
    :tr('Dentro de un límite numérico publicado; NO certifica aptitud','Within a published numerical limit; NOT proof of suitability'));
 }
 if(!assessment.checks?.length)node(root,'p',tr('Sin resultados y límites directamente comparables','No directly comparable results and limits'),'muted');
 for(const p of assessment.pending||[])node(root,'p',(en?checkLabels[p.label]||p.label:p.label)+': '+(p.reason==='forming_mode'?tr('pendiente: elige modo estándar o BFS','pending: choose standard or BFS mode'):p.reason==='capacity_conditions'?tr('pendiente: confirmar material y condiciones del rendimiento publicado','pending: confirm material and published output conditions'):tr('pendiente: falta entrada o unidad compatible','pending: missing input or compatible unit')),'muted');
 for(const key of assessment.notes||[])if(messages[key])node(root,'p',messages[key][en?1:0],'muted');
}
function picker(root,id,label,options,current,onChange) {
 const text=node(root,'label',label);text.htmlFor=id;
 const select=node(root,'select');select.id=id;
 for(const [value,label] of options){const item=node(select,'option',label);item.value=value;item.selected=value===current;}
 select.addEventListener('change',e=>onChange(e.target.value));return select;
}
export function renderMachinePanel(root,{catalog,process,selection,onSelect,onConfirm,onManufacturer,onOperation,assessment=null,history=[],onReuse}) {
 const opened=root.dataset.machineId===selection.id?new Set([...root.querySelectorAll('details[open][id]')].map(d=>d.id)):new Set();
 root.dataset.machineId=selection.id;
 root.replaceChildren();root.setAttribute('data-i18n-ignore','');
 const en=document.documentElement.lang==='en',tr=(es,enText)=>en?enText:es;
 node(root,'h2',tr('Maquinaria y equipo de proceso','Processing machinery and equipment'));
 node(root,'p',tr('Selecciona fabricante y modelo. Comprueba variante y condiciones; una serie no define una máquina concreta.','Select maker and model. Check variant and conditions; a series does not define one machine.'),'muted');
 if(!catalog)node(root,'p',tr('Catálogo de maquinaria no disponible; puedes continuar con entradas manuales.','Machinery catalog unavailable; manual inputs remain available.'),'muted');
 else {const audit=catalogReadiness(catalog);node(root,'p',audit.qualified_count+' '+tr('fichas concretas con documentación revisada; ','specific records with reviewed documentation; ')+(audit.complete?tr('mínimos por proceso cubiertos. No es validación industrial.','per-process minimums covered. Not industrial validation.'):tr('catálogo todavía incompleto.','catalog still incomplete.')),'muted');}
 const candidates=process==='costos'?(catalog?.machines||[]):machinesFor(catalog,process);
 const makers=[...new Set(candidates.map(m=>m.manufacturer))].sort();
 const chosen=selection.manufacturer||'';
 picker(root,'machine-manufacturer',tr('Fabricante de maquinaria','Machine manufacturer'),[['',tr('Todos los fabricantes','All manufacturers')],...makers.map(x=>[x,x])],chosen,value=>onManufacturer?.(value));
 picker(root,'machine-select',tr('Seleccionar maquinaria real','Select real-world equipment'),[['',tr('Sin selección — entradas manuales','No selection — manual inputs')],...candidates.filter(m=>!chosen||m.manufacturer===chosen).map(m=>[m.id,m.manufacturer+' · '+(en?m.model_en||m.model:m.model)])],selection.id,onSelect);
 if(process==='costos'){
  node(root,'p',tr('La ficha aporta identidad y límites, nunca consumo medio. Puedes reutilizar entradas de un cálculo guardado mediante una acción explícita; se conservan tus entradas manuales.','The datasheet provides identity and limits, never average consumption. Explicitly reuse saved-case inputs while preserving your manual entries.'),'muted');
  const source=picker(root,'machine-cost-source',tr('Cálculo de origen','Source calculation'),[['',tr('Seleccionar cálculo guardado','Choose saved calculation')],...history.map(r=>[r.id,r.name||r.module])],'',()=>{});
  const reuse=node(root,'button',tr('Reutilizar entradas compatibles','Reuse compatible inputs'));reuse.id='machine-reuse';reuse.type='button';reuse.onclick=()=>{const record=history.find(x=>x.id===source.value);if(record)onReuse?.(record);};
  reuse.disabled=true;source.addEventListener('change',()=>{reuse.disabled=!source.value;});
  if(selection.reused_from)node(root,'p',tr('Origen reutilizado: ','Reused source: ')+(selection.reused_from.name||selection.reused_from.id)+' · '+Object.keys(selection.reused_from.applied).join(', '),'muted');
 }
 const profile=selection.profile;if(!profile)return;
 node(root,'h3',profile.manufacturer+' · '+(en?profile.model_en||profile.model:profile.model));
 node(root,'p',(en?profile.configuration_en||profile.configuration:profile.configuration_es||profile.configuration)||profile.model,'muted');
 const specific=['specific_configuration','specific_model'].includes(profile.scope);
 node(root,'p',specific?tr('Ficha de configuración concreta; verificar físicamente la variante','Specific configuration datasheet; verify actual variant'):tr('Rango de serie/modelo — NO capacidad de una unidad particular','Series/model range — NOT the capacity of one unit'),'muted');
 node(root,'p',tr('Estado de evidencia: ','Evidence status: ')+(profile.verification_status==='document_checked'?tr('Documento revisado; no es certificación del equipo','Document reviewed; not equipment certification'):tr('Documentación previa; pendiente de reconsulta','Prior documentation; recheck pending')),'muted');
 if(profile.identity_status)node(root,'p',tr('Equivalencia entre variantes/fuentes pendiente; no se contabiliza como otro equipo ni se mezclan especificaciones.','Cross-source variant equivalence pending; not counted as another machine and specifications are not merged.'),'muted');
 node(root,'p',Object.keys(profile.autofill_fields||{}).length?tr('Precarga compatible, tras confirmar variante: ','Compatible prefill after confirming variant: ')+Object.values(profile.autofill_fields).map(k=>(labels[k]||[k,k])[en?1:0]).join(', '):tr('Sin precarga operativa: los límites de ficha no son condiciones de operación.','No operating prefill: datasheet limits are not operating conditions.'),'muted');
 const details=node(root,'details');details.id='machine-datasheet';details.open=opened.has(details.id);node(details,'summary',tr('Datos técnicos y fuente','Technical data and source'));
 const grid=node(details,'div',null,'machine-spec-grid');
 for(const [key,s] of Object.entries(profile.specifications)){
  const row=node(grid,'div',null,'machine-spec');node(row,'span',(labels[key]||[key,key])[en?1:0]);node(row,'strong',(s.range?s.range.join('–'):s.value)+' '+s.unit);
  node(row,'small',en?s.note_en||tr('Nota original de fuente: ','Original source note: ')+s.note:s.note);
  if(s.conditions)node(row,'small',tr('Condiciones: ','Conditions: ')+JSON.stringify(s.conditions));
  if(s.source_id)node(row,'small',tr('Fuente: ','Source: ')+s.source_id);
 }
 node(details,'p',en?'Check the original document for conditions, configuration and limitations.':profile.source.scope_note,'muted');
 for(const source of profile.sources||[profile.source]){
  const link=node(details,'a',source.title||tr('Consultar fuente técnica','Open technical source'));link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';
  node(details,'small',tr('Consulta: ','Retrieved: ')+(source.retrieved_on||catalog?.retrieved_on||tr('No registrada','Not recorded')));
 }
 if(profile.documented_materials?.length)node(details,'p',tr('Materiales mencionados en la documentación: ','Materials mentioned in the documentation: ')+profile.documented_materials.join(', ')+tr('. Confirmar grado, opciones y condiciones reales.','. Verify grade, options and actual conditions.'),'muted');
 else node(details,'p',tr('Lista específica de materiales admisibles pendiente: confirmar con el fabricante. Una referencia de rendimiento no certifica compatibilidad.','Specific approved-material list pending: confirm with the manufacturer. An output reference does not certify compatibility.'),'muted');
 if(profile.undocumented_fields?.length)node(details,'p',tr('Sin documentar: ','Undocumented: ')+profile.undocumented_fields.map(k=>(labels[k]||[k,k])[en?1:0]).join(', '),'muted');
 if(profile.limitations)node(details,'p',en?profile.limitations_en||profile.limitations:profile.limitations,'muted');
 if(specific&&process!=='costos'){
  const container=node(root,'label',null,'machine-confirm');const input=node(container,'input');input.type='checkbox';input.id='machine-confirm';input.checked=selection.confirmed===true;
  node(container,'span',tr('Confirmo que mi máquina corresponde a esta variante. Incorporar solo parámetros publicados compatibles, conservando mis entradas manuales.','I confirm my machine matches this variant. Apply only compatible published parameters while preserving manual inputs.'));
  input.addEventListener('change',e=>onConfirm(e.target.checked));
 }
 const operation=profile.process===process?[
  ['injectionPressureBar','max_injection_pressure_bar','Presión de inyección de máquina','Machine injection pressure','bar'],
  ['injectionSpeed','max_injection_speed_mm_s','Velocidad de inyección','Injection speed','mm/s'],
  ['moldWidth','mold_max_width_mm','Ancho del molde','Mould width','mm'],['moldLength','mold_max_length_mm','Largo del molde','Mould length','mm'],
  ['moldThickness','mold_min_thickness_mm','Espesor del molde','Mould thickness','mm'],['openingStroke','clamp_max_stroke_mm','Carrera de apertura requerida','Required opening stroke','mm'],
  ['formingHeight','forming_max_height_mm','Altura de conformado','Forming height','mm'],['screwRpm','screw_speed_rpm','Velocidad de husillo','Screw speed','rpm'],
  ['formingWidth','forming_max_width_mm','Ancho de conformado','Forming width','mm'],['formingLength','forming_max_length_mm','Largo de conformado','Forming length','mm'],['toolWidth','tool_max_width_mm','Ancho de herramienta','Tool width','mm'],['toolLength','tool_max_length_mm','Largo de herramienta','Tool length','mm']
 ].filter(x=>profile.specifications[x[1]]):[];
 if(operation.length){
  const box=node(root,'details');box.id='machine-operation-details';box.open=opened.has(box.id);node(box,'summary',tr('Condiciones adicionales para comparar','Additional comparison conditions'));
  for(const [key,,es,eng,unit] of operation){const label=node(box,'label',tr(es,eng)+' ('+unit+')');const input=node(label,'input');input.type='number';input.min='0';input.step='any';input.id='machine-operation-'+key;input.value=selection.operation?.[key]??'';input.oninput=()=>onOperation?.(key,input.validity.badInput?'invalid':input.value);}
 }
 if(profile.specifications.max_cycle_cpm&&process==='termoformado')picker(root,'machine-forming-mode',tr('Modo de la referencia de ciclos','Cycle reference mode'),[['',tr('Sin confirmar','Not confirmed')],['standard',tr('Estándar (sin BFS)','Standard (without BFS)')],['BFS','BFS']],selection.operation?.formingMode||'',v=>onOperation?.('formingMode',v));
 const capacity=profile.specifications.output_max_kg_h||profile.specifications.plasticizing_rate_PS_kg_h||profile.specifications.shot_mass_ABS_g||profile.specifications.ABS_reference_output_kg_h;
 if(capacity?.conditions?.material&&process!=='costos'){
  const box=node(root,'details');box.id='machine-capacity-details';box.open=opened.has(box.id);node(box,'summary',tr('Condiciones del rendimiento publicado','Published output conditions'));
  picker(box,'machine-capacity-material',tr('Material de la referencia','Reference material'),[['',tr('Sin confirmar','Not confirmed')],[capacity.conditions.material,capacity.conditions.material]],selection.operation?.capacityMaterial||'',v=>onOperation?.('capacityMaterial',v));
  const label=node(box,'label',null,'machine-confirm');const input=node(label,'input');input.type='checkbox';input.id='machine-capacity-confirm';input.checked=selection.operation?.capacityConditionsConfirmed===true;input.onchange=()=>onOperation?.('capacityConditionsConfirmed',input.checked);node(label,'span',tr('Confirmo que coinciden material y todas las condiciones de la ficha; esto no garantiza rendimiento real.','I confirm the material and all datasheet conditions match; this does not guarantee actual output.'));
 }
 node(root,'p',tr('La ficha, variante, condiciones y fuentes se conservarán en el cálculo guardado.','Specifications, variant, conditions and sources are preserved in saved calculations.'),'muted');
 const status=node(root,'div');status.id='machine-assessment';status.role='status';renderMachineAssessment(status,assessment);
}
