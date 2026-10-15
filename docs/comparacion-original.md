# Comparación con la calculadora original

Referencia consultada de forma exclusivamente lectora: [Calculadora-de-shot-y-primera-inyeccion](https://github.com/reymenez323/Calculadora-de-shot-y-primera-inyeccion), commit `0ac352e69316c09bf988c72f4911f4fc59cda455`, archivo `Calculadora Shot Inyeccion.dc.html`. No se modificó ese repositorio. La comparación se basa en sus entradas y fórmulas de código, no en los valores de las recreaciones de la guía.

La original se aproxima al **nivel técnico del módulo de inyección**, con algunas herramientas equivalentes al **avanzado**. No existe una correspondencia exacta ni tres versiones separadas en la original. La plataforma nueva contiene otros seis procesos que esa calculadora no aborda.

| Función de la original | Correspondencia en la nueva |
| --- | --- |
| Shot por masa o por volumen, cavidades y colada | Básico: balance de cantidad; resultados que necesitan propiedades ausentes permanecen pendientes |
| Densidad de fusión, geometría del husillo, capacidad volumétrica, utilización, carrera y colchón residual | Técnico; las magnitudes se distinguen y la densidad no se presupone |
| Área proyectada, presión de cavidad, fuerza de cierre, caudal de llenado y capacidad de plastificación | Avanzado; cierre admite factor de seguridad explícito |
| Utilización gravimétrica sobre capacidad nominal de máquina | Pendiente: la nueva muestra utilización volumétrica geométrica |
| Perfil de inyección L1/L2/L3 con fracciones 30/50/20 % | Avanzado: gráfico y tabla opcionales; porcentajes editables, suma 100 %, sin reserva/colchón automático. Coordenadas solo con origen y sentido explícitos |
| «Factor de caliente» multiplicando la densidad | Sin equivalente automático; requiere especificación técnica separada |
| Umbrales de uso 30–80 % y dictamen de adecuación | No adoptados como criterio universal; la nueva exige validar los límites del equipo |

## Diferencias matemáticas relevantes

En la original, el modo por masa usa `Vshot = Wtotal / (rho × fc) × (1 + margen)`, donde `fc` es el llamado «factor de caliente». La nueva usa masa total/densidad del fundido y su margen de shot, sin ese factor. Los resultados no son numéricamente intercambiables para cualquier entrada.

El modo por volumen original suma volumen de pieza y colada antes del margen; el nuevo interpreta el volumen como **por pieza** y multiplica por cavidades. Es necesario normalizar el significado de la entrada antes de comparar.

Ambas calculan capacidad ideal mediante el área transversal del husillo por su carrera, utilización como volumen de shot/capacidad, tiempo nominal de llenado como volumen/caudal y plastificación como masa/capacidad horaria. Estas similitudes no validan los modelos para una máquina real. El cierre nuevo añade un factor de seguridad explícito al área por presión. Tampoco deben confundirse margen de shot y colchón residual.

**L1/L2/L3 son etapas físicas de un perfil**, mientras que básico/técnico/avanzado son niveles de entradas y resultados. La V1 archivada es una versión histórica de la aplicación, no un cuarto nivel ni la calculadora original.

## Trabajo técnico pendiente

El perfil geométrico implementado no define velocidades, presiones, tiempos ni conmutación. Para convertirlo en una configuración industrial se requieren límites del equipo, molde, material, condiciones y validación reproducible del proceso. Las fracciones 30/50/20 no son una recomendación universal. Véanse las [reglas dimensionales y limitaciones del perfil](inyeccion-densidad-perfil-v1.5.md).

No se copiaron las densidades genéricas de la original a la biblioteca comercial. En la nueva, grado, fase, temperatura, presión, método y fuente siguen condicionando la admisibilidad de cada propiedad.
