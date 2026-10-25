# Auditoría de Calidad de Software ISO/IEC 25010 — Sistema DemoBlaze

## 1. Descripción Ejecutiva
Este repositorio centraliza los instrumentos, scripts de automatización, evidencias empíricas y el informe técnico de la **evaluación de calidad de software bajo el estándar ISO/IEC 25010** aplicada al sistema de comercio electrónico en producción **DemoBlaze** ([https://www.demoblaze.com/index.html](https://www.demoblaze.com/index.html)).

La auditoría combina pruebas automatizadas de línea de comandos (Playwright, `@axe-core/playwright`, Google Lighthouse y k6), herramientas web de diagnóstico y extensiones de interfaz de usuario (Speedtest, PageSpeed Insights, GTmetrix, Check My Links, W3C Validator, WhatFont y ColorZilla), junto con investigación empírica de experiencia de usuario (Observación Directa y cuestionario **SUS** con 5 usuarios reales).

---

## 2. Dimensiones ISO/IEC 25010 Evaluadas

| Característica ISO/IEC 25010 | Subcaracterísticas Auditadas | Instrumentos y Metodologías |
| :--- | :--- | :--- |
| **1. Adecuación Funcional** | Pertinencia funcional, Completitud funcional, Corrección funcional | Automatización E2E con Playwright, inspección DOM de buscador y contador de carrito, pruebas funcionales del flujo de compra |
| **2. Eficiencia de Desempeño** | Comportamiento temporal, Utilización de recursos, Capacidad | Línea base con `fast-cli`/Playwright y Speedtest; auditoría de Core Web Vitals (LCP, FCP, TBT, CLS) con Lighthouse, PageSpeed Insights y GTmetrix; pruebas de carga concurrente con **k6 (50 usuarios virtuales)** |
| **3. Capacidad de Interacción (Usabilidad)** | Reconocibilidad, Operabilidad, Protección contra errores de usuario, Estética UI, Accesibilidad | Pruebas negativas de validación en Checkout (`Place Order`), emulación y uso de WhatFont, ColorZilla y Check My Links, auditoría WCAG con `@axe-core/playwright`, Validador W3C, Observación Directa y cuestionario **SUS** ($n = 5$) |

---

## 3. Tabla de Navegación por Integrante y Módulo

| Bloque / Directorio | Responsable | Alcance y Entregables Principales | Guía Detallada |
| :--- | :--- | :--- | :--- |
| [`./01_pruebas_automatizadas_cli/`](./01_pruebas_automatizadas_cli/) | **Integrante 1**<br>*(Automatización QA & DevOps)* | Scripts y evidencias JSON/PNG de línea base de red (`01_red_fast_cli`), capturas del flujo crítico (`02_capturas_flujo`), pruebas negativas, estilos UI, enlaces y accesibilidad axe-core (`03_adecuacion_e_interaccion`), y métricas de Lighthouse + k6 con 50 VUs (`04_desempeno_metricas_y_k6`). | [Ver Resumen Técnico](./01_pruebas_automatizadas_cli/RESUMEN_EJECUCION_TECNICA_PASO2.md) |
| [`./02_auditoria_extensiones_ui/`](./02_auditoria_extensiones_ui/) | **Integrante 2**<br>*(Auditoría Web & Extensiones UI)* | Capturas y análisis en Markdown de **Speedtest**, **PageSpeed Insights**, **GTmetrix**, **Check My Links**, **Validador W3C**, **WhatFont** y **ColorZilla**. | [Ver Guía Integrante 2](./02_auditoria_extensiones_ui/README.md) |
| [`./03_investigacion_usuarios_ux/`](./03_investigacion_usuarios_ux/) | **Integrante 3**<br>*(Investigación UX & Usuarios)* | Definición de **Población y Muestra** ($n = 5$), matriz de **Observación Directa** durante el flujo de compra y cálculos estadísticos del **Cuestionario SUS**. | [Ver Guía Integrante 3](./03_investigacion_usuarios_ux/README.md) |
| [`./04_informe_final/`](./04_informe_final/) | **Integrante 4**<br>*(Arquitectura & Informe Maestro)* | Documento maestro consolidado de los **Puntos 1 al 5** de la evaluación ISO/IEC 25010 y **Diagramas de Casos de Uso** en formato Mermaid y PNG. | [Ver Guía Integrante 4](./04_informe_final/README.md) |

---

## 4. Arquitectura del Repositorio

```text
proyecto_iso25010_demoblaze/
├── README.md                                       # Descripción ejecutiva y navegación general
├── .gitignore                                      # Exclusión de node_modules, .pnpm-store y logs
├── 01_pruebas_automatizadas_cli/                   # Bloque 1: Automatización CLI (Playwright, axe, Lighthouse, k6)
│   ├── evidencias/
│   │   ├── 01_red_fast_cli/                        # Línea base de ancho de banda y latencia
│   │   ├── 02_capturas_flujo/                      # Capturas del flujo e-commerce y fallos de validación
│   │   ├── 03_adecuacion_e_interaccion/            # JSONs funcionales, estilos HEX, enlaces y accesibilidad WCAG
│   │   └── 04_desempeno_metricas_y_k6/             # Reportes Lighthouse (JSON/HTML) y resumen de carga k6
│   └── scripts/                                    # Scripts modulares (.mjs / .js) de ejecución técnica
├── 02_auditoria_extensiones_ui/                    # Bloque 2: Extensiones UI y herramientas web
├── 03_investigacion_usuarios_ux/                   # Bloque 3: Pruebas con 5 usuarios reales y cuestionario SUS
└── 04_informe_final/                               # Bloque 4: Informe maestro (Puntos 1-5) y Casos de Uso
```

---

## 5. Reglas de Trabajo Colaborativo
1. **Gestor de paquetes exclusivo:** El entorno utiliza `pnpm` (`devEngines.packageManager = pnpm`). No emplear `npm` ni `npx`.
2. **Aislamiento por directorio:** Cada integrante trabaja dentro de su carpeta asignada (`01_` a `04_`) para evitar conflictos de fusión (*merge conflicts*).
3. **Trazabilidad empírica:** Todas las conclusiones del informe final deben respaldarse en las capturas y archivos `.json`/`.csv` almacenados en este repositorio.
