# Evaluación Técnica de Calidad de Software (ISO/IEC 25010) — Desarrollo Metodológico de los Pasos 1 y 2

**Sistema bajo Prueba (SUT):** Plataforma de Comercio Electrónico DemoBlaze (`https://www.demoblaze.com/index.html` y `https://api.demoblaze.com/entries`)  
**Estándar de Referencia:** ISO/IEC 25010 — Modelo de Calidad del Producto Software (Eficiencia de Desempeño, Adecuación Funcional y Capacidad de Interacción / Usabilidad)  
**Entorno de Ejecución:** Windows 11 (x64), Node.js ES Modules (`type: "module"`), gestor de paquetes estricto `pnpm` (`^12.15.0`), Playwright (`v1.64.1`), `@axe-core/playwright` (`v4.14.0`), Google Lighthouse (`v13.5.0`) y Grafana `k6`.

---

## Paso 1: Preparación del Entorno y Línea Base de Conectividad

### 1.1. Metodología y Aislamiento del Entorno de Pruebas
Previo a la ejecución de cualquier instrumento de medición sobre un sistema desplegado en producción en la nube, la ingeniería de calidad de software bajo el estándar **ISO/IEC 25010** exige establecer una **Línea Base de Conectividad y Red**. Este procedimiento garantiza la validez interna del experimento: permite descartar que eventuales degradaciones en los tiempos de respuesta (como el *Time to First Byte* o el *Largest Contentful Paint*) sean atribuibles a estrangulamiento de ancho de banda (*bandwidth throttling*), pérdida de paquetes o congestión local (*bufferbloat*) en el nodo cliente.

Para asegurar la reproducibilidad técnica del entorno:
1. **Estandarización de Dependencias y Runtime:** Se configuró el repositorio bajo `devEngines.packageManager = pnpm` (`^12.15.0`) con resolución determinista mediante `pnpm-lock.yaml`, aislando los binarios de automatización (`playwright` v1.64.1 y `@axe-core/playwright` v4.14.0).
2. **Estandarización de Viewport y Navegador:** Todas las pruebas de interfaz y renderizado en cliente se ejecutaron sobre una instancia limpia y sin caché de **Chromium Headless** con una resolución fija de **`1280x800` píxeles**, eliminando la interferencia de extensiones de usuario o estados previos en `localStorage` y `Cookies`.
3. **Doble Instrumentación de Red:** Se implementó el script [`./01_pruebas_automatizadas_cli/scripts/medir_red.mjs`](../01_pruebas_automatizadas_cli/scripts/medir_red.mjs), el cual combina la medición por interfaz de línea de comandos (`fast-cli --upload --json`) con una verificación cruzada mediante automatización DOM sobre `https://fast.com` en Playwright y un muestreo estadístico de latencia de aplicación (20 sondas HTTP directas hacia la infraestructura de DemoBlaze). Los resultados crudos quedaron registrados en [`./01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json`](../01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json).

### 1.2. Validación de Conectividad de Red y Análisis de Latencia
Las mediciones se ejecutaron el `2026-10-25T02:42:21.803Z` desde el nodo cliente ubicado en **Neiva, Colombia** (ISP: **Claro**, IP pública `200.118.145.63`), enrutando contra los servidores de medición de **Bogotá, CO** y **Miami, US**.

#### Tabla 1.1. Resultados de la Línea Base de Conectividad y Sondeo HTTP hacia DemoBlaze

| Instrumento / Destino | Parámetro Evaluado | Valor Obtenido Exacto | Umbral / Criterio de Aceptación | Veredicto |
| :--- | :--- | :--- | :--- | :---: |
| **`fast-cli` (CLI Nativo)** | Velocidad de Descarga (`downloadSpeed`) | **`580 Mbps`** (`540 MB` transferidos) | `> 10 Mbps` | **APRUEBA** |
| **`fast-cli` (CLI Nativo)** | Velocidad de Subida (`uploadSpeed`) | **`510 Mbps`** (`2210 MB` transferidos) | `> 5 Mbps` | **APRUEBA** |
| **`fast-cli` (CLI Nativo)** | Latencia en Reposo (`latency`) | **`10 ms`** | `< 100 ms` | **APRUEBA** |
| **`fast-cli` (CLI Nativo)** | Latencia bajo Carga (`bufferBloat`) | **`22 ms`** (`+12 ms` bajo saturación) | `< 150 ms` | **APRUEBA** |
| **Playwright (`fast.com` DOM)** | Velocidad de Descarga (`descarga_mbps`) | **`760 Mbps`** | `> 10 Mbps` | **APRUEBA** |
| **Playwright (`fast.com` DOM)** | Velocidad de Subida (`subida_mbps`) | **`530 Mbps`** | `> 5 Mbps` | **APRUEBA** |
| **Playwright (`fast.com` DOM)** | Latencia en Reposo (`latencia_ms`) | **`9 ms`** | `< 100 ms` | **APRUEBA** |
| **Playwright (`fast.com` DOM)** | Latencia bajo Carga (`latencia_bajo_carga_ms`) | **`13 ms`** (`+4 ms` de variación) | `< 150 ms` | **APRUEBA** |
| **Sondeo HTTP Frontend** | `https://www.demoblaze.com` (`HEAD`, 10 iteraciones) | Promedio: **`378.67 ms`**<br>Mín: **`266.05 ms`** \| Máx: **`690.57 ms`** | `< 1000 ms` (9/10 `HTTP 200 OK`; 1 `ERROR` aislado en iteración 9) | **APRUEBA** |
| **Sondeo HTTP Backend API** | `https://api.demoblaze.com/entries` (`GET`, 10 iteraciones) | Promedio: **`337.61 ms`**<br>Mín: **`157.63 ms`** \| Máx: **`1354.52 ms`** | `< 1000 ms` (10/10 `HTTP 200 OK`; pico de `1354.52 ms` en iteración 7) | **APRUEBA** |
| **Consolidado Global Ping** | Frontend + Backend API (20 muestras totales) | Promedio: **`358.14 ms`**<br>Mín: **`157.63 ms`** \| Máx: **`1354.52 ms`** | Latencia internacional estable hacia el hosting en la nube | **APRUEBA** |

**Interpretación Técnica de la Línea Base:**
- El canal local presenta capacidades simétricas de fibra óptica (**`580–760 Mbps`** de descarga y **`510–530 Mbps`** de subida) con una latencia hacia el nodo nacional de apenas **`9–10 ms`** y un *bufferbloat* despreciable (**`13–22 ms`**).
- En contraste, el sondeo directo a nivel de capa de aplicación (HTTP/TLS) hacia los servidores de DemoBlaze arroja un tiempo de ida y vuelta promedio combinado de **`358.14 ms`** (**`378.67 ms`** hacia el servidor web estático y **`337.61 ms`** hacia el endpoint REST `/entries`, con un mínimo de **`157.63 ms`** tras reutilización de sesión Keep-Alive y un pico puntual de **`1354.52 ms`** por *cold start* o contención en el backend compartido).
- **Conclusión del Paso 1:** Se certifica con `conexion_estable: true` que el entorno de red local supera ampliamente los requisitos mínimos y no introduce sesgos en la auditoría. Cualquier demora superior a `~360 ms` observada en el Paso 2 obedece exclusivamente a la arquitectura cliente/servidor de DemoBlaze.

### 1.3. Verificación Operativa Inicial del Sistema Bajo Prueba
Se comprobó la disponibilidad operativa de `https://www.demoblaze.com/index.html` y de su servicio de datos `https://api.demoblaze.com/entries`. El documento raíz responde con código `HTTP 200 OK`, renderiza la barra de navegación superior (`#narvbarx`), el carrusel promocional (`#carouselExampleIndicators`), el menú lateral de categorías (`Phones`, `Laptops`, `Monitors`) y puebla de manera asíncrona el contenedor `#tbodyid` con las **9 tarjetas iniciales de productos** (`.card`), habilitando formalmente la ejecución del Paso 2.

---

## Paso 2: Ejecución de Herramientas Técnicas (Instrumentos Automatizados)

La evaluación instrumental automatizada se estructuró mediante dos motores complementarios:
1. **Auditoría Funcional, de Interfaz (UI/UX), Enlaces y Accesibilidad:** Implementada en [`./01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs`](../01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs) utilizando **Playwright** (`v1.64.1`) y **`@axe-core/playwright`** (`v4.14.0`).
2. **Auditoría de Eficiencia de Desempeño y Capacidad bajo Concurrencia:** Ejecutada mediante **Google Lighthouse CLI** (`v13.5.0`) y **Grafana k6** con el script [`./01_pruebas_automatizadas_cli/scripts/carga_k6.js`](../01_pruebas_automatizadas_cli/scripts/carga_k6.js) simulando **50 usuarios virtuales concurrentes (50 VUs)**.

---

### 2.1. Evaluación de Adecuación Funcional y Capacidad de Interacción (Playwright)

El script `auditoria_funcional_ui.mjs` recorrió el flujo transaccional de extremo a extremo (*End-to-End*) con un viewport de `1280x800`, generando las evidencias estructuradas en [`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`](../01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json) y 5 capturas de pantalla en [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/`](../01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/):

1. **Inspección del Catálogo Inicial y Ausencia de Buscador (`Completitud Funcional`):**
   - Al cargar `index.html`, se verificó la presencia de las 9 tarjetas `.card` iniciales (`Samsung galaxy s6` a `$360`, `Nokia lumia 1520` a `$820`, `Nexus 6` a `$650`, `Samsung galaxy s7` a `$800`, `Iphone 6 32gb` a `$790`, `Sony xperia z5` a `$320`, `HTC One M9` a `$700`, `Sony vaio i5` a `$790` y `Sony vaio i7` a `$790`).
   - **Hallazgo de Completitud:** La consulta al DOM arrojó `conteoInputTypeSearch: 0`, `conteoInputPlaceholderSearch: 0`, `existeRoleSearch: false` y `conteoInputsVisiblesEnHome: 0` (los únicos `6` elementos `<input>` del documento pertenecen a los modales ocultos `#exampleModal`, `#logInModal` y `#signInModal`). El sistema **carece por completo de barra de búsqueda por texto**.
   - **Evidencia visual:** [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/01_home_catalogo.png`](../01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/01_home_catalogo.png).

2. **Filtrado por Categoría, Detalle de Producto y Feedback de Carrito (`Corrección y Pertinencia Funcional`):**
   - Al accionar el filtro `Laptops` (`onclick="byCat('notebook')"`), el catálogo se actualizó correctamente mostrando 6 equipos portátiles (`Sony vaio i5`, `Sony vaio i7`, `MacBook air`, `Dell i7 8gb`, `2017 Dell 15.6 Inch`, `MacBook Pro`).
   - Al navegar al detalle de **`Sony vaio i5`** (`https://www.demoblaze.com/prod.html?idp_=8`), se verificó la renderización del título, precio (`$790 *includes tax`), descripción e imagen (`imgs/sony_vaio_5.jpg`).
   - **Evidencia visual:** [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/02_detalle_producto.png`](../01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/02_detalle_producto.png).
   - **Hallazgo de Reconocibilidad y Feedback:** Al hacer clic en `Add to cart`, el sistema emplea un diálogo `window.alert` nativo bloqueante del navegador con el texto exacto **`"Product added"`**. Asimismo, al inspeccionar el nodo `#cartur` (`Cart`) en la barra de navegación antes y después de la adición, se comprobó que `innerHTML` permanece invariable en `"Cart"` con `childElementCount: 0` y `existeContadorNumericoEnNavbar: false`, careciendo de un *badge* o indicador visual de cantidad de artículos.

3. **Auditoría del Carrito de Compras (`Completitud y Operabilidad`):**
   - En `https://www.demoblaze.com/cart.html`, la tabla `#tbodyid` cargó correctamente `1` fila correspondiente a `Sony vaio i5` con precio `790` y total `#totalp = 790`.
   - **Hallazgo Funcional:** Se verificó que `permiteModificarCantidadUnitaria: false`. La tabla solo renderiza las columnas `Pic`, `Title`, `Price` y `x` (`Delete`), sin ofrecer un `<input type="number">` ni controles `+`/`-` para ajustar las unidades de un producto.
   - **Evidencia visual:** [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/03_carrito_compras.png`](../01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/03_carrito_compras.png).

4. **Pruebas Negativas de Protección contra Errores de Usuario en el Checkout (`#orderModal`):**
   - Al hacer clic en `Place Order`, se desplegó el modal `#orderModal` y se capturó su estado inicial en [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/04_modal_checkout_vacio.png`](../01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/04_modal_checkout_vacio.png).
   - La inspección programática de los 6 campos del formulario (`#name`, `#country`, `#city`, `#card`, `#month`, `#year`) demostró que **todos son `<input type="text">` sin ningún atributo de validación HTML5** (`required: false`, `pattern: null`, `minLength: null`, `maxLength: null`, `inputMode: null`).
   - **Prueba Negativa 1 (Formulario 100% vacío):** Al invocar `Purchase` (`purchaseOrder()`) con los 6 campos en blanco, el sistema disparó un `window.alert` con el mensaje **`"Please fill out Name and Creditcard."`**, demostrando que ignora la obligatoriedad de país (`#country`), ciudad (`#city`), mes (`#month`) y año (`#year`).
   - **Prueba Negativa 2 (Inyección de Tarjeta Alfabética Inválida y Campos Vacíos):** Se ingresó `#name = "Usuario Prueba QA"` y en `#card` la cadena alfabética **`"TARJETA_FALSA_SIN_NUMEROS_ABC"`**, dejando vacíos `#country`, `#city`, `#month` y `#year`. Al pulsar `Purchase`, **el sistema NO rechazó la transacción** (`transaccionRechazada: false`, `compraProcesadaExitosamente: true`), desplegando el modal `.sweet-alert` con el título **`"Thank you for your purchase!"`** y el recibo de pago:
     `Id: 3747911 | Amount: 790 USD | Card Number: TARJETA_FALSA_SIN_NUMEROS_ABC | Name: Usuario Prueba QA | Date: 24/9/2026`.
   - **Evidencia visual del fallo crítico:** [`./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/05_fallo_proteccion_errores_checkout.png`](../01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/05_fallo_proteccion_errores_checkout.png).

---

### 2.2. Auditoría Estética de Interfaz (Emulación Automatizada de WhatFont y ColorZilla)

Mediante `page.evaluate()` y `window.getComputedStyle()`, se extrajeron las propiedades tipográficas y cromáticas reales en `index.html`, `prod.html` y `cart.html`, almacenadas en [`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json`](../01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json).

#### Tabla 2.1. Inventario Tipográfico y Cromático Computado (WhatFont + ColorZilla)

| Selector CSS | Contexto | Etiqueta | Familia Tipográfica (`fontFamily`) | Tamaño (`fontSize`) | Peso (`fontWeight`) | Alto de Línea | Color de Texto (`#HEX` / `RGB`) | Color de Fondo Efectivo (`#HEX` / `RGB`) |
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

**Hallazgos de Consistencia Estética:**
- Aunque la tipografía corporativa declarada es `LatoWeb`, los elementos `<button>` nativos (`.btn-primary` en modales y `.btn-success` en `cart.html`) heredan la regla genérica `font-family: sans-serif` del reset de Bootstrap 4 Alpha, rompiendo la uniformidad tipográfica frente a los botones implementados con etiquetas `<a>` (`Add to cart` en `prod.html`, que sí usa `LatoWeb` a `20px`).
- El color gris medio `#868688` empleado para el texto de las tarjetas y precios sobre fondo blanco `#FFFFFF`, así como el verde `#34A853` con texto blanco `#FFFFFF` en los botones de acción principal, producen relaciones de contraste insuficientes que impactan directamente en la legibilidad (confirmado por `axe-core`).

---

### 2.3. Operabilidad e Integridad de Enlaces e Imágenes (Emulación de Check My Links)

El análisis de integridad de hipervínculos y recursos gráficos sobre `https://www.demoblaze.com/index.html` (registrado en [`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json`](../01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json)) evaluó un total de **47 elementos DOM** (`33` enlaces `<a href>` y `14` imágenes `<img src>`):
- **Enlaces `<a href>` (`33` totales):**
  - **`23` enlaces válidos (`69.7%`):** Respondieron con código **`HTTP 200 OK`** (`index.html`, `cart.html`, controles del carrusel `#carouselExampleIndicators` y los 18 enlaces de imagen y título hacia `prod.html?idp_=1` hasta `prod.html?idp_=9`).
  - **`10` anclas sin destino (`30.3%`):** Poseen `href="#"` o `href=""` vacío (`Contact`, `About us`, `Log in`, `Log out`, `#nameofuser`, `Sign up`, `CATEGORIES`, `Phones`, `Laptops`, `Monitors`). Se utilizan como disparadores de modales o de funciones JavaScript *inline* (`onclick="byCat(...)"`) en lugar de botones semánticos `<button type="button">`, provocando saltos de scroll al tope de la página y degradando la navegabilidad por teclado.
  - **`0` enlaces rotos (`0%`):** Ningún enlace arrojó error `HTTP 404` o `HTTP 500`.
- **Imágenes `<img src>` (`14` totales):**
  - **`14` imágenes válidas (`100%`):** Todas respondieron con **`HTTP 200 OK`** (`0` errores `404/500`).
  - **Deficiencia de Accesibilidad en Imágenes:** **`11` de las `14` imágenes (`78.6%`)** carecen de atributo `alt` descriptivo (`alt: null` o `alt=""` vacío en las 9 miniaturas de productos y en los 2 logotipos `blazemeter-favicon-512x512.png`).

---

### 2.4. Auditoría de Accesibilidad Web WCAG 2.0/2.1 (`@axe-core/playwright`)

Se ejecutó `AxeBuilder` (`@axe-core/playwright v4.14.0`) sobre las vistas de catálogo (`index.html`) y carrito (`cart.html`). El reporte completo ([`./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json`](../01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json)) identificó **11 reglas violadas acumuladas** y **45 nodos DOM afectados** (`2` violaciones de severidad *critical*, `3` *serious*, `6` *moderate* y `0` *minor*).

#### Tabla 2.2. Desglose de Violaciones de Accesibilidad Detectadas por `@axe-core/playwright`

| Vista Auditada | ID de Regla (`axe-core`) | Severidad | Nodos Afectados | Estándar Asociado | Descripción Técnica del Fallo en el DOM |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **`index.html`** | `image-alt` | **Critical** | `2` | WCAG 2 A (`1.1.1`) | Los 2 logotipos `<img src="blazemeter-favicon-512x512.png">` en `#nava` (navbar) y `footer h4` carecen por completo del atributo `alt`. |
| **`index.html`** | `color-contrast` | **Serious** | `18` | WCAG 2 AA (`1.4.3`) | Los 9 precios `<h5>` (`20px`) y las 9 descripciones `p.card-text` (`14.67px`) usan texto `#868688` sobre fondo `#FFFFFF`, generando un ratio de **`3.63:1`** (inferior al mínimo normativo de **`4.5:1`**). |
| **`index.html`** | `link-name` | **Serious** | `9` | WCAG 2 A (`2.4.4`, `4.1.2`) | Los 9 enlaces envolventes de imagen `<a href="prod.html?idp_=1..9"><img alt=""></a>` están en el orden de tabulación pero carecen de texto accesible o `aria-label`. |
| **`index.html`** | `landmark-one-main` | **Moderate** | `1` | Best Practice / ARIA | El documento `<html lang="en">` carece de una región principal `<main>` o `role="main"`. |
| **`index.html`** | `page-has-heading-one` | **Moderate** | `1` | Best Practice / Semántica | La página no contiene ningún encabezado de primer nivel `<h1>`. |
| **`index.html`** | `region` | **Moderate** | `3` | Best Practice / Teclado | El menú lateral `.col-lg-3`, la grilla `#tbodyid` y el contenedor `#footc` están huérfanos fuera de *landmarks* semánticos. |
| **`cart.html`** | `image-alt` | **Critical** | `3` | WCAG 2 A (`1.1.1`) | Los 2 logotipos `blazemeter-favicon-512x512.png` y la miniatura del producto `<img width="100" height="100" src="imgs/sony_vaio_5.jpg">` en la tabla del carrito carecen de atributo `alt`. |
| **`cart.html`** | `color-contrast` | **Serious** | `2` | WCAG 2 AA (`1.4.3`) | El enlace `Delete` (`#0275D8` sobre `#F2F2F2`, ratio **`4.13:1 < 4.5:1`**) y el botón `Place Order` (`#FFFFFF` sobre `#34A853`, ratio **`3.05:1 < 4.5:1`**) incumplen el contraste mínimo AA. |
| **`cart.html`** | `landmark-one-main` | **Moderate** | `1` | Best Practice / ARIA | Ausencia de etiqueta `<main>` en la estructura del carrito. |
| **`cart.html`** | `page-has-heading-one` | **Moderate** | `1` | Best Practice / Semántica | Ausencia de encabezado `<h1>` (se salta directamente a `<h2>Products</h2>` y `<h2>Total</h2>`). |
| **`cart.html`** | `region` | **Moderate** | `4` | Best Practice / Teclado | Los bloques `.col-lg-8`, `.col-lg-1 > h2`, `.panel` (`#totalp`) y `#footc` no están contenidos en regiones ARIA/HTML5. |

---

### 2.5. Evaluación de Eficiencia de Desempeño y Capacidad (Lighthouse + Grafana k6)

Para evaluar la característica de **Eficiencia de Desempeño** en sus tres subcaracterísticas (**Comportamiento Temporal**, **Utilización de Recursos** y **Capacidad**), se ejecutó **Google Lighthouse v13.5.0** en modo *headless* ([`./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json`](../01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json)) y una prueba de carga controlada en **Grafana k6** ([`./01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/k6_summary.json`](../01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/k6_summary.json)).

#### Configuración del Escenario de Concurrencia en `k6` (`carga_k6.js`)
- **Perfil de Carga (Stages):** Rampa de ascenso de `5 s` hasta alcanzar **50 Usuarios Virtuales (`50 VUs`)**, meseta sostenida de `20 s` con `50 VUs` concurrentes y rampa de descenso de `5 s` hasta `0 VUs` (duración total: `30 s`).
- **Transacciones por Iteración:** Petición `GET` al documento principal `https://www.demoblaze.com/index.html` seguida de petición `GET` al servicio de catálogo `https://api.demoblaze.com/entries`, con validación `check(res, { 'status 200': (r) => r.status === 200 })` y tiempo de reflexión `sleep(1)`.
- **Umbrales Normativos (`thresholds`):** `http_req_duration: ['avg<2000', 'p(95)<2000']` ($< 2.0\text{ s}$) y `http_req_failed: ['rate<0.01']` ($< 1\%$).

#### Tabla 2.3. Resultados Consolidados de Eficiencia de Desempeño (Lighthouse + k6 con 50 VUs)

| Subcaracterística ISO 25010 | Instrumento | Métrica / Indicador | Valor Real Obtenido | Umbral / Meta ISO 25010 | Veredicto |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Comportamiento Temporal** | Lighthouse v13.5 | **Largest Contentful Paint (LCP)** | **`3.74 s`** (`3740.94 ms`, score: `0.57`) | **`< 2.5 s`** (`2500 ms`) | **REPRUEBA** |
| **Comportamiento Temporal** | Lighthouse v13.5 | **First Contentful Paint (FCP)** | **`1.79 s`** (`1790.94 ms`, score: `0.90`) | `< 1.8 s` (`1800 ms`) | **APRUEBA** |
| **Comportamiento Temporal** | Lighthouse v13.5 | **Total Blocking Time (TBT)** | **`108 ms`** (display: `"110 ms"`, score: `0.98`) | `< 200 ms` | **APRUEBA** |
| **Estabilidad Visual** | Lighthouse v13.5 | **Cumulative Layout Shift (CLS)** | **`0.235`** (`0.23499`, score: `0.53`) | `< 0.1` | **REPRUEBA** |
| **Comportamiento Temporal** | Lighthouse v13.5 | **Speed Index (SI)** | **`6.51 s`** (`6508.15 ms`, score: `0.39`) | `< 3.4 s` | **REPRUEBA** |
| **Comportamiento Temporal** | Lighthouse v13.5 | **Time to Interactive (TTI)** | **`6.89 s`** (`6887.64 ms`, score: `0.54`) | `< 3.8 s` | **REPRUEBA** |
| **Comportamiento Temporal** | Lighthouse v13.5 | **Server Response Time (TTFB Root)** | **`1148 ms`** (`"Root document took 1,150 ms"`) | `< 600 ms` | **REPRUEBA** |
| **Scores Globales** | Lighthouse v13.5 | **Performance / Accessibility / Best Practices / SEO** | Perf: **`70`** \| Acc: **`82`** \| BP: **`100`** \| SEO: **`82`** | `>= 90 / 100` por categoría | **REPRUEBA PARCIAL** |
| **Utilización de Recursos** | Lighthouse v13.5 | **Peso Total de Transferencia (`total-byte-weight`)** | **`1,426,268 Bytes`** (`1,392.84 KiB` / `1.43 MB`) | `< 1,600 KiB` (`~1.6 MB`) | **APRUEBA** |
| **Utilización de Recursos** | Lighthouse v13.5 | **Total Peticiones HTTP (`network-requests`)** | **`31 peticiones`** (12 img: `353.2 KB`, 3 media: `548.8 KB`, 6 JS: `292.1 KB`, 1 font: `183.1 KB`, 4 CSS: `41.2 KB`) | `< 50 peticiones` | **APRUEBA** |
| **Comportamiento Temporal bajo Carga** | Grafana k6 (`50 VUs`) | **Tiempo de Respuesta Promedio (`http_req_duration.avg`)** | **`188.00 ms`** (`0.188 s`) | **`< 2.0 s`** (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal bajo Carga** | Grafana k6 (`50 VUs`) | **Mediana (`med`) y Mínimo (`min`)** | Mediana: **`159.00 ms`** \| Mín: **`68.92 ms`** | `< 2.0 s` (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal bajo Carga** | Grafana k6 (`50 VUs`) | **Percentil 90 (`p(90)`) y Percentil 95 (`p(95)`)** | `p(90)`: **`401.34 ms`** \| `p(95)`: **`423.04 ms`** | **`< 2.0 s`** (`2000 ms`) | **APRUEBA** |
| **Comportamiento Temporal bajo Carga** | Grafana k6 (`50 VUs`) | **Tiempo Máximo (`max`) y Espera TTFB (`http_req_waiting.avg`)** | Máx: **`1421.99 ms`** \| TTFB avg: **`178.09 ms`** | `< 2.0 s` (`2000 ms`) | **APRUEBA** |
| **Capacidad (Throughput)** | Grafana k6 (`50 VUs`) | **Volumen y Tasa de Peticiones (`http_reqs`)** | **`1,632 peticiones`** (`816` iteraciones) a **`52.60 req/s`** | Soporte sostenido a `50 VUs` | **APRUEBA** |
| **Capacidad / Fiabilidad** | Grafana k6 (`50 VUs`) | **Tasa de Fallos (`http_req_failed`) y `checks`** | **`0.00%` de error** (`0` fallos; `1,632 / 1,632` checks `HTTP 200 OK` exitosos) | **`< 1.0%`** (`rate < 0.01`) | **APRUEBA** |

### 2.6. Síntesis Diagnóstica del Paso 2
1. **Dicotomía Backend vs. Frontend en Eficiencia de Desempeño:** Bajo concurrencia de **50 usuarios virtuales**, el backend y el hosting de DemoBlaze responden con alta solvencia (**`188.00 ms`** en promedio, **`423.04 ms`** en el percentil 95 y **`0.00%`** de tasa de error sobre `1,632` peticiones). Sin embargo, la experiencia de carga en el navegador reprueba el **LCP (`3.74 s > 2.5 s`)** y el **CLS (`0.235 > 0.1`)** debido a que el catálogo de productos se solicita de forma asíncrona tras descargar bundles pesados de JavaScript/Media (`1.43 MB` totales) e inyecta las imágenes de `1366x768` sin dimensiones explícitas en el DOM.
2. **Deficiencias Críticas en Adecuación Funcional y Capacidad de Interacción:** El sistema reprueba la protección contra errores de usuario al procesar pagos con tarjetas alfabéticas (`"TARJETA_FALSA_SIN_NUMEROS_ABC"`) y campos vacíos en `#orderModal`, carece de funciones esenciales de un e-commerce (buscador de productos, selector de cantidad en carrito y contador numérico en `#cartur`) e incumple **11 reglas de accesibilidad WCAG** en `45` nodos del DOM.
