# Seguridad y límites

## Controles comprobados

- Catálogos/importaciones validados antes de aplicar datos; fases/unidades y datos faltantes no se convierten en ceros.
- Campos personales y texto de maquinaria se presentan como texto o se escapan; URLs documentales limitadas a HTTPS sin credenciales. Pruebas previas de XSS e importación siguen activas.
- Issue/JSON es dato no confiable: no se interpola en comandos shell. Los scripts de contribuciones revalidan digest y revisión antes de preparar un PR.
- Workflow de aportes: lectura por defecto, escritura únicamente en la acción manual de un mantenedor, credenciales no persistidas en checkout, sin activación privilegiada desde Issues. No hay PAT en frontend ni localStorage.
- Vendor local con versiones, licencias y SHA fijados; las pruebas contrastan bytes. No se afirma haber consultado una base de CVE actual durante el bloqueo de red.
- XLSX/CSV mantienen protección contra fórmulas. XLSX/PDF/JSON se inspeccionan como archivos reales.
- Recuperar y exportar un histórico conservan sus resultados sin motor ni catálogo actuales; los datos se normalizan solo para una presentación segura, manteniendo el original.
- Historial corrupto conserva contenido; materiales personales corruptos/incompatibles ahora impiden escritura destructiva. No se borra localStorage para hacer pasar tests.
- Publicación exige manifiesto íntegro, commit exacto, todos los controles GO, CI documentada y SHA esperado de `gh-pages`. Se conservan rutas históricas, ZIP y assets inmutables. Push normal, sin force ni modificación de `main`.

## Activación externa de aportes

El workflow no está en el árbol actual de `origin/main`; su activación en la rama predeterminada sigue pendiente. GitHub ejecuta eventos Issues desde esa rama, no desde una web estática ni por guardar un material local. Se conserva `pending_default_branch_activation` en el catálogo compartido.

Etapas 4 y 7 contienen la definición y el cambio propuesto para revisión. La activación necesita que se revise e incorpore el código y sus dependencias en la rama predeterminada mediante un PR autorizado; no se hace aquí. Un material local, propuesta preparada, Issue, PR, revisión humana y publicación global son estados distintos. Este pendiente no impide publicar la web si se explica correctamente, pero no debe presentarse como automatización operativa.

## Límites científicos conservados

1. Datos de familia, manuales, genéricos y experimentales no certifican un grado o lote. De 64 grados comerciales, 47 tienen nueva evidencia y 17 no recibieron enriquecimiento numérico adicional; los 9 perfiles genéricos siguen sin ficha propia.
2. Densidad de fundido nunca se sustituye por sólida/aparente, ni se vuelve a corregir térmicamente. Referencias de familia separadas, editables, marcadas como estimaciones y desactivables con modo verificado. PVC rígido/flexible requiere identificación de formulación.
3. MFR y MVR conservan unidad, carga, temperatura, norma y región. GP-35 mantiene ambas tablas oficiales; no se convierten entre sí por coincidencia numérica.
4. Mezclas: primer porcentaje virgen, segundo reciclado; no promediar universalmente MFR, resistencia, impacto o propiedades térmicas. Las 15 formulaciones de artículos no se asignan al grado virgen seleccionado.
5. Inyección: volumen equivalente de fundido; perfil físico L1/L2/L3 sin margen ni colchón automático. Coordenadas solo con origen/sentido. No son velocidades/presiones. Cierre usa presión media de cavidad, no hidráulica, boquilla o presión nominal de máquina.
6. Extrusión: continuidad de producto uniforme, no predicción kg/h desde rpm. Película: dos paredes y DDR geométrico sin hinchamiento/densidad variable. Soplado: cilindro exterior y pared delgada, no capacidad útil ni espesor local real. Termoformado: promedio geométrico, no distribución local.
7. Secado: Q·t, inventario nominal; densidad aparente compatible para volumen. Cp debe estar sustentado para el intervalo/definición y fase sólida sin transición. El cálculo sensible no incluye agua, evaporación, pérdidas, regeneración ni consumo eléctrico total.
8. Costos: costo directo parcial, sin OEE/disponibilidad, turnos, depreciación o recirculación automáticos; esos resultados no se anuncian como implementados. Potencia media debe medirse o justificarse, nunca copiar kW instalados.
9. Maquinaria: 20 fichas documentadas no son ensayos de equipos instalados. Moiron M2-1/M2-I y variantes siguen pendientes; Ø16/100 kN no se mezcla con Ø20/15 tf. XH monocapa/tricapa y anuncio 2.2 kW separados; 300/180 mm no son límites confirmados. GEISS como serie; Kiefel columna/modo exactos; motan nominal/superficial no equivale a útil/deshumidificante.
10. Máximos de fabricante no garantizan operación simultánea ni aptitud industrial. Validar placa, número de serie, material, geometría y condiciones reales.

La auditoría de esta etapa verifica integridad y coherencia de evidencia almacenada; las restricciones de red no permiten afirmar una nueva consulta en vivo de todos los fabricantes.

Los decimales mostrados son redondeo del cálculo, no precisión metrológica. La tolerancia 1e-10 de las referencias comprueba aritmética; no es una tolerancia industrial ni propaga una incertidumbre que la ficha no documenta.
