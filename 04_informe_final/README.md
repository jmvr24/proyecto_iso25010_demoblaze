# Informe Final y Modelado del Sistema — Integrante 4

## 1. Propósito del Módulo
Este directorio alberga el **Documento Maestro consolidado (Puntos 1 al 5)** de la auditoría de calidad de software bajo la norma **ISO/IEC 25010** aplicada a **DemoBlaze** (`https://www.demoblaze.com/index.html`), así como los **diagramas de Casos de Uso** y artefactos visuales de síntesis.

---

## 2. Responsabilidades y Entregables del Integrante 4

### A. Documento Maestro Consolidado (Puntos 1 al 5)
El **Integrante 4** debe integrar los insumos generados por los Bloques 1, 2 y 3 en un informe estructurado que cubra rigurosamente los **5 puntos del proyecto**:

1. **Punto 1 — Caracterización del Sistema y Modelado Funcional:**
   - Descripción técnica y funcional del portal e-commerce **DemoBlaze** (`https://www.demoblaze.com/index.html`).
   - Identificación de actores, módulos principales (Catálogo por categorías, Detalle de producto, Carrito de compras, Modal de Checkout `Place Order`, Autenticación `Log in` / `Sign up` y Contacto).
   - **Diagramas de Casos de Uso** (en sintaxis Mermaid y exportados en `.png`) junto con sus respectivas tablas de especificación de casos de uso.

2. **Punto 2 — Selección y Justificación del Modelo de Calidad (ISO/IEC 25010):**
   - Definición de las características y subcaracterísticas evaluadas:
     - **Adecuación Funcional:** Completitud funcional, Corrección funcional, Pertinencia funcional.
     - **Eficiencia de Desempeño:** Comportamiento temporal, Utilización de recursos, Capacidad.
     - **Capacidad de Interacción (Usabilidad):** Reconocibilidad de la adecuación, Operabilidad, Protección contra errores de usuario, Estética de la interfaz de usuario, Accesibilidad.

3. **Punto 3 — Diseño de Métricas, Instrumentos y Línea Base (Paso 1):**
   - Matriz de métricas con indicadores, fórmulas, umbrales de aceptación (por ejemplo, $\text{LCP} < 2.5\text{ s}$, Tiempo de respuesta bajo carga $< 2.0\text{ s}$, Tasa de fallo $< 1\%$, $\text{SUS} \ge 68$) e instrumentos asociados.
   - Consolidación de la **Línea Base de Red** (datos de `./01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/` y Speedtest del Integrante 2).

4. **Punto 4 — Ejecución de Pruebas y Análisis de Resultados (Paso 2):**
   - Integración cruzada de las evidencias cuantitativas y cualitativas de los tres frentes:
     - **Frente CLI Automatizado (Integrante 1):** Playwright, `@axe-core/playwright`, Google Lighthouse y pruebas de carga concurrente con **k6 (50 VUs)** desde `./01_pruebas_automatizadas_cli/`.
     - **Frente Extensiones y Herramientas Web (Integrante 2):** PageSpeed Insights, GTmetrix, Check My Links, Validador W3C, WhatFont y ColorZilla desde `./02_auditoria_extensiones_ui/`.
     - **Frente Investigación UX con Usuarios (Integrante 3):** Observación directa y cuestionario **SUS** con $n = 5$ usuarios reales desde `./03_investigacion_usuarios_ux/`.

5. **Punto 5 — Dictamen de Calidad ISO/IEC 25010 y Plan de Mejora:**
   - Matriz de calificación final por característica y subcaracterística (**APRUEBA / REPRUEBA**).
   - Hallazgos críticos priorizados (ausencia de buscador, ausencia de badge en carrito, vulnerabilidad crítica de validación en `Place Order` que acepta tarjetas alfabéticas, enlaces vacíos `href="#"` y violaciones WCAG de accesibilidad).
   - Recomendaciones técnicas de remediación a corto y mediano plazo.

---

### B. Diagramas de Casos de Uso (Mermaid y PNG)
Incluir tanto el código fuente en **Mermaid** como las imágenes renderizadas en alta resolución (`.png` / `.svg`):
- Diagrama General de Casos de Uso de DemoBlaze.
- Especificación detallada de los casos de uso críticos:
  - `CU-01`: Explorar y filtrar catálogo por categoría.
  - `CU-02`: Visualizar detalle y agregar producto al carrito.
  - `CU-03`: Gestionar carrito de compras y eliminar ítems.
  - `CU-04`: Procesar orden de compra (`Place Order`).

---

## 3. Estructura Sugerida del Directorio

```text
04_informe_final/
├── README.md                                  # Esta guía de trabajo
├── INFORME_MAESTRO_ISO25010_DEMOBLAZE.md      # Documento maestro completo (Puntos 1 al 5)
└── diagramas/                                 # Diagramas de Casos de Uso y arquitectura
    ├── casos_de_uso_demoblaze.mmd             # Código fuente Mermaid
    └── casos_de_uso_demoblaze.png             # Imagen exportada lista para el informe
```

---

## 4. Flujo de Entrega en Git

```bash
git pull origin main
git add 04_informe_final/
git commit -m "docs: informe maestro puntos 1 al 5 y diagramas de casos de uso"
git push origin main
```
