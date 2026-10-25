# Guía Maestra de Estudio y Sustentación Grupal — Evaluación ISO/IEC 25010 en DemoBlaze

**Propósito:** Material de estudio rápido y riguroso para los **4 integrantes del equipo** de cara a la sustentación ante la docente. Todos los argumentos están respaldados por los **datos numéricos reales** obtenidos en nuestras pruebas automatizadas sobre `https://www.demoblaze.com/index.html` y `https://api.demoblaze.com/entries`.

---

## 1. Resumen Ejecutivo ("Cheat Sheet" para Memorizar en 5 Minutos)

| Dimensión / Paso | Herramienta Usada | Métrica Clave Real | Umbral ISO/IEC 25010 | Veredicto | Dato Clave para la Docente |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Paso 1: Línea Base Red** | `fast-cli` + Playwright (`fast.com`) | Descarga: **`580–760 Mbps`**<br>Subida: **`510–530 Mbps`**<br>Latencia local: **`9–10 ms`** | `> 10 Mbps` descarga<br>`< 100 ms` latencia | **APRUEBA** | ISP Claro (Neiva, CO). El canal local no tiene *bufferbloat* (`13–22 ms`) ni introduce sesgo en las pruebas. |
| **Paso 1: Ping a DemoBlaze** | Node.js `fetch` (20 muestras) | Global: **`358.14 ms`**<br>Web (`HEAD`): **`378.67 ms`**<br>API (`GET`): **`337.61 ms`** | `< 1000 ms` | **APRUEBA** | Mínimo de `157.63 ms` (con Keep-Alive) y pico máximo de `1354.52 ms` por *cold start* en la nube. |
| **Eficiencia: Comportamiento Temporal (Frontend)** | Google Lighthouse `v13.5.0` | **LCP: `3.74 s`** (`3740.94 ms`)<br>**FCP: `1.79 s`** \| **TBT: `108 ms`**<br>**CLS: `0.235`** \| **SI: `6.51 s`**<br>**TTI: `6.89 s`** \| **TTFB: `1148 ms`** | **LCP `< 2.5 s`**<br>FCP `< 1.8 s`<br>TBT `< 200 ms`<br>CLS `< 0.1` | **REPRUEBA**<br>*(por LCP y CLS)* | Scores Lighthouse: **Performance `70`**, **Accessibility `82`**, **Best Practices `100`**, **SEO `82`**. |
| **Eficiencia: Utilización de Recursos** | Google Lighthouse `v13.5.0` | Peso total: **`1,392.84 KiB`** (`1.43 MB` / `1,426,268 B`)<br>Peticiones HTTP: **`31 reqs`** | `< 1,600 KiB`<br>`< 50 peticiones` | **APRUEBA** | Mayor peso en Media/HLS (`548.8 KB`), 12 imágenes (`353.2 KB`), 6 scripts JS (`292.1 KB`) y 1 fuente (`183.1 KB`). |
| **Eficiencia: Capacidad y Concurrencia** | Grafana `k6` (**`50 VUs`** durante `30 s`) | Promedio: **`188.00 ms`**<br>Mediana: **`159.00 ms`**<br>**`p(95)`: `423.04 ms`**<br>Tasa de error: **`0.00%`** | `avg < 2.0 s`<br>`p(95) < 2.0 s`<br>`error < 1.0%` | **APRUEBA** | **`1,632` peticiones HTTP** (`816` iteraciones), throughput de **`52.60 req/s`** y `100%` de *checks* exitosos. |
| **Adecuación Funcional** | Playwright E2E (`1280x800`) | Buscador: **`0` inputs**<br>Control cantidad carrito: **No existe**<br>Badge en `#cartur`: **`0` (No existe)** | Búsqueda, gestión de ítems y feedback claro | **REPRUEBA** | El flujo de compra básico funciona (`Sony vaio i5` a `$790`), pero usa `window.alert("Product added")` bloqueante. |
| **Capacidad de Interacción: Protección contra Errores** | Playwright (Pruebas Negativas en `#orderModal`) | Vacío: `alert("Please fill out Name and Creditcard.")`<br>Tarjeta `"TARJETA_FALSA_SIN_NUMEROS_ABC"`: **Compra aprobada** | Rechazar tarjetas no numéricas y exigir todos los campos | **REPRUEBA CRÍTICO** | Los 6 inputs carecen de `required`/`pattern`. `purchaseOrder()` en `js/cart.js` ignora `#country`, `#city`, `#month` y `#year`. |
| **Capacidad de Interacción: Enlaces e Imágenes** | Emulación Check My Links (`47` nodos) | Enlaces (`33`): **`23` HTTP 200** (`69.7%`), **`10` `href="#"`** (`30.3%`)<br>Imágenes (`14`): **`14` HTTP 200**, **`11` sin `alt`** | `0` enlaces rotos (`404/500`) y enlaces semánticos | **REPRUEBA PARCIAL** | No hay errores `404/500`, pero el `30.3%` de los `<a>` son anclas vacías (`href="#"`) para disparar JS. |
| **Capacidad de Interacción: Accesibilidad WCAG** | `@axe-core/playwright` `v4.14.0` | **`11` reglas violadas** acumuladas<br>**`45` nodos DOM afectados**<br>(`2` críticas, `3` serias, `6` moderadas) | `0` violaciones críticas o serias en WCAG 2.1 A/AA | **REPRUEBA** | `index.html`: `6` reglas / `34` nodos.<br>`cart.html`: `5` reglas / `11` nodos.<br>Falla en `image-alt`, `color-contrast` y `link-name`. |

---

## 2. Respuestas Fundamentadas a las Preguntas del Taller QA Aplicadas a DemoBlaze

### 2.1. ¿Cuál es el impacto del Ping y del Ancho de Banda en las pruebas de Eficiencia de Desempeño?
- **Respuesta Técnica:** En el **Paso 1** comprobamos que nuestra conexión local en Neiva (Claro Fibra) entrega **`580–760 Mbps` de descarga**, **`510–530 Mbps` de subida** y **`9–10 ms` de latencia local**, mientras que el **Ping HTTP hacia DemoBlaze promedia `358.14 ms`** (`378.67 ms` al frontend web y `337.61 ms` a la API `/entries`).
- **Por qué importa:** Esto demuestra científicamente que el cuello de botella **no está en la red del evaluador**. Además, conocer que un viaje redondo HTTP (*Round-Trip Time*) hacia los servidores internacionales de DemoBlaze toma `~358 ms` en frío y `~158–188 ms` con conexiones *Keep-Alive* reutilizadas explica por qué el documento raíz en Lighthouse tuvo un TTFB de `1,148 ms` (establecimiento TCP + handshake TLS + respuesta del servidor) y por qué en `k6`, una vez abiertas las conexiones TLS de los 50 VUs, el tiempo promedio bajó a **`188.00 ms`**.

### 2.2. ¿Cómo se relaciona el LCP obtenido (`3.74 s`) con el SEO y la tasa de abandono de usuarios?
- **Respuesta Técnica:** Google establece dentro de sus **Core Web Vitals** que el *Largest Contentful Paint (LCP)* debe ser **`< 2.5 s`** para clasificar una experiencia como "Buena". En DemoBlaze obtuvimos un **LCP de `3.74 s` (`3,740.94 ms`)**, junto con un **Speed Index de `6.51 s`**, un **TTI de `6.89 s`** y un **CLS de `0.235`** (más del doble del límite de `0.1`).
- **Impacto en SEO y Negocio:**
  1. **Penalización en el algoritmo de Page Experience de Google:** Un LCP en la franja de `> 2.5 s` y un CLS de `0.235` reducen el posicionamiento orgánico (SEO), sumado a que la página carece de `<meta name="description">` con contenido y no tiene etiqueta `<h1>` (SEO Score de `82/100`).
  2. **Tasa de rebote (*Bounce Rate*) en E-Commerce:** En comercio electrónico, superar los `3 segundos` en la renderización del catálogo principal incrementa la probabilidad de abandono en más de un `32%`. El usuario ve primero una estructura vacía y, cuando finalmente llegan las imágenes de `1366x768` desde `GET /entries` sin atributos `width`/`height`, toda la página sufre un desplazamiento brusco (*Layout Shift* de `0.235`).

### 2.3. ¿Qué cuellos de botella de red y arquitectura cliente se detectaron?
1. **Cascada de Peticiones (*Request Waterfall*) en el Catálogo (`index.html`):** El navegador primero debe descargar el HTML (`1,148 ms`), luego parsear `jquery.min.js`, `video.min.js` (`292.1 KB` en 6 scripts JS), luego pedir `config.json` y recién ahí ejecutar `GET https://api.demoblaze.com/entries` para descubrir las URLs de las 9 imágenes de producto.
2. **Carga innecesaria del reproductor de video HLS en todas las páginas:** Aunque el usuario jamás abra el modal `"About us"` (`#videoModal`), `index.html`, `prod.html` y `cart.html` descargan e inicializan `video.min.js` y `videojs-contrib-hls.min.js`, transfiriendo **`548.8 KB` de recursos multimedia** (`38.5%` del peso total de `1,392.84 KiB`).
3. **Problema de Consultas $N+1$ en el Carrito (`js/cart.js`):** Al abrir `cart.html`, el script llama a `POST /viewcart` y luego, dentro de un `data.Items.forEach(...)`, dispara **una petición `POST /view` separada por cada ítem del carrito**, recalculando y vaciando `#totalp` en cada callback asíncrono.

### 2.4. ¿Qué significan los códigos HTTP de los enlaces (`200 OK` vs. `href="#"`) detectados en DemoBlaze?
- **Respuesta Técnica:** De los **47 elementos** auditados en `index.html` (`33` enlaces `<a>` y `14` imágenes `<img>`), **ninguno dio error `HTTP 404` ni `HTTP 500`** (`37` recursos respondieron `HTTP 200 OK`: `23` enlaces y `14` imágenes).
- **El problema del `30.3%` de anclas vacías (`10` de `33` enlaces con `href="#"` o `href=""`):** Enlaces como `Contact`, `About us`, `Log in`, `Sign up`, `Phones`, `Laptops` y `Monitors` usan `<a href="#" onclick="...">` en lugar de `<button type="button">`. Esto es una mala práctica de **Operabilidad**:
  - Al hacer clic en `Phones` (`href="#"`), el navegador agrega `#` a la URL y fuerza un salto de scroll hacia el inicio de la página.
  - Si un usuario intenta abrir el enlace en una pestaña nueva (clic central), abre una copia duplicada del Home en vez de ejecutar la acción.
  - En las funciones de paginación `#next2` y `#prev2` (`js/index.js`, líneas 2268 y 2293), el desarrollador dejó `<a href="#">` alrededor de la imagen del producto, haciendo que al cambiar de página **las fotos de los productos dejen de ser clicables**.

### 2.5. ¿Qué hallazgos arrojó la auditoría de Fuentes y Colores (WhatFont y ColorZilla) en el DOM?
- **Inconsistencia Tipográfica:** El sitio carga la fuente `LatoWeb` (`14.6667px` en `body`, `16px bold` en `.nav-link`, `24px medium` en `.card-title`). Sin embargo, los botones nativos `<button>` (`.btn-primary` en modales y `.btn-success` `"Place Order"` en `cart.html`) muestran `font-family: sans-serif` (`16px`), mientras que el botón `"Add to cart"` en `prod.html` (que es un `<a class="btn btn-success btn-lg">`) usa `LatoWeb` a `20px`.
- **Fallo de Contraste Cromático en la Paleta `#HEX`:**
  - El texto general y los precios `<h5>` usan gris `#868688` sobre tarjetas blancas `#FFFFFF`, dando un ratio de contraste de **`3.63:1`**, que **reprueba el mínimo de `4.5:1` de WCAG 2.1 AA** (`18` nodos afectados en `index.html`).
  - El botón de éxito `.btn-success` (`Place Order`) usa texto blanco `#FFFFFF` sobre fondo verde `#34A853`, con un ratio de apenas **`3.05:1`** (`< 4.5:1`).
  - El enlace `Delete` en la tabla del carrito usa azul `#0275D8` sobre fila gris `#F2F2F2`, dando **`4.13:1`** (`< 4.5:1`).

### 2.6. ¿Por qué ocurre la vulnerabilidad de validación en el Checkout (`Place Order`)?
- **Respuesta desde el Código Fuente (`js/cart.js`, líneas 2641–2668):**
  En la función `purchaseOrder()`, el código cliente únicamente declara:
  ```javascript
  var name = document.getElementById("name").value;
  var creditcard = document.getElementById("card").value;
  if (name == "" || creditcard == "") {
    alert("Please fill out Name and Creditcard.");
  } else {
    // Borra el carrito y lanza swal("Thank you for your purchase!")
  }
  ```
  - **Causa 1:** Los inputs `#country`, `#city`, `#month` y `#year` ni siquiera se leen en JavaScript (son *dead inputs*).
  - **Causa 2:** No existe validación de expresión regular (`/^\d{13,19}$/`) ni suma de verificación del **Algoritmo de Luhn** sobre `#card`. Por eso en nuestra **Prueba Negativa 2** ingresamos `"TARJETA_FALSA_SIN_NUMEROS_ABC"` y el sistema emitió una orden exitosa por `790 USD` (`Id: 3747911`).

---

## 3. Preguntas Difíciles de Sustentación (Defensa Oral ante la Docente)

### Pregunta 1: *"¿Cómo midieron Eficiencia de Desempeño (Comportamiento Temporal, Utilización de Recursos y Capacidad) si ustedes no tienen acceso al servidor backend de DemoBlaze?"*
> **Respuesta Modelo:**  
> "Bajo el estándar **ISO/IEC 25010**, la Eficiencia de Desempeño se evalúa mediante pruebas de **caja negra e instrumentación de extremo a extremo (E2E)** desde la perspectiva del cliente y del protocolo HTTP:
> 1. **Para aislar la red local (Paso 1):** Primero medimos nuestra línea base (`580–760 Mbps` y ping HTTP base de `358.14 ms` hacia DemoBlaze), de modo que conocíamos exactamente el tiempo de transporte de red.
> 2. **Para Comportamiento Temporal y Utilización de Recursos en el navegador:** Instrumentamos **Google Lighthouse v13.5.0** sobre Chromium, que inspecciona las trazas del motor Blink/V8 y del panel de red para medir tiempos exactos de renderizado (`FCP = 1.79 s`, `LCP = 3.74 s`, `TBT = 108 ms`, `TTFB = 1148 ms`) y el consumo real de ancho de banda y objetos del navegador (`31 peticiones HTTP` y `1,392.84 KiB` transferidos).
> 3. **Para Capacidad bajo concurrencia:** Con **Grafana k6** generamos una carga concurrente real de **50 Usuarios Virtuales (`50 VUs`)** ejecutando `1,632 peticiones` (`52.60 req/s`) contra el frontend (`index.html`) y el backend (`api.demoblaze.com/entries`), midiendo directamente el tiempo de procesamiento del servidor mediante la métrica `http_req_waiting` (TTFB promedio de **`178.09 ms`** y `p(95)` de **`414.88 ms`**) y la tasa de fallos (`0.00%`). Así separamos con precisión matemática el rendimiento del backend de los cuellos de botella de renderizado del frontend."

---

### Pregunta 2: *"¿Por qué en k6 con 50 usuarios el tiempo promedio fue de `188 ms` (APRUEBA), pero en Lighthouse el LCP fue de `3.74 s` (REPRUEBA)? ¿Acaso los datos se contradicen?"*
> **Respuesta Modelo:**  
> "No se contradicen; al contrario, se complementan y demuestran por qué es indispensable usar ambos instrumentos:
> - **`k6` mide el protocolo HTTP puro (capa de transporte y respuesta de API/HTML)** sin ejecutar JavaScript ni renderizar píxeles ni descargar imágenes o videos. Los `188.00 ms` promedio (`p95 = 423.04 ms`) demuestran que el servidor web y la API REST `/entries` responden muy rápido incluso con 50 usuarios simultáneos.
> - **Lighthouse mide el ciclo de vida completo en el navegador real:** descargar el HTML (`1,148 ms`), descargar y compilar `292 KB` de JavaScript (`jquery`, `bootstrap`, `video.js` de `548 KB`), pedir `config.json`, hacer el `GET /entries` asíncrono y finalmente descargar y pintar las imágenes de `1366x768 px` en el DOM (`LCP = 3.74 s`). Es decir, el servidor es rápido, pero la arquitectura de carga en el frontend es ineficiente."

---

### Pregunta 3: *"¿Por qué eligieron esas subcaracterísticas específicas de Adecuación Funcional y Capacidad de Interacción (Usabilidad) para auditar un E-Commerce?"*
> **Respuesta Modelo:**  
> "Seleccionamos las subcaracterísticas críticas para la conversión y la confianza transaccional en una tienda en línea según **ISO/IEC 25010**:
> 1. **Completitud y Pertinencia Funcional:** En un catálogo de comercio electrónico, encontrar un producto (buscador) y gestionar el carrito (modificar cantidades y ver cuántos ítems llevo en el navbar) son funciones primarias. Nuestra auditoría demostró la ausencia del buscador (`0` inputs), la imposibilidad de cambiar cantidades en `cart.html` y la ausencia de un *badge* numérico en `#cartur`.
> 2. **Protección contra Errores de Usuario:** En un flujo de pago (`Place Order`), el sistema debe impedir que el usuario cometa errores al digitar su tarjeta o su dirección. DemoBlaze falló críticamente al aceptar `"TARJETA_FALSA_SIN_NUMEROS_ABC"` sin fecha ni país.
> 3. **Reconocibilidad / Estética de la Interfaz y Operabilidad:** Evaluamos la consistencia visual (`LatoWeb` vs `sans-serif`), el uso de `window.alert` bloqueantes y la operabilidad de los enlaces (`30.3%` son `href="#"`).
> 4. **Accesibilidad (WCAG 2.1 A/AA):** Un sistema de calidad debe ser utilizable por personas con discapacidad visual o motora; con `@axe-core/playwright` detectamos `45` nodos con fallos reales de contraste (`3.63:1` y `3.05:1`), enlaces sin nombre accesible (`link-name`) e imágenes sin `alt` (`image-alt`)."

---

### Pregunta 4: *"¿Cómo se conectan estos resultados técnicos del Paso 1 y Paso 2 con la Investigación de Usuarios (Paso 3 - SUS) y con el Plan de Mejora (Paso 5)?"*
> **Respuesta Modelo:**  
> "Existe una trazabilidad directa entre nuestros hallazgos automatizados y la experiencia de los usuarios reales:
> - Las fricciones que sufren los 5 usuarios en la **Observación Directa y el Cuestionario SUS (Paso 3)** —como no encontrar un buscador, no saber si el producto se agregó al carrito porque `#cartur` no tiene contador, o sorprenderse de que el checkout acepte datos incompletos— tienen su explicación técnica exacta en nuestros reportes JSON del **Paso 2**.
> - A su vez, en el **Análisis de Causa Raíz (`root_cause_codigo_cliente.md`)** ya localizamos las funciones exactas (`purchaseOrder()` en `js/cart.js`, `addToCart()` en `js/prod.js` y el renderizado de tarjetas en `js/index.js`) y diseñamos la refactorización con algoritmo de Luhn, *toast* reactivo con *badge* en `#cartur` y corrección de contraste WCAG AA (`#4A4A4F` y `#1E7E34`) para el **Paso 5**."

---

## 4. Distribución Sugerida de Roles para la Sustentación (4 Integrantes)

1. **Integrante 1 (Arquitectura de Automatización CLI, Red y Desempeño — Pasos 1 y 2):** Explica la línea base (`fast-cli` + ping `358.14 ms`), resultados de Lighthouse (`LCP 3.74 s`, `CLS 0.235`, `31 reqs`, `1.43 MB`), prueba de concurrencia en `k6` (`50 VUs`, `avg 188 ms`, `p95 423.04 ms`, `0%` fallos) y el análisis de código fuente (`root_cause_codigo_cliente.md`).
2. **Integrante 2 (Auditoría con Extensiones y Herramientas Web — Paso 2):** Contrasta los resultados de las extensiones visuales (Speedtest, PageSpeed Insights, GTmetrix, Check My Links, Validador W3C, WhatFont y ColorZilla) con los JSON obtenidos por CLI.
3. **Integrante 3 (Investigación con Usuarios Reales y UX — Paso 3):** Presenta la población/muestra ($n = 5$), la matriz de observación directa y el cálculo del puntaje **SUS (System Usability Scale)**, vinculando las quejas de los usuarios con la falta de buscador, los `alert()` nativos y el fallo del checkout.
4. **Integrante 4 (Síntesis ISO/IEC 25010, Casos de Uso y Plan de Acción — Pasos 4 y 5):** Presenta el mapeo arquitectónico, los diagramas de Casos de Uso y la priorización de mejoras del Paso 5 fundamentada en las métricas y en las refactorizaciones propuestas.
