"""Independent Decimal/SI references. Synthetic inputs, never commercial properties.

The reference equations below do not import CCIP. Node is used only to obtain
the actual results under audit. --write records the reproducible comparison.
"""
import argparse
from decimal import Decimal as D, getcontext
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
getcontext().prec = 50
PI = D('3.1415926535897932384626433832795028841971693993751')
G0 = D('9.80665')
CASES = []

def add(name, process, values, refs):
    CASES.append(dict(name=name, process=process, inputs=values, expected=[dict(label=k, value=None if v is None else float(v), unit=u, derivation=f) for k,v,u,f in refs]))

def injection(name, mode, c, part, runner, rho, margin, diameter, stroke):
    c,p,r,d,a,dd,ss=map(D,map(str,(c,part,runner,rho,margin,diameter,stroke)))
    m0=(c*p+r) if mode=='mass' else (c*p+r)*d
    vol0=m0/d
    mass=m0*(1+a/100); vol=vol0*(1+a/100)
    area=PI*dd*dd/4;cap=area*ss/1000;travel=vol*1000/area
    force=D(32)*D(40)*100/(1000*G0)
    values=dict(method=mode,cavities=int(c),meltDensity=float(d),shotMargin=float(a),screwD=float(dd),screwMaxStroke=float(ss),targetCushion=4,projectedArea=32,cavityPressure=40,clampFactor=1.15,injectionFlow=8,plasticizingRate=5)
    values.update(dict(partMass=float(p),runnerMass=float(r)) if mode=='mass' else dict(partVolume=float(p),runnerVolume=float(r)))
    add(name,'inyeccion',values,[
        ('Masa total sin reserva',m0,'g','n·mₚ+mᵣ, o (n·Vₚ+Vᵣ)ρₘ'),
        ('Shot calculado (masa)',mass,'g','m₀(1+a/100)'),('Shot calculado (volumen)',vol,'cm³','mₛ/ρₘ'),
        ('Capacidad volumétrica teórica del husillo',cap,'cm³','πD²sₘₐₓ/(4·1000)'),
        ('Utilización volumétrica teórica',100*vol/cap,'%','100Vₛ/Vₘₐₓ'),
        ('Carrera calculada del husillo',travel,'mm','1000Vₛ/(πD²/4)'),
        ('Recorrido remanente al dosificar al máximo',ss-travel,'mm','sₘₐₓ−s'),
        ('Fuerza de cierre teórica',force,'tf','32 cm²·40 MPa·100 N/(9806.65 N/tf)'),
        ('Fuerza de cierre con factor',force*D('1.15'),'tf','F·1.15'),
        ('Tiempo de llenado ideal',vol/8,'s','Vₛ/(8 cm³/s)'),
        ('Tiempo de plastificación estimado',mass*D('3.6')/5,'s','mₛ·3600/(5·1000)')])

injection('inyeccion-masa','mass',4,12.5,6,.8,8,20,250)
injection('inyeccion-volumen','volume',2,15,2,.75,10,16,200)

for name,shape,values in [
    ('extrusion-lamina','sheet',dict(width=400,thickness=.75,density=.92,lineSpeed=12,lossPct=8,secEnergy=.3,holdUpKg=5)),
    ('extrusion-tubo','tube',dict(outerD=25,innerD=20,density=1.4,lineSpeed=8,lossPct=0,secEnergy=.45,holdUpKg=3)),
    ('extrusion-parada','sheet',dict(width=400,thickness=.75,density=.92,lineSpeed=0,lossPct=0,secEnergy=.3,holdUpKg=5))]:
    v={k:D(str(x)) for k,x in values.items()};area=v['width']*v['thickness'] if shape=='sheet' else PI*(v['outerD']**2-v['innerD']**2)/4
    # A mm² × 1 m = A cm³, so A·rho g/m.
    mass=area*v['density'];net=mass*v['lineSpeed']*60/1000;feed=net/(1-v['lossPct']/100)
    add(name,'extrusion',dict(shape=shape,**values),[
        ('Área transversal',area,'mm²','w·e, o π(Dₒ²−Dᵢ²)/4'),('Masa por metro de producto',mass,'g/m','A mm²·1000 mm/(1000 mm³/cm³)·ρ'),
        ('Producción neta ideal',net,'kg/h','m′·v·60/1000'),('Alimentación con pérdida indicada',feed,'kg/h','Qₙ/(1−r/100)'),
        ('Potencia específica estimada',feed*v['secEnergy'],'kW','Qᶠ·E'),('Tiempo de residencia nominal',60*v['holdUpKg']/feed if feed else None,'min','60M/Qᶠ; pendiente si Qᶠ=0')])

for speed in (8,0):
    w=D('314.1592653589793');g=D(50);rho=D('.92');area=2*w*g/1000;diam=2*w/PI;bur=diam/100;ddr=D('.8')/(g/1000*bur)
    add('pelicula-'+('normal' if speed else 'parada'),'pelicula',dict(layflat=float(w),filmGauge=50,lineSpeed=speed,density=.92,dieDiameter=100,dieGap=.8),[
        ('Diámetro ideal de burbuja',diam,'mm','Dᵦ=2w/π'),('Área transversal total de la película',area,'mm²','2w·e/1000'),
        ('Producción ideal',area*D(speed)*rho*D('.06'),'kg/h','2w·e·v·ρ con conversión SI'),('Relación de soplado (BUR)',bur,'—','Dᵦ/Dᵈ'),
        ('Relación ideal de estiramiento (DDR)',ddr,'—','g/(e·BUR), g y e en mm')])

diam=D(60);height=D(180);wall=D('.6');rho=D('.95');surface=PI*diam*height+PI*diam**2/2;mass=surface*wall*rho/1000
add('soplado-cilindro','soplado',dict(bodyD=60,bodyH=180,wall=.6,density=.95,parisonD=25,unitsHour=1200),[
    ('Volumen geométrico cilíndrico',PI*diam**2*height/4000,'mL','πD²H/4000 (volumen exterior)'),('Superficie de cilindro cerrado',surface,'mm²','πDH+πD²/2'),
    ('Masa de pared ideal',mass,'g','S·e·ρ/1000 (aproximación de pared delgada)'),('Expansión diametral',diam/25,'—','D/Dₚ'),('Material para producción nominal',mass*1200/1000,'kg/h','m·N/1000')])

area=D(300)*250;mass=area*D('1.2')*D('1.05')/1000
add('termoformado-lamina','termoformado',dict(blankW=300,blankL=250,initialT=1.2,density=1.05,drawAreaRatio=2.4,cycleSec=15,cavities=4),[
    ('Superficie de lámina consumida',area,'mm²','w·l'),('Masa de lámina por ciclo',mass,'g','A·e·ρ/1000'),('Espesor medio geométrico ideal',D('1.2')/D('2.4'),'mm','e₀/Rₐ'),
    ('Ciclos teóricos por hora',D(3600)/15,'ciclos/h','3600/t'),('Piezas teóricas por hora',D(3600)*4/15,'pzas/h','3600n/t'),('Consumo de lámina',mass*3600/15/1000,'kg/h','m·3600/t/1000')])

for q in (18,0):
    mass=D(q)*D('3.5')
    add('secado-'+('nominal' if q else 'parada'),'secado',dict(throughput=q,residence=3.5,bulkDensity=.62,specificHeat=1.75,startT=25,targetT=85),[
        ('Masa mínima de material en tolva',mass,'kg','Q·t'),('Volumen útil mínimo de tolva',mass/D('.62'),'L','M/ρbulk'),('Potencia térmica sensible mínima',D(q)*D('1.75')*60/3600,'kW','Q·Cp·(Tf−Ti)/3600; evidencia térmica sintética')])

for scrap in (D('7.5'),D(100)):
    pieces=D(3600)*4/24*(1-scrap/100);feed=D(3600)*4*15/24/1000;cm=feed*D('1.8');ce=D(4)*D('.16');total=cm+ce+12
    add('costos-'+('normal' if scrap<100 else 'rechazo-total'),'costos',dict(cycleSec=24,cavities=4,partMass=15,scrapPct=float(scrap),resinCost=1.8,powerKw=4,energyCost=.16,laborHour=12),[
        ('Piezas buenas teóricas',pieces,'pzas/h','3600n/t·(1−rechazo/100)'),('Consumo de material',feed,'kg/h','3600n·m/t/1000'),('Costo de material',cm,'moneda/h','Q·precio'),('Costo energético',ce,'moneda/h','Pmedia·tarifa'),
        ('Costo horario directo parcial',total,'moneda/h','Cm+Ce+mano de obra'),('Costo directo parcial por pieza buena',total/pieces if pieces else None,'moneda/pza','Ch/Ng; pendiente si Ng=0')])

def main():
    args=argparse.ArgumentParser();args.add_argument('--write',action='store_true');opts=args.parse_args()
    code="import{calculate}from'./src/engine.js';let text='';for await(const c of process.stdin)text+=c;console.log(JSON.stringify(JSON.parse(text).map(c=>calculate(c.process,c.inputs,'advanced'))));"
    actual=json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,input=json.dumps(CASES),text=True))
    rows=[];failures=[]
    for case,result in zip(CASES,actual):
        for ref in case['expected']:
            got=next(m for m in result['metrics'] if m['label']==ref['label']);a=got['value'];b=ref['value'];tol=1e-10*max(1,abs(b or 0));delta=None if a is None or b is None else abs(a-b)
            passed=got['unit']==ref['unit'] and ((a is None and b is None) or (delta is not None and delta<=tol))
            row=dict(case=case['name'],**ref,actual=a,difference=delta,tolerance=tol,passed=passed);rows.append(row)
            if not passed:failures.append(row)
    if opts.write:
        (ROOT/'tests/fixtures-stage7-numerics.json').write_text(json.dumps(CASES,ensure_ascii=False,indent=2)+'\n')
        out=ROOT/'docs/etapa-7';(out/'pruebas').mkdir(parents=True,exist_ok=True)
        (out/'pruebas/validacion-numerica.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
        md=['# Validación numérica independiente','',f'{len(CASES)} casos sintéticos; {len(rows)} salidas contrastadas. Referencias calculadas con Python Decimal (50 dígitos) sin importar CCIP. Node se utiliza únicamente para leer el resultado real. Tolerancia absoluta/relativa: 1e-10 × max(1, |referencia|). No son propiedades de grados o equipos comerciales.','', 'Fuentes: definiciones SI, BIPM (https://www.bipm.org/en/publications/si-brochure); gravedad convencional g₀=9.80665 m/s²; continuidad, geometría y balance sensible declarados en cada fila. La validación comprueba el modelo ideal, no rendimiento industrial. En secado el motor aritmético recibe Cp sintético: su validez de intervalo se verifica aparte en el gate de Etapa 5.','', 'Reproducir: `python scripts/validate-numerics-stage7.py --write`. Los datos completos están en `tests/fixtures-stage7-numerics.json`.','', '| Caso / resultado | Fórmula | Referencia | CCIP | Unidad | Diferencia | Tolerancia | Conclusión |','|---|---|---:|---:|---|---:|---:|---|']
        for r in rows:
            md.append('| '+' | '.join(str(x) for x in [r['case']+' / '+r['label'],r['derivation'],r['value'],r['actual'],r['unit'],r['difference'],r['tolerance'],'Aprobado' if r['passed'] else 'FALLO'])+' |')
        (out/'validacion-numerica.md').write_text('\n'.join(md)+'\n')
    print(json.dumps(dict(cases=len(CASES),outputs=len(rows),passed=len(rows)-len(failures),failed=len(failures))))
    if failures:print(json.dumps(failures,ensure_ascii=False,indent=2));raise SystemExit(1)

if __name__=='__main__':main()
