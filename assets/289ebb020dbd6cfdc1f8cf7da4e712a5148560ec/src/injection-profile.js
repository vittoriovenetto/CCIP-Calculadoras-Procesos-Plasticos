import { calculate } from './engine.js';
import { n } from './math.js';

export const defaultInjectionProfile = () => ({ enabled: false, fractions: [30,50,20], initial_position_mm:'', direction:'' });
export function restoreInjectionProfile(value) {
  const fallback = defaultInjectionProfile();
  if (!value || !Array.isArray(value.fractions) || value.fractions.length !== 3 || !value.fractions.every(x=>typeof x==='number'&&Number.isFinite(x))) return fallback;
  return {enabled:value.enabled===true,fractions:[...value.fractions],initial_position_mm:['string','number'].includes(typeof value.initial_position_mm)?value.initial_position_mm:'',direction:['increasing','decreasing'].includes(value.direction)?value.direction:''};
}

// Recorridos geométricos acumulados; coordenadas solo con origen y sentido explícitos.
// Base sin reserva ni colchón, como el perfil del original; rho ya es fundida.
export function calculateInjectionProfile(inputs, level, settings, densityAssessment) {
  if (!settings?.enabled || level !== 'advanced') return null;
  const fractions = settings.fractions?.map(n);
  if (!fractions || fractions.length !== 3 || fractions.some(x=>!Number.isFinite(x)||x<0||x>100) || Math.abs(fractions.reduce((a,b)=>a+b,0)-100)>1e-8) {
    return {valid:false,error:'Los porcentajes L1/L2/L3 deben estar entre 0 y 100 y sumar 100 %.',settings};
  }
  const base = calculate('inyeccion',{...inputs,shotMargin:0},level);
  const metric = label => base.metrics.find(m=>m.label===label)?.value ?? null;
  const mass = metric('Shot calculado (masa)'), volume = metric('Shot calculado (volumen)');
  const totalStroke = metric('Carrera calculada del husillo');
  const massMode = inputs.method !== 'volume';
  const estimated = densityAssessment?.approximate === true;
  const initial = n(settings.initial_position_mm);
  const direction = settings.direction === 'increasing' ? 1 : settings.direction === 'decreasing' ? -1 : null;
  const absolute = Number.isFinite(initial) && direction !== null && totalStroke !== null;
  let sum = 0;
  const stages = fractions.map((fraction,i)=>{
    sum += fraction;
    const scale = (value,f) => value===null ? null : value*(f/100);
    return {label:`L${i+1}`,fraction,volume_cm3:scale(volume,fraction),mass_g:scale(mass,fraction),stroke_mm:scale(totalStroke,fraction),cumulative_mm:scale(totalStroke,sum),
      start_position_mm:absolute?initial+direction*scale(totalStroke,sum-fraction):null,end_position_mm:absolute?initial+direction*scale(totalStroke,sum):null,
      start_position_estimate:estimated&&massMode&&totalStroke!==null&&sum-fraction!==0,
      volume_estimate:estimated&&massMode&&volume!==null,mass_estimate:estimated&&!massMode&&mass!==null,stroke_estimate:estimated&&massMode&&totalStroke!==null};
  });
  const validAbsolute = absolute && stages.every(s=>Number.isFinite(s.start_position_mm)&&Number.isFinite(s.end_position_mm));
  if (!validAbsolute) for(const stage of stages) {stage.start_position_mm=null;stage.end_position_mm=null;}
  return {valid:true,settings:{...settings,enabled:true,fractions},basis:'unreserved_dose',volume_cm3:volume,mass_g:mass,stroke_mm:totalStroke,stages,
    approximate:estimated,thermal_correction_applied:false,absolute_machine_positions:validAbsolute,
    note:'Perfil geométrico ilustrativo: 30/50/20 % son editables, no una recomendación universal. No define velocidades, presiones, conmutación ni consignas de máquina.'};
}
