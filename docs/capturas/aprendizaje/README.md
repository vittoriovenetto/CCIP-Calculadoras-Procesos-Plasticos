# Aprendizaje de fórmulas: capturas y pruebas

Capturas de Chromium del código `c53deb2`, tomadas localmente el 2026-10-14. Las tres imágenes de fórmulas corresponden al paquete exacto `dist/` comprobado bajo una subruta. Las calculadoras usan los datos sintéticos de `tests/fixtures.js`, con densidad fundida manual 0.8 g/cm³ sin atribuirla a un grado comercial.

- [Calculadora PC: apartado visible](v13-es-1440.png)
- [Calculadora móvil](v13-es-390.png)
- [Guía PC: filtros de proceso y nivel](formulas-aprendizaje-1440.png)
- [Guía móvil: filtros](formulas-aprendizaje-390.png)
- [Móvil: fuerza de cierre paso a paso](formulas-cierre-paso-a-paso-390.png)

[502 pruebas Node](node-tests.txt) · [25 pruebas de navegador](suite-browser.txt) · [Prueba del paquete exacto: siete procesos × tres niveles y 42 enlaces](artefacto-browser.txt)

La ejecución completa comenzó antes del último ajuste de visibilidad de las alternativas; las páginas de fórmulas se cargaron después del ajuste. El paquete exacto se verificó separadamente tras el commit, incluida la visibilidad de las alternativas en técnico. CI ejecuta las 25 pruebas desde el commit completo. Véase [informe](../../aprendizaje-formulas.md) y [registro de publicación](../../despliegue.md).
