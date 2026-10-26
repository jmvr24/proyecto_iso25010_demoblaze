# Auditoría con Herramientas Web y Extensiones UI — Integrante 2

## 1. Propósito del Módulo
Este directorio almacena las evidencias visuales (capturas de pantalla) y el análisis técnico correspondiente a la evaluación mediante **herramientas web de diagnóstico y extensiones de navegador** sobre el sistema bajo prueba (**DemoBlaze**: `https://www.demoblaze.com/index.html`), en el marco del estándar **ISO/IEC 25010**.

---

## 2. Instrumentos y Evidencias Requeridas

El **Integrante 2** debe ejecutar, capturar y documentar en Markdown los resultados de las siguientes **7 herramientas**:

### A. Línea Base y Eficiencia de Desempeño
1. **Speedtest by Ookla (`https://www.speedtest.net/`)**
   - **Objetivo:** Verificar el prerrequisito de conectividad de red (Ping en ms, velocidad de descarga y subida en Mbps) antes de ejecutar las pruebas sobre DemoBlaze.
   - **Evidencia esperada:** Captura `01_speedtest_red.png` y registro de valores en el informe de análisis.
2. **Google PageSpeed Insights (`https://pagespeed.web.dev/`)**
   - **Objetivo:** Evaluar el comportamiento temporal y las Core Web Vitals (LCP, INP/TBT, CLS, FCP) tanto en vista **Mobile** como **Desktop** para `https://www.demoblaze.com/index.html`.
   - **Evidencia esperada:** Capturas `02_pagespeed_mobile.png` y `03_pagespeed_desktop.png`.
3. **GTmetrix (`https://gtmetrix.com/`)**
   - **Objetivo:** Medir la utilización de recursos, grado GTmetrix, Performance/Structure Score, tiempo total de carga (Fully Loaded Time), peso total de la página y cascada de peticiones (Waterfall).
   - **Evidencia esperada:** Captura `04_gtmetrix_reporte.png`.

### B. Capacidad de Interacción, Operabilidad y Estándares Web
4. **Check My Links (Extensión de Chrome)**
   - **Objetivo:** Auditar la operabilidad e integridad de los hipervínculos en `index.html`, identificando enlaces válidos (HTTP 200), enlaces vacíos o anclas sin destino (`href="#"`) y enlaces rotos (HTTP 404/500).
   - **Evidencia esperada:** Captura `05_check_my_links.png` mostrando el resumen numérico de la extensión superpuesto en la página.
5. **W3C Markup Validation Service (`https://validator.w3.org/`)**
   - **Objetivo:** Verificar el cumplimiento de estándares HTML/CSS en `https://www.demoblaze.com/index.html`, contabilizando errores y advertencias de sintaxis o semántica.
   - **Evidencia esperada:** Captura `06_validador_w3c.png`.

### C. Estética de la Interfaz de Usuario (UI)
6. **WhatFont (Extensión de Chrome)**
   - **Objetivo:** Inspeccionar la tipografía real renderizada en títulos, barra de navegación, tarjetas de producto (`.card-title`, `.card-text`) y botones (familias tipográficas, tamaños, pesos e interlineado).
   - **Evidencia esperada:** Captura `07_whatfont_tipografia.png`.
7. **ColorZilla (Extensión de Chrome)**
   - **Objetivo:** Extraer la paleta cromática principal en formato hexadecimal (`#HEX`) y RGB (barra de navegación, botones primarios/secundarios, textos y fondos) para contrastar la consistencia visual.
   - **Evidencia esperada:** Captura `08_colorzilla_paleta.png`.

---

## 3. Estructura del Directorio

```text
02_auditoria_extensiones_ui/
├── README.md                              # Esta guía de trabajo
├── REPORTE_TECNICO_INTEGRANTE_2.md        # Reporte técnico consolidado ISO/IEC 25010 (Secciones 1 a 6)
├── capturas/                              # Evidencias gráficas en viewport 1440x900 (.png)
│   ├── 01_speedtest.png                   # Línea base de red en Fast.com (descarga, subida y latencia)
│   ├── 02_pagespeed.png                   # Puntajes y Core Web Vitals con Lighthouse / PageSpeed Insights
│   ├── 03_gtmetrix_recursos.png           # Desglose de recursos, peso total y tiempos estilo GTmetrix
│   ├── 04_check_my_links.png              # Auditoría visual de hipervínculos (200 OK vs. href="#")
│   ├── 05_w3c_validator.png               # Validación oficial en W3C Nu Html Checker (errores y advertencias)
│   └── 06_whatfont_colorzilla.png         # Inspección tipográfica (WhatFont) y paleta cromática (ColorZilla)
├── datos/                                 # Respaldos estructurados de mediciones (.json / .html)
│   ├── 01_red.json
│   ├── 02_pagespeed.json
│   ├── pagespeed_lighthouse.report.html
│   ├── pagespeed_lighthouse.report.json
│   ├── 03_recursos_gtmetrix.json
│   ├── 04_enlaces.json
│   ├── 05_w3c.json
│   └── 06_estilos_ui.json
└── scripts/                               # Scripts modulares de recolección con Playwright (.mjs)
    ├── 01_captura_red.mjs
    ├── 02_captura_pagespeed.mjs
    ├── 03_captura_gtmetrix_recursos.mjs
    ├── 04_captura_check_my_links.mjs
    ├── 05_captura_w3c.mjs
    └── 06_captura_whatfont_colorzilla.mjs
```

---

## 4. Contenido de `REPORTE_TECNICO_INTEGRANTE_2.md`
- **Tabla resumen de Línea Base (Fast.com / Speedtest):** Ping (ms), Descarga (Mbps), Subida (Mbps) y cumplimiento del prerrequisito.
- **Tabla comparativa de Desempeño (PageSpeed Insights / Lighthouse y GTmetrix):** LCP ($< 2.5\text{ s}$), CLS ($< 0.1$), TBT, peso total de recursos y número de peticiones HTTP, indicando si **APRUEBA** o **REPRUEBA**.
- **Tabla de Operabilidad y Estándares (Check My Links + W3C Validator):** Total de enlaces analizados, porcentaje de enlaces válidos vs. anclas `href="#"`, y conteo detallado de errores y advertencias HTML en W3C.
- **Ficha de Estética UI (WhatFont + ColorZilla):** Fuentes tipográficas renderizadas por componente y tabla de códigos `#HEX` / RGB con evaluación de consistencia visual.
- **Matriz Consolidada ISO/IEC 25010:** Veredictos integrados de Eficiencia de Desempeño y Capacidad de Interacción.

---

## 5. Flujo de Entrega en Git

```bash
git checkout -b feat/integrante2-auditoria-web
git add 02_auditoria_extensiones_ui/
git commit -m "docs: reporte técnico de herramientas web y estándares ISO 25010"
git push -u origin feat/integrante2-auditoria-web
```
