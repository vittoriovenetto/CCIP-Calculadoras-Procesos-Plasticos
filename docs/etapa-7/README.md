# Etapa 7 — auditoría integral y preparación de publicación

**Estado actual: NO-GO / publicación bloqueada por acceso remoto.** No se ha publicado esta rama. La autorización del usuario permite publicar únicamente cuando se aprueben todos los requisitos; no permite modificar `main` ni fusionar PR.

Base: `f6ae02f13af82f0582988c45095063c53cae6c2a`, rama Etapa 6, con Etapa 5 `9db34e2`, Etapa 4 `51def4b` y Etapa 3 `7de3816` como ancestros confirmados. No se crearon catálogos nuevos ni se cambiaron ecuaciones o propiedades.

Rama: `feature/etapa-7-auditoria-publicacion`, contra `feature/etapa-6-catalogo-maquinarias`.

## Arquitectura y alcance

Siete motores independientes en `src/models/`, validación común de esquema/entradas, gates separados de evidencia térmica/densidad, biblioteca comercial separada de formulaciones y maquinaria. Materiales y Aprendizaje son apartados propios. Historial conserva snapshots; XLSX/PDF/JSON no recalculan históricos. La internacionalización modifica presentación, nunca magnitudes ni claves.

Se mantienen 73 identidades originales (64 comerciales, 9 genéricas), 15 formulaciones experimentales y 25 registros de máquinas (20 computables). Se conserva el alcance documental: 47 grados con evidencia numérica adicional, 17 comerciales sin enriquecimiento adicional. Integridad de identidad/archivos no significa verificación científica completa de la biblioteca.

Las correcciones estabilizan rutas proceso/nivel y Atrás/Adelante, evitan sobrescribir materiales personales dañados, completan mensajes EN y protegen el publicador frente a pérdida de históricos, cambios de rama, artefactos alterados y recursos antiguos en caché.

## Evidencias

- [Auditoría y matriz de requisitos](auditoria-final.md).
- [Validación Decimal independiente: 13 casos, 79 resultados](validacion-numerica.md).
- [Validación funcional y regresiones](validacion-funcional.md).
- [Seguridad y limitaciones](seguridad-y-limitaciones.md).
- [Publicación, puerta GO/NO-GO y rollback](publicacion.md).
- [Capturas reales](capturas/README.md) y [salidas](pruebas/).
- [145 archivos protegidos frente a Etapa 6](integridad-base.json).

## Reproducir

Node 24, Python 3.12 y Chromium. No hacen falta dependencias npm de desarrollo. Instalar `python -m pip install -r tests/requirements.txt`. Ejecutar `npm test`, las suites `browser_smoke.py` y `browser_stage2.py` a `browser_stage7.py`, `python scripts/validate-numerics-stage7.py`, `node scripts/audit-machine-catalog.mjs --require-complete` y `node scripts/audit-stage7.mjs`.

Guardar el código en Git antes de `npm run build:pages`, y ejecutar `python tests/browser_pages_cache.py` y `CCIP_STAGE7_DIST=1 python tests/browser_stage7.py`. Estos comandos no publican. Los tests levantan y cierran su servidor local. La CI conserva todas las suites e incorpora Etapa 7.
