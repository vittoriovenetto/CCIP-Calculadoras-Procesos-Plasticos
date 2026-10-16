# Validación de Etapa 4

Base exacta: `7de3816d4a8c8b215848d68d9433e6172040d561` (PR #12 aceptado).
Se verificó la base antes de editar: 607 pruebas Node, 42 pruebas de navegador,
6 de historial/exportaciones y 10 de Etapa 3, todas satisfactorias.

## Ejecución reproducible

```bash
npm test
CCIP_TEST_ARTIFACTS=test-artifacts/general python tests/browser_smoke.py
CCIP_TEST_ARTIFACTS=test-artifacts/etapa-2 python tests/browser_stage2.py
CCIP_TEST_ARTIFACTS=test-artifacts/etapa-3 python tests/browser_stage3.py
CCIP_TEST_ARTIFACTS=test-artifacts/etapa-4 python tests/browser_stage4.py
# Después de guardar los cambios en un commit limpio:
npm run build:pages
python tests/browser_pages_cache.py
```

El build crea `dist/` local con módulos, catálogos y dependencias diferidas bajo el SHA del commit.
No publica. El workflow de validación incluye esta rama, PR hacia Etapa 3 y la suite nueva.

## Resultados

| Comprobación | Resultado |
|---|---|
| Node: matemáticas, datos, seguridad y propuestas | **626/626** |
| Regresión general de navegador | **42/42**, 135 estados, 73 perfiles y 27 cambios ES/EN/ES |
| Historial y archivos reales Etapa 2 | **6/6** |
| Regresión documental y formulaciones Etapa 3 | **10/10** |
| Biblioteca y contribuciones Etapa 4 | **7/7** |
| Build estático local | Correcto; no publicado |
| Artefacto con caché obsoleta | Correcto en 390 / 768 / 1440 px; incluye biblioteca y XLSX de ficha |

[Logs de ejecución](logs/) · [24 capturas ES/EN y seis anchos](capturas/README.md).

Las pruebas no detectaron regresiones en los motores, aprendizaje, historial, materiales,
exportaciones ni navegación de la calculadora, dentro de la cobertura indicada.
La suite nueva cubre las 73 fichas originales, los 15 experimentos, las mediciones GP-35, búsqueda
combinada, navegación sin pérdida del caso/borrador, comparación, archivos XLSX/PDF/JSON reales,
CRUD/revisión local, cargas compartidas controladas, conflictos, snapshots inmutables y recuperación
de propuestas. La recepción remota de aportes se prueba con API simulada y se identifica como tal.

Las capturas corresponden a 360, 390, 540, 768, 1024 y 1440 px, en español e inglés, en Chromium.
Se comprueba ausencia de scroll horizontal global; las tablas técnicas se desplazan dentro de su
contenedor. Son pruebas de navegador con viewports, no ensayos en todos los equipos físicos.

## Correcciones encontradas durante la implementación

- Guardar desde Materiales no reflejaba la ficha en la URL: corregido para recarga/enlace directo.
- Las copias locales de aportes compartidos necesitaban una ficha diferenciada: ruta `ID~local`,
  sin sobrescribir la revisión aprobada ni usar la copia conflictiva silenciosamente.
- La sección de reología podía quedar cerrada aun cuando había ensayos: se abre cuando contiene
  mediciones y mantiene MFR/MVR separados.
- Las propiedades originales y la extensión documental no deben duplicar IDs ni arrastrar todas
  las fuentes de otros materiales al exportar: unión por identidad y referencias por ficha.
- Una densidad de usuario sin condiciones activaba una referencia de familia durante una prueba
  de compatibilidad con V1 archivada. La restricción nueva es intencional: se documentan condiciones
  explícitas en ese fixture sintético de regresión; no se cambia V1 ni sus archivos/históricos.
- Se evita usar densidad de referencia del virgen para nuevos materiales propios reciclados/mezclas.
- Confirmar una revisión base evita preparar una actualización de copia antigua como si fuera actual;
  Actions vuelve a validar esa base. Recuperar una propuesta conserva su ID original.
- Los errores de recepción conservan el estado sin confirmar. Requiere correcciones/rechazado no se
  confunden con aprobado. El origen y las revisiones de usuario se incluyen también en Excel/PDF.

## Límites pendientes

La activación y el ensayo remoto completo de Actions están pendientes, como detalla
[aportes-github.md](aportes-github.md). No se validaron industrialmente propiedades nuevas ni se
reconfirmaron externamente las fuentes aceptadas de Etapa 3. Permanecen los 17 grados sin nuevo
enriquecimiento numérico y las limitaciones de curvas/condiciones de ensayo de sus fuentes.
No hay validación de compatibilidad de mezclas, equipos o formulaciones por el hecho de consultarlas.

[Integridad de motores, datos originales y archivos históricos](integridad.json): comparación byte a byte con la base aceptada.
