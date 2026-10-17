// Stored data remains unchanged. Normalize only what is safe to present;
// restoring a snapshot never invokes a model or the current catalog.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const strings=x=>Array.isArray(x)?x.filter(v=>typeof v==='string'):[];
const objects=x=>Array.isArray(x)?x.filter(v=>v&&typeof v==='object'&&!Array.isArray(v)):[];
export function snapshotPresentation(record){
 const metrics=objects(record.metrics).map(m=>({...m,value:finite(m.value)?m.value:null,precision:Number.isInteger(m.precision)&&m.precision>=0&&m.precision<=20?m.precision:2}));
 const warnings=strings(record.warnings),input_issues=Array.isArray(record.input_issues)?objects(record.input_issues).filter(i=>typeof i.message==='string'):warnings.map(message=>({message}));
 let machine=null;
 if(record.machine_assessment&&typeof record.machine_assessment==='object')machine={...record.machine_assessment,
  checks:objects(record.machine_assessment.checks).filter(c=>finite(c.actual)&&finite(c.limit)),pending:objects(record.machine_assessment.pending),notes:strings(record.machine_assessment.notes)};
 let profile=null,p=record.injection_profile;
 if(p?.valid===false)profile={valid:false,error:typeof p.error==='string'?p.error:''};
 else if(p?.valid===true&&Array.isArray(p.stages)&&p.stages.length===3&&p.stages.every(s=>s&&finite(s.fraction)&&s.fraction>=0&&s.fraction<=100)&&Math.abs(p.stages.reduce((a,s)=>a+s.fraction,0)-100)<1e-8){
  profile={...p,stages:p.stages.map((s,i)=>({...s,label:'L'+(i+1),fraction:s.fraction}))};
 }
 const drying=record.drying_assessment&&typeof record.drying_assessment==='object'?{...record.drying_assessment,pending:objects(record.drying_assessment.pending).filter(p=>typeof p.message==='string')}:{pending:[]};
 return {...record,metrics,warnings,input_issues,machine_assessment:machine,injection_profile:profile,drying_assessment:drying};
}
