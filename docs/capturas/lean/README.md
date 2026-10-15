# Capturas reales de la auditoría Lean

Checkout local de `feature/auditoria-lean-10-capturas`, servido bajo una subruta como GitHub Pages. No se publica esta entrega. Las capturas son de Chromium; los ejemplos son sintéticos y no representan un material o equipo industrial validado.

| Vista | Escritorio, 1440 × 900 | Móvil, 390 × 900 |
| --- | --- | --- |
| Inyección avanzada, referencia HDPE 0.73 y perfil 30/50/20 | [Abrir](lean-inyeccion-1440.png) | [Abrir](lean-inyeccion-390.png) |
| Secado, recomendación de PA6 B3S R03; Cp ausente | [Abrir](lean-secado-1440.png) | [Abrir](lean-secado-390.png) |
| Genérico sin ficha vacía | [Abrir](lean-sin-ficha-1440.png) | [Abrir](lean-sin-ficha-390.png) |
| Aprendizaje integrado, una explicación abierta | [Abrir](lean-aprendizaje-1440.png) | [Abrir](lean-aprendizaje-390.png) |

Se comprobaron también 320/768/1024 px. Las imágenes son de página completa y, por ello, su altura supera la del viewport. La interfaz avanzada conserva sus entradas opcionales y el perfil; básico presenta menos entradas y solo resultados calculables.

- [Node: 547 aprobadas](node-tests.txt).
- [Suite completa de navegador: 37 aprobadas](browser-tests.txt), 135 estados de cálculo, 73 perfiles y 27 cambios ES/EN/ES.
- [Comprobación posterior de ayudas, acordeones y capturas: seis pruebas aprobadas](browser-ayudas-y-capturas.txt).
- [Informe de requisitos, cambios, pruebas y límites](../../auditoria-lean-10-capturas.md).
- [Diez capturas originales conservadas con SHA-256](../lean-originales/integrity.json).

Las pruebas de interfaz anteriores se actualizaron para comprobar las nuevas reglas aprobadas; los motores y sus pruebas matemáticas se conservan. La CI del PR repite las suites completas del commit de revisión.
