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

## 3. Estructura Sugerida del Directorio

```text
02_auditoria_extensiones_ui/
├── README.md                        # Esta guía de trabajo
├── ANALISIS_EXTENSIONES_UI.md       # Documento con tablas de resultados y hallazgos ISO/IEC 25010
└── capturas/                        # Carpeta con las evidencias gráficas (.png / .jpg)
    ├── 01_speedtest_red.png
    ├── 02_pagespeed_mobile.png
    ├── 03_pagespeed_desktop.png
    ├── 04_gtmetrix_reporte.png
    ├── 05_check_my_links.png
    ├── 06_validador_w3c.png
    ├── 07_whatfont_tipografia.png
    └── 08_colorzilla_paleta.png
```

---

## 4. Contenido Mínimo de `ANALISIS_EXTENSIONES_UI.md`
- **Tabla resumen de Línea Base (Speedtest):** Ping (ms), Descarga (Mbps), Subida (Mbps) y cumplimiento del prerrequisito.
- **Tabla comparativa de Desempeño (PageSpeed Insights vs. GTmetrix):** LCP ($< 2.5\text{ s}$), CLS ($< 0.1$), TBT, peso total de recursos y número de peticiones HTTP, indicando si **APRUEBA** o **REPRUEBA**.
- **Tabla de Operabilidad y Estándares (Check My Links + W3C Validator):** Total de enlaces analizados, porcentaje de enlaces válidos vs. anclas `href="#"`, y conteo de errores HTML en W3C.
- **Ficha de Estética UI (WhatFont + ColorZilla):** Fuentes tipográficas detectadas y tabla de códigos `#HEX` con evaluación de contraste y consistencia visual.

---

## 5. Flujo de Entrega en Git

```bash
git pull origin main
git add 02_auditoria_extensiones_ui/
git commit -m "docs: evidencias y análisis de auditoría con extensiones UI"
git push origin main
```
