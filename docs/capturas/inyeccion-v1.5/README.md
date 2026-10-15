# Inyección — evidencias de revisión, 15/10/2026

Capturas reales de Chromium, checkout local servido bajo una subruta equivalente a GitHub Pages. No se publicó contenido. Caso sintético: 2 piezas de 30 g + 5 g de canales, referencia HDPE 0.73 g/cm³ aceptada, husillo 20 mm, carrera disponible 400 mm; margen principal 20 %, perfil sin margen ni colchón. No son datos de una máquina real.

Las imágenes muestran la edición del reparto inicial 30/50/20 a **40/40/20** y coordenadas opcionales: origen explícito 300 mm, sentido decreciente. El gráfico representa porcentajes, no velocidad o presión.

| Vista | Captura |
| --- | --- |
| PC, viewport 1440 × 1000 | [Página completa](inyeccion-perfil-es-1440.png) · [Panel del perfil](perfil-detalle-es-1440.png) |
| Tablet, viewport 768 × 1000 | [Página completa](inyeccion-perfil-es-768.png) |
| Móvil, viewport 390 × 1000 | [Página completa](inyeccion-perfil-es-390.png) · [Panel del perfil](perfil-detalle-es-390.png) |

Se verificó además el ancho 320 px, ES/EN, los siete procesos y tres niveles. Las tablas largas tienen desplazamiento horizontal dentro de su contenedor; la página y sus controles no desbordan.

## Ejecuciones locales

- [Node](node-tests.txt): **520 aprobadas, 0 fallidas, 0 omitidas**; incluye 33 casos nuevos de densidad/perfil y 487 anteriores.
- [Regresión de navegador inicial](browser-regresion-inicial.txt): 30 pruebas ejecutadas; 29 sin fallos, y la prueba 17 detectó la misma traducción pendiente en cinco subcasos PC. Se conserva el registro fallido como evidencia del defecto detectado. Se comprobaron 135 estados de cálculo y 162 de biblioteca, más 27 cambios ES/EN/ES.
- [Repetición tras corregir](browser-correccion.txt): pruebas 17 y 28 aprobadas; los **73 perfiles** superan la comprobación ES/EN y diseño, y se comprueba la nueva invalidación de verificación manual al cambiar condiciones.
- [Perfil y capturas](browser-perfil.txt): prueba 30 aprobada de nuevo, con gráficos, posiciones opcionales, porcentajes, historial, modo volumétrico sin densidad y pantallas PC/tablet/móvil.

La CI del pull request repite las suites completas sobre el commit publicado en la rama de revisión. Su estado se consulta en Checks del PR; los registros locales distinguen la detección inicial y la corrección, sin ocultar fallos. Chromium y tamaños simulados no validan Safari/Firefox, dispositivos físicos ni procesos industriales.
