# Protocolo, seguridad y activación de aportes

## Contratos

`ccip-material-contribution/1` contiene exclusivamente `schema`, `submission_id`, `action`
(create/update), `base_revision` (null para creación), `prepared_at`, `justification`, `material`.
ID de material `user-[a-z0-9-]{1,100}`; propuesta `submission-…`; no rutas derivadas de nombres.
Identidad/familia, procedencia documentada, fuente general y declaración no verificada son
obligatorias para enviar, sin exigir una cantidad de propiedades. El borrador local admite
propiedades vacías. Límites: JSON 45.000 bytes, cuerpo de Issue 60.000 bytes, profundidad 16,
longitudes por campo, nueve familias y lista explícita de propiedades/unidades/fases.
No se permiten claves de contaminación de prototipos, fuentes HTTPS con credenciales,
valores no finitos ni estados comerciales/IDs de fuente falsificados.

El cuerpo empieza con `<!-- ccip-material-contribution/1 -->`, contiene un bloque JSON y su
SHA-256. La comprobación de recepción recalcula el digest del payload canónico, en lugar de
confiar en el texto que dice SHA-256. La autenticación y el envío final ocurren en GitHub.
No hay tokens en el código web, localStorage o archivos públicos.

`ccip-shared-user-materials/1` versiona el catálogo y sus entradas: ID, categoría, material
normalizado, revisión, incorporación/modificación, contribución, revisión humana y cadena de
historial. Estado permitido: `approved_contribution_not_industrially_certified`; revisión humana
`approved_as_contribution`, revisor, URL del PR, justificación, fecha y campos modificados.
El historial conserva snapshots anterior/propuesto, fuente, fecha y referencias GitHub.
El validador comprueba continuidad y coincidencia de la versión vigente con el último snapshot.
Los importadores locales no pueden importar la autoridad de esos metadatos.

## Jobs de Actions

Archivo: `.github/workflows/material-contributions.yml`.

1. `issues` opened/edited/reopened/labeled o despacho manual: checkout de la **rama predeterminada
   confiable**, credenciales Git no persistidas, Node 24, permisos contents:read/issues:read.
2. El script consulta el Issue del repositorio fijo, trata su cuerpo únicamente como datos y
   revalida contrato, fuentes, unidades, IDs, duplicados contra las identidades originales y la
   revisión compartida. Issues ajenos al marcador se omiten. Informe JSON descargable en Actions:
   válido para revisión, omitido o rechazado técnicamente con motivo. Validar no significa aprobar.
3. Solamente despacho manual de un mantenedor con `prepare_pr=true` activa otro job, con
   contents:write/pull-requests:write/issues:read. Checkout confiable nuevo y descarga del informe.
4. Se consulta nuevamente el Issue; cambios de digest o revisión de catálogo abortan la operación.
5. GitHub REST crea una rama `contributions/user-…-digest-rREV`, un archivo JSON de propuesta
   en una ruta fija y un PR **draft**. Repetir la operación recupera el PR existente; tras un fallo
   parcial comprueba la rama/archivo existentes antes de continuar. No escribe JS, workflows,
   catálogos originales ni el catálogo activo. No hay comando shell construido con datos externos.
6. El PR conserva payload y enlace al Issue. Un revisor estudia identidad, fuentes, propiedades,
   cambios y conflictos. Aceptación como aporte sigue sin certificar propiedades industriales.

La serialización y rutas están limitadas por validadores. El job privilegiado no ejecuta código
procedente del Issue, de un PR externo ni de un artefacto: usa los scripts de la rama predeterminada
confiable y vuelve a validar los datos. El workflow no publica comentarios automáticos ni hace merge.

## Incorporación revisada posterior

Después de revisión humana, en una rama de revisión del repositorio que ya contenga esta etapa:

```bash
node scripts/material-contributions/promote.mjs \
  .github/material-proposals/user-ID.json \
  https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/pull/NUMERO \
  REVISOR "Justificación técnica de la incorporación"
npm test
```

El comando produce únicamente un diff local de `src/data/user-materials.v1.json`. Comprueba el
digest, la revisión base y la versión anterior, incrementa revisión y conserva historial. Hay que
revisar ese diff, actualizar/cerrar la propuesta según la decisión humana y someter la incorporación
a revisión y publicación posteriores. No utiliza credenciales ni escribe en GitHub por sí mismo.
Si hubo un cambio concurrente, preparar nuevamente la propuesta sobre la revisión vigente;
no forzar sobrescritura. Si el PR de propuesta ya fue cerrado, el mantenimiento es explícito.

## Activación que todavía falta

- Incorporar por revisión autorizada el workflow, scripts, validadores y biblioteca de esta
  etapa a la rama predeterminada. No basta con poner solo el YAML en `main`.
- Revisar en Settings → Actions → General los permisos de creación de PR mediante GitHub Actions;
  la política del repositorio u organización puede impedir `contents:write` o crear PR.
- Mantener revisiones humanas y protección de ramas; comprobar acceso del mantenedor a despacho manual.
- Activar y ejecutar un ensayo controlado del ciclo real Issue → informe → PR draft → revisión →
  incorporación → publicación. **Ese ensayo remoto completo aún no se ha realizado.**
- Solo tras aprobación/publicación, verificar que otro navegador recibe el aporte integrado.

En esta entrega no se modifican esos ajustes, `main` ni GitHub Pages. El catálogo compartido no
contiene aportes reales aprobados. La interfaz indica activación pendiente y distingue incorporación
a una versión publicada de sincronización de propuestas locales.

## Pruebas y qué no demuestran

Las pruebas Node verifican validación repetida, intentos de suplantación, URLs, tamaños,
conflictos/revisiones, promoción e historial, creación REST de un PR draft e idempotencia usando
un cliente simulado. Las pruebas de navegador interceptan la API pública para confirmar contenido
coincidente y prueban respaldo local, borradores y conflictos con un catálogo de prueba servido
únicamente en la sesión. No crean Issues/PR públicos de aportes ni prueban permisos de escritura
reales. Los fallos 403/429 y contenido diferente no se convierten en un envío exitoso.
