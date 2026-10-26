# Auditoría de Calidad de Software ISO/IEC 25010 — Sistema DemoBlaze

[![ISO/IEC 25010](https://img.shields.io/badge/Est%C3%A1ndar-ISO%2FIEC%2025010%3A2023-0052CC?style=for-the-badge&logo=iso&logoColor=white)](https://iso25000.com/index.php/normas-iso-25000/iso-25010)
[![Playwright](https://img.shields.io/badge/Playwright-1.64.1-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Grafana k6](https://img.shields.io/badge/k6-v2.2.0%20(50%20VUs)-7D64FF?style=for-the-badge&logo=k6&logoColor=white)](https://k6.io/)
[![Google Lighthouse](https://img.shields.io/badge/Lighthouse-13.5.0-F44B21?style=for-the-badge&logo=lighthouse&logoColor=white)](https://developer.chrome.com/docs/lighthouse/)
[![axe-core](https://img.shields.io/badge/axe--core-4.14.0%20(WCAG%202.1)-00758F?style=for-the-badge&logo=accessibility&logoColor=white)](https://github.com/dequelabs/axe-core)
[![fast-cli](https://img.shields.io/badge/fast--cli-6.0.0-E50914?style=for-the-badge&logo=netflix&logoColor=white)](https://github.com/sindresorhus/fast-cli)
[![W3C Validation](https://img.shields.io/badge/W3C-HTML5%20%26%20CSS-005A9C?style=for-the-badge&logo=w3c&logoColor=white)](https://validator.w3.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

---

## 1. Descripción Ejecutiva

Este repositorio centraliza la suite de automatización, los respaldos empíricos en formato estructurado (`.json`, `.csv`, `.html`), las evidencias audiovisuales (`.png`, `.mp4`, `.svg`) y el informe técnico maestro de la **evaluación de calidad de software en producción** aplicada al portal de comercio electrónico **DemoBlaze** ([https://www.demoblaze.com/index.html](https://www.demoblaze.com/index.html)), desarrollada bajo el estándar internacional **ISO/IEC 25010:2023**.

La metodología articula cinco fases rigurosas sobre el flujo crítico *end-to-end* (exploración por categoría, visualización de detalle de producto, incorporación y gestión del carrito de compras, y procesamiento de pago en el modal *Place Order*):
1. **Paso 1 — Preparación del Entorno y Línea Base:** Verificación de conectividad de red (`fast-cli`, Playwright sobre `fast.com` y Speedtest), latencia HTTP hacia el frontend y la API (`https://api.demoblaze.com/entries`) y prueba de humo del flujo crítico.
2. **Paso 2 — Ejecución de Herramientas Técnicas:** Automatización E2E e intercepción de red con **Playwright**, pruebas de carga concurrente con **50 usuarios virtuales en Grafana k6**, auditoría de *Core Web Vitals* con **Google Lighthouse / PageSpeed Insights / GTmetrix**, y evaluación de accesibilidad e integridad con **`@axe-core/playwright`**, **Check My Links**, **W3C Nu Html Checker**, **WhatFont** y **ColorZilla**.
3. **Paso 3 — Aplicación de Instrumentos con Usuarios ($n = 5$):** Estudio empírico mediante **Observación Directa** cronometrada en video y aplicación del cuestionario estandarizado **SUS (*System Usability Scale*)**.
4. **Paso 4 — Análisis Cruzado y Triangulación:** Contrastación de mediciones técnicas y humanas frente a los umbrales de aceptación definidos.
5. **Paso 5 — Recomendaciones y Plan de Acción Correctivo:** Diagnóstico de causa raíz a nivel de código fuente cliente (`index.html`, `cart.html`, `js/cart.js`, `js/prod.js`) y propuesta de refactorización priorizada.

---

## 2. Dimensiones ISO/IEC 25010 Evaluadas

| Característica ISO/IEC 25010 | Subcaracterísticas Evaluadas | Métricas e Instrumentos Aplicados |
| :--- | :--- | :--- |
| **1. Adecuación Funcional** | **Pertinencia funcional** | Retroalimentación persistente en acciones críticas (`RP`), número de clics para localizar un producto (`C`), inspección DOM de buscador por texto y controles de cantidad en carrito mediante **Playwright**. |
| **2. Eficiencia de Desempeño** | **Comportamiento temporal**, **Capacidad** y **Utilización de recursos** | Tiempos de respuesta bajo carga concurrente con **k6 (50 VUs)** (`avg = 188,00 ms`, `p95 = 423,04 ms`, tasa de error `E = 0,00 %`), mediciones HTTP de `/bycat` y `/view`, *Core Web Vitals* (`LCP`, `FCP`, `CLS`, `TBT`) y peso transferido (`P`) con **Lighthouse**, **PageSpeed Insights** y **GTmetrix**. |
| **3. Capacidad de Interacción (Usabilidad)** | **Aprendibilidad**, **Operabilidad**, **Protección contra errores de usuario**, **Involucramiento del usuario** e **Inclusividad** | Tasa de rechazo en pruebas negativas de *Place Order* (`R`), prueba de borrado destructivo sin confirmación (`Delete`), integridad de enlaces (**Check My Links**), uniformidad tipográfica y cromática (**WhatFont** y **ColorZilla**), violaciones WCAG 2.1 con modales cerrados y abiertos (**`axe-core`**), validación sintáctica (**W3C**) y pruebas con usuarios (**Observación Directa + SUS**, $n = 5$). |

---

## 3. Arquitectura del Repositorio

```text
proyecto_iso25010_demoblaze/
├── README.md                                       # Documentación ejecutiva y guía general del repositorio
├── LICENSE                                         # Licencia MIT con atribución conjunta del equipo
├── package.json                                    # Configuración ESM, scripts de auditoría y dependencias (pnpm)
├── pnpm-lock.yaml                                  # Árbol determinista de dependencias
├── 01_pruebas_automatizadas_cli/                   # Scripts y resultados de Playwright, k6, Lighthouse y axe-core
│   ├── RESUMEN_EJECUCION_TECNICA_PASO2.md          # Síntesis técnica de las corridas CLI
│   ├── RESPUESTAS_LISTAS_PARA_PR.md                # Consolidado de métricas adicionales de endpoints y modales
│   ├── evidencias/
│   │   ├── versiones_herramientas.json             # Inventario exacto de versiones CLI, paquetes y hardware
│   │   ├── 01_red_fast_cli/                        # Línea base de red (fast-cli, fast.com y ping HTTP)
│   │   ├── 02_capturas_flujo/                      # Capturas E2E del flujo, pruebas negativas y borrado en carrito
│   │   ├── 03_adecuacion_e_interaccion/            # JSONs de pruebas funcionales, Delete, enlaces, estilos, axe y RCA
│   │   └── 04_desempeno_metricas_y_k6/             # Reportes Lighthouse (JSON/HTML), resumen k6 y tiempos /view y /bycat
│   └── scripts/                                    # Scripts modulares (.mjs / .js) de ejecución automatizada
├── 02_auditoria_extensiones_ui/                    # Evidencias visuales y reportes (WhatFont, ColorZilla, W3C, GTmetrix)
│   ├── REPORTE_TECNICO_INTEGRANTE_2.md             # Informe detallado de herramientas web y estándares UI
│   ├── capturas/                                   # Evidencias gráficas (Speedtest, PageSpeed, GTmetrix, W3C, UI)
│   ├── datos/                                      # Respaldos JSON/HTML de cada instrumento web
│   └── scripts/                                    # Scripts Playwright de captura y extracción en viewport 1440x900
├── 03_investigacion_usuarios_ux/                   # Resultados de Observación Directa y Cuestionario SUS (n = 5)
│   ├── ESTUDIO_USUARIOS_Y_SUS.md                   # Estudio de usabilidad, tiempos por tarea e intervalo de confianza SUS
│   ├── Encuesta.csv                                # Respuestas crudas recolectadas del cuestionario SUS
│   ├── datos/                                      # Matrices CSV anonimizadas (observación, hitos de video y cálculo SUS)
│   └── evidencia_sesiones/                         # Grabaciones en video (Usuario 1 a 5.mp4) y Cuestionario.pdf
└── 04_informe_final/                               # Documento consolidado del análisis cruzado y plan de mejora
    ├── INFORME_ISO25010_DEMOBLAZE.md               # Informe Maestro completo (Puntos 1 al 5)
    ├── SECCION_PASO_1_Y_PASO_2.md                  # Desarrollo metodológico detallado de los Pasos 1 y 2
    ├── GUIA_ESTUDIO_SUSTENTACION_GRUPO.md          # Guía de estudio y sustentación grupal con métricas reales
    ├── capturas/                                   # Secuencia visual numerada del flujo crítico de compra
    ├── diagramas/                                  # Diagramas de Casos de Uso (.puml, .svg y .png)
    └── evidencias/                                 # Registros JSON de recorrido del sitio y capturas del informe
```

---

## 4. Ejecución de Scripts Automatizados

El proyecto utiliza exclusivamente **`pnpm`** como gestor de paquetes sobre **Node.js >= 22** (ES Modules):

```bash
# Instalar dependencias deterministas
pnpm install

# Ejecutar mediciones técnicas individuales
pnpm run audit:red         # Línea base de red (fast.com + ping HTTP a DemoBlaze)
pnpm run audit:ui          # Auditoría E2E funcional, enlaces, estilos y accesibilidad axe-core
pnpm run audit:endpoints   # Tiempos de respuesta HTTP de /bycat y /view (secuencial y concurrente)
pnpm run audit:delete      # Prueba automatizada de borrado sin confirmación en el carrito
pnpm run audit:modals      # Auditoría WCAG de etiquetas <label> con los 4 modales abiertos

# Ejecutar prueba de carga concurrente (50 usuarios virtuales durante 30 s) con k6
"C:\Program Files\k6\k6.exe" run ./01_pruebas_automatizadas_cli/scripts/carga_k6.js
```

---

## 5. Equipo de Trabajo (Roles)

| Nombre | Rol en la Auditoría ISO/IEC 25010 |
| :--- | :--- |
| **Juan David Fierro Calderon** | Líder de Automatización QA (Playwright, k6) |
| **Santiago Márquez Murcia** | Auditor de Estándares Web, Red y Accesibilidad |
| **Miguel Angel Medina Díaz** | Líder de Investigación UX y Percepción Humana |
| **Juan Manuel Villalba Rincón** | Arquitecto Documental y Analista de Triangulación |
