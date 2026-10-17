// DOM-only equipment view: never interpret maker/model text as markup.
import {machinesFor} from './machines.js';
const labels={
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
export function renderMachineAssessment(root,assessment) {
 if(!root)return;root.replaceChildren();if(!assessment)return;
 const en=document.documentElement.lang==='en',tr=(es,enText)=>en?enText:es;
 for(const check of assessment.checks||[]){
  const line=node(root,'div',null,'machine-check');
  node(line,'span',check.label);node(line,'strong',check.actual.toFixed(2)+' / '+check.limit+' '+check.unit);
  node(line,'small',check.status==='above_published_limit'
    ? tr('Supera un límite publicado; revisar caso y equipo','Exceeds a published limit; review the case and equipment')
    : tr('Dentro de un límite numérico publicado; NO certifica aptitud','Within a published numerical limit; NOT proof of suitability'));
 }
 const msg=assessment.scope!=='specific_configuration'
  ?tr('Rango de serie o modelo configurable: NO se evalúa capacidad individual','Series/configurable model range: individual capacity NOT assessed')
  :!assessment.configuration_confirmed?tr('Confirma la variante real para comparar','Confirm actual configuration to compare')
  :!assessment.checks.length?tr('Sin resultados y límites directamente comparables','No directly comparable results and limits'):null;
 if(msg)node(root,'p',msg,'muted');
 node(root,'p',tr('Comprobación académica: verifica el equipo real, material, molde y proceso.','Educational screening: verify actual equipment, material, mould and process.'),'muted');
}
export function renderMachinePanel(root,{catalog,process,selection,onSelect,onConfirm,assessment=null}) {
 root.replaceChildren();
 const en=document.documentElement.lang==='en',tr=(es,enText)=>en?enText:es;
 node(root,'h2',tr('Maquinaria y equipo de proceso','Processing machinery and equipment'));
 node(root,'p',tr('Catálogo documental. Una serie no define una configuración de máquina; los datos no sustituyen la placa de características.','Documentary catalog. A series does not identify one machine configuration; these values do not replace the machine nameplate.'),'muted');
 if(process==='costos') {
  node(root,'p',tr('Costos utiliza consumos medidos y no deduce potencia media de potencias instaladas.','Costing uses measured consumption and does not infer average power from installed ratings.'),'muted');
  return;
 }
 const label=node(root,'label',tr('Seleccionar maquinaria real','Select real-world equipment'));label.htmlFor='machine-select';
 const select=node(root,'select',null);select.id='machine-select';select.setAttribute('aria-label',tr('Modelo de máquina','Machine model'));
 const empty=document.createElement('option');empty.value='';empty.textContent=tr('Sin selección — entradas manuales','No selection — manual inputs');select.append(empty);
 for(const item of machinesFor(catalog,process)){
  const option=document.createElement('option');option.value=item.id;option.textContent=item.manufacturer+' · '+item.model;option.selected=item.id===selection.id;select.append(option);
 }
 select.addEventListener('change',event=>onSelect(event.target.value));
 const profile=selection.profile;if(!profile)return;
 node(root,'p',profile.manufacturer+' · '+profile.model);
 node(root,'p',profile.scope==='specific_configuration'
  ?tr('Ficha de configuración concreta; verificar físicamente la variante','Specific configuration datasheet; verify actual variant')
  :tr('Rango de serie/modelo — NO capacidad de una unidad particular','Series/model range — NOT the capacity of one unit'),'muted');
 const details=node(root,'details',null);node(details,'summary',tr('Datos técnicos y fuente','Technical data and source'));
 const grid=node(details,'div',null,'machine-spec-grid');
 for(const [key,s] of Object.entries(profile.specifications)){
  const row=node(grid,'div',null,'machine-spec');
  node(row,'span',(labels[key]||[key,key])[en?1:0]);
  node(row,'strong',(s.range?s.range.join('–'):s.value)+' '+s.unit);
 }
 node(details,'p',en?'Verify applicability and variants in the original manufacturer datasheet.':profile.source.scope_note,'muted');
 const link=node(details,'a',tr('Consultar ficha oficial','Open official manufacturer datasheet'));link.href=profile.source.url;link.target='_blank';link.rel='noopener noreferrer';
 if(profile.scope==='specific_configuration'){
  const container=node(root,'label',null,'machine-confirm');
  const input=node(container,'input',null);input.type='checkbox';input.id='machine-confirm';input.checked=selection.confirmed===true;
  node(container,'span',tr('Confirmo que mi máquina corresponde exactamente a esta configuración. Precargar solo diámetro y carrera publicados.','I confirm my machine matches this exact configuration. Prefill only published screw diameter and stroke.'));
  input.addEventListener('change',event=>onConfirm(event.target.checked));
 }
 node(root,'p',tr('La ficha seleccionada y su procedencia se conservarán en el cálculo guardado.','Selected specifications and source are captured in saved calculations.'),'muted');
 const assessmentRoot=node(root,'div',null);assessmentRoot.id='machine-assessment';assessmentRoot.setAttribute('role','status');
 renderMachineAssessment(assessmentRoot,assessment);
}
