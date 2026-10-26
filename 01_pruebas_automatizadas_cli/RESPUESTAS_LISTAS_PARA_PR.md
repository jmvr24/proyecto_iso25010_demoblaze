# RESPUESTAS Y EVIDENCIAS TÉCNICAS LISTAS PARA COMPLETAR EL PR #4 (INTEGRANTE 1 -> INTEGRANTE 4)

Este documento consolida los **4 bloques pendientes marcados como `[PENDIENTE: integrante 1]`** en `04_informe_final/INFORME_ISO25010_DEMOBLAZE.md` (Tablas 11, 15 y 16), obtenidos mediante ejecución real de scripts automatizados en el entorno del Integrante 1. Todos los valores siguen el formato editorial del informe (coma decimal, punto de miles y trazabilidad exacta a archivos JSON/PNG y scripts fuente).

---

## BLOQUE 1: Versiones Exactas de Herramientas y Especificaciones del Equipo (Tabla 11 - Paso 1)

### 1.1 Filas listas para copiar y pegar en la Tabla 11 (`Ambiente de ejecución de las pruebas técnicas`)

Reemplazar las dos filas con `[PENDIENTE: integrante 1, ...]` en la **Tabla 11** por:

```markdown
| Equipo y procesador (integrante 1) | 12th Gen Intel(R) Core(TM) i5-12500H (16 núcleos lógicos a 3.110 MHz), 39,69 GB de RAM (42.619.752.448 B) y Windows 11 Pro de 64 bits (versión 10.0.26200.9711; índice de rendimiento de CPU en Lighthouse: 2.473,50) | `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json` y `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Herramientas y versiones principales | Lighthouse 13.5.0; HeadlessChrome 155.0.0.0; axe-core 4.14.0; Playwright 1.64.1; @playwright/test 1.64.1; @axe-core/playwright 4.14.0 | `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json`, `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` y `pnpm-lock.yaml` |
| Herramientas de línea de comandos y entorno (integrante 1) | k6: v2.2.0 (commit/00a9a1b7f5, go1.26.5, windows/amd64); Node.js: v24.16.0 (V8 13.6.233.17-node.49); pnpm: 12.15.0; fast-cli: 6.0.0; Git: 2.51.0.windows.1; GitHub CLI (gh): 2.103.0 | `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json` |
```

### 1.2 Desglose de verificación por consola

- **Sistema Operativo:** `Windows 11 Pro` x64 (`Microsoft Windows [Version 10.0.26200.9711]`, kernel `10.0.26200`).
- **Procesador y RAM:** `12th Gen Intel(R) Core(TM) i5-12500H` (16 hilos lógicos, 3.110 MHz), `39,69 GB` de RAM (`42.619.752.448` bytes).
- **Node.js:** `v24.16.0` (`node -v`).
- **pnpm:** `12.15.0` (`pnpm -v`).
- **k6:** `k6.exe v2.2.0 (commit/00a9a1b7f5, go1.26.5, windows/amd64)` (`"C:\Program Files\k6\k6.exe" version`).
- **fast-cli:** `6.0.0` (`pnpm list -g fast-cli`).
- **Google Lighthouse CLI:** `13.5.0` (`lighthouse --version`).
- **Playwright / `@playwright/test`:** `1.64.1` (`./node_modules/playwright/package.json`).
- **`@axe-core/playwright` y motor `axe-core`:** `4.14.0` (`./node_modules/@axe-core/playwright/package.json` y `axe-core/package.json`).
- **Git / GitHub CLI:** `git version 2.51.0.windows.1` / `gh version 2.103.0 (2026-10-21)`.
- **Ruta de evidencia:** `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json`.

---

## BLOQUE 2: Tiempos de Respuesta HTTP de `/view` y `/bycat` (Tabla 15 - Eficiencia de Desempeño / Comportamiento Temporal)

### 2.1 Fila lista para copiar y pegar en la Tabla 15 (`Resultados de las mediciones técnicas para Eficiencia de desempeño`)

Reemplazar la fila de `Tiempos de respuesta HTTP de /view y /bycat` en la **Tabla 15** por:

```markdown
| Comportamiento temporal | Tiempos de respuesta HTTP de /view y /bycat | Script de medición HTTP (Node.js `fetch` + `performance.now()`) | **Endpoint `POST /bycat` (`{"cat":"notebook"}`):** en 20 peticiones secuenciales (20 con HTTP 200; éxito: 100,00 %), promedio = 203,22 ms, mediana (p50) = 145,67 ms, percentil 95 (p95) = 472,97 ms (nearest-rank: 468,34 ms), mínimo = 135,44 ms y máximo = 560,84 ms; en 10 peticiones concurrentes (9 con HTTP 200 y 1 fallo `fetch failed` en 10.213,19 ms; éxito: 90,00 %), sobre las 9 muestras válidas promedio = 442,70 ms, p50 = 326,77 ms, p95 = 856,95 ms (nearest-rank: 1.013,99 ms), mínimo = 159,91 ms y máximo = 1.013,99 ms (consolidado `/bycat` sobre 29 muestras exitosas de 30: promedio = 277,54 ms, p50 = 156,81 ms, p95 = 615,36 ms). En pruebas secuenciales complementarias (5 iteraciones c/u, 100,00 % HTTP 200): `{"cat":"phone"}` promedió 338,11 ms (p50: 171,10 ms; p95: 664,30 ms; mín: 151,89 ms; máx: 707,87 ms) y `{"cat":"monitor"}` promedió 173,48 ms (p50: 158,51 ms; p95: 230,13 ms; mín: 144,14 ms; máx: 247,21 ms). **Endpoint `POST /view` (`{"id":"8"}`, Sony vaio i5):** en 20 peticiones secuenciales (20 con HTTP 200; éxito: 100,00 %), promedio = 311,28 ms, p50 = 214,89 ms, p95 = 656,78 ms (nearest-rank: 636,90 ms), mínimo = 146,07 ms y máximo = 1.034,43 ms; en 10 peticiones concurrentes (10 con HTTP 200; éxito: 100,00 %), promedio = 644,02 ms, p50 = 471,29 ms, p95 = 1.480,25 ms (nearest-rank: 1.589,25 ms), mínimo = 236,33 ms y máximo = 1.589,25 ms (consolidado `/view` sobre 30 muestras: promedio = 422,19 ms, p50 = 331,19 ms, p95 = 1.206,36 ms). Con `{"id":"1"}` (Samsung galaxy s6, 5 peticiones secuenciales, 100,00 % HTTP 200) promedió 417,87 ms (p50: 479,90 ms; p95: 531,59 ms; mín: 150,31 ms; máx: 533,74 ms). **Resumen combinado (`/bycat` + `/view`, 59 respuestas HTTP 200 sobre 60 peticiones; éxito: 98,33 %):** promedio global = 351,09 ms, p50 = 236,33 ms, p95 = 1.016,03 ms y máximo = 1.589,25 ms (todos dentro del umbral ISO/IEC 25010 de `< 2.000,00 ms`) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/tiempos_http_view_bycat.json` y `01_pruebas_automatizadas_cli/scripts/medir_endpoints_view_bycat.mjs` |
```

### 2.2 Tabla resumen de verificación estadística (`/bycat` y `/view`)

| Endpoint y Payload | Modo | Éxito HTTP 200 | Suma tiempos válidos (ms) | Mínimo (ms) | Promedio (ms) | Mediana p50 (ms) | p95 interpolado (ms) | p95 nearest-rank (ms) | Máximo (ms) | `< 2.000 ms` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /bycat` (`{"cat":"notebook"}`) | 20 secuenciales | 20 / 20 (100,00 %) | 4.064,32 | 135,44 | 203,22 | 145,67 | 472,97 | 468,34 | 560,84 | Sí |
| `POST /bycat` (`{"cat":"notebook"}`) | 10 concurrentes | 9 / 10 (90,00 %) | 3.984,30 | 159,91 | 442,70 | 326,77 | 856,95 | 1.013,99 | 1.013,99 | Sí |
| `POST /bycat` (`{"cat":"notebook"}`) | Consolidado (30) | 29 / 30 (96,67 %) | 8.048,62 | 135,44 | 277,54 | 156,81 | 615,36 | 621,40 | 1.013,99 | Sí |
| `POST /bycat` (`{"cat":"phone"}`) | 5 secuenciales | 5 / 5 (100,00 %) | 1.690,56 | 151,89 | 338,11 | 171,10 | 664,30 | 707,87 | 707,87 | Sí |
| `POST /bycat` (`{"cat":"monitor"}`) | 5 secuenciales | 5 / 5 (100,00 %) | 867,40 | 144,14 | 173,48 | 158,51 | 230,13 | 247,21 | 247,21 | Sí |
| `POST /view` (`{"id":"8"}` - Sony vaio i5) | 20 secuenciales | 20 / 20 (100,00 %) | 6.225,58 | 146,07 | 311,28 | 214,89 | 656,78 | 636,90 | 1.034,43 | Sí |
| `POST /view` (`{"id":"8"}` - Sony vaio i5) | 10 concurrentes | 10 / 10 (100,00 %) | 6.440,16 | 236,33 | 644,02 | 471,29 | 1.480,25 | 1.589,25 | 1.589,25 | Sí |
| `POST /view` (`{"id":"8"}` - Sony vaio i5) | Consolidado (30) | 30 / 30 (100,00 %) | 12.665,74 | 146,07 | 422,19 | 331,19 | 1.206,36 | 1.347,03 | 1.589,25 | Sí |
| `POST /view` (`{"id":"1"}` - Galaxy s6) | 5 secuenciales | 5 / 5 (100,00 %) | 2.089,35 | 150,31 | 417,87 | 479,90 | 531,59 | 533,74 | 533,74 | Sí |
| **Global principal (`/bycat` + `/view`)** | **60 peticiones** | **59 / 60 (98,33 %)** | **20.714,36** | **135,44** | **351,09** | **236,33** | **1.016,03** | **1.034,43** | **1.589,25** | **Sí** |

---

## BLOQUE 3: Prueba Automatizada de Borrado en el Carrito (`Delete`) sin Confirmación (Tabla 16 - Protección contra Errores de Usuario)

### 3.1 Fila lista para copiar y pegar en la Tabla 16 (`Resultados de las mediciones técnicas para Capacidad de interacción`)

Reemplazar la fila de `Confirmación en borrado del carrito (Delete)` en la **Tabla 16** por:

```markdown
| Protección contra errores de usuario | Confirmación en borrado del carrito (Delete) | Playwright (prueba funcional automatizada e intercepción de red) | Sin mecanismo de confirmación ni recuperación (`confirmationDialogTriggered = false`, `confirmationModalTriggered = false`, `undoMechanismAvailable = false`). Tras incorporar el producto Sony vaio i5 (`idp_=8`, precio 790 USD, `itemsAntes = 1` en `#tbodyid`) y accionar el enlace `Delete` (`onclick="deleteItem('5886f608-ae2a-a675-4407-4d59faed8685')"`), la función cliente `deleteItem(id)` ejecutó de manera inmediata la petición `POST https://api.demoblaze.com/deleteitem` (código HTTP 200 en 361,55 ms con payload `{"id":"5886f608-ae2a-a675-4407-4d59faed8685"}`) e invocó `location.reload()` directamente en el callback `success`, eliminando el registro de `#tbodyid` (`itemsDespues = 0`, `#totalp` vacío) sin desplegar diálogos nativos (`window.confirm`, `alert` o `prompt`: 0 eventos capturados) ni modales de confirmación en el DOM | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/prueba_delete_carrito.json`, `01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/06_borrado_sin_confirmacion_carrito.png` y `01_pruebas_automatizadas_cli/scripts/prueba_delete_carrito.mjs` |
```

---

## BLOQUE 4: Auditoría de Etiquetado de Campos (`label`) con Modales Abiertos (Tabla 16 - Inclusividad)

### 4.1 Fila lista para copiar y pegar en la Tabla 16 (`Resultados de las mediciones técnicas para Capacidad de interacción`)

Reemplazar la fila de `Etiquetado de campos en modales` en la **Tabla 16** por:

```markdown
| Inclusividad | Etiquetado de campos en modales | axe-core (`@axe-core/playwright`) / Lighthouse / Inspección DOM | Lighthouse marcó la auditoría `label` con `score: null` y `scoreDisplayMode: 'notApplicable'` debido a que los modales permanecían cerrados (`display: none`) durante la inspección inicial. Al abrir secuencialmente los 4 modales con formularios y auditarlos en estado visible (`.modal.show`) con `AxeBuilder.include(modalSelector)` e inspección del DOM sobre los 13 campos totales (`12 <input>` y `1 <textarea>`), se constató que **10 de 13 campos (76,92 %)** poseen asociación programática `<label for="...">` válida y **3 de 13 campos (23,08 %) carecen de etiqueta programática**, registrando **3 nodos con violación de impacto crítico (`critical`) en la regla `label` de axe-core** (WCAG 2.1 SC 1.3.1 y 4.1.2 Nivel A): 1) **Modal `Place Order` (`#orderModal` en `cart.html`, 6 campos):** 6 de 6 etiquetados correctamente (`PASS` en regla `label`; `#name`, `#country`, `#city`, `#card`, `#month` y `#year` coinciden con sus `<label for="...">`); 2) **Modal `Contact` (`#exampleModal` en `index.html`, 3 campos):** 2 de 3 etiquetados (`#recipient-name` y `#message-text`) y **1 violación crítica (`label`)** en `<input id="recipient-email">`, cuyo `<label>` visual vecino ("Contact Email:") tiene por error `for="recipient-name"` (atributo duplicado con el segundo campo); 3) **Modal `Log in` (`#logInModal` en `index.html`, 2 campos):** 0 de 2 etiquetados y **2 violaciones críticas (`label`)** en `<input id="loginusername">` y `<input id="loginpassword">`, cuyas etiquetas `<label>` apuntan a identificadores inexistentes (`for="log-name"` y `for="log-pass"`); 4) **Modal `Sign up` (`#signInModal` en `index.html`, 2 campos):** 2 de 2 etiquetados correctamente (`PASS` en regla `label`; `#sign-username` y `#sign-password`). Ninguno de los 13 controles posee atributos `aria-label`, `aria-labelledby`, `placeholder` ni `required`. Adicionalmente, con los modales abiertos axe-core detectó violaciones serias (`serious`) de `color-contrast` en `#exampleModal` (4 nodos), `#logInModal` (3 nodos) y `#signInModal` (3 nodos) | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/auditoria_labels_modales_abiertos.json`, `01_pruebas_automatizadas_cli/scripts/auditoria_labels_modales_abiertos.mjs` y `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
```

### 4.2 Resumen matricial por modal abierto

| Modal Auditado | Vista | Selector | Total Campos | Asociados Válidos (`<label for>`) | Huérfanos sin `label` | Estado Regla `label` (axe-core) | Causa Técnica en el DOM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Place Order** | `cart.html` | `#orderModal` | 6 | 6 (100,00 %) | 0 (0,00 %) | `PASS` (0 violaciones) | Los 6 inputs (`#name`, `#country`, `#city`, `#card`, `#month`, `#year`) coinciden con el atributo `for` de su `<label>`. |
| **Contact** | `index.html` | `#exampleModal` | 3 | 2 (66,67 %) | 1 (33,33 %) | `VIOLATION` (`critical`, 1 nodo) | `<input id="recipient-email">` tiene un `<label>` vecino ("Contact Email:") con `for="recipient-name"` (colisión por copiado/pegado con `#recipient-name`). |
| **Log in** | `index.html` | `#logInModal` | 2 | 0 (0,00 %) | 2 (100,00 %) | `VIOLATION` (`critical`, 2 nodos) | `<input id="loginusername">` y `<input id="loginpassword">` tienen `<label>` vecinos con `for="log-name"` y `for="log-pass"` (IDs inexistentes en el DOM). |
| **Sign up** | `index.html` | `#signInModal` | 2 | 2 (100,00 %) | 0 (0,00 %) | `PASS` (0 violaciones) | `<input id="sign-username">` y `<input id="sign-password">` coinciden exactamente con `for="sign-username"` y `for="sign-password"`. |
| **Total Consolidado** | **Ambas vistas** | **4 modales** | **13** | **10 (76,92 %)** | **3 (23,08 %)** | **3 nodos críticos (`label`)** | **Error de correspondencia `for`/`id` en `#exampleModal` y `#logInModal`, sin `aria-label` ni `placeholder` de respaldo.** |

---

## 5. Índice de Archivos Generados en esta Ejecución

1. `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json` — Inventario exacto de versiones CLI, paquetes NPM y hardware del equipo del Integrante 1.
2. `01_pruebas_automatizadas_cli/scripts/medir_endpoints_view_bycat.mjs` — Script de medición HTTP (`POST /bycat` y `POST /view`, 20 secuenciales + 10 concurrentes + variantes).
3. `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/tiempos_http_view_bycat.json` — Resultados crudos y estadísticos (mínimo, promedio, p50, p95, máximo y tasa de éxito HTTP 200).
4. `01_pruebas_automatizadas_cli/scripts/prueba_delete_carrito.mjs` — Script Playwright de prueba de borrado destructivo en el carrito (`Delete`) sin confirmación.
5. `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/prueba_delete_carrito.json` — Evidencia estructurada de `Delete` sin confirmación (`confirmationDialogTriggered: false`, `confirmationModalTriggered: false`).
6. `01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/06_borrado_sin_confirmacion_carrito.png` — Captura de pantalla del carrito vacío inmediatamente después del borrado sin confirmación.
7. `01_pruebas_automatizadas_cli/scripts/auditoria_labels_modales_abiertos.mjs` — Script Playwright + `@axe-core/playwright` para auditar etiquetas `<label>` con los 4 modales abiertos.
8. `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/auditoria_labels_modales_abiertos.json` — Reporte completo de axe-core e inspección DOM sobre los 13 campos en los 4 modales abiertos.
