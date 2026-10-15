# Inyección: densidad fundida y perfil físico L1/L2/L3

Entrega del 15/10/2026 para revisión; sin publicación ni fusión a `main`. Base: `audit/materiales-minimo-3-propiedades`; rama: `feature/ux-lean-materiales-v1.5`. No se modifica el repositorio original de Reymenez, el motor compartido ni los modelos de los otros seis procesos. La biblioteca comercial conserva sus 64 grados y 9 perfiles genéricos de la base auditada.

## Alcance autorizado y documento adjunto

Se implementan las instrucciones directas del usuario y sus aclaraciones: referencias fundidas aceptadas, prioridad de datos y tres tramos físicos en avanzado. El DOCX `CCIP_Especificacion_Codex_Plataforma_Lean_Materiales_v1_5.docx` no contenía una tabla fundida; los valores y las citas siguientes fueron aportados explícitamente después en el chat. No se dedujeron de las densidades sólidas del documento. La reorganización completa del catálogo y otros cambios generales del DOCX quedan fuera de esta entrega.

## Referencias separadas de las fichas

Datos versionados en `src/data/melt-density-family.v1.js`, estado `reference_generic_estimate`, fase fundida, unidad `g/cm3`. No se añaden a `properties.melt_density` de ningún grado.

| Familia / formulación | g/cm³ | Temperatura | Presión | Fuente |
| --- | ---: | --- | --- | --- |
| HDPE | 0.73 | No especificada | No especificada | Reiloy |
| LDPE | 0.76 | No especificada | No especificada | Reiloy |
| LLDPE | 0.70 | No especificada | No especificada | Reiloy |
| PP | 0.75 | No especificada | No especificada | Reiloy |
| PET | 1.10 | No especificada | No especificada | Reiloy |
| PVC rígido, compuesto final confirmado | 1.22 | No especificada | No especificada | Reiloy |
| PVC flexible, compuesto final confirmado | 1.20 | No especificada | No especificada | Reiloy |
| ABS | 0.97 | No especificada | No especificada | Reiloy |
| PA6 | 0.96 | 250 °C | No especificada | López-Barrón et al. |
| PC | 1.02 | No especificada | No especificada | Reiloy |

Reiloy USA (2018), [Preventive Maintenance Booklet](https://reiloyusa.com/assets/template/Medien/Dateien/reiloy-usa-preventive-maintenance-booklet-2018.pdf), página 16, tabla *Injection Screw Design Guidelines*. Alcance declarado: orientación general para diseño de husillos de inyección. Sus temperaturas críticas **no** son condiciones de medición de densidad.

López-Barrón et al. (2007), *Film Processability, Morphology, and Properties of Polyamide-6/Low Density Polyethylene Blends*, Journal of Plastic Film & Sheeting, [DOI 10.1177/8756087907083481](https://doi.org/10.1177/8756087907083481). El valor a 250 °C no caracteriza universalmente todos los grados PA6.

Las consultas independientes a ambos destinos devolvieron HTTP 403 en este entorno. La procedencia se registra como `user_supplied_reference_with_citation`, con `independent_access: http_403`; no se afirma una verificación documental independiente. El acceso y la correspondencia exacta de las cifras quedan pendientes de revisión técnica.

## Selección y trazabilidad

En técnico/avanzado, abrir «Densidad fundida: referencia y verificación». Se muestra la referencia compatible y su fuente; **no se aplica antes de aceptarla**. Prioridad:

1. Propiedad fundida documentada del grado, con condición, evidencia, fuente y compatibilidad declarada del caso.
2. Valor manual; pulsar «Calcular» confirma su uso. Editar un valor automático conserva su referencia de origen como trazabilidad de la modificación.
3. Referencia familiar aceptada mediante casilla o botón. Cambiar grado o variante PVC requiere aceptación nueva.
4. Sin valor admisible, quedan pendientes solo las magnitudes dependientes.

«Solo datos verificados» desactiva la referencia familiar, conserva la entrada manual y exige declaración explícita, fuente, temperatura y presión para usarla. La declaración del usuario no es certificación del CCIP. Las fichas actuales no contienen una densidad fundida específica validada: esta ruta se prueba con una ficha sintética y no se presenta como dato comercial existente.

PVC exige elegir rígido/flexible y confirmar el compuesto final. No se aplica automáticamente a resina en polvo de formulación desconocida. PA6 no se usa si se declara otra temperatura distinta de 250 °C. Una referencia sin rango de presión/temperatura no valida el caso a esas condiciones; conserva su carácter preliminar y no recibe ajuste pVT.

Historial y JSON guardan `density_assessment` (valor realmente usado, origen, fuente, condiciones, aceptación/política, verificación y carácter aproximado), `density_provenance`, entradas efectivas, ficha y referencia congeladas. El comparador conserva las marcas de estimación y su CSV añade densidad/origen/fuente de cada caso. No recalcula resultados guardados usando la tabla vigente.

## Independencia de resultados

| Método | Independiente de densidad | Dependiente de densidad |
| --- | --- | --- |
| Gravimétrico | Masa por piezas/canales; masa del shot con margen; plastificación por masa; capacidad geométrica; cierre | Volumen del shot; carrera, recorrido remanente y utilización; tiempo ideal por caudal volumétrico |
| Volumétrico | Volumen introducido; carrera, recorrido remanente, utilización y tiempo por caudal; capacidad geométrica; cierre | Masa total y del shot; plastificación por masa |

Solo los resultados calculados que dependen de la referencia se etiquetan como estimaciones. Los pendientes no se convierten en cero. No se sustituyen densidades fundidas por sólidas o aparentes; no se aplica «factor de caliente» a una densidad ya fundida.

Básico mantiene únicamente las entradas activas de ese nivel: masa sin densidad o volumen de fundido directo. Los valores de densidad/diámetro guardados al volver de avanzado no se usan como entradas ocultas.

## Tres tramos físicos, solo en avanzado

Panel opcional «Perfil geométrico L1/L2/L3». Reparto inicial 30/50/20 %, editable, cada fracción entre 0 y 100 y suma 100 % (tolerancia numérica 1e-8 puntos porcentuales). Un tramo cero está permitido; un vacío no se interpreta como cero. Una suma incorrecta impide generar el perfil y no bloquea otros resultados.

La base es la dosificación **sin margen adicional ni colchón residual**:

```text
m = n × masa_pieza + masa_canales                         [g]
V = m / rho_fundida                                      [cm³], método masa
V = n × volumen_fundido_por_pieza + volumen_canales       [cm³], método volumen
A = π D² / 4                                            [mm²], D en mm
V_i = V × f_i / 100                                      [cm³]
delta_s_i = 1000 V_i / A                                 [mm]
s_acumulado_i = suma(delta_s_1 ... delta_s_i)             [mm]
```

Comprobación dimensional: `g / (g/cm³) = cm³`; `1 cm³ = 1000 mm³`; `mm³/mm² = mm`. Se normaliza `kg/m³` a `g/cm³` dividiendo una sola vez entre 1000 si una referencia futura declara esa unidad.

Cada fila muestra etapa, porcentaje, volumen, masa auxiliar, recorrido individual y acumulado. Las columnas de inicio/fin absolutos se generan **solo si** hay posición inicial finita y sentido creciente/decreciente:

```text
x_fin_i = x_inicial ± s_acumulado_i
x_inicio_1 = x_inicial; x_inicio_i = x_fin_(i-1)
```

No se impone un cero de coordenadas de máquina. Un origen 0 explícito es válido; sin dirección no hay coordenadas absolutas. El gráfico de barras representa porcentajes geométricos, no una curva de velocidad, presión o tiempo. Porcentaje y fórmulas se conservan en historial/exportación junto a la tabla calculada.

Ejemplo sintético de comprobación: 2 piezas de 30 g + 5 g de canales = 65 g; HDPE aceptado 0.73 g/cm³; husillo 20 mm y carrera disponible 400 mm. Dosificación 89.0410958904 cm³; capacidad 125.6637061436 cm³; carrera 283.4266109856 mm; utilización sin margen 70.8566527464 %. Etapas 30/50/20: volúmenes 26.7123287671, 44.5205479452, 17.8082191781 cm³; recorridos 85.0279832957, 141.7133054928, 56.6853221971 mm. El margen opcional modifica el shot principal, pero no la base de este perfil. No son parámetros reales de una máquina.

## Límites y validaciones pendientes

- Los valores familiares no son propiedades certificadas de grado/lote ni datos pVT. Composición, refuerzo, humedad y condiciones pueden cambiar la densidad real.
- Comprobar fuentes originales, grado, condiciones y mediciones antes del uso industrial. Las pruebas automatizadas verifican lógica/unidades, no exactitud experimental de las referencias.
- Perfil 30/50/20 ilustrativo: no calcula velocidades, presiones, transferencia a sostenimiento ni tiempo por etapa. No produce un programa de máquina.
- La capacidad es geométrica; no sustituye capacidad nominal en gramos equivalente PS, límites del fabricante, volumen útil, válvula antirretorno ni compresibilidad.
- Posiciones requieren comprobar origen, sentido y límites reales del equipo. No se añaden límites universales de utilización o colchón.
- Validación visual automatizada con Chromium en tamaños PC/tablet/móvil; Safari, Firefox y dispositivos físicos continúan pendientes.

## Pruebas y capturas

Ejecutar `npm test` y `python3 tests/browser_smoke.py`. El navegador sirve el checkout en una subruta equivalente a GitHub Pages; no publica contenido. Casos específicos en `tests/injection-density.test.js`, `tests/injection-profile.test.js` y pruebas de navegador 28–30; la regresión conserva las pruebas anteriores de los siete módulos, niveles, catálogo, ES/EN, historial y exportaciones.

Los resultados finales y las capturas se enlazan desde `docs/capturas/inyeccion-v1.5/README.md` una vez completada la ejecución. No se modifica la V1 archivada.
