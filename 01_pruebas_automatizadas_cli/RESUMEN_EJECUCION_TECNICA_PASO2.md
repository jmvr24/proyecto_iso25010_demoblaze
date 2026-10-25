# Resumen de Ejecución Técnica — Paso 1 y Paso 2 (ISO/IEC 25010)

**Sistema Evaluado:** DemoBlaze E-Commerce (`https://www.demoblaze.com/index.html` y `https://api.demoblaze.com/entries`)  
**Marco Normativo:** ISO/IEC 25010 (Eficiencia de Desempeño, Adecuación Funcional y Capacidad de Interacción / Usabilidad)  
**Fecha de Ejecución Automatizada:** `2026-10-25T02:37:55.552Z` – `2026-10-25T02:42:56.293Z`  
**Resolución de Viewport Auditada:** `1280x800`  

---

## 1. Tabla 1: Línea Base de Conectividad y Red (Paso 1 — Prerrequisito ISO/IEC 25010)

**Archivo de evidencia fuente:** [`./01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json`](./evidencias/01_red_fast_cli/linea_base_red.json)  
**Fecha de medición:** `2026-10-25T02:42:21.803Z`

| Categoría / Herramienta | Métrica / Parámetro | Valor Medido Exacto | Criterio / Observación Técnica | Veredicto |
| :--- | :--- | :--- | :--- | :---: |
| **Entorno del Cliente** | Proveedor de Internet (ISP) | `Claro` | Extraído del DOM de `fast.com` (`userIsp`) | **INFO** |
| **Entorno del Cliente** | Ubicación del Cliente | `Neiva, CO` | IP Pública: `200.118.145.63` | **INFO** |
| **Entorno del Cliente** | Servidores de Medición | `Bogota, CO \| Miami, US` | `["Bogota, CO", "Miami, US"]` | **INFO** |
| **`fast-cli` (CLI Nativo)** | Velocidad de Descarga (`downloadSpeed`) | **`580 Mbps`** | Volumen descargado: `540 MB` (`> 10 Mbps` requerido) | **APRUEBA** |
| **`fast-cli` (CLI Nativo)** | Velocidad de Subida (`uploadSpeed`) | **`510 Mbps`** | Volumen subido: `2210 MB` (`> 5 Mbps` requerido) | **APRUEBA** |
| **`fast-cli` (CLI Nativo)** | Latencia en Reposo (`latency`) | **`10 ms`** | Latencia base hacia CDN (`< 100 ms` requerido) | **APRUEBA** |
| **`fast-cli` (CLI Nativo)** | Latencia bajo Carga (`bufferBloat`) | **`22 ms`** | Incremento bajo saturación de enlace (`+12 ms`) | **APRUEBA** |
| **Playwright (`fast.com` DOM)** | Velocidad de Descarga (`descarga_mbps`) | **`760 Mbps`** | Medición directa en navegador Chromium headless | **APRUEBA** |
| **Playwright (`fast.com` DOM)** | Velocidad de Subida (`subida_mbps`) | **`530 Mbps`** | Medición directa en navegador Chromium headless | **APRUEBA** |
| **Playwright (`fast.com` DOM)** | Latencia en Reposo (`latencia_ms`) | **`9 ms`** | Consistente con `fast-cli` (`10 ms`) | **APRUEBA** |
| **Playwright (`fast.com` DOM)** | Latencia bajo Carga (`latencia_bajo_carga_ms`) | **`13 ms`** | Bufferbloat mínimo (`+4 ms`) | **APRUEBA** |
| **Ping HTTP Frontend** | `https://www.demoblaze.com` (`HEAD`, 10 iter.) | Promedio: **`378.67 ms`**<br>Mín: **`266.05 ms`** / Máx: **`690.57 ms`** | 9/10 respuestas `HTTP 200 OK`; 1 muestra (`iteración 9`) con estado `ERROR` (`266.05 ms`) | **APRUEBA** |
| **Ping HTTP Backend API** | `https://api.demoblaze.com/entries` (`GET`, 10 iter.) | Promedio: **`337.61 ms`**<br>Mín: **`157.63 ms`** / Máx: **`1354.52 ms`** | 10/10 respuestas `HTTP 200 OK` (pico aislado de `1354.52 ms` en iteración 7) | **APRUEBA** |
| **Resumen Global Ping** | Consolidado Frontend + Backend (20 muestras) | Promedio: **`358.14 ms`**<br>Mín: **`157.63 ms`** / Máx: **`1354.52 ms`** | Latencia transatlántica/cloud estable hacia los servidores de DemoBlaze | **APRUEBA** |
| **Validación Prerrequisito** | `validacion_prerrequisito_iso25010` | `conexion_estable: true` | **`APRUEBA (Entorno de red apto para pruebas de Eficiencia de Desempeño)`** | **APRUEBA** |

---

## 2. Tabla 2: Resultados de Eficiencia de Desempeño (Paso 2 — Lighthouse + Grafana k6)

**Archivos de evidencia fuente:**
- [`./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json`](./evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json) (Lighthouse `v13.5.0`, `fetchTime: 2026-10-25T02:37:55.552Z`)
- [`./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.html`](./evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.html)
- [`./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/k6_summary.json`](./evidencias/04_desempeno_metricas_y_k6/k6_summary.json) (Grafana k6 con `50 VUs` concurrentes)

| Subcaracterística ISO 25010 | Herramienta | Métrica Técnica | Valor Obtenido Exacto | Umbral / Meta ISO 25010 | Veredicto Individual |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Comportamiento Temporal** | Lighthouse CLI | **Largest Contentful Paint (LCP)** | **`3.74 s`** (`3740.937 ms` / display: `"3.7 s"`, score: `0.57`) | `< 2.5 s` (`2500 ms`) | **REPRUEBA** |
| **Comportamiento Temporal** | Lighthouse CLI | **First Contentful Paint (FCP)** | **`1.79 s`** (`1790.937 ms` / display: `"1.8 s"`, score: `0.90`) | `< 1.8 s` (`1800 ms`) | **APRUEBA** |
| **Comportamiento Temporal** | Lighthouse CLI | **Total Blocking Time (TBT)** | **`108 ms`** (display: `"110 ms"`, score: `0.98`) | `< 200 ms` | **APRUEBA** |
| **Estabilidad Visual** | Lighthouse CLI | **Cumulative Layout Shift (CLS)** | **`0.235`** (`0.2349915653127912`, score: `0.53`) | `< 0.1` | **REPRUEBA** |
| **Comportamiento Temporal** | Lighthouse CLI | **Speed Index (SI)** | **`6.51 s`** (`6508.15 ms` / display: `"6.5 s"`, score: `0.39`) | `< 3.4 s` (`3400 ms`) | **REPRUEBA** |
| **Comportamiento Temporal** | Lighthouse CLI | **Time to Interactive (TTI)** | **`6.89 s`** (`6887.64 ms` / display: `"6.9 s"`, score: `0.54`) | `< 3.8 s` (`3800 ms`) | **REPRUEBA** |
| **Comportamiento Temporal** | Lighthouse CLI | **Server Response Time (TTFB Root Doc)** | **`1148 ms`** (display: `"Root document took 1,150 ms"`, score: `0`) | `< 600 ms` | **REPRUEBA** |
| **Score Global Categorías** | Lighthouse CLI | **Performance Score** | **`70 / 100`** (`0.70`) | `>= 90 / 100` (`0.90`) | **REPRUEBA** |
| **Score Global Categorías** | Lighthouse CLI | **Accessibility Score** | **`82 / 100`** (`0.82`) | `>= 90 / 100` (`0.90`) | **REPRUEBA** |
| **Score Global Categorías** | Lighthouse CLI | **Best Practices Score** | **`100 / 100`** (`1.00`) | `>= 90 / 100` (`0.90`) | **APRUEBA** |
| **Score Global Categorías** | Lighthouse CLI | **SEO Score** | **`82 / 100`** (`0.82`) | `>= 90 / 100` (`0.90`) | **REPRUEBA** |
| **Score Global Categorías** | Lighthouse CLI | **Agentic Browsing Score** | **`18 / 100`** (`0.18`) | Informativo (Lighthouse v13.5) | **INFO** |
| **Utilización de Recursos** | Lighthouse CLI | **Peso Total de Transferencia (`total-byte-weight`)** | **`1,426,268 Bytes`** (`1,392.84 KiB` / `"1,393 KiB"` / `1.43 MB`, score: `1.00`) | `< 1,600 KiB` (`~1.6 MB`) | **APRUEBA** |
| **Utilización de Recursos** | Lighthouse CLI | **Número de Peticiones HTTP (`network-requests`)** | **`31 peticiones`** (`30` en `resource-summary`: 12 img = `353,176 B`, 6 js = `292,125 B`, 4 css = `41,249 B`, 3 media = `548,780 B`, 1 font = `183,083 B`, 1 doc = `4,616 B`, 3 other = `3,239 B`) | `< 50 peticiones` | **APRUEBA** |
| **Capacidad y Comportamiento Temporal** | Grafana k6 (`50 VUs`) | **Tiempo de Respuesta Promedio (`http_req_duration.avg`)** | **`188.00 ms`** (`187.99866433823527 ms` / `0.188 s`) | **`< 2.0 s`** (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal** | Grafana k6 (`50 VUs`) | **Tiempo de Respuesta Mínimo (`http_req_duration.min`)** | **`68.92 ms`** (`68.9193 ms`) | `< 2.0 s` (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal** | Grafana k6 (`50 VUs`) | **Tiempo de Respuesta Mediana (`http_req_duration.med`)** | **`159.00 ms`** (`159.0007 ms` / `0.159 s`) | `< 2.0 s` (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal** | Grafana k6 (`50 VUs`) | **Percentil 90 (`http_req_duration.p(90)`)** | **`401.34 ms`** (`401.33587 ms` / `0.401 s`) | `< 2.0 s` (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal** | Grafana k6 (`50 VUs`) | **Percentil 95 (`http_req_duration.p(95)`)** | **`423.04 ms`** (`423.04468 ms` / `0.423 s`) | **`< 2.0 s`** (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal** | Grafana k6 (`50 VUs`) | **Tiempo de Respuesta Máximo (`http_req_duration.max`)** | **`1421.99 ms`** (`1421.986 ms` / `1.422 s`) | `< 2.0 s` (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal** | Grafana k6 (`50 VUs`) | **Tiempo de Espera TTFB (`http_req_waiting.avg` / `p(95)`)** | Promedio: **`178.09 ms`** / Mediana: **`154.66 ms`** / p95: **`414.88 ms`** | `< 2.0 s` (`2000 ms`) | **APRUEBA** |
| **Capacidad (Throughput)** | Grafana k6 (`50 VUs`) | **Tasa de Peticiones por Segundo (`http_reqs.rate` - RPS)** | **`52.60 req/s`** (`52.595666562462576 RPS`, `1632` peticiones HTTP en `816` iteraciones) | Soporte estable a `50 VUs` | **APRUEBA** |
| **Capacidad (Tráfico)** | Grafana k6 (`50 VUs`) | **Datos Recibidos / Enviados (`data_received` / `data_sent`)** | Recibidos: **`7,999,879 B`** (`257.82 KB/s`)<br>Enviados: **`357,889 B`** (`11.53 KB/s`) | Sin estrangulamiento de red | **APRUEBA** |
| **Capacidad / Fiabilidad en Carga** | Grafana k6 (`50 VUs`) | **Tasa de Fallos HTTP (`http_req_failed`) y `checks`** | **`0.00%`** (`value: 0`, `passes: 0` fallos de `1632` reqs)<br>Checks: **`1632 / 1632` (`100%`)** (`GET index.html`: 816 ok, `GET api/entries`: 816 ok) | **`< 1.0%`** (`rate < 0.01`) | **APRUEBA** |
| **VEREDICTO GLOBAL EFICIENCIA DE DESEMPEÑO** | **Lighthouse + k6** | **Consolidado de la Característica** | **Backend/API bajo carga de 50 VUs APRUEBA holgadamente (`avg = 188.00 ms`, `p95 = 423.04 ms`, `0.00%` error); Frontend reprueba LCP (`3.74 s > 2.5 s`) y CLS (`0.235 > 0.1`) por carga asíncrona de catálogo sin reserva de espacio en DOM.** | Cumplimiento mixto (Backend **APRUEBA** / Frontend **REPRUEBA** LCP) | **REPRUEBA PARCIAL (Condicionado por LCP > 2.5 s)** |

---

## 3. Tabla 3: Resultados de Adecuación Funcional y Capacidad de Interacción (Paso 2)

**Archivos de evidencia fuente:**
- [`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`](./evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json)
- [`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json`](./evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json)
- [`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json`](./evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json)
- [`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json`](./evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json)

| Subcaracterística ISO 25010 | Prueba / Herramienta Emulada | Hallazgo Técnico y Métricas Exactas del JSON | Severidad / Impacto | Veredicto |
| :--- | :--- | :--- | :---: | :---: |
| **Completitud Funcional** | Auditoría DOM de Buscador (`Playwright`) | **Ausencia total de buscador de productos:** `existeInputTypeSearch: false` (`0`), `existeInputPlaceholderSearch: false` (`0`), `existeRoleSearch: false`, `conteoInputsVisiblesEnHome: 0`. Los únicos `6` elementos `<input>` del DOM pertenecen a modales ocultos (`#exampleModal`, `#logInModal`, `#signInModal`). | **ALTA** | **REPRUEBA** |
| **Completitud Funcional** | Gestión de Cantidades en Carrito (`cart.html`) | **Imposibilidad de modificar cantidad unitaria:** `permiteCambiarCantidad: false` (`permiteModificarCantidadUnitaria: false`). La tabla `#tbodyid` solo muestra `Picture`, `Title`, `Price` y enlace `Delete`; no existe `<input type="number">` ni botones `+`/`-`. | **MEDIA** | **REPRUEBA** |
| **Corrección Funcional** | Flujo E2E Catálogo → Categoría → Detalle → Carrito | **Catálogo inicial:** 3 categorías (`Phones`, `Laptops`, `Monitors`) y `9` productos iniciales.<br>**Filtro `Laptops`:** Lista `6` productos (`Sony vaio i5`, `Sony vaio i7`, `MacBook air`, `Dell i7 8gb`, `2017 Dell 15.6 Inch`, `MacBook Pro`).<br>**Detalle (`prod.html?idp_=8`):** Muestra `Sony vaio i5`, precio `$790 *includes tax`, imagen `imgs/sony_vaio_5.jpg`.<br>**Carrito (`cart.html`):** Muestra `1` fila (`Sony vaio i5`, precio `790`) y total `#totalp = 790`. | **NINGUNA** | **APRUEBA** |
| **Pertinencia Funcional / Reconocibilidad** | Feedback `Add to cart` y Navbar `#cartur` | **Uso de `window.alert` nativo bloqueante y ausencia de badge en carrito:** Al pulsar `Add to cart`, se dispara un diálogo `alert` nativo con el texto exacto `"Product added"`. El enlace `#cartur` en la barra de navegación mantiene `innerHTML: "Cart"`, `childElementCount: 0`, `conteoBadgesEnNavbar: 0` y `existeContadorNumericoEnNavbar: false` tanto antes como después de agregar el ítem. | **MEDIA** | **REPRUEBA** |
| **Protección contra Errores de Usuario** | Inspección HTML5 del Modal `#orderModal` | **Cero validaciones declarativas HTML5:** Los 6 campos (`#name`, `#country`, `#city`, `#card`, `#month`, `#year`) son de tipo `type="text"` y tienen `required: false`, `pattern: null`, `minLength: null`, `maxLength: null` e `inputMode: null`. | **ALTA** | **REPRUEBA** |
| **Protección contra Errores de Usuario** | **Prueba Negativa 1:** Envío de `Place Order` con los 6 campos vacíos | Al ejecutar `purchaseOrder()` con `#name`, `#country`, `#city`, `#card`, `#month` y `#year` vacíos, el envío se bloquea (`bloqueoEnvio: true`) mediante un `window.alert` nativo con el texto exacto **`"Please fill out Name and Creditcard."`**. Ignora por completo la obligatoriedad de `Country`, `City`, `Month` y `Year`. | **ALTA** | **REPRUEBA** |
| **Protección contra Errores de Usuario** | **Prueba Negativa 2:** Pago con tarjeta alfabética `"TARJETA_FALSA_SIN_NUMEROS_ABC"` y campos vacíos | Al ingresar `name: "Usuario Prueba QA"`, `card: "TARJETA_FALSA_SIN_NUMEROS_ABC"` y dejar vacíos `country: ""`, `city: ""`, `month: ""`, `year: ""`, **el sistema NO rechaza la transacción** (`transaccionRechazada: false`, `compraProcesadaExitosamente: true`). Muestra el modal **`"Thank you for your purchase!"`** y genera el recibo:<br>`Id: 3747911` \| `Amount: 790 USD` \| `Card Number: TARJETA_FALSA_SIN_NUMEROS_ABC` \| `Name: Usuario Prueba QA` \| `Date: 24/9/2026`. | **CRÍTICA** | **REPRUEBA** |
| **Estética de la Interfaz (UI)** | Emulación **WhatFont + ColorZilla** (Estilos computados CSS) | **Tipografías:** Fuente principal `LatoWeb` (en `body`, `nav`, `.nav-link`, `.card-title`, `.card-title a`, `.card-text`, `a.btn-success` en `prod.html`, `footer`) e inconsistencia de familia tipográfica `sans-serif` en botones `<button>` (`.btn-primary` y `.btn-success` en `cart.html`).<br>**Escala tipográfica:** `body`: `14.6667px` (w:400, lh:22px), `.nav-link`: `16px` (w:700, lh:24px), `.card-title` y `.card-title a`: `24px` (w:500, lh:26.4px), `.card-text`: `14.6667px` (w:400, lh:24px), `.btn-primary`: `16px` (w:400, lh:20px), `.btn-success` (`prod.html`): `20px` (w:400, lh:25px), `.btn-success` (`cart.html`): `16px` (w:400, lh:20px), `footer`: `14.6667px` (w:400, lh:22px).<br>**Paleta `#HEX`:** Fondo navbar/footer `#292B2C`, fondo body `#FAFCFF`, fondo cards `#FFFFFF`, texto general/cards `#868688`, enlaces nav/botones `#FFFFFF`, primario y título de card `#0275D8`, botón de éxito `#34A853`. | **MEDIA** (Contraste insuficiente en `#868688` y `#34A853`) | **OBSERVACIÓN** |
| **Integridad de Enlaces e Imágenes** | Emulación **Check My Links** (`index.html`) | **Total elementos auditados:** `47` (`33` enlaces `<a>` + `14` imágenes `<img>`).<br>**Enlaces `<a>` (`33`):** `23` válidos con `HTTP 200 OK` (`69.7%`), **`10` anclas sin destino** con `href="#"` o `href=""` (`30.3%`: `Contact`, `About us`, `Log in`, `Log out`, `#nameofuser`, `Sign up`, `CATEGORIES`, `Phones`, `Laptops`, `Monitors`), `0` errores `HTTP 404/500`.<br>**Imágenes `<img>` (`14`):** `14` válidas con `HTTP 200 OK` (`100%`), `0` errores `HTTP 404/500`, **`11` imágenes sin atributo `alt`**.<br>**Consolidado global:** `37` HTTP 200 OK, `10` anclas vacías/hash, `0` enlaces/imágenes rotos (404/500). | **MEDIA** (`30.3%` de enlaces son `href="#"` no semánticos) | **REPRUEBA PARCIAL** |
| **Accesibilidad (WCAG 2.0/2.1 A y AA)** | **`@axe-core/playwright` v4.14.0** en `index.html` y `cart.html` | **Consolidado (2 páginas):** `11` reglas violadas acumuladas y **`45` nodos DOM afectados** (`critical: 2`, `serious: 3`, `moderate: 6`, `minor: 0`).<br>**1. `index.html` (`6` reglas violadas, `34` nodos afectados):**<br>- `critical` (`1` regla, `2` nodos): `image-alt` (2 logos `blazemeter-favicon-512x512.png` sin `alt`).<br>- `serious` (`2` reglas, `27` nodos): `color-contrast` (`18` nodos con `#868688` sobre `#ffffff`, ratio `3.63:1 < 4.5:1`) y `link-name` (`9` enlaces `<a href="prod.html?idp_=1..9">` sin texto accesible).<br>- `moderate` (`3` reglas, `5` nodos): `landmark-one-main` (`1` nodo), `page-has-heading-one` (`1` nodo), `region` (`3` nodos).<br>- `minor`: `0`.<br>**2. `cart.html` (`5` reglas violadas, `11` nodos afectados):**<br>- `critical` (`1` regla, `3` nodos): `image-alt` (2 logos + 1 imagen `imgs/sony_vaio_5.jpg` sin `alt`).<br>- `serious` (`1` regla, `2` nodos): `color-contrast` (enlace `Delete` `#0275d8` sobre `#f2f2f2` con ratio `4.13:1 < 4.5:1`, y botón `Place Order` `#ffffff` sobre `#34a853` con ratio `3.05:1 < 4.5:1`).<br>- `moderate` (`3` reglas, `6` nodos): `landmark-one-main` (`1` nodo), `page-has-heading-one` (`1` nodo), `region` (`4` nodos).<br>- `minor`: `0`. | **CRÍTICA / SERIA** | **REPRUEBA** |
| **VEREDICTO GLOBAL ADECUACIÓN E INTERACCIÓN** | **Playwright + axe-core** | **El sistema permite comprar con tarjetas alfabéticas falsas sin fecha de expiración ni país/ciudad, carece de buscador y de control de cantidad en carrito, abusa de `window.alert()` nativos y presenta 45 nodos con violaciones de accesibilidad WCAG.** | **CRÍTICA** | **REPRUEBA** |

---

## 4. Detalle de Inventario UI (Emulación WhatFont + ColorZilla)

Datos exactos extraídos de [`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json`](./evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json):

| Selector Auditado | Contexto de Página | Etiqueta | Fuente (`fontFamily`) | Tamaño (`fontSize`) | Peso (`fontWeight`) | Alto Línea (`lineHeight`) | Color Texto (`#HEX` / `RGB`) | Color Fondo Efectivo (`#HEX` / `RGB`) |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :--- | :--- |
| `body` | `index.html` | `<body>` | `LatoWeb` | `14.6667px` | `400` | `22px` | `#868688` (`rgb(134, 134, 136)`) | `#FAFCFF` (`rgb(250, 252, 255)`) |
| `nav` | `index.html` | `<nav>` | `LatoWeb` | `14.6667px` | `400` | `22px` | `#868688` (`rgb(134, 134, 136)`) | `#292B2C` (`rgb(41, 43, 44)`) |
| `.nav-link` | `index.html` | `<a>` | `LatoWeb` | `16px` | `700` | `24px` | `#FFFFFF` (`rgb(255, 255, 255)`) | `#292B2C` (`rgb(41, 43, 44)`) |
| `.card-title` | `index.html` | `<h4>` | `LatoWeb` | `24px` | `500` | `26.4px` | `#868688` (`rgb(134, 134, 136)`) | `#FFFFFF` (`rgb(255, 255, 255)`) |
| `.card-title a` | `index.html` | `<a>` | `LatoWeb` | `24px` | `500` | `26.4px` | `#0275D8` (`rgb(2, 117, 216)`) | `#FFFFFF` (`rgb(255, 255, 255)`) |
| `.card-text` | `index.html` | `<p>` | `LatoWeb` | `14.6667px` | `400` | `24px` | `#868688` (`rgb(134, 134, 136)`) | `#FFFFFF` (`rgb(255, 255, 255)`) |
| `.btn-primary` | `index.html` | `<button>` | `sans-serif` | `16px` | `400` | `20px` | `#FFFFFF` (`rgb(255, 255, 255)`) | `#0275D8` (`rgb(2, 117, 216)`) |
| `.btn-success` | `prod.html` | `<a>` | `LatoWeb` | `20px` | `400` | `25px` | `#FFFFFF` (`rgb(255, 255, 255)`) | `#34A853` (`rgb(52, 168, 83)`) |
| `.btn-success` | `cart.html` | `<button>` | `sans-serif` | `16px` | `400` | `20px` | `#FFFFFF` (`rgb(255, 255, 255)`) | `#34A853` (`rgb(52, 168, 83)`) |
| `footer` | `index.html` | `<footer>` | `LatoWeb` | `14.6667px` | `400` | `22px` | `#868688` (`rgb(134, 134, 136)`) | `#292B2C` (`rgb(41, 43, 44)`) |

---

## 5. Galería y Referencia de Evidencias Visuales (Capturas PNG) y Scripts Ejecutados

### 5.1. Capturas de Pantalla del Flujo Crítico y Pruebas Negativas (`1280x800`)

1. **Catálogo Inicial y Ausencia de Buscador (`01_home_catalogo.png`):**  
   - Ruta: [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/01_home_catalogo.png`](./evidencias/02_capturas_flujo/01_home_catalogo.png)  
   - Evidencia: Vista principal con las 3 categorías (`Phones`, `Laptops`, `Monitors`), 9 productos iniciales y ausencia total de barra de búsqueda.
2. **Vista de Detalle de Producto (`02_detalle_producto.png`):**  
   - Ruta: [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/02_detalle_producto.png`](./evidencias/02_capturas_flujo/02_detalle_producto.png)  
   - Evidencia: Producto `Sony vaio i5` (`prod.html?idp_=8`, `$790 *includes tax`) y botón `Add to cart` (`.btn-success` `#34A853`), sin contador numérico en el enlace `Cart` (`#cartur`) tras aceptar el `alert("Product added")`.
3. **Carrito de Compras sin Control de Cantidad (`03_carrito_compras.png`):**  
   - Ruta: [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/03_carrito_compras.png`](./evidencias/02_capturas_flujo/03_carrito_compras.png)  
   - Evidencia: Tabla `#tbodyid` en `cart.html` mostrando `Sony vaio i5` (`790`) y botón `Place Order`, evidenciando la ausencia de controles para incrementar o disminuir unidades.
4. **Modal de Checkout con Campos Vacíos — Prueba Negativa 1 (`04_modal_checkout_vacio.png`):**  
   - Ruta: [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/04_modal_checkout_vacio.png`](./evidencias/02_capturas_flujo/04_modal_checkout_vacio.png)  
   - Evidencia: Modal `#orderModal` con los 6 campos (`#name`, `#country`, `#city`, `#card`, `#month`, `#year`) sin atributos `required` ni mensajes de validación inline tras el `alert("Please fill out Name and Creditcard.")`.
5. **Fallo Crítico de Protección contra Errores — Prueba Negativa 2 (`05_fallo_proteccion_errores_checkout.png`):**  
   - Ruta: [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/05_fallo_proteccion_errores_checkout.png`](./evidencias/02_capturas_flujo/05_fallo_proteccion_errores_checkout.png)  
   - Evidencia: Confirmación exitosa `"Thank you for your purchase!"` (`Id: 3747911`, `Amount: 790 USD`) procesando `Card Number: TARJETA_FALSA_SIN_NUMEROS_ABC` con `Country`, `City`, `Month` y `Year` vacíos.

### 5.2. Scripts de Automatización Desarrollados y Ejecutados

- **Fase B (Paso 1 — Red y Conectividad):** [`./01_pruebas_automatizadas_cli/scripts/medir_red.mjs`](./scripts/medir_red.mjs)  
  Ejecuta `fast-cli --upload --json`, automatiza `https://fast.com` con Playwright y realiza 20 mediciones de latencia HTTP (`HEAD` a `https://www.demoblaze.com` y `GET` a `https://api.demoblaze.com/entries`).
- **Fase C (Paso 2 — Adecuación Funcional, UI, Enlaces y Accesibilidad WCAG):** [`./01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs`](./scripts/auditoria_funcional_ui.mjs)  
  Ejecuta el flujo E2E con Playwright (`1280x800`), toma las 5 capturas `.png`, ejecuta las pruebas negativas de `Place Order`, extrae los estilos computados CSS (WhatFont/ColorZilla), verifica el estado HTTP de los 47 recursos (Check My Links) y ejecuta `@axe-core/playwright` v4.14.0 en `index.html` y `cart.html`.
- **Fase D (Paso 2 — Eficiencia de Desempeño y Carga k6):** [`./01_pruebas_automatizadas_cli/scripts/carga_k6.js`](./scripts/carga_k6.js) + CLI de Lighthouse v13.5.0  
  Ejecuta el escenario de estrés de `50 VUs` concurrentes (`ramp-up 5s -> 50 VUs`, `plateau 20s @ 50 VUs`, `ramp-down 5s -> 0 VUs`) contra `https://www.demoblaze.com/index.html` y `https://api.demoblaze.com/entries`, exportando `k6_summary.json` junto con `lighthouse_report.report.json` y `lighthouse_report.report.html`.
