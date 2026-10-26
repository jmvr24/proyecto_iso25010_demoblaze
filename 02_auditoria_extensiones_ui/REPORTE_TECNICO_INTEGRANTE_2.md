# Reporte Técnico de Auditoría QA con Herramientas Web y Estándares UI (ISO/IEC 25010) — Integrante 2

- **Sistema Bajo Prueba (SUT):** DemoBlaze E-Commerce (`https://www.demoblaze.com/index.html`, `prod.html` y `cart.html`)
- **Marco Normativo:** ISO/IEC 25010 (Eficiencia de Desempeño y Capacidad de Interacción / Usabilidad)
- **Responsable:** Integrante 2 — Auditoría con Herramientas de Diagnóstico Web, Estándares W3C e Inspección UI
- **Entorno de Recolección:** Automatización directa con Playwright Chromium (`1440x900`), Google Lighthouse v13.5.0, PerformanceResourceTiming / CDP Network, W3C Nu Html Checker v26.10.18 e inspección programática DOM/CSS (`Check My Links`, `WhatFont` y `ColorZilla`)
- **Fecha de Ejecución (UTC):** `2026-10-26T03:42:57Z` – `2026-10-26T03:49:42Z`

---

## SECCIÓN 1: Validación de Conectividad y Línea Base de Red (Paso 1)

Antes de ejecutar mediciones de rendimiento sobre un sistema desplegado en la nube, el estándar **ISO/IEC 25010** exige certificar que el canal de comunicaciones del cliente no introduzca latencia parásita ni estrangulamiento de ancho de banda (*bandwidth throttling*).

### 1.1. Resultados Empíricos Obtenidos

- **Evidencia visual:** [`./capturas/01_speedtest.png`](./capturas/01_speedtest.png)
- **Registro estructurado:** [`./datos/01_red.json`](./datos/01_red.json)

![Captura 1 - Prueba de Conectividad y Línea Base de Red](./capturas/01_speedtest.png)

| Parámetro de Red Evaluado | Valor Real Obtenido | Umbral de Referencia del Equipo | Dictamen |
| :--- | :---: | :---: | :---: |
| **Ping / Latencia en Reposo (Descargada)** | **`11 ms`** | Estable (`< 100 ms`) | **CUMPLE** |
| **Velocidad de Descarga (Download)** | **`80 Mbps`** (`300 MB` transferidos) | **`> 30 Mbps`** | **CUMPLE** (`2.67x` el mínimo) |
| **Velocidad de Subida (Upload)** | **`88 Mbps`** (`280 MB` transferidos) | **`> 8 Mbps`** | **CUMPLE** (`11.0x` el mínimo) |
| **Latencia bajo Saturación Máxima (Cargada)** | `1.1 s` (`1,100 ms`) | Informativo (*bufferbloat* bajo estrés de `300 MB`) | **INFO** |
| **Ubicación y Nodos de Prueba** | Cliente: `Rivera, CO` | Servidores CDN: `Medellin, CO \| Bogota, CO \| Miami, US` | **INFO** |

### 1.2. Análisis Técnico de Conectividad

1. **Relación entre Subida (`88 Mbps`) y Bajada (`80 Mbps`) e influencia en la carga de activos web:**
   Se observa una diferencia de apenas **`+8 Mbps` (`+10%`)** a favor del enlace de subida, comportamiento característico de una conexión de **fibra óptica simétrica (FTTH)** con ligera ocupación concurrente en el canal descendente. En la arquitectura HTTP/1.1 y HTTP/2 de un e-commerce como DemoBlaze, la **velocidad de descarga (`80 Mbps` $\approx 10\text{ MB/s}$ teóricos)** es el factor determinante para transferir documentos HTML, hojas CSS, bundles JavaScript, fuentes tipográficas (`.woff2`), fotografías del catálogo (`.jpg`) y segmentos de video (`.ts`). Por su parte, contar con **`88 Mbps` de subida** garantiza que el envío de paquetes de control TCP (`SYN`, `ACK`), la negociación criptográfica TLS 1.3 y las peticiones `GET`/`POST` hacia `api.demoblaze.com` se transmitan de forma instantánea sin encolamiento de subida que degrade la ventana de recepción TCP.

2. **Significado técnico del Ping (`11 ms`) en la relación solicitud-respuesta:**
   El valor de **`11 ms`** mide el *Round-Trip Time* (RTT) en reposo: el tiempo exacto que tarda un paquete IP en viajar desde la estación de auditoría hasta el nodo de borde y regresar con su confirmación. Una latencia base de `11 ms` certifica una ruta óptica limpia y sin pérdida de paquetes en la última milla. Aunque bajo saturación extrema sostenida (`300 MB` continuos) el enrutador doméstico exhibe *bufferbloat* (`1.1 s`), la carga completa de DemoBlaze consume únicamente **`2.18 MB`**, volumen que una línea de `80 Mbps` despacha sin saturar las colas del módem. En consecuencia, cualquier tiempo de respuesta superior en las pruebas posteriores es atribuible exclusivamente a la infraestructura remota de DemoBlaze y a su código frontend.

3. **Validación del prerrequisito experimental ISO/IEC 25010:**
   Con **`80 Mbps` de descarga** (superando holgadamente el umbral de **`> 30 Mbps`**) y **`88 Mbps` de subida** (superando en once veces el umbral de **`> 8 Mbps`**), junto con un Ping estable de **`11 ms`**, queda técnicamente descartado que la red local sesgue las mediciones de *Comportamiento Temporal* y *Utilización de Recursos* del Paso 2.

---

## SECCIÓN 2: Evaluación de Eficiencia de Desempeño (PageSpeed Insights y Recursos GTmetrix)

### 2.1. Evidencias Recolectadas

- **Evidencia PageSpeed / Lighthouse:** [`./capturas/02_pagespeed.png`](./capturas/02_pagespeed.png) y [`./datos/02_pagespeed.json`](./datos/02_pagespeed.json)
- **Evidencia Recursos y Waterfall estilo GTmetrix:** [`./capturas/03_gtmetrix_recursos.png`](./capturas/03_gtmetrix_recursos.png) y [`./datos/03_recursos_gtmetrix.json`](./datos/03_recursos_gtmetrix.json)

![Captura 2 - Auditoría PageSpeed Insights / Lighthouse](./capturas/02_pagespeed.png)

![Captura 3 - Auditoría de Recursos y Cuellos de Botella estilo GTmetrix](./capturas/03_gtmetrix_recursos.png)

### 2.2. Tabla Comparativa de Métricas de Eficiencia de Desempeño

| Dimensión / Categoría | Métrica Evaluada | Valor Real Obtenido | Parámetro / Umbral de Decisión | Dictamen |
| :--- | :--- | :---: | :--- | :---: |
| **Puntuación Global PSI / Lighthouse** | **Rendimiento (Performance)** | **`54 / 100`** | `90–100` Verde (Óptimo) \| `50–89` Amarillo (Requiere mejora) \| `1–49` Rojo | **NO CUMPLE NIVEL ÓPTIMO** *(Amarillo: Requiere mejora)* |
| **Puntuación Global PSI / Lighthouse** | **Accesibilidad** | **`82 / 100`** | `>= 90 / 100` (Nivel óptimo) | **REQUIERE MEJORA** *(Amarillo)* |
| **Puntuación Global PSI / Lighthouse** | **Prácticas Recomendadas** | **`100 / 100`** | `>= 90 / 100` (Nivel óptimo) | **CUMPLE** *(Verde)* |
| **Puntuación Global PSI / Lighthouse** | **SEO** | **`82 / 100`** | `>= 90 / 100` (Nivel óptimo) | **REQUIERE MEJORA** *(Amarillo)* |
| **Comportamiento Temporal (Core Web Vitals)** | **First Contentful Paint (FCP)** | **`2.13 s`** (`2,127.67 ms` / `2,1 s`) | `< 1.8 s` (Bueno) | **REQUIERE MEJORA** |
| **Comportamiento Temporal (Core Web Vitals)** | **Largest Contentful Paint (LCP)** | **`7.08 s`** (`7,083.32 ms` / `7,1 s`) | **`< 2.5 s`** | **NO CUMPLE** *(Crítico: `2.83x` sobre el límite)* |
| **Interactividad / Bloqueo Hilo Principal** | **Total Blocking Time (TBT)** | **`248 ms`** (`250 ms`) | `< 200 ms` | **NO CUMPLE** *(Requiere mejora)* |
| **Estabilidad Visual (Core Web Vitals)** | **Cumulative Layout Shift (CLS)** | **`0.284`** (`0.2844`) | **`< 0.1`** | **NO CUMPLE** *(Crítico: `2.84x` sobre el límite)* |
| **Comportamiento Temporal** | **Speed Index (SI)** | **`3.14 s`** (`3,138.23 ms` / `3,1 s`) | `< 3.4 s` | **CUMPLE** |
| **Comportamiento Temporal** | **Time to Interactive (TTI)** | **`8.13 s`** (`8,125.76 ms` / `8,1 s`) | `< 3.8 s` | **NO CUMPLE** |
| **Cascada de Red (GTmetrix / Timing)** | **TTFB / DOMContentLoaded / Onload** | `262 ms` / `797 ms` / `0.82 s` (`819 ms`) | Respuesta base HTML rápida (`< 1.0 s`) | **CUMPLE** *(HTML base)* |
| **Cascada de Red (GTmetrix / Timing)** | **Tiempo Total de Carga (Fully Loaded)** | **`6.72 s`** (`6,722 ms`) | `< 3.0 s` deseable en e-commerce | **NO CUMPLE** |
| **Utilización de Recursos** | **Tamaño Total Transferido de Página** | **`2.18 MB`** (`2,230.24 KB` / `2,221 KiB`) | `< 1.6 MB` recomendado para catálogo inicial | **NO CUMPLE** *(Sobrecarga multimedia)* |
| **Utilización de Recursos** | **Número Total de Solicitudes HTTP** | **`31 solicitudes HTTP`** | `< 50 solicitudes` | **CUMPLE** |

### 2.3. Evaluación del LCP (`7.08 s`) y su Incidencia en SEO y Experiencia de Usuario (UX)

El **Largest Contentful Paint (LCP)** obtenido es de **`7.08 s` (`7,1 s` en interfaz)**, superando en **`+4.58 segundos`** (`+183%`) el umbral máximo de **`2.5 segundos`** exigido por nuestro equipo y por Google Core Web Vitals. Por esta razón, la métrica recibe una calificación prácticamente nula (`score: 0.05`) y arrastra la puntuación global de Rendimiento a **`54/100` (Amarillo)**.

- **Impacto directo en SEO:** Google emplea los *Core Web Vitals* (específicamente `LCP < 2.5 s`, `CLS < 0.1` e `INP < 200 ms`) como señal algorítmica de posicionamiento (*Page Experience Ranking Factor*). Un sitio con `LCP = 7.08 s` y `CLS = 0.284` queda clasificado en el rango **"Deficiente" (Rojo)** en Google Search Console, perdiendo visibilidad frente a competidores cuyo catálogo principal renderiza en menos de `2.5 s`.
- **Impacto en UX y tasa de abandono:** En comercio electrónico, el LCP mide el instante en que el usuario realmente visualiza el producto destacado o las tarjetas del catálogo. Retrasar este hito por encima de los `7 segundos` provoca una percepción de bloqueo o página vacía (*blank grid*), incrementando drásticamente la **tasa de rebote (*bounce rate*)** y el abandono prematuro antes siquiera de iniciar la selección de productos. Además, el **`CLS = 0.284`** desplaza bruscamente el layout cuando las imágenes cargan de forma tardía sin atributos `width`/`height`, induciendo clics erróneos.

### 2.4. Identificación Técnica de los Cuellos de Botella Principales

El desglose de red de [`03_recursos_gtmetrix.json`](./datos/03_recursos_gtmetrix.json) demuestra que el problema **no radica en la API de datos** (`api.demoblaze.com/entries` pesa apenas `1.61 KB` en XHR), sino en **tres cuellos de botella graves de arquitectura frontend**:

1. **Precarga innecesaria de streaming de video HLS para un modal oculto (`31.0%` del peso total sumando media + JS):**
   - Sin que el usuario haga clic en *"About us"* (`#videoModal`), la página principal descarga en segundo plano el segmento de video **`hls.demoblaze.com/about_demo_hls_600k00000.ts` (`529.52 KB`, `23.7%` de todo el peso del sitio)** más los manifiestos `.m3u8` (`535.90 KB` en `4` peticiones `Video/Media`).
   - Adicionalmente, carga de forma síncrona dos librerías pesadas de reproductor de video: **`video.min.js` (`155.16 KB`, el recurso más lento de toda la página con `455.4 ms`)** y **`videojs-contrib-hls.min.js` (`70.25 KB`, `442.9 ms`)**, bloqueando el hilo principal (`TBT = 248 ms`).
2. **Imágenes de catálogo y marca sin formatos de próxima generación (WebP/AVIF), sin compresión ni `loading="lazy"` (`1,169.71 KB` — `52.4%` del peso total en `12` solicitudes):**
   - Fotografías como **`Nexus_6.jpg` (`226.83 KB`, `284.2 ms`)** e **`iphone_6.jpg` (`196.57 KB`, `265.8 ms`)** se transfieren en JPEG sin redimensionar al tamaño real de la tarjeta `.card`. Asimismo, el ícono de la barra superior **`blazemeter-favicon-512x512.png` (`55.85 KB`, `443.3 ms`)** descarga un PNG de `512x512 px` para pintarlo a solo `50x50 px`.
3. **Dependencia en cascada secuencial (Waterfall Chaining) y fuente web pesada:**
   - La fuente **`Lato-Regular.woff2` (`178.80 KB`, `268.1 ms`)** carece de directiva `font-display: swap`. Por su parte, las tarjetas de productos dependen de que primero descarguen CSS/JS bloqueantes, luego se ejecute `index.js`, se consulte `api.demoblaze.com/entries` y recién a partir del milisegundo `1,221 ms` comience la descarga de las imágenes del catálogo, disparando el LCP hasta `7.08 s`.

---

## SECCIÓN 3: Evaluación de Integridad de Enlaces (Check My Links)

### 3.1. Conteo Exacto de Hipervínculos en `index.html`

- **Evidencia visual:** [`./capturas/04_check_my_links.png`](./capturas/04_check_my_links.png)
- **Registro estructurado:** [`./datos/04_enlaces.json`](./datos/04_enlaces.json)

![Captura 4 - Auditoría de Integridad de Enlaces estilo Check My Links](./capturas/04_check_my_links.png)

| Clasificación Check My Links | Indicador Visual | Cantidad Exacta | Porcentaje | Códigos HTTP / Patrón Detectado |
| :--- | :---: | :---: | :---: | :--- |
| **Total enlaces analizados (`<a>`)** | — | **`33`** | **`100.0%`** | Totalidad de etiquetas `<a>` en el DOM con catálogo cargado |
| **Enlaces válidos** | **Verde** | **`23`** | **`69.7%`** | **`HTTP 200 OK`** (`index.html`, `cart.html`, controles carrusel y `18` enlaces `prod.html?idp_=1..9`) |
| **Enlaces vacíos / Advertencias** | **Amarillo** | **`10`** | **`30.3%`** | Sin petición de navegación real: **`href="#"`** en modales y categorías |
| **Enlaces inválidos / Rotos** | **Rojo** | **`0`** | **`0.0%`** | **`0`** respuestas `HTTP 404 Not Found` o `HTTP 500 Internal Server Error` |

### 3.2. Análisis de Códigos HTTP e Impacto en la Operabilidad (ISO/IEC 25010)

- **Cumplimiento del umbral crítico (`0` enlaces `HTTP 404`):** Los `23` enlaces con ruta real resolvieron satisfactoriamente con código **`HTTP 200 OK`**. No existen vínculos huérfanos (`404 Not Found`) ni caídas de servidor (`500 Internal Server Error`) en la navegación hacia el detalle de producto (`prod.html?idp_=X`) ni hacia el carrito (`cart.html`), evitando bloqueos fatales en el flujo de compra.
- **Impacto negativo del abuso de `href="#"` (`30.3%` de los enlaces) sobre la Operabilidad:**
  Los **`10` enlaces amarillos** corresponden a cinco disparadores de modales/sesión en la barra superior (`Contact`, `About us`, `Log in`, `Log out`, `#nameofuser`, `Sign up`) y cuatro elementos del panel lateral de categorías (`CATEGORIES`, `Phones`, `Laptops`, `Monitors` con `onClick="byCat(...)"`). Emplear `<a href="#">` en lugar de `<button type="button">` o rutas con parámetros URL (`?cat=notebook`) degrada la **Operabilidad** de cuatro formas concretas:
  1. **Salto involuntario de scroll (*scroll-to-top*):** Al no invocar `event.preventDefault()`, pulsar cualquier categoría añade `#` a la URL (`index.html#`) y desplaza bruscamente la ventana al inicio de la página.
  2. **Ruptura de navegación estándar del navegador:** Si un comprador intenta hacer *"Clic derecho -> Abrir enlace en una pestaña nueva"* sobre `Laptops`, se abre nuevamente `index.html#` sin aplicar el filtro de portátiles, perdiendo contexto.
  3. **Inexistencia de historial y *deep-linking*:** El botón *Atrás* del navegador no restaura la categoría previa seleccionada por el usuario.
  4. **Confusión semántica para lectores de pantalla:** Anuncia como "enlace de navegación" controles que en realidad abren ventanas modales o ejecutan acciones JavaScript locales.

---

## SECCIÓN 4: Auditoría de Estándares de Código HTML (Validador W3C)

### 4.1. Clasificación de Errores (`Error`) y Advertencias (`Warning`) en W3C

- **Evidencia visual:** [`./capturas/05_w3c_validator.png`](./capturas/05_w3c_validator.png)
- **Registro estructurado:** [`./datos/05_w3c.json`](./datos/05_w3c.json)

![Captura 5 - Auditoría de Estándares HTML en W3C Nu Html Checker](./capturas/05_w3c_validator.png)

El servicio oficial **W3C Nu Html Checker (`v26.10.18`)** reportó un total de **`11` hallazgos** sobre `https://www.demoblaze.com/index.html`: **`7` Errores (`Error`)** y **`4` Advertencias (`Warning`)**, incumpliendo el umbral de `0 errores críticos de estructura HTML`.

| # | Severidad W3C | Ubicación Exacta | Regla / Mensaje Oficial W3C | Fragmento HTML Afectado |
| :-: | :---: | :--- | :--- | :--- |
| 1 | **`Error`** | Línea `384`, col `15–63` | `The value of the "for" attribute of the "label" element must be the ID of a non-hidden form control.` | `<label for="log-name" class="form-control-label">Username:</label>` *(el input real tiene `id="loginusername"`)* |
| 2 | **`Error`** | Línea `388`, col `15–63` | `The value of the "for" attribute of the "label" element must be the ID of a non-hidden form control.` | `<label for="log-pass" class="form-control-label">Password:</label>` *(el input real tiene `id="loginpassword"`)* |
| 3 | **`Error`** | Línea `392`, col `15–75` | `The value of the "for" attribute of the "label" element must be the ID of a non-hidden form control.` | `<label for="log-pass" id="errorl" class="form-control-label"></label>` |
| 4 | **`Error`** | Línea `435`, col `57–143` | `An "img" element must have an "alt" attribute, except under certain conditions.` | `<img width=50 height=50 style="margin-right:10px" src="blazemeter-favicon-512x512.png">` *(Navbar `#nava`)* |
| 5 | **`Error`** | Línea `504`, col `11–85` | `Duplicate ID "itemc".` | `<a href="#" id="itemc" onClick="byCat('notebook')" class="list-group-item">Laptops</a>` |
| 6 | **`Error`** | Línea `505`, col `11–84` | `Duplicate ID "itemc".` | `<a href="#" id="itemc" onClick="byCat('monitor')" class="list-group-item">Monitors</a>` |
| 7 | **`Error`** | Línea `555`, col `17–103` | `An "img" element must have an "alt" attribute, except under certain conditions.` | `<img width=50 height=50 style="margin-right:10px" src="blazemeter-favicon-512x512.png">` *(Footer)* |
| 8 | **`Warning`** | Línea `303`, col `11–57` | `This document has heading elements but none of them has a computed heading level of 1.` | Ausencia global de etiqueta `<h1>` (salta directamente a `<h4>`/`<h5>`) |
| 9–10 | **`Warning`** | Línea `503`, col `11–82` | `The first occurrence of ID "itemc" was here.` *(x2 referencias)* | `<a href="#" id="itemc" onClick="byCat('phone')" class="list-group-item">Phones</a>` |
| 11 | **`Warning`** | Línea `529`, col `3–51` | `The "type" attribute is unnecessary for JavaScript resources.` | `<script type="text/javascript" src="js/index.js"></script>` |

*(Nota técnica adicional: las imágenes de las tarjetas del catálogo inyectadas dinámicamente por JavaScript después de la carga inicial tampoco incluyen atributo `alt`, agravando el hallazgo #4 y #7 en tiempo de ejecución).*

### 4.2. Dictamen Técnico de Accesibilidad, Interoperabilidad y Protocolo de Reporte a Desarrollo

1. **Afectación a la Accesibilidad (WCAG 2.1 Nivel A) e Interoperabilidad Cross-Browser:**
   - **Ruptura de formularios asistivos (Errores #1, #2 y #3):** En el modal de inicio de sesión (`#logInModal`), los `<label>` apuntan a `log-name` y `log-pass`, identificadores inexistentes en el DOM. Como resultado, hacer clic sobre el texto *"Username:"* no enfoca el campo en ningún navegador, y lectores de pantalla (NVDA, JAWS, VoiceOver) anuncian los cuadros de texto como *"cuadro de edición en blanco"* sin contexto semántico.
   - **Imágenes mudas o ruidosas (Errores #4 y #7):** Sin atributo `alt`, las tecnologías de asistencia leen literalmente el nombre crudo del archivo (`"blazemeter-favicon-512x512.png"`) o ignoran el propósito del enlace de marca.
   - **Colisión en el árbol DOM (Errores #5 y #6):** La especificación W3C DOM exige que el atributo `id` sea único en todo el documento. Triplicar `id="itemc"` provoca que `document.getElementById('itemc')` devuelva exclusivamente el primer nodo (`Phones`) e invalida selectores `aria-labelledby` o pruebas automatizadas basadas en ID, generando comportamientos no deterministas entre motores Blink, Gecko y WebKit.
   - **Jerarquía documental rota (Warning #8):** Carecer de un `<h1>` impide a usuarios con discapacidad visual navegar por el esquema semántico principal de la tienda.

2. **Cómo reportar formalmente estos defectos al equipo de desarrollo:**
   Cada hallazgo debe registrarse en el gestor de incidencias (Jira / GitHub Issues) bajo severidad **Alta (Accesibilidad / Estándares W3C)** adjuntando: **(a)** URL y versión del validador (`vnu 26.10.18`), **(b)** línea y columna exactas del archivo `index.html`, **(c)** criterio WCAG/HTML5 infringido y **(d)** el parche exacto (*diff*):
   - *Corrección líneas `384–392`:* Cambiar `for="log-name"` por `for="loginusername"`, `for="log-pass"` por `for="loginpassword"` y reemplazar el `<label id="errorl">` vacío por `<div id="errorl" role="alert" aria-live="polite"></div>`.
   - *Corrección líneas `435` y `555`:* Añadir `alt="Product Store Logo"` (en enlace funcional) o `alt=""` (cuando acompaña al texto `"PRODUCT STORE"` como ícono decorativo).
   - *Corrección líneas `503–505`:* Sustituir el `id="itemc"` repetido por una clase común `class="list-group-item category-filter"` e IDs únicos (`id="cat-phones"`, `id="cat-laptops"`, `id="cat-monitors"`).
   - *Corrección jerarquía y scripts:* Incorporar un `<h1>` semántico para el catálogo y eliminar `type="text/javascript"` en `<script src="js/index.js">`.

---

## SECCIÓN 5: Auditoría de Diseño de Interfaces UI y Tipografía (WhatFont y ColorZilla)

### 5.1. Inventario Tipográfico y Paleta Cromática Extraída

- **Evidencia visual:** [`./capturas/06_whatfont_colorzilla.png`](./capturas/06_whatfont_colorzilla.png)
- **Registro estructurado:** [`./datos/06_estilos_ui.json`](./datos/06_estilos_ui.json)

![Captura 6 - Auditoría Tipográfica y Cromática estilo WhatFont y ColorZilla](./capturas/06_whatfont_colorzilla.png)

| Componente Evaluado | Vista | Selector / Etiqueta | `font-family` | `font-size` | `font-weight` | `line-height` | Color Texto (`#HEX`) | Color Fondo Efectivo (`#HEX` / Gradiente) |
| :--- | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Navbar — Marca** | `index.html` | `#nava` (`<a>`) | `LatoWeb` | `20px` | `700` | `30px` | `#FFFFFF` | `#292B2C` + `linear-gradient(135deg, #4C00FF, #00CFFF)` |
| **Navbar — Enlaces** | `index.html` | `nav .nav-link` (`<a>`) | `LatoWeb` | `16px` | `700` | `24px` | `#FFFFFF` | `#292B2C` + `linear-gradient(135deg, #4C00FF, #00CFFF)` |
| **Títulos de Productos** | `index.html` | `.card-title a` (`<a>`) | `LatoWeb` | `24px` | `500` | `26.4px` | `#0275D8` | `#FFFFFF` |
| **Precios en Catálogo** | `index.html` | `.card h5` (`<h5>`) | `LatoWeb` | `20px` | `500` | `22px` | `#868688` | `#FFFFFF` |
| **Descripción Tarjeta** | `index.html` | `.card-text` (`<p>`) | `LatoWeb` | `14.67px` | `400` | `24px` | `#868688` | `#FFFFFF` |
| **Precio en Detalle** | `prod.html` | `.price-container` (`<h3>`) | `LatoWeb` | `24px` | `300` | `26.4px` | `#292B2C` | `#FFFFFF` |
| **Botón `Add to cart`** | `prod.html` | `a.btn-success` (`<a>`) | `LatoWeb` | `20px` | `400` | `25px` | `#FFFFFF` | `#34A853` |
| **Botón `Place Order`** | `cart.html` | `button.btn-success` (`<button>`) | **`sans-serif`** | **`16px`** | `400` | `20px` | `#FFFFFF` | `#34A853` |
| **Botones de Modales** | `index.html` | `.btn-primary` (`<button>`) | **`sans-serif`** | `16px` | `400` | `20px` | `#FFFFFF` | `#0275D8` |
| **Footer Informativo** | `index.html` | `#fotcont` (`<div>`) | `LatoWeb` | `14.67px` | `400` | `22px` | `#FFFFFF` | Gradiente azul/violeta sobre `#FAFCFF` |
| **Footer Copyright** | `index.html` | `footer.py-5` (`<footer>`) | `LatoWeb` | `14.67px` | `400` | `22px` | `#868688` | `#292B2C` |

### 5.2. Dictamen sobre el Sistema de Diseño y la Estética UI (ISO/IEC 25010)

DemoBlaze **NO mantiene un sistema de diseño 100% uniforme**, sino una superposición híbrida e incompleta de **Bootstrap 4 Alpha 6 estándar** (`#0275D8` primario, `#292B2C` `bg-inverse`) con **reglas personalizadas de rebranding de BlazeMeter** (`LatoWeb`, verde `#34A853` y gradiente eléctrico `#4C00FF -> #00CFFF`). Esto genera tres fracturas directas en la subcaracterística **Estética de la interfaz de usuario**:

1. **Inconsistencia tipográfica entre enlaces y botones (`LatoWeb` vs. `sans-serif`):**
   La hoja personalizada define `font-family: LatoWeb` sobre el cuerpo del documento, pero en Bootstrap 4 Alpha los controles `<button>` aplican la regla nativa `font-family: sans-serif`. Como resultado, el botón **`Add to cart`** en `prod.html` (maquetado como `<a class="btn btn-success btn-lg">`) renderiza en **`LatoWeb` a `20px`**, mientras que el botón **`Place Order`** en `cart.html` y los botones **`Send message` / `Purchase`** (maquetados como `<button>`) renderizan en **`sans-serif` del sistema a `16px`**, rompiendo el requisito del **100% de uniformidad tipográfica**.
2. **Asimetría cromática y jerárquica en precios:**
   En el catálogo (`index.html`), los precios (`.card h5`) se muestran en gris atenuado `#868688` (`20px`, peso `500`), compitiendo débilmente con la descripción del producto, mientras que en el detalle (`prod.html`) cambian a gris carbón `#292B2C` (`24px`, peso ligero `300`).
3. **Déficit de legibilidad y contraste cromático (WCAG AA):**
   El uso de `#868688` sobre tarjetas blancas `#FFFFFF` arroja una relación de contraste de apenas **`3.63:1`** (inferior al mínimo normativo `4.5:1` para texto normal), y el botón primario de conversión **`Place Order`** (`#FFFFFF` sobre `#34A853` a `16px` regular) apenas alcanza **`3.05:1`**, restando nitidez visual y accesibilidad cromática en pantallas de brillo medio o usuarios con baja sensibilidad al contraste.

---

## SECCIÓN 6: Tabla Consolidada de Veredicto Preliminar (Integrante 2)

La siguiente matriz consolida todas las mediciones empíricas obtenidas en este bloque para su triangulación directa en el **Paso 4** con las pruebas CLI/k6 (Integrante 1) y el estudio UX/SUS con usuarios reales (Integrante 3):

| Dimensión ISO/IEC 25010 | Instrumento Aplicado | Métrica / Criterio Evaluado | Valor Real Obtenido | Umbral Exigido | Dictamen Final |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Prerrequisito Ambiental (Paso 1)** | FAST / Speedtest Web (`1440x900`) | Velocidad de Descarga / Subida y Ping local | **`80 Mbps` bajada / `88 Mbps` subida / `11 ms` ping** | `> 30 Mbps` bajada, `> 8 Mbps` subida y Ping estable | **CUMPLE** |
| **Eficiencia de Desempeño** *(Comportamiento Temporal)* | PageSpeed Insights / Lighthouse v13.5 | **Largest Contentful Paint (LCP)** | **`7.08 s`** (`7,1 s`) | **`< 2.5 s`** | **NO CUMPLE** |
| **Eficiencia de Desempeño** *(Score Global)* | PageSpeed Insights / Lighthouse v13.5 | **Puntuación Global de Rendimiento** | **`54 / 100`** *(Amarillo)* | `90–100` (Verde = Nivel óptimo) | **NO CUMPLE** *(Requiere mejora)* |
| **Eficiencia de Desempeño** *(Estabilidad y Bloqueo)* | PageSpeed Insights / Lighthouse v13.5 | **CLS** / **TBT** / **FCP** / **Speed Index** | CLS: **`0.284`** \| TBT: **`248 ms`** \| FCP: **`2.13 s`** \| SI: **`3.14 s`** | `CLS < 0.1`, `TBT < 200 ms`, `FCP < 1.8 s`, `SI < 3.4 s` | **NO CUMPLE** *(Solo aprueba SI)* |
| **Eficiencia de Desempeño** *(Utilización de Recursos)* | Telemetría GTmetrix-Style (ResourceTiming + CDP) | Tiempo Fully Loaded, Peso Total y Solicitudes HTTP | **`6.72 s`** \| **`2.18 MB`** (`2,230.24 KB`) \| **`31 reqs`** | Sin cuellos de botella multimedia (`< 1.6 MB`, `< 3.0 s`) | **NO CUMPLE** *(52.4% img + 24.0% video HLS oculto)* |
| **Capacidad de Interacción** *(Operabilidad — Enlaces Rotos)* | Auditoría DOM + HTTP Check My Links | Enlaces rotos con error `HTTP 404 / 500` | **`0 enlaces rotos`** (`23/33` con `HTTP 200 OK`) | **`0` enlaces rotos `HTTP 404` permitidos** | **CUMPLE** |
| **Capacidad de Interacción** *(Operabilidad — Navegación)* | Auditoría DOM + HTTP Check My Links | Enlaces vacíos o anclas sin destino (`href="#"`) | **`10 enlaces` (`30.3%`) con `href="#"`** | Navegación semántica sin saltos de scroll ni anclas vacías | **NO CUMPLE** *(Degrada operabilidad)* |
| **Capacidad de Interacción** *(Accesibilidad e Interoperabilidad)* | Validador de Marcado W3C (`vnu 26.10.18`) | Errores críticos de estructura y semántica HTML5 | **`7 Errores` y `4 Advertencias`** (`id="itemc"` duplicado, `img` sin `alt`, `label for` rotos, sin `<h1>`) | **`0` errores críticos de estructura HTML** | **NO CUMPLE** |
| **Capacidad de Interacción** *(Estética UI — Sistema de Diseño)* | Auditoría CSS WhatFont y ColorZilla | Uniformidad tipográfica (`100%`) y consistencia cromática | **`2` fuentes (`LatoWeb` vs `sans-serif` en `<button>`)**, asimetría `20px` vs `16px` en CTAs y contraste `3.05:1–3.63:1` | **100% de uniformidad tipográfica** y paleta accesible consistente | **NO CUMPLE** |
