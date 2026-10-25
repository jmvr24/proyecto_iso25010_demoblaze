# INSTRUCCIONES DE EJECUCIÓN MULTI-AGENTE: ARQUITECTURA DE REPOSITORIO Y AUDITORÍA AUTOMATIZADA ISO/IEC 25010 EN DEMOBLAZE

## 1. Contexto, Entorno y Arquitectura Multi-Agente
Actúa como un **Agente Orquestador Principal (Lead QA & DevOps)**. Tu objetivo es estructurar el repositorio colaborativo del equipo en Git/GitHub y ejecutar las pruebas técnicas del **Paso 1 (Línea Base)** y **Paso 2 (Instrumentos Automatizados)** bajo el estándar **ISO/IEC 25010** sobre el sistema en producción `https://www.demoblaze.com/index.html`.

### Reglas Estrictas del Entorno (Windows 11 + CMD + pnpm v11)
1. **PROHIBIDO usar `npx` o `npm`:** El proyecto tiene configurado `devEngines.packageManager = pnpm`. Cualquier ejecución de paquetes debe usar `pnpm exec <comando>` (para paquetes locales como `playwright`) o `pnpm dlx <paquete>` (para paquetes remotos).
2. **Despliegue de Múltiples Agentes (Sub-Agentes):** Debes dividir y delegar el trabajo en sub-agentes especializados por dominio técnico (DevOps/GitHub, Red/Línea Base, Automatización Funcional/UI con Playwright MCP, Ingeniería de Desempeño con Lighthouse/k6, y Compilador ISO 25010). Ejecuta en paralelo aquellas tareas que no dependan entre sí.
3. **Cero Datos Ficticios:** Prohibido inventar métricas. Todo valor debe provenir de los archivos `.json` generados por las pruebas reales.
4. **Uso Activo de GitHub CLI (`gh`) y Git:** Usa `gh` para verificar la configuración del repositorio remoto, documentar el avance y sincronizar los entregables del equipo.

---

## 2. Plan de Ejecución por Bloques y Sub-Agentes

### FASE 0: Sub-Agente DevOps — Scaffolding del Repositorio Grupal (`git` + `gh` CLI)
1. Verifica el estado de autenticación y del repositorio remoto ejecutando `gh auth status` y `gh repo view`. (Si el repositorio remoto aún no existe en GitHub, créalo automáticamente con `gh repo create iso25010-demoblaze --public --source=. --remote=origin`).
2. Verifica que `.gitignore` exista y contenga `node_modules/`, `.pnpm-store/`, `*.log` y archivos temporales.
3. Crea la siguiente arquitectura de directorios en la raíz del proyecto para los 4 integrantes:
   - `./01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/`
   - `./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/`
   - `./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/`
   - `./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/`
   - `./01_pruebas_automatizadas_cli/scripts/`
   - `./02_auditoria_extensiones_ui/`
   - `./03_investigacion_usuarios_ux/`
   - `./04_informe_final/`
4. Crea archivos `README.md` guía en las carpetas de los compañeros:
   - `./02_auditoria_extensiones_ui/README.md`: Instrucciones para el **Integrante 2** (subir capturas y análisis en Markdown de Speedtest, PageSpeed Insights, GTmetrix, Check My Links, Validador W3C, WhatFont y ColorZilla).
   - `./03_investigacion_usuarios_ux/README.md`: Instrucciones para el **Integrante 3** (subir definición de Población/Muestra, matriz de Observación Directa y cálculos del Cuestionario SUS de los 5 usuarios reales).
   - `./04_informe_final/README.md`: Instrucciones para el **Integrante 4** (subir documento maestro de los Puntos 1 al 5 y diagramas de Casos de Uso en Mermaid/PNG).
   - `./README.md` (Raíz): Descripción ejecutiva del proyecto de evaluación ISO/IEC 25010 sobre DemoBlaze y tabla de navegación hacia las carpetas de los 4 integrantes.
5. Realiza el primer commit y push estructural:
   `git add .gitignore README.md 02_auditoria_extensiones_ui/ 03_investigacion_usuarios_ux/ 04_informe_final/`
   `git commit -m "chore(repo): inicializa arquitectura de carpetas para los 4 integrantes ISO 25010"`
   `git push -u origin main`

---

### FASE A: Sub-Agente de Red — Preparación del Entorno y Línea Base (Paso 1)
1. Intenta medir el ancho de banda y latencia con `fast-cli`:
   `fast --upload --json > ./01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json`
2. **Plan de Contingencia Automático (Fallback anti-fallo de Puppeteer en Windows):**
   Si `fast-cli` falla o devuelve un JSON vacío porque `pnpm` bloqueó el binario interno de Puppeteer, crea y ejecuta inmediatamente un script `./01_pruebas_automatizadas_cli/scripts/medir_red.mjs` usando **Playwright (`chromium`)** y `fetch` nativo de Node.js que:
   - Mida el Ping promedio, mínimo y máximo (en ms) realizando 10 peticiones `HEAD`/`GET` hacia `https://www.demoblaze.com` y `https://api.demoblaze.com/entries`.
   - Navegue en modo headless con Playwright a `https://fast.com`, espere a que el indicador `#speed-value.succeeded` termine de medir los Mbps de descarga (y haga clic en `#show-more-details-link` para capturar la subida en `#upload-value` y latencia en `#latency-value`), guardando todos los datos reales en `./01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json`.

---

### FASE B y C: Sub-Agente Auditor Funcional y UI/UX (Playwright MCP + `@axe-core/playwright`)
Crea y ejecuta un script modular en `./01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs` (ejecutado con `node ./01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs`) o apóyate en el **MCP de Playwright** con un viewport de `1280x800` sobre `https://www.demoblaze.com/index.html` para realizar todas estas pruebas:

1. **Capturas del Flujo Crítico y Adecuación Funcional (Pertinencia Funcional):**
   - **Captura 1 (Home):** Espera a que carguen las tarjetas `.card` y guarda `./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/01_home_catalogo.png`.
   - **Auditoría de Buscador:** Verifica en el DOM si existe algún `<input type="search">` o buscador por texto. Documenta su ausencia.
   - **Selección de Producto:** Haz clic en la categoría `Laptops`, luego en `Sony vaio i5`, espera a que cargue la vista de detalle y guarda `./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/02_detalle_producto.png`.
   - **Auditoría de Feedback en Carrito:** Intercepta el diálogo `window.alert` (`page.on('dialog', ...)`), haz clic en `Add to cart`, captura el texto del alert (`"Product added"`) y acéptalo. Inspecciona `#cartur` (`Cart`) en el navbar para comprobar que NO existe un contador numérico (badge) de productos.
   - **Captura del Carrito:** Navega a `Cart` (`#cartur`), espera a que cargue la fila en `#tbodyid` y guarda `./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/03_carrito_compras.png`.

2. **Capacidad de Interacción — Protección contra Errores de Usuario (Pruebas Negativas en Checkout):**
   - Haz clic en `Place Order` para abrir `#orderModal` y guarda `./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/04_modal_checkout_vacio.png`.
   - **Prueba Negativa 1:** Haz clic en `Purchase` con todos los campos en blanco y registra el texto del `alert` de validación.
   - **Prueba Negativa 2 (Datos Inválidos):** Llena `#name` con `"Usuario Prueba QA"` y en `#card` ingresa texto alfabético inválido `"TARJETA_FALSA_SIN_NUMEROS_ABC"`. Deja vacíos `#country`, `#city`, `#month` y `#year`. Haz clic en `Purchase`.
   - Espera el modal `.sweet-alert` (`"Thank you for your purchase!"`), extrae su texto para demostrar que el sistema procesa tarjetas alfabéticas sin fecha ni país, y guarda `./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/05_fallo_proteccion_errores_checkout.png`.
   - Guarda los resultados de Pertinencia Funcional y Protección contra Errores en `./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`.

3. **Capacidad de Interacción — Estética UI (Emulación de WhatFont y ColorZilla):**
   - En `index.html`, ejecuta `page.evaluate()` sobre `body`, `nav`, `.nav-link`, `.card-title`, `.card-text`, `.btn-primary`, `.btn-success` y `footer` extrayendo `fontFamily`, `fontSize`, `color` y `backgroundColor` (convertidos a formato `#HEX`).
   - Guarda el reporte en `./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json`.

4. **Capacidad de Interacción — Operabilidad e Integridad de Enlaces (Emulación de Check My Links):**
   - Extrae todos los `<a href>` e `<img src>` en `index.html`. Clasifica cuántos responden HTTP 200, cuántos son anclas sin destino (`href="#"` o vacíos) y cuántos dan error HTTP 404/500.
   - Guarda el reporte en `./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json`.

5. **Capacidad de Interacción — Accesibilidad (`@axe-core/playwright`):**
   - Ejecuta `AxeBuilder` sobre `index.html` y `cart.html`, y exporta el conteo y detalle de violaciones WCAG (críticas, serias, moderadas y menores) en `./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json`.

---

### FASE D: Sub-Agente de Eficiencia de Desempeño (Lighthouse + k6)
*(Puede ejecutarse en paralelo con el Sub-Agente Funcional o inmediatamente después)*

1. **Comportamiento Temporal y Utilización de Recursos (Google Lighthouse):**
   - Ejecuta en consola:
     `lighthouse https://www.demoblaze.com/index.html --output=json --output=html --output-path=./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report --chrome-flags="--headless --no-sandbox"`
   - **Nota Crítica sobre Windows:** En Windows 11, Lighthouse suele arrojar un error `EPERM` al final cuando intenta borrar su carpeta temporal en `AppData\Local\Temp`, aun después de haber creado con éxito los archivos `.report.json` y `.report.html`. **Verifica siempre si el archivo `./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` existe antes de considerar que el comando falló.**
   - Si no encuentra Chrome por defecto, pasa la ruta del Chromium de Playwright en la variable de entorno `CHROME_PATH`.
   - Extrae del JSON: Score de Performance, Accesibilidad, Best Practices y SEO; tiempo exacto de **LCP (Largest Contentful Paint)** en segundos (umbral $< 2.5\text{ s}$); FCP; TBT; CLS; total de peticiones HTTP y peso total de transferencia en KB/MB.

2. **Capacidad bajo Concurrencia (k6 — 50 Usuarios Concurrentes):**
   - Crea el script `./01_pruebas_automatizadas_cli/scripts/carga_k6.js` que simule:
     - Rampa de 5s a **50 usuarios virtuales (50 VUs)**, meseta de 20s con 50 VUs concurrentes, y bajada de 5s.
     - Peticiones `GET` a `https://www.demoblaze.com/index.html` y `https://api.demoblaze.com/entries`.
     - Umbrales (`thresholds`) ISO/IEC 25010: `http_req_duration: ['avg<2000', 'p(95)<2000']` ($< 2.0\text{ s}$) y `http_req_failed: ['rate<0.01']` ($< 1\%$).
   - Ejecuta `k6 run --summary-export=./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/k6_summary.json ./01_pruebas_automatizadas_cli/scripts/carga_k6.js`.
   - **Nota Crítica sobre `k6` en CMD:** Si el comando `k6` no es reconocido en el `PATH` actual de la consola, ejecútalo invocando directamente su binario de instalación en Windows: `"C:\Program Files\k6\k6.exe" run --summary-export=./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/k6_summary.json ./01_pruebas_automatizadas_cli/scripts/carga_k6.js`.

---

### FASE E: Sub-Agente Compilador ISO/IEC 25010 y Sincronización Final (`git` + `gh` CLI)
1. Lee todos los archivos `.json` generados en las fases A, B, C y D, y redacta un informe exhaustivo en `./01_pruebas_automatizadas_cli/RESUMEN_EJECUCION_TECNICA_PASO2.md` que incluya:
   - **Tabla 1: Línea Base de Conectividad y Red** (Ping en ms, Descarga/Subida en Mbps y validación de prerrequisito).
   - **Tabla 2: Resultados de Eficiencia de Desempeño** (LCP en segundos, Score de Lighthouse, peso total en KB/MB, número de peticiones HTTP, Tiempo de respuesta promedio en k6 con 50 VUs, p95 y tasa de fallos en %) comparados contra sus límites ($< 2.0\text{ s}$, $< 1\%$ error, LCP $< 2.5\text{ s}$) y su veredicto (**APRUEBA / REPRUEBA**).
   - **Tabla 3: Resultados de Adecuación Funcional y Capacidad de Interacción** (Hallazgos de buscador y contador de carrito, prueba negativa de pago con tarjeta alfabética en `Place Order`, inventario de fuentes y colores `#HEX`, conteo de enlaces HTTP 200 vs `href="#"` vs HTTP 404, y violaciones WCAG en axe-core) con su veredicto (**APRUEBA / REPRUEBA**).
2. Verifica con `git status` que `node_modules/` NO esté incluido.
3. Realiza el commit y push de todos los resultados técnicos:
   `git add 01_pruebas_automatizadas_cli/ package.json pnpm-lock.yaml PROMPT_AGENTE_QA*`
   `git commit -m "feat(qa): completa ejecucion automatizada multi-agente Paso 1 y Paso 2 ISO 25010"`
   `git push origin main`
4. Usa `gh` CLI para crear un Issue de seguimiento o resumen en el repositorio (`gh issue create --title "Entregable Bloque 1 Completado: Evidencias Automatizadas Paso 1 y Paso 2" --body-file ./01_pruebas_automatizadas_cli/RESUMEN_EJECUCION_TECNICA_PASO2.md`) de modo que los otros 3 integrantes vean el resumen directamente al entrar a GitHub, y muestra la URL final del repositorio en consola.