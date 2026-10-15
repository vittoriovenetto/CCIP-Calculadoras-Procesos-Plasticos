import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateInjectionProfile,defaultInjectionProfile,restoreInjectionProfile} from '../src/injection-profile.js';
const input={method:'mass',partMass:30,cavities:2,runnerMass:5,meltDensity:1,screwD:10,screwMaxStroke:1000,shotMargin:20};
const settings={enabled:true,fractions:[30,50,20]};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Perfil L1/L2/L3: sin margen, particiones 30/50/20, mm³ y acumulados desde cero',()=>{
  const p=calculateInjectionProfile(input,'advanced',settings,{approximate:true});
  assert.equal(p.valid,true);assert.equal(p.volume_cm3,65);assert.equal(p.mass_g,65);
  assert.deepEqual(p.stages.map(s=>s.volume_cm3),[19.5,32.5,13]);
  close(p.stages[0].stroke_mm,248.2817112233567);close(p.stages[1].stroke_mm,413.8028520389279);close(p.stages[2].stroke_mm,165.52114081557116);
  close(p.stages[2].cumulative_mm,827.6057040778558);assert.equal(p.absolute_machine_positions,false);
  assert.ok(p.stages.every(s=>s.volume_estimate&&s.stroke_estimate&&!s.mass_estimate));
  assert.equal(p.stages[0].start_position_estimate,false);assert.equal(p.stages[1].start_position_estimate,true);
});
test('Perfil volumétrico conserva cm³ y mm sin rho; solo las masas quedan pendientes',()=>{
  const p=calculateInjectionProfile({...input,method:'volume',partVolume:30,runnerVolume:5,meltDensity:''},'advanced',settings,{approximate:false});
  assert.equal(p.volume_cm3,65);assert.equal(p.stages[0].mass_g,null);assert.equal(p.stages[0].volume_cm3,19.5);assert.ok(p.stages[0].stroke_mm>0);
});
test('Perfil por masa conserva gramos sin rho; cm³ y mm no se inventan',()=>{
  const p=calculateInjectionProfile({...input,meltDensity:''},'advanced',settings,{approximate:false});
  assert.equal(p.stages[0].mass_g,19.5);assert.equal(p.stages[0].volume_cm3,null);assert.equal(p.stages[0].stroke_mm,null);
});
test('Sin diámetro o con diámetro inválido los volúmenes no se pierden y las carreras quedan pendientes',()=>{
  for(const screwD of ['',0,-1,NaN,Infinity]) {
    const p=calculateInjectionProfile({...input,screwD},'advanced',settings,{});
    assert.equal(p.stages[0].volume_cm3,19.5);assert.equal(p.stages[0].stroke_mm,null);
  }
});
test('Fracciones editables: ceros admitidos; negativos, suma incorrecta, vacíos e infinitos rechazados',()=>{
  for(const fractions of [[30,30,20],[-10,90,20],[100,0,1],['',50,50],[NaN,50,50],[Infinity,0,0],[50,50]]) {
    assert.equal(calculateInjectionProfile(input,'advanced',{enabled:true,fractions},{}).valid,false);
  }
  const p=calculateInjectionProfile(input,'advanced',{enabled:true,fractions:[0,50,50]},{});assert.equal(p.valid,true);assert.equal(p.stages[0].stroke_mm,0);
});
test('L1/L2/L3 físicos no son los niveles; el perfil no se impone en básico ni inicialmente',()=>{
  assert.equal(calculateInjectionProfile(input,'basic',settings,{}),null);
  assert.equal(calculateInjectionProfile(input,'technical',settings,{}),null);
  assert.equal(calculateInjectionProfile(input,'technical',defaultInjectionProfile(),{}),null);
  assert.deepEqual(restoreInjectionProfile({enabled:true,fractions:[20,40,40]}),{...defaultInjectionProfile(),enabled:true,fractions:[20,40,40]});
  assert.deepEqual(restoreInjectionProfile({enabled:true,fractions:['bad']}),defaultInjectionProfile());
});
test('Posiciones absolutas solo con origen y sentido explícitos; cero es un origen válido',()=>{
  for(const optional of [{},{initial_position_mm:0},{direction:'decreasing'},{initial_position_mm:'invalid',direction:'increasing'}]) {
    const p=calculateInjectionProfile(input,'advanced',{...settings,...optional},{});
    assert.equal(p.absolute_machine_positions,false);assert.ok(p.stages.every(s=>s.start_position_mm===null&&s.end_position_mm===null));
  }
  for(const [direction,sign] of [['increasing',1],['decreasing',-1]]) {
    const p=calculateInjectionProfile(input,'advanced',{...settings,initial_position_mm:0,direction},{});
    assert.equal(p.absolute_machine_positions,true);assert.equal(p.stages[0].start_position_mm,0);
    close(p.stages[2].end_position_mm,sign*p.stroke_mm);
    close(p.stages[1].start_position_mm,p.stages[0].end_position_mm);
  }
});
test('Colchón, factor caliente y margen no alteran los tres tramos físicos',()=>{
  const a=calculateInjectionProfile(input,'advanced',settings,{});
  const b=calculateInjectionProfile({...input,cushion:10,hotFactor:0.5,shotMargin:90},'advanced',settings,{});
  assert.deepEqual(a.stages,b.stages);assert.equal(b.thermal_correction_applied,false);
});
