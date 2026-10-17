// Comparaciones documentales independientes de los siete motores matemáticos.
const finite = v => typeof v === 'number' && Number.isFinite(v);
const number = v => typeof v==='number'?v:typeof v==='string'&&v.trim()?Number(v):NaN;
const metric = (r,label,unit) => r?.metrics?.find(m=>m.label===label&&m.unit===unit&&finite(m.value))?.value;
const conversions = { 'mm:mm':1, 'cm:mm':10, 'm:mm':1000, 'mm²:mm²':1, 'µm:µm':1, 'mm:µm':1000, 'µm:mm':.001,
  'cm³:cm³':1, 'L:L':1, 'cm³:L':.001, 'kg/h:kg/h':1, 'm/min:m/min':1,
  'g:g':1, 'mm/s:mm/s':1, 'rpm:rpm':1, 'bar:bar':1, 'MPa:bar':10, 'kN:kN':1, 'tf:kN':9.80665, 'cm³/s:cm³/s':1, '°C:°C':1,
  'ciclos/h:c/min':1/60, 'c/min:c/min':1 };
export function machineUnit(value,from,to) {
  const factor=conversions[from+':'+to];return finite(value)&&finite(factor)?value*factor:NaN;
}
export function compareMachine(profile,confirmed,process,result,values={},operation={}) {
  if(!profile || profile.process!==process)return null;
  const report={machine_id:profile.id,model:profile.model,manufacturer:profile.manufacturer,source:structuredClone(profile.source),
    scope:profile.scope,configuration_confirmed:confirmed===true,checks:[],pending:[],notes:[],industrial_approval:false};
  const specific=['specific_configuration','specific_model'].includes(profile.scope);
  if(!specific){report.notes.push('series_not_individual');return report;}
  if(!confirmed){report.notes.push('confirm_variant');return report;}
  const s=profile.specifications,op=operation||{};
  function check(label,value,unit,key,{minimum=false,nominal=false,conditional=false}={}) {
    const p=s[key];if(!p)return;
    if(conditional && (op.capacityConditionsConfirmed!==true || !p.conditions || op.capacityMaterial!==p.conditions.material || op.materialFamily&&op.materialFamily!==p.conditions.material ||
      p.conditions.temperature_C!=null&&number(values.targetT)!==p.conditions.temperature_C ||
      p.conditions.residence_h&&(!finite(number(values.residence))||number(values.residence)<p.conditions.residence_h[0]||number(values.residence)>p.conditions.residence_h[1]))){
      report.pending.push({label,key,reason:'capacity_conditions',conditions:p.conditions||null});return;
    }
    const actual=machineUnit(value,unit,p.unit);
    if(!finite(actual)||!finite(p.value)||p.unit==='°C'&&actual<=-273.15||p.unit!=='°C'&&actual<0||['mm','µm','mm²'].includes(p.unit)&&actual===0){report.pending.push({label,key,reason:'missing_or_incompatible_units'});return;}
    report.checks.push({label,key,actual,limit:p.value,unit:p.unit,conditions:structuredClone(p.conditions||null),
      status:minimum&&actual<p.value?'below_published_limit':!minimum&&actual>p.value?'above_published_limit':nominal?'below_nominal_not_verified':'within_published_limit',
      criterion:minimum?'minimum':'maximum',basis:nominal?'nominal_only':'published_reference',note:p.note});
  }
  function interval(label,value,unit,key) {
    const p=s[key];if(!p)return;
    const actual=machineUnit(number(value),unit,p.unit);
    if(!finite(actual)||!p.range||p.unit==='°C'&&actual<=-273.15||p.unit!=='°C'&&actual<0){report.pending.push({label,key,reason:'missing_or_incompatible_units'});return;}
    report.checks.push({label,key,actual,limit:p.range[1],lower_limit:p.range[0],unit:p.unit,basis:'published_range',
      status:actual<p.range[0]?'below_published_limit':actual>p.range[1]?'above_published_limit':'within_published_limit',note:p.note});
  }
  const screwMismatch=process==='inyeccion' && ['screwD','screwMaxStroke'].some((field,i)=>{
    const p=s[i?'screw_max_stroke_mm':'screw_diameter_mm'],actual=number(values[field]);return p&&finite(p.value)&&finite(actual)&&actual!==p.value;
  });
  if(screwMismatch){report.notes.push('screw_configuration_mismatch');return report;}
  if(process==='inyeccion'){
    check('Shot calculado (volumen)',metric(result,'Shot calculado (volumen)','cm³'),'cm³','shot_volume_cm3');
    check('Carrera calculada del husillo',metric(result,'Carrera calculada del husillo','mm'),'mm','screw_max_stroke_mm');
    check('Fuerza de cierre con factor',metric(result,'Fuerza de cierre con factor','tf'),'tf','clamp_force_kN');
    check('Caudal volumétrico inyección',number(values.injectionFlow),'cm³/s','max_injection_flow_cm3_s');
    check('Presión de inyección de máquina',number(op.injectionPressureBar),'bar','max_injection_pressure_bar');
    check('Capacidad de plastificación',number(values.plasticizingRate),'kg/h','plasticizing_rate_PS_kg_h',{conditional:true});
    check('Masa de shot para ABS',metric(result,'Shot calculado (masa)','g'),'g','shot_mass_ABS_g',{conditional:true});
    check('Velocidad de inyección',number(op.injectionSpeed),'mm/s','max_injection_speed_mm_s');
    check('Ancho del molde',number(op.moldWidth),'mm','mold_max_width_mm');
    check('Largo del molde',number(op.moldLength),'mm','mold_max_length_mm');
    check('Espesor del molde',number(op.moldThickness),'mm','mold_min_thickness_mm',{minimum:true});
    report.notes.push('pressure_roles_separate');
  }
  if(process==='extrusion'){
    check('Alimentación con pérdida indicada',metric(result,'Alimentación con pérdida indicada','kg/h'),'kg/h','output_max_kg_h',{conditional:true});
    check('Velocidad de línea',number(values.lineSpeed),'m/min','line_speed_max_m_min');
    interval('Velocidad de husillo',op.screwRpm,'rpm','screw_speed_rpm');
    report.notes.push('no_output_from_rpm','installed_not_consumption');
  }
  if(process==='pelicula'){
    check('Diámetro ideal de burbuja',metric(result,'Diámetro ideal de burbuja','mm'),'mm','bubble_max_diameter_mm');
    check('Ancho plegado',number(values.layflat),'mm','film_max_layflat_mm');
    check('Espesor de una pared',number(values.filmGauge),'µm','film_max_thickness_um');
    check('Espesor de una pared',number(values.filmGauge),'µm','film_min_thickness_um',{minimum:true});
    check('Producción ideal',metric(result,'Producción ideal','kg/h'),'kg/h','output_max_kg_h',{conditional:true});
    check('Velocidad de línea',number(values.lineSpeed),'m/min','hauloff_max_speed_m_min');
    interval('Velocidad de línea',values.lineSpeed,'m/min','hauloff_speed_m_min');
    interval('Velocidad de husillo',op.screwRpm,'rpm','screw_speed_rpm');
    if(s.die_diameter_mm && number(values.dieDiameter)!==s.die_diameter_mm.value)report.notes.push('die_configuration_mismatch');
    report.notes.push('film_geometry_only','no_output_from_rpm');
  }
  if(process==='soplado'){
    check('Ancho del molde',number(op.moldWidth),'mm','mold_max_width_mm');
    check('Largo del molde',number(op.moldLength),'mm','mold_max_length_mm');
    check('Carrera de apertura requerida',number(op.openingStroke),'mm','clamp_max_stroke_mm');
    report.notes.push('mould_not_container');
  }
  if(process==='termoformado'){
    check('Ancho de recorte',number(values.blankW),'mm','sheet_max_width_mm');
    check('Largo de recorte',number(values.blankL),'mm','sheet_max_length_mm');
    check('Espesor inicial',number(values.initialT),'mm','sheet_max_thickness_mm');
    check('Altura de conformado',number(op.formingHeight),'mm','forming_max_height_mm');
    check('Ancho de conformado',number(op.formingWidth),'mm','forming_max_width_mm');
    check('Largo de conformado',number(op.formingLength),'mm','forming_max_length_mm');
    check('Ancho de herramienta',number(op.toolWidth),'mm','tool_max_width_mm');
    check('Largo de herramienta',number(op.toolLength),'mm','tool_max_length_mm');
    interval('Espesor inicial',values.initialT,'mm','sheet_thickness_mm');
    if(s.max_cycle_cpm){
      if(['standard','BFS'].includes(op.formingMode))check('Velocidad de ciclos',metric(result,'Ciclos teóricos por hora','ciclos/h'),'ciclos/h',op.formingMode==='BFS'?'bfs_max_cycle_cpm':'max_cycle_cpm');
      else report.pending.push({label:'Velocidad de ciclos',key:'max_cycle_cpm',reason:'forming_mode'});
      report.notes.push('cycle_reference_not_production');
    }
    check('Superficie de lámina consumida',metric(result,'Superficie de lámina consumida','mm²'),'mm²','sheet_max_area_mm2');
    report.notes.push('nominal_not_useful_area');
  }
  if(process==='secado'){
    check('Volumen útil mínimo de tolva',metric(result,'Volumen útil mínimo de tolva','L'),'L','hopper_nominal_L',{nominal:true});
    check('Temperatura final',number(values.targetT),'°C','max_temperature_C');
    interval('Temperatura final',values.targetT,'°C','temperature_range_C');
    check('Caudal de polímero',number(values.throughput),'kg/h','output_max_kg_h',{conditional:true});
    check('Caudal de polímero',number(values.throughput),'kg/h','ABS_reference_output_kg_h',{conditional:true});
    if(profile.machine_type==='hot_air_surface_dryer')report.notes.push('hot_air_surface_only');
    report.notes.push('hopper_nominal_not_useful','installed_not_consumption','resin_guideline_not_machine_rating');
  }
  report.notes.push('screening_not_approval');return report;
}
