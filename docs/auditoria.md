# Auditoría de CCIP Web V1

Fecha: 2026-10-13. Repositorio: `vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos`. Rama de trabajo: `feature/web-v1-modular`. Base revisada: `84fc633ff9af9fe6e43deb565647d12103360818`.

## Alcance e inventario inicial

Se revisaron los nueve archivos del árbol original de la rama, incluyendo lógica, fórmulas, niveles, entradas, almacenamiento, interfaz y documentación:

| Archivo original | Resultado de inspección |
| --- | --- |
| `README.md` | Describe siete módulos y modelos experimentales; faltaban dominios, pruebas de límites y resultados de auditoría. |
| `package.json` | Módulos ES; única tarea `npm test` con Node test runner; sin dependencias, compilación ni lockfile necesario. |
| `.nojekyll` | Marcador vacío adecuado para servir el sitio como archivos estáticos. |
| `index.html` | Recursos relativos aptos para subruta; metadatos móviles; se añadieron aviso de ejemplos, anuncio accesible de resultados e icono local. |
| `src/schema.js` | Catálogo de siete procesos y tres niveles; faltaban restricciones coherentes y había densidades/tiempo de secado sin fuente. |
| `src/engine.js` | Se revisaron todas las ecuaciones; conversiones nominales correctas en los casos existentes, con errores de dominio y supuestos no explícitos. |
| `src/app.js` | Campos ocultos participaban en cálculos; historial validaba solo que fuera una lista; resultados/fecha podían quedar obsoletos tras editar. |
| `src/styles.css` | Menú móvil provocaba tamaño mínimo de rejilla mayor que la pantalla; resultados y campos necesitaban adaptación a ancho estrecho. |
| `tests/engine.test.js` | Diez pruebas nominales; todas pasaron antes de corregir. Se conservan. |

No había instrucciones AGENTS.md aplicables, submódulos ni CI en el árbol revisado. No se cambió el repositorio de `reymenez323`, ni se publicó el sitio ni se fusionó con `main`.

## Hallazgos y correcciones

| Hallazgo | Corrección y evidencia |
| --- | --- |
| Modo volumétrico de inyección no validaba cavidades: cero/negativas podían generar shots cero/negativos; fracciones se aceptaban. | Cavidades positivas enteras y dependencia explícita en volumen. Regresiones para vacío, cero, negativo y fracción. |
| Las temperaturas objetivo de secado ≤ 0 °C se descartaban aunque ΔT fuera válido. | Temperaturas finitas mayores que el cero absoluto; ΔT ≥ 0. Referencias con −20 → 0 °C, ΔT cero y caso de enfriamiento. |
| Un costo de resina explícitamente cero no se admitía. | Tarifas/costos no negativos; todos los costos cero producen costo unitario cero. Campos vacíos siguen pendientes. |
| Rechazo del 100 % dejaba todo el cálculo de producción sin representar el caso. | Cero piezas buenas, costo unitario pendiente y advertencia; consumo nominal sigue definido. |
| Velocidad/producción/caudal cero se confundían con dato inválido. | Cero válido donde describe línea parada; residencia de extrusión pendiente con caudal cero. |
| Entradas inválidas dependían de comprobaciones dispersas y algunas divisiones producían negativos. | Validación central por esquema, conteos enteros, dominios, límites porcentuales y números estrictos; resultados dependientes pendientes sin bloquear independientes. |
| `Number()` aceptaba booleanos/listas como cantidades. | Conversión restringida a números y cadenas numéricas finitas. Regresiones para booleanos, listas, objetos, espacios e infinito. |
| Densidades sólidas 0.92/1.04, tiempo de secado 3 h y factor de cierre 1.25 aparecían sin trazabilidad. | Se retiraron esos valores y el factor implícito del motor. Propiedades/factor/tiempo deben ingresarse. Se mantienen ejemplos de geometría/cantidades identificados como sintéticos; no se retiró ninguna calculadora. |
| Básico podía calcular con densidades/cavidades ocultas, y reducir nivel seguía usando entradas avanzadas. | Nivel/variante filtran el motor y las entradas JSON. 27 combinaciones de variante × nivel verifican disponibilidad y exclusión de campos ocultos. |
| Termoformado infería una cavidad aun con dato ausente. | El motor deja piezas/h pendientes sin conteo; conserva ciclos/h independientes. El ejemplo visible de una cavidad en el formulario técnico se mantiene editable. |
| Volumen geométrico sólido podía confundirse con volumen de fundido en inyección. | Campo y explicación especifican volumen equivalente de fundido a condiciones de proceso; no se estima contracción/PVT. |
| Volumen exterior del cilindro podía leerse como capacidad útil; espesor imposible aún daba masa. | Se aclara volumen exterior, modelo de pared delgada; masa pendiente si no hay interior positivo y aviso heurístico de pared gruesa. |
| Resultados anteriores persistían al editar y la fecha no se reiniciaba. | Edición invalida la vista; cálculo/guardar/exportar usa el estado actual; cambio de nivel/variante y restablecer reinician resultados y fecha. |
| Historial dañado, módulo/nivel desconocido o acceso denegado a localStorage podía interrumpir la interfaz. | Validación de registros, captura de fallos de lectura/acceso/escritura y entradas escapadas. Se conservan resultados/fórmulas de registros válidos, límite de 60 y presentación de 15. Recuperación recalcula con el motor actual. |
| Etiquetas de parámetros no estaban asociadas a controles; ayuda anidada dentro de etiqueta. | Identificadores, `label for`, descripción asociada, ayuda separada, foco visible y anuncio de resultados. Verificado clic de etiqueta y cálculo/ayuda por teclado. |
| Menú de procesos ensanchaba la página desde tableta hasta móvil. | Tamaño mínimo corregido en rejilla; menú mantiene su desplazamiento propio. Campos, cifras, fórmulas y marca se adaptan sin desbordar la página a 320 px. |
| Motor monolítico de siete ramas. | Funciones independientes en `src/models`, registro en motor y contrato compartido. Ampliar un proceso no obliga a cambiar ecuaciones de otros. |

Las constantes de conversión de unidades se conservaron; no se sustituyeron propiedades de material por valores supuestos. Los supuestos nominales de canales/reserva/pérdida/rechazo cero se documentan y deben confirmarse para cada caso.

## Verificación ejecutada

Entorno: Node.js 24.19.0, Python 3.12.14, Playwright 1.62.0 y Chromium 154.0.8037.57 en Linux.

| Comando / comprobación | Resultado |
| --- | --- |
| `npm test`, antes de cambios | 10/10 aprobadas. Cobertura nominal insuficiente para los hallazgos anteriores. |
| `npm test`, después de cambios | 137/137 aprobadas, ninguna fallida, omitida o cancelada. Incluye las diez originales, referencias de todas las salidas de siete modelos, dos variantes extra, tres niveles, dominios de todos los campos numéricos activos, ceros/vacíos/negativos y persistencia. |
| `python3 tests/browser_smoke.py` | 6/6 pruebas de integración aprobadas en Chromium; matriz de 108 estados y flujos de edición, niveles, reinicio, historial, exportación JSON, almacenamiento dañado/denegado, etiquetas y teclado. |
| Matriz de interfaz | Nueve variantes: siete procesos, más inyección volumétrica y extrusión tubular; básico/técnico/avanzado; 1440×900, 768×1024, 390×844 y 320×568. Sin desbordamiento horizontal de página ni controles/resultados fuera de pantalla; menú móvil tiene desplazamiento intencional. |
| Recursos y JavaScript | Carga bajo subruta de repositorio en servidor local, sin errores de consola/ejecución durante pruebas. ES modules y rutas relativas cargan correctamente. Sin compilación requerida. |
| Exportación e historial | JSON con fecha ISO, entradas del nivel activo, números/null, unidades, fórmulas y notas; recuperación correcta. Lectura bloqueada permite calcular; fallo de escritura informa al usuario. |
| Inspección visual | Capturas completas de escritorio, tableta y móvil producidas por el runner; revisión de vista móvil confirmó ajuste de formulario, resultados y textos. |
| `git diff --check` | Sin errores de espacios/conflictos. |

Las referencias son aritméticas/dimensionales y usan datos sintéticos explícitos. No son ensayos de planta ni validación de polímeros concretos. El nivel básico muestra pendientes para salidas que requieren propiedades/entradas técnicas; eso es comportamiento esperado, no una prueba omitida.

Para reproducir: ejecutar los dos comandos desde la raíz del checkout. `npm test` no necesita instalar paquetes. El test Python requiere Playwright y Chromium; inicia y cierra su propio servidor y navegador. Puede guardar capturas en el directorio indicado por `CCIP_TEST_ARTIFACTS`. Las [capturas de verificación](capturas/README.md) se conservan como documentación; no se incluyen registros generados ni capturas como recursos de la aplicación.

## Cuestiones pendientes

1. **Validación de ingeniería:** bibliografía aplicable y revisión docente, fichas de grados a las condiciones usadas, datos PVT/contracción, parámetros reales de máquinas, mediciones y tolerancias de aceptación. Ningún resultado está aprobado para ajustar producción. Ver límites por proceso en [modelos](modelos.md).
2. **Soplado/inyección:** no confundir volumen exterior con capacidad útil ni volumen sólido con shot de fundido. Masa de pared, fuerza de cierre, carrera y tiempos requieren contraste técnico.
3. **Distribución y pérdidas:** validar sección/espesor uniforme, pérdidas, disponibilidad, recuperación y residencia frente a medición. Promedios no determinan mínimos locales ni estabilidad del proceso.
4. **Secado y costos:** potencia sensible mínima no dimensiona secador ni garantiza humedad final; costo directo parcial no es costo total. Se necesitan especificaciones y balances reales.
5. **Compatibilidad:** tamaños de pantalla verificados en Chromium, no dispositivos físicos ni Safari/Firefox. Accesibilidad revisada funcionalmente (etiquetas, foco, teclado, anuncio), sin auditoría WCAG completa ni ensayo con lector de pantalla.
6. **Trazabilidad:** JSON/historial local no versiona modelo ni fuentes de datos, ni garantiza almacenamiento permanente. Para validación institucional hacen falta identificación del cálculo/modelo, fuentes e incertidumbre. El historial antiguo se recalcula con las fórmulas actuales.
7. **Publicación:** solo se probó servicio local bajo subruta; no se ejecutó despliegue GitHub Pages ni fusión a `main`. La rama de desarrollo se prepara para revisión en GitHub; subir esa rama no constituye una publicación del sitio. Identidad gráfica institucional definitiva y publicación quedan para revisión posterior.

El conjunto de cambios permanece preparado para revisión en la rama de desarrollo. Se conservan los siete módulos, métricas, niveles, variantes, ayudas, historial y exportación; se justifican los resultados que ahora quedan pendientes cuando falta una propiedad o una entrada válida.
