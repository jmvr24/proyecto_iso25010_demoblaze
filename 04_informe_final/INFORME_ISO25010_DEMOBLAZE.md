# Evaluación de la calidad del flujo de compra de DemoBlaze según la norma ISO/IEC 25010

Universidad Surcolombiana, Facultad de Ingeniería

Asignatura: Ingeniería de Software Avanzada

Docente: [NOMBRE]

Integrantes:

- [NOMBRE]
- [NOMBRE]
- [NOMBRE]
- [NOMBRE]

Neiva, [FECHA]

## Índice

1. Contextualización y justificación de la funcionalidad
2. Modelado del sistema: casos de uso y pantallas
3. Selección de criterios ISO/IEC 25010 y definición de población y muestra
4. Instrumentos de medición, métricas y parámetros de comportamiento
5. Proceso de evaluación paso a paso
   - Paso 1. Preparación del entorno y línea base
   - Paso 2. Ejecución de herramientas técnicas
   - Paso 3. Aplicación de instrumentos con usuarios
   - Paso 4. Análisis cruzado frente a los parámetros definidos
   - Paso 5. Conclusiones y recomendaciones de mejora
- Referencias
- Anexos

## 1. Contextualización y justificación de la funcionalidad

En este informe evaluamos la calidad de software de la plataforma de comercio electrónico DemoBlaze con base en el estándar internacional ISO/IEC 25010. Para este propósito seleccionamos como funcionalidad crítica el flujo de compra de punta a punta, el cual abarca desde la exploración del catálogo hasta la confirmación de la orden en el modal de pedido. Esta delimitación nos permite examinar las etapas en las que se concentra la interacción del comprador y en las que un fallo impide o entorpece completar la compra.

### 1.1. Descripción de DemoBlaze

DemoBlaze es una tienda en línea de demostración de productos de tecnología. La propia BlazeMeter la presenta como uno de sus sitios de demostración y la usa en sus tutoriales de pruebas de carga (Panetti, 2023). La página principal (https://www.demoblaze.com/index.html) se titula STORE (`04_informe_final/evidencias/recorrido_sitio.json`, paso 1) y muestra en la barra superior el logotipo de BlazeMeter, cargado desde el archivo `blazemeter-favicon-512x512.png` (`01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json`).

A partir de los registros técnicos recolectados en `04_informe_final/evidencias/recorrido_sitio.json`, constatamos que la plataforma ofrece un catálogo organizado en tres categorías: Phones (7 productos), Laptops (6 productos) y Monitors (2 productos), sumando un inventario total de 15 productos únicos. La vista principal despliega 9 productos iniciales y permite visualizar los 6 restantes en una segunda página mediante los controles de paginación Next y Previous. Cada artículo cuenta con una página de detalle individual (`prod.html?idp_=[id]`) que presenta fotografía, nombre, precio, descripción textual y el botón Add to cart. Al agregar un artículo, este se traslada al carrito de compras (`cart.html`), donde se visualiza una tabla con las columnas Picture, Title, Price y Delete, el valor total acumulado y el botón Place Order para abrir el formulario de facturación.

Adicionalmente, el sistema dispone de módulos complementarios de soporte: autenticación de usuarios mediante modales de registro (Sign up) e inicio de sesión (Log in) con campos de usuario y contraseña, reflejando el estado de la sesión activa en la barra superior con el mensaje Welcome seguido del identificador del usuario, además de la opción de cierre de sesión (Log out). También incorpora un modal de contacto (Contact) con campos para correo electrónico, nombre y mensaje, y un modal informativo institucional (About us) que aloja un reproductor de video sustentado en tecnología de transmisión secuencial HLS.

En contraste con las funciones descritas, identificamos dos ausencias operativas notorias en la experiencia de compra: el sistema carece de un motor o campo de búsqueda por texto (`existeBuscador = false`, con cero entradas de tipo search en el DOM según `04_informe_final/evidencias/recorrido_sitio.json`, paso 1), lo que obliga a explorar el catálogo exclusivamente mediante clics en categorías o paginación, y la vista del carrito no permite modificar cantidades unitarias de un artículo ya agregado (`permiteCambiarCantidadEnCarrito = false`), limitando la gestión a la eliminación completa de la fila. La Tabla 1 sintetiza la estructura funcional observada en el sistema.

Tabla 1. Módulos y funciones observadas en DemoBlaze

| Módulo | Función observada | Evidencia (clave del JSON) |
| :--- | :--- | :--- |
| Catálogo general y paginación | Despliegue de 9 productos en página inicial y 6 en segunda página; navegación mediante botones Next y Previous | `resumenFuncional.productosPorPaginaInicial`, `resumenFuncional.productosEnSegundaPagina`, `pasos[1].observaciones` |
| Clasificación por categorías | Filtrado del inventario en tres familias: Phones (7 productos), Laptops (6 productos) y Monitors (2 productos) | `resumenFuncional.categoriasDisponibles`, `resumenFuncional.productosPorCategoria`, `pasos[2].observaciones` |
| Búsqueda de productos | Ausente; no existen campos de entrada ni selectores con rol o atributo de búsqueda en la interfaz | `resumenFuncional.existeBuscador`, `pasos[0].observaciones.campoBusqueda` |
| Ficha de detalle de producto | Presentación de fotografía, nombre, precio, descripción técnica y botón Add to cart | `pasos[3].observaciones.botonAddToCart`, `pasos[3].observaciones.precioMostrado` |
| Carrito de compras | Tabla con columnas Picture, Title, Price y Delete; cálculo del monto total; sin controles para alterar cantidades unitarias | `resumenFuncional.permiteCambiarCantidadEnCarrito`, `pasos[5].observaciones.columnasTabla` |
| Formulario de pedido | Modal Place Order con seis campos de texto para captura de datos personales y tarjeta de crédito | `resumenFuncional.camposPlaceOrder`, `pasos[5].observaciones.modalPlaceOrder` |
| Gestión de usuarios y sesión | Modales de Sign up y Log in; saludo dinámico en barra superior al iniciar sesión y enlace de Log out | `resumenFuncional.camposSignUp`, `resumenFuncional.camposLogIn`, `resumenFuncional.sesionMuestraUsuarioEnBarra`, `pasos[8].observaciones` |
| Atención y contacto | Modal Contact con campos para correo electrónico, nombre del remitente y cuerpo del mensaje | `resumenFuncional.camposContact`, `pasos[6].observaciones.modalContact` |
| Información institucional | Modal About us con reproductor de video en flujo continuo mediante manifiesto HLS | `resumenFuncional.aboutUsContieneVideo`, `pasos[7].observaciones.reproductorVideo` |

Fuente: elaboración propia a partir de `04_informe_final/evidencias/recorrido_sitio.json`.

### 1.2. Arquitectura general observable

La evaluación técnica de DemoBlaze se efectúa bajo una modalidad estricta de caja negra desde la perspectiva del cliente, dado que no poseemos acceso al servidor de aplicaciones, a las bases de datos de respaldo ni al código fuente alojado en el entorno de ejecución remoto. Toda la caracterización arquitectónica se fundamenta en la inspección de peticiones de red, recursos transferidos y cabeceras HTTP documentados en `04_informe_final/evidencias/recorrido_sitio.json`.

A partir de estas evidencias, identificamos tres componentes diferenciados que estructuran la operación del sistema desde el navegador:

1. Frontend estático alojado en www.demoblaze.com: este servidor concentró 138 solicitudes durante el recorrido automatizado (`resumenArquitectura.hostsContactados`), sirviendo los documentos HTML (`index.html`, `prod.html`, `cart.html`), hojas de estilo y scripts del cliente. Entre las librerías externas identificadas en `resumenArquitectura.librerias` figuran jQuery (`node_modules/jquery/dist/jquery.min.js`), el marco de diseño Bootstrap (`node_modules/bootstrap/dist/js/bootstrap.min.js` y su hoja de estilos correspondiente), Tether (`node_modules/tether/dist/js/tether.min.js`), el reproductor Video.js (`node_modules/video.js/dist/video.min.js` y su hoja de estilos), la extensión HLS de Video.js (`node_modules/videojs-contrib-hls/dist/videojs-contrib-hls.min.js`), el complemento visual SweetAlert en el carrito (`node_modules/bootstrap-sweetalert/dist/sweetalert.min.js` y `sweetalert.css`) y los scripts propios de la lógica del cliente (`js/index.js`, `js/cart.js`).

2. Interfaz de programación de aplicaciones (API) en api.demoblaze.com: este servicio atendió 17 solicitudes mediante intercambio asíncrono de objetos JSON (`resumenArquitectura.hostsContactados`), gestionando la entrega del catálogo, la paginación, los filtros de categoría, la información de detalle de los productos, el contenido del carrito (asociado a un identificador que el navegador envía en el campo `cookie` de cada petición) y la autenticación de usuarios.

3. Servidor de transmisión multimedia en hls.demoblaze.com: este servidor recibió 26 solicitudes durante el recorrido (`resumenArquitectura.hostsContactados`), destinadas a la entrega del manifiesto de video (`index.m3u8`) y de los fragmentos de transporte (.ts) del reproductor del modal About us. Estas solicitudes aparecen al cargar cada página, aunque el usuario no abra ese modal (`04_informe_final/evidencias/recorrido_sitio.json`, pasos 6 y 9).

En lo relativo a la infraestructura de entrega, las cabeceras HTTP obtenidas tanto para el documento principal HTML como para los puntos de acceso de la API devuelven textualmente el valor `server: Google Frontend` (`resumenArquitectura.cabecerasDocumento.destacadas.server` y `resumenArquitectura.cabecerasApi.destacadas.server`). Nos abstenemos de atribuir plataformas de computación en la nube o tecnologías internas específicas que dicha cabecera no detalle expresamente.

Durante el recorrido automatizado de referencia registramos nueve puntos de acceso de la API, detallados en la Tabla 2. Es necesario precisar que la confirmación final de la compra no se ejecutó durante dicho recorrido de inspección técnica, motivo por el cual la petición de envío del pedido no quedó capturada en este archivo y no se incorpora en el listado para preservar la fidelidad de los datos.

Tabla 2. Servicios de la API observados durante el recorrido

| Método | Ruta | Función observada | Paso del recorrido |
| :--- | :--- | :--- | :--- |
| GET | `/entries` | Obtención del catálogo general de productos disponibles | Pasos 1 y 9 |
| POST | `/pagination` | Consulta de productos para la paginación del catálogo | Paso 2 |
| POST | `/bycat` | Filtrado de productos según la categoría seleccionada | Pasos 3 y 4 |
| POST | `/view` | Consulta de los datos detallados de un producto específico | Pasos 4 y 6 |
| POST | `/addtocart` | Adición de un producto al carrito; el cuerpo incluye el identificador del producto y el campo `cookie` del usuario | Paso 5 |
| POST | `/viewcart` | Recuperación de los artículos almacenados en el carrito activo | Paso 6 |
| POST | `/signup` | Registro de una nueva cuenta de usuario en el sistema | Paso 9 |
| POST | `/login` | Validación de credenciales y apertura de sesión de usuario | Paso 9 |
| POST | `/check` | Envío del token de sesión tras iniciar sesión; interpretamos que verifica la autenticación | Paso 9 |

Fuente: elaboración propia a partir de `04_informe_final/evidencias/recorrido_sitio.json`.

### 1.3. Propósito y público objetivo

Para encuadrar adecuadamente la evaluación de calidad, diferenciamos el propósito operativo real de DemoBlaze de la experiencia comercial simulada en su interfaz. En la realidad, DemoBlaze es uno de los sitios de demostración de BlazeMeter, empresa de herramientas de pruebas de software, que lo usa en sus propios tutoriales como objetivo de pruebas de carga (Panetti, 2023). Detrás de la tienda no hay inventario físico, despachos ni cobros reales.

En su propósito simulado, DemoBlaze emula una tienda minorista en línea dirigida a consumidores interesados en la adquisición de dispositivos electrónicos (teléfonos inteligentes, computadores portátiles y monitores de escritorio). Para los efectos metodológicos de esta evaluación bajo la norma ISO/IEC 25010, definimos como usuario de referencia a un comprador potencial en línea que interactúa con la interfaz buscando adquirir productos de tecnología. Evaluar el sistema desde la perspectiva de este perfil resulta indispensable, pues las expectativas de operabilidad, confianza y protección contra errores corresponden a las de un usuario que pretende realizar una compra digital.

### 1.4. Funcionalidad crítica: flujo de compra de punta a punta

Delimitamos el flujo de compra de punta a punta como la secuencia transaccional que un usuario debe completar para seleccionar un producto y formalizar su pedido en DemoBlaze. A partir de los pasos auditados en `04_informe_final/evidencias/recorrido_sitio.json`, el recorrido evaluado comprende los siguientes seis pasos:

1. Selección de categoría: el usuario ingresa a la página de inicio y hace clic en una de las opciones del panel de categorías (Phones, Laptops o Monitors) para acotar el catálogo. En este paso interviene el servicio de la API `POST /bycat` (`04_informe_final/evidencias/recorrido_sitio.json`, paso 3).

2. Selección y apertura del producto: el usuario examina los productos listados y hace clic sobre el título del artículo de su interés (por ejemplo, Sony vaio i5), navegando a la página de detalle en `prod.html?idp_=8`. En este paso interviene el servicio de la API `POST /view` (`04_informe_final/evidencias/recorrido_sitio.json`, paso 4).

3. Adición al carrito: en la vista de detalle, el usuario pulsa el botón Add to cart y acepta el diálogo modal nativo del navegador con el texto "Product added". En este paso interviene el servicio de la API `POST /addtocart` (`04_informe_final/evidencias/recorrido_sitio.json`, paso 5).

4. Revisión del carrito de compras: el usuario hace clic en el enlace Cart de la barra superior para dirigirse a `cart.html`, visualizando la tabla de productos seleccionados y el cálculo del total acumulado. En este paso intervienen los servicios de la API `POST /viewcart` y `POST /view` (`04_informe_final/evidencias/recorrido_sitio.json`, paso 6).

5. Despliegue y diligenciamiento del modal de pedido: el usuario presiona el botón Place Order para abrir el formulario modal `#orderModal` y procede a diligenciar los campos de datos personales y de pago (Name, Country, City, Credit card, Month y Year). No se observó intervención de servicios de la API en el despliegue del modal ni en la captura de campos (`04_informe_final/evidencias/recorrido_sitio.json`, paso 6).

6. Confirmación de la orden y obtención del comprobante: el usuario hace clic en el botón Purchase para enviar la orden y recibe en pantalla una ventana emergente de SweetAlert con el identificador de la compra, el monto, el número de tarjeta, el nombre del comprador y la fecha (`01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`). La petición de compra no fue observada en nuestro recorrido, porque en él no se ejecutó ninguna compra.

Seleccionamos este flujo como la funcionalidad crítica del software porque constituye el núcleo transaccional sobre el cual reposa el modelo de negocio del comercio electrónico: es la única secuencia capaz de convertir una visita en una venta. Si este recorrido presenta fallos de diseño, desorientación o bloqueos de interacción, el usuario interrumpe la navegación y abandona el sitio. Asimismo, las evidencias técnicas preliminares señalan que en este trayecto se concentran los defectos de usabilidad y protección de datos más sensibles de la plataforma.

### 1.5. Justificación de negocio

El abandono del carrito es uno de los problemas mejor documentados del comercio electrónico. Baymard Institute (2025) promedia 50 estudios y calcula una tasa de abandono del carrito del 70,22 %; es decir, cerca de 7 de cada 10 carritos se abandonan sin completar la compra. Cuando se excluye a quienes solo estaban mirando, la misma fuente reporta que el 19 % de los compradores abandonó porque no confió en el sitio con los datos de su tarjeta, el 17 % porque el sitio tuvo errores o se cayó y otro 17 % porque el proceso de pago era demasiado largo o complicado. Baymard Institute (2025) también señala que el checkout promedio en Estados Unidos muestra 23,48 elementos de formulario, cuando un flujo ideal puede tener entre 12 y 14, y estima que el sitio grande promedio podría aumentar su tasa de conversión en un 35,26 % con un mejor diseño del proceso de pago.

Sobre los formularios de pago, Scott (2024) reporta que el 31 % de los sitios evaluados en el estudio comparativo de Baymard no ofrece validación en línea, y advierte que mostrar los errores solo cuando el usuario intenta enviar el formulario puede conducir al abandono. En las pruebas de ese estudio, un participante que invirtió dos dígitos de su tarjeta pudo corregirlos antes de continuar porque el sitio validaba el número en línea con el algoritmo de Luhn. Sobre la retroalimentación al agregar productos, Laubheimer (2018), en un artículo de Nielsen Norman Group, recuerda que agregar el producto al carrito es el primer paso de la compra y que una confirmación clara da al usuario sensación de control. Recomienda además un indicador numérico visible sobre el ícono del carrito, y relaciona esta práctica con dos heurísticas de usabilidad: visibilidad del estado del sistema y prevención de errores.

En Colombia, la Cámara Colombiana de Comercio Electrónico (2025) reportó para el primer trimestre de 2025 ventas en línea por 27,3 billones de pesos y 131,6 millones de transacciones. El mismo informe señala que Tecnología fue la categoría más dinámica, con un 42,6 % de participación, y que las tarjetas de crédito y débito dominaron los medios de pago, con más del 60 % de participación. Estas cifras muestran que un catálogo de tecnología pagado con tarjeta, como el que simula DemoBlaze, corresponde a un tipo de compra frecuente en el país.

Al contrastar la evidencia teórica con los hallazgos técnicos registrados en DemoBlaze, observamos que las deficiencias del sistema se alinean con las principales causas documentadas de abandono:

1. Desprotección crítica en el formulario de pago: en `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json` se documenta que el modal Place Order procesa una compra con un número de tarjeta compuesto solo por letras (`TARJETA_FALSA_SIN_NUMEROS_ABC`) y con Country, City, Month y Year vacíos. Los seis campos del formulario son entradas de texto sin atributos HTML5 de validación (`required`, `pattern`, `inputmode`) ni límites de longitud, y el número de tarjeta no se verifica con el algoritmo de Luhn. Inferimos que emitir un comprobante exitoso ante datos de pago claramente inválidos afecta la confianza del comprador, que es justamente la causa de abandono que Baymard Institute (2025) asocia al 19 % de los casos.

2. Retroalimentación deficiente y efímera en la adición de artículos: al pulsar Add to cart, el sistema dispara un diálogo nativo bloqueante (`window.alert("Product added")`), tras cuyo cierre no subsiste ninguna indicación visual en la pantalla y el enlace Cart de la barra superior mantiene cero indicadores numéricos (`conteoBadgesEnNavbar = 0`, según `pruebas_funcionales_y_errores.json` y `recorrido_sitio.json`). Esta deficiencia va en contra de la recomendación de Laubheimer (2018) sobre la visibilidad del estado del sistema, y obliga al comprador a abrir otra vista solo para comprobar si su selección quedó registrada.

3. Ausencia de buscador y rigidez en el carrito: la falta de una barra de búsqueda por texto (`conteoInputTypeSearch = 0` en `pruebas_funcionales_y_errores.json`) impone la exploración secuencial del catálogo, y la tabla del carrito no provee selectores numéricos para variar unidades (`permiteCambiarCantidadEnCarrito = false`). Inferimos que estas omisiones entorpecen la navegación y la gestión del pedido, sumando fricción innecesaria al proceso de compra.

4. Desfase cronológico en la generación del comprobante: en `pruebas_funcionales_y_errores.json` se evidenció que una compra ejecutada el 24 de octubre de 2026 emitió un comprobante con la fecha `Date: 24/9/2026`, reflejando un mes de retraso. Al examinar el código de `purchaseOrder()` en `04_informe_final/evidencias/recorrido_sitio.json` (paso 6), constatamos que la función construye la cadena del recibo mediante `date.getMonth()` sin sumar 1 para compensar la indexación en base cero de JavaScript (donde octubre equivale a 9). En una tienda real, inferimos que un comprobante con la fecha equivocada podría generar confusión y reclamos, y se sumaría a los errores del sitio que el comprador percibe.

Aclaramos que no afirmamos que DemoBlaze sufra pérdidas financieras directas, pues se trata de un entorno demostrativo. El valor del análisis está en que estos defectos coinciden con causas de abandono documentadas en el comercio electrónico real, y por eso el flujo de compra es el objeto que conviene evaluar.

### 1.6. Alcance de un sitio de demostración

DemoBlaze no sostiene un modelo de negocio comercial, no posee clientes reales y sus órdenes no ejecutan cargos bancarios ni transacciones monetarias efectivas. A pesar de estas condiciones, la plataforma constituye un objeto de estudio idóneo y representativo para aplicar la norma ISO/IEC 25010 por cuatro motivos fundamentales: se encuentra desplegada en un entorno de producción público y accesible mediante protocolo seguro HTTPS (`https://www.demoblaze.com`); reproduce en su totalidad las etapas operativas de un checkout electrónico convencional; es uno de los sitios de demostración que BlazeMeter ofrece y usa para ilustrar pruebas de software (Panetti, 2023); y carece de restricciones de confidencialidad o acuerdos de reserva comercial, lo que hace posible incorporar capturas de pantalla reales, fragmentos de código e inspecciones de red sin alterar la fidelidad documental del informe.

Como hallazgo operativo complementario a las subcaracterísticas evaluadas, observamos en `04_informe_final/evidencias/recorrido_sitio.json` (paso 2) una anomalía funcional en los controles de paginación del catálogo: tras avanzar a la segunda página mediante el botón Next (#next2), hacer clic en el botón Previous (#prev2) no restaura los 9 productos de la primera página (Samsung galaxy s6 a Sony vaio i7), sino que envía el objeto `{"id":"1"}` a la ruta `POST /pagination` y muestra los productos 2 a 10 (Nokia lumia 1520 a Apple monitor 24), alterando la secuencia de navegación del visitante.

## 2. Modelado del sistema: casos de uso y pantallas

Representa la arquitectura funcional desde la perspectiva del usuario final para que el lector entienda el sistema sin haberlo operado.

### 2.1. Diagrama de casos de uso general

Muestra los actores y las principales interacciones con todo el sistema.

### 2.2. Especificación del caso de uso crítico "Realizar compra"

Detalla actor, precondiciones, flujo principal, flujos alternos y de excepción, y postcondiciones del caso de uso evaluado.

### 2.3. Uso de capturas reales en lugar de mockups

Justifica por qué se presentan pantallas reales: la guía pide mockups solo cuando hay restricciones de confidencialidad, y DemoBlaze no las tiene.

### 2.4. Secuencia visual del flujo de compra

Recorre con capturas anotadas cada pantalla del flujo, desde la página de inicio hasta la confirmación de la compra.

## 3. Selección de criterios ISO/IEC 25010 y definición de población y muestra

Define qué características y subcaracterísticas de la norma se evalúan y a quién se aplican los instrumentos con usuarios.

### 3.1. Características y subcaracterísticas seleccionadas

Justifica las tres dimensiones elegidas y cada subcaracterística del alcance acordado.

### 3.2. Características excluidas

Explica por qué no se evalúan las demás características de la norma.

### 3.3. Equivalencias entre las ediciones 2023 y 2011 de la norma

Relaciona los nombres de ISO/IEC 25010:2023 con los de la edición de 2011.

### 3.4. Población incluyente y excluyente

Delimita con criterios concretos quiénes pueden participar en el estudio y quiénes quedan fuera.

### 3.5. Tamaño y características de la muestra

Justifica el tamaño de la muestra y describe el perfil de los participantes.

## 4. Instrumentos de medición, métricas y parámetros de comportamiento

Fija, antes de medir, el instrumento, la métrica y el límite de decisión de cada subcaracterística.

### 4.1. Tabla de instrumentos, métricas y límites de decisión

Reúne en una tabla, con las cuatro columnas de la guía, cada subcaracterística, su instrumento, su fórmula y su umbral con la fuente.

### 4.2. Definiciones operativas

Precisa cómo se mide la uniformidad visual y qué cuenta como extravío en la observación directa.

### 4.3. Triangulación de instrumentos

Indica qué métrica automática se cruza con qué instrumento de percepción humana en cada dimensión.

## 5. Proceso de evaluación paso a paso

Documenta el procedimiento metodológico seguido en los cinco pasos de la guía.

### Paso 1. Preparación del entorno y línea base

Describe el ambiente de pruebas y confirma que el sistema y la red funcionaban antes de aplicar los instrumentos.

#### Configuración del ambiente de pruebas

Registra el equipo, el sistema operativo, la red, las herramientas con sus versiones y la condición de acceso al sitio.

#### Validación del funcionamiento operativo inicial

Presenta la prueba de humo del flujo de compra y la línea base de red.

### Paso 2. Ejecución de herramientas técnicas

Reporta, por subcaracterística, qué se ejecutó, con qué herramienta, el resultado exacto y la ruta de la evidencia.

### Paso 3. Aplicación de instrumentos con usuarios

Presenta los resultados de la observación directa y del cuestionario SUS aplicados a la muestra.

#### Observación directa

Consolida la matriz de tareas, éxitos, tiempos y extravíos de cada participante.

#### Cuestionario SUS

Presenta el puntaje SUS de cada participante, el puntaje global y la subescala de aprendizaje.

### Paso 4. Análisis cruzado frente a los parámetros definidos

Contrasta los resultados con los umbrales y determina si las distintas fuentes coinciden en el diagnóstico.

#### Regla de decisión

Establece cuándo aprueba una subcaracterística y cuándo una característica.

#### Triangulación por subcaracterística

Cruza el dato automatizado, el de las herramientas web y el de los usuarios contra su umbral, y emite el veredicto.

#### Amenazas a la validez

Expone las limitaciones que condicionan el alcance de las conclusiones.

### Paso 5. Conclusiones y recomendaciones de mejora

Emite el dictamen técnico sobre el flujo de compra evaluado.

#### Fortalezas

Resume lo que el sistema sí cumple según los datos.

#### Debilidades

Resume los incumplimientos encontrados y su impacto en el usuario.

#### Planes de acción correctivos

Propone mejoras concretas para DemoBlaze, cada una ligada a su hallazgo y a la métrica que comprobaría la mejora.

## Referencias

Baymard Institute. (2025, 22 de septiembre). *50 Cart Abandonment Rate Statistics 2026*. Baymard Institute. https://baymard.com/lists/cart-abandonment-rate

Cámara Colombiana de Comercio Electrónico. (2025, 13 de junio). *Informe Trimestral del Comercio Electrónico en Colombia 2025-I*. CCCE. https://ccce.org.co/noticias/informe-trimestral-del-comercio-electronico-en-colombia-2025-i/

Laubheimer, P. (2018, 17 de junio). *Adding an Item to a Shopping Cart: Provide Clear, Persistent Feedback*. Nielsen Norman Group. https://www.nngroup.com/articles/cart-feedback/

Panetti, J. (2023, 23 de mayo). *Running Your Own Gatling Script in Blazemeter Cloud*. Perforce BlazeMeter. https://www.blazemeter.com/blog/gatling-script

Scott, E. (2024, 9 de enero). *Usability Testing of Inline Form Validation: 31% Don’t Have It, 4% Get It Wrong*. Baymard Institute. https://baymard.com/research-articles/inline-form-validation

## Anexos

Reúne el material de soporte que respalda las cifras del informe.

### Anexo A. Inventario de evidencias

Relaciona cada archivo de evidencia del repositorio con la sección del informe que lo usa.

### Anexo B. Cuestionario SUS aplicado

Reproduce los diez ítems del cuestionario en la versión entregada a los participantes.

### Anexo C. Protocolo de observación directa

Reproduce las tareas, las rutas mínimas y las instrucciones de registro usadas en las sesiones.
