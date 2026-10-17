import test from 'node:test';import assert from 'node:assert/strict';
import {compareMachine,machineUnit} from '../src/machine-comparison.js';
import {reuseCalculation,newMachineState,machineSnapshot,restoreMachine} from '../src/machines.js';
// Synthetic fixtures test dimensions/semantics, never commercial machine data.
const p=(value,unit,conditions=null)=>({value,unit,note:'Synthetic test fixture',conditions});
const profile=(process,specifications)=>({id:'synthetic-test-fixture',model:'Synthetic fixture',manufacturer:'Test only',scope:'specific_configuration',process,specifications,source:{url:'https://example.com',title:'Synthetic fixture'}});
const result=(label,value,unit)=>({metrics:[{label,value,unit}]});
test('Machine units: tf/kN, MPa/bar, mm/µm; no ABS mass-volume or installed-power conversions',()=>{
 assert.equal(machineUnit(15,'tf','kN'),147.09975);assert.equal(machineUnit(60,'MPa','bar'),600);assert.equal(machineUnit(.02,'mm','µm'),20);
 for(const a of [[20,'g','cm³'],[2,'kW','kWh'],[3,'kW','kg/h'],[100,'kg/cm²','bar']])assert.ok(Number.isNaN(machineUnit(...a)));
});
test('Pressure roles: cavity input never becomes machine injection pressure',()=>{
 const m=profile('inyeccion',{max_injection_pressure_bar:p(600,'bar')});
 const a=compareMachine(m,true,'inyeccion',result('',1,''),{cavityPressure:1000});assert.equal(a.checks.length,0);
 assert.equal(compareMachine(m,true,'inyeccion',{}, {},{injectionPressureBar:700}).checks[0].status,'above_published_limit');
});
test('Extrusion throughput needs material and explicit full-condition match, never RPM inference',()=>{
 const m=profile('extrusion',{output_max_kg_h:p(50,'kg/h',{material:'PE',scope:'Synthetic conditions'}),screw_speed_rpm:{range:[0,95],unit:'rpm',note:'Synthetic'}});
 const r=result('Alimentación con pérdida indicada',60,'kg/h');
 assert.equal(compareMachine(m,true,'extrusion',r,{}, {screwRpm:95}).checks.length,1);
 assert.equal(compareMachine(m,true,'extrusion',r,{}, {capacityConditionsConfirmed:true,capacityMaterial:'PP'}).checks.length,0);
 const a=compareMachine(m,true,'extrusion',r,{}, {capacityConditionsConfirmed:true,capacityMaterial:'PE'});assert.equal(a.checks[0].actual,60);assert.equal(a.checks[0].status,'above_published_limit');
 assert.equal(compareMachine(m,true,'extrusion',r,{}, {capacityConditionsConfirmed:true,capacityMaterial:'PE',materialFamily:'PP'}).checks.length,0);
 assert.equal(compareMachine(m,true,'extrusion',r,{}, {capacityConditionsConfirmed:true,capacityMaterial:'PE',materialFamily:'unverified_formulation'}).checks.length,0);
});
test('Blown film: actual bubble, single-wall thickness and haul-off limits; no die-derived production',()=>{
 const m=profile('pelicula',{bubble_max_diameter_mm:p(300,'mm'),film_min_thickness_um:p(.02,'mm'),film_max_thickness_um:p(.2,'mm'),hauloff_max_speed_m_min:p(20,'m/min')});
 const a=compareMachine(m,true,'pelicula',result('Diámetro ideal de burbuja',320,'mm'),{filmGauge:10,lineSpeed:25});
 assert.equal(a.checks.length,4);assert.equal(a.checks.filter(x=>['above_published_limit','below_published_limit'].includes(x.status)).length,3);
 assert.equal(a.checks.find(x=>x.key==='film_min_thickness_um').actual,.01);assert.equal(a.checks.find(x=>x.key==='film_min_thickness_um').status,'below_published_limit');
});
test('Blow moulding checks actual mould, never bottle dimensions against mould size',()=>{
 const m=profile('soplado',{mold_max_width_mm:p(610,'mm'),mold_max_length_mm:p(430,'mm')});
 const a=compareMachine(m,true,'soplado',{}, {bodyD:20,bodyH:30});assert.equal(a.checks.length,0);assert.equal(a.pending.length,2);
 assert.equal(compareMachine(m,true,'soplado',{}, {},{moldWidth:620,moldLength:400}).checks[0].status,'above_published_limit');
});
test('Thermoforming distinguishes max sheet limits from configurable minimums and tool height',()=>{
 const m=profile('termoformado',{min_nominal_sheet_width_mm:p(1000,'mm'),standard_tool_height_mm:p(620,'mm')});
 assert.equal(compareMachine(m,true,'termoformado',{}, {blankW:1200,blankL:1000}).checks.length,0);
 m.specifications.sheet_max_width_mm=p(600,'mm');m.specifications.forming_max_height_mm=p(250,'mm');
 const a=compareMachine(m,true,'termoformado',{}, {blankW:700},{formingHeight:200});assert.equal(a.checks[0].status,'above_published_limit');assert.equal(a.checks[1].status,'within_published_limit');
});
test('Drying: nominal hopper never certifies useful volume or polymer heating power',()=>{
 const m=profile('secado',{hopper_nominal_L:p(30,'L'),max_temperature_C:p(130,'°C'),connected_power_kW:p(2,'kW')});
 const a=compareMachine(m,true,'secado',result('Volumen útil mínimo de tolva',25,'L'),{targetT:140});
 assert.equal(a.checks[0].status,'below_nominal_not_verified');assert.equal(a.checks[1].status,'above_published_limit');assert.equal(a.industrial_approval,false);assert.equal(a.checks.length,2);
 assert.equal(compareMachine(m,true,'secado',result('Volumen útil mínimo de tolva',35,'L'),{targetT:80}).checks[0].status,'above_published_limit');
});
test('Missing, nonfinite, negative or incompatible units produce pending, not zero/green',()=>{
 const m=profile('soplado',{mold_max_width_mm:p(100,'mm')});
 for(const value of ['',' ',null,'invalid',-1,0,Infinity,true,[]])assert.equal(compareMachine(m,true,'soplado',{}, {},{moldWidth:value}).checks.length,0);
 m.specifications.mold_max_width_mm.unit='cm³';assert.equal(compareMachine(m,true,'soplado',{}, {},{moldWidth:20}).checks.length,0);
});
test('Costs reuses only compatible explicit inputs; preserves manual fields and original source',()=>{
 const record={id:'source-case',module:'inyeccion',date:'2026-10-17',name:'Source',inputs:{cycleSec:15,cavities:2,partMass:10,powerKw:100},machine:{profile:{specifications:{connected_power_kW:p(2,'kW')}}}};
 const before=structuredClone(record),values={cycleSec:30,cavities:3,partMass:'',powerKw:''},origins={cycleSec:'default_example',cavities:'manual'};
 const trace=reuseCalculation(record,values,origins);assert.equal(values.cycleSec,15);assert.equal(values.cavities,3);assert.equal(values.partMass,10);assert.equal(values.powerKw,'');assert.equal(trace.installed_power_used_as_consumption,false);assert.deepEqual(record,before);
 const s=newMachineState();s.reused_from=trace;assert.deepEqual(restoreMachine(machineSnapshot(s)).reused_from,trace);
 const next=reuseCalculation({id:'next',module:'termoformado',inputs:{cycleSec:40}},values,origins,trace);assert.equal(values.partMass,'');assert.equal(values.cycleSec,40);assert.equal(values.cavities,3);assert.equal(next.applied.cycleSec,40);
});
