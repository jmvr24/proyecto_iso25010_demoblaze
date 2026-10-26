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

Durante las inspecciones automatizadas registramos diez puntos de acceso de la API, detallados en la Tabla 2. Los primeros nueve corresponden al recorrido general de exploración (`04_informe_final/evidencias/recorrido_sitio.json`). El décimo servicio, `POST /deletecart`, fue observado al ejecutar la compra en `04_informe_final/evidencias/capturas_flujo.json` (paso 7); en dicha ejecución constatamos que el sistema no transmite ninguna petición de registro de pedido a la API, limitándose a solicitar el vaciado del carrito mediante dicho punto de acceso.

Tabla 2. Servicios de la API observados durante el recorrido

| Método | Ruta | Función observada | Paso del recorrido |
| :--- | :--- | :--- | :--- |
| GET | `/entries` | Obtención del catálogo general de productos disponibles | Pasos 1 y 9 |
| POST | `/pagination` | Consulta de productos para la paginación del catálogo | Paso 2 |
| POST | `/bycat` | Filtrado de productos según la categoría seleccionada | Pasos 3 y 4 |
| POST | `/view` | Consulta de los datos detallados de un producto específico | Pasos 4 y 6 |
| POST | `/addtocart` | Adición de un producto al carrito; el cuerpo incluye el identificador del producto y el campo `cookie` del usuario | Paso 5 |
| POST | `/viewcart` | Recuperación de los artículos almacenados en el carrito activo | Paso 6 |
| POST | `/deletecart` | Vaciado de los productos del carrito activo tras pulsar Purchase; no se envía una orden a la API | Capturas, paso 7 |
| POST | `/signup` | Registro de una nueva cuenta de usuario en el sistema | Paso 9 |
| POST | `/login` | Validación de credenciales y apertura de sesión de usuario | Paso 9 |
| POST | `/check` | Envío del token de sesión tras iniciar sesión; interpretamos que verifica la autenticación | Paso 9 |

Fuente: elaboración propia a partir de `04_informe_final/evidencias/recorrido_sitio.json` y `04_informe_final/evidencias/capturas_flujo.json`.

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

6. Confirmación de la orden y obtención del comprobante: el usuario hace clic en el botón Purchase para formalizar el pedido y recibe en pantalla una ventana emergente de SweetAlert con el identificador de la compra, el monto, el número de tarjeta, el nombre del comprador y la fecha (`01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`). Al ejecutar esta acción observamos que el sistema no envía ningún pedido a la API, sino que efectúa una solicitud `POST /deletecart` para vaciar el carrito activo (`04_informe_final/evidencias/capturas_flujo.json`, paso 7) y genera el comprobante directamente en el navegador del cliente.

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

Dado que la docente no ha operado directamente la plataforma de comercio electrónico DemoBlaze, en este capítulo modelamos su arquitectura funcional desde la perspectiva del usuario final. Para ello presentamos un diagrama general de casos de uso con su catálogo de interacciones, la especificación completa del caso de uso crítico de compra y la secuencia visual documentada mediante capturas reales del sistema en producción.

### 2.1. Diagrama de casos de uso general

Figura 1. Diagrama de casos de uso general de DemoBlaze

![Figura 1. Diagrama de casos de uso general de DemoBlaze](diagramas/casos_de_uso_demoblaze.png)

Fuente: elaboración propia en PlantUML a partir de `04_informe_final/evidencias/recorrido_sitio.json`.

El modelado funcional identifica dos actores en el sistema: el Visitante y el Usuario registrado. El Visitante representa a cualquier persona que accede a la tienda sin autenticarse, mientras que el Usuario registrado corresponde a quien creó una cuenta en la plataforma e inició sesión. Entre ambos actores se define una relación de generalización o herencia, de modo que el Usuario registrado puede realizar todas las acciones del Visitante y cuenta además con la función exclusiva de cerrar sesión (CU-12). Conviene precisar que en DemoBlaze es posible completar una compra sin haber iniciado sesión, dado que la aplicación vincula el carrito de compras a un identificador que el navegador envía en el campo cookie dentro del cuerpo de las solicitudes HTTP (`04_informe_final/evidencias/recorrido_sitio.json`, paso 5). Por esta razón, el Visitante se relaciona directamente con el caso de uso transaccional de compra.

Por otra parte, la interfaz de programación de aplicaciones (api.demoblaze.com) y el servidor de transmisión multimedia (hls.demoblaze.com) no figuran como actores en el diagrama. En la notación UML, los actores personifican entidades externas, bien sean usuarios humanos o sistemas independientes, que interactúan con las fronteras del software para obtener valor. Tanto la API como el servidor de video son componentes arquitectónicos internos de la infraestructura de DemoBlaze que atienden solicitudes desde el cliente; por ende, forman parte del sistema modelado y no de los actores que demandan sus servicios.

Las relaciones de inclusión y extensión estructuran la modularidad y dependencia entre los casos de uso. Las relaciones de extensión (`<<extend>>`) representan comportamientos opcionales que condicionan o amplían el flujo de un caso de uso base. En DemoBlaze, CU-02 Paginar catálogo y CU-03 Filtrar por categoría extienden a CU-01 Explorar catálogo, debido a que el usuario puede revisar los primeros nueve artículos de la vista principal sin necesidad de filtrar por categorías ni avanzar entre páginas. De modo análogo, CU-07 Eliminar producto del carrito extiende a CU-06 Ver carrito, pues retirar un artículo constituye una decisión facultativa del comprador. En contraste, las relaciones de inclusión (`<<include>>`) señalan secuencias obligatorias que forman parte indivisible del caso de uso base. Así, CU-08 Realizar compra incluye obligatoriamente a CU-06 Ver carrito, ya que el acceso al botón de pedido exige visualizar la tabla de artículos seleccionados, e incluye a CU-09 Diligenciar formulario de pedido, puesto que la formalización de la orden requiere diligenciar y enviar el formulario modal de facturación.

Dentro de este conjunto funcional, delimitamos CU-08 Realizar compra como el caso de uso crítico evaluado, marcado en el diagrama con el estereotipo `<<crítico>>`, pues sobre él recae la culminación de la transacción comercial de la tienda. La Tabla 3 presenta el catálogo completo de los catorce casos de uso modelados.

Tabla 3. Catálogo de casos de uso

| Código | Caso de uso | Actor principal | Evidencia (paso del recorrido o captura) |
| :--- | :--- | :--- | :--- |
| CU-01 | Explorar catálogo | Visitante | Recorrido del sitio, paso 1; capturas de flujo, captura 1 |
| CU-02 | Paginar catálogo | Visitante | Recorrido del sitio, paso 2 |
| CU-03 | Filtrar por categoría | Visitante | Recorrido del sitio, paso 3; capturas de flujo, captura 2 |
| CU-04 | Ver detalle de producto | Visitante | Recorrido del sitio, paso 4; capturas de flujo, captura 3 |
| CU-05 | Agregar producto al carrito | Visitante | Recorrido del sitio, paso 5; capturas de flujo, captura 4 |
| CU-06 | Ver carrito | Visitante | Recorrido del sitio, paso 6; capturas de flujo, captura 5 |
| CU-07 | Eliminar producto del carrito | Visitante | Recorrido del sitio, paso 6; pruebas funcionales y de errores |
| CU-08 | Realizar compra | Visitante | Capturas de flujo, capturas 6 y 7; pruebas funcionales y de errores |
| CU-09 | Diligenciar formulario de pedido | Visitante | Recorrido del sitio, paso 6; capturas de flujo, captura 6 |
| CU-10 | Registrarse | Visitante | Recorrido del sitio, paso 9 |
| CU-11 | Iniciar sesión | Visitante | Recorrido del sitio, paso 9 |
| CU-12 | Cerrar sesión | Usuario registrado | Recorrido del sitio, paso 9 |
| CU-13 | Enviar mensaje de contacto | Visitante | Recorrido del sitio, paso 7 |
| CU-14 | Ver información de la tienda (About us) | Visitante | Recorrido del sitio, paso 8 |

Fuente: elaboración propia a partir de `04_informe_final/diagramas/casos_de_uso_demoblaze.puml`, `04_informe_final/evidencias/recorrido_sitio.json` y `04_informe_final/evidencias/capturas_flujo.json`.

### 2.2. Especificación del caso de uso crítico "Realizar compra"

A continuación especificamos de forma detallada el caso de uso crítico CU-08 Realizar compra, documentando sus actores, condiciones de ejecución, secuencia transaccional completa y las reglas de negocio verificadas empíricamente en la lógica del cliente y la red.

Tabla 4. Especificación del caso de uso crítico CU-08 Realizar compra

| Elemento | Especificación |
| :--- | :--- |
| Código y nombre | CU-08 Realizar compra |
| Actor principal | Visitante (o Usuario registrado por relación de generalización) |
| Actores secundarios | Ninguno. DemoBlaze no integra pasarelas de pago de terceros, sistemas de validación bancaria ni servicios logísticos externos; la transacción se procesa en el navegador del cliente mediante scripts y llamadas asíncronas a su propia API. |
| Descripción | Permite al usuario revisar los productos agregados al carrito, desplegar el formulario modal de facturación Place Order, registrar datos de pago, confirmar la orden y recibir un comprobante visual en pantalla, regresando a la página de inicio. |
| Precondiciones | El usuario debe encontrarse navegando en la plataforma DemoBlaze y haber incorporado al menos un artículo al carrito de compras mediante CU-05 Agregar producto al carrito. No se requiere autenticación previa. |
| Disparador | Clic en el enlace Cart de la barra superior de navegación. |
| Flujo principal | 1. Acción del actor: Hace clic en el enlace Cart de la barra superior para revisar su selección.<br>2. Respuesta del sistema: Carga la página `cart.html`, realiza las peticiones `POST /viewcart` y `POST /view` a la API (`04_informe_final/evidencias/capturas_flujo.json`, paso 5) y despliega la tabla con los artículos, sus precios y el total acumulado.<br>3. Acción del actor: Hace clic en el botón Place Order para abrir el formulario de pago.<br>4. Respuesta del sistema: Despliega la ventana modal `#orderModal` con los campos Name, Country, City, Credit card, Month y Year.<br>5. Acción del actor: Diligencia los campos del formulario con sus datos de facturación y hace clic en el botón Purchase.<br>6. Respuesta del sistema: Ejecuta la función `purchaseOrder()` en el cliente, verifica que Name y Credit card no estén vacíos, invoca la función `deleteCart()` para enviar la petición `POST /deletecart` a la API (`04_informe_final/evidencias/capturas_flujo.json`, paso 7) y muestra una ventana emergente de SweetAlert con el comprobante de confirmación ("Thank you for your purchase!") con Id, Amount, Card Number, Name y Date.<br>7. Acción del actor: Hace clic en el botón OK del comprobante de confirmación.<br>8. Respuesta del sistema: Ejecuta la instrucción `location.href = 'index.html'` y redirige al usuario a la página de inicio (`04_informe_final/evidencias/capturas_flujo.json`, paso 7). |
| Flujos alternos | FA-1. Compra con el carrito vacío (el sistema no hace cumplir la precondición): Si el usuario ingresa a `cart.html` sin productos (la tabla muestra cero filas y el total permanece vacío) y pulsa Place Order, el sistema despliega el formulario modal. Al ingresar Name y Credit card y pulsar Purchase, la función `purchaseOrder()` ejecuta la transacción sin validar artículos, envía la petición `POST /deletecart` y genera la confirmación exitosa de SweetAlert con "Amount: 0 USD" (`04_informe_final/evidencias/capturas_flujo.json`, clave `verificacionCarritoVacio`). |
| Flujos de excepción | FE-1. Omisión de campos obligatorios Name o Credit card: Si el actor pulsa Purchase dejando vacío Name, Credit card o ambos, el sistema interrumpe el procesamiento y muestra un diálogo nativo del navegador (`window.alert`) con el mensaje textual "Please fill out Name and Creditcard.", impidiendo avanzar hasta que ambos campos contengan texto (`01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`, prueba negativa 1).<br>FE-2. Ingreso de tarjeta alfabética y omisión de datos de ubicación y fecha: Si el actor ingresa texto alfabético en el campo de tarjeta (`TARJETA_FALSA_SIN_NUMEROS_ABC`) y deja vacíos Country, City, Month y Year, el sistema no bloquea el envío. Al hacer clic en Purchase, emite el comprobante exitoso de confirmación, ya que el script del cliente solo comprueba que Name y Credit card no sean cadenas vacías, omitiendo comprobaciones de formato numérico, algoritmo de Luhn o campos secundarios (`01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`, prueba negativa 2; `04_informe_final/evidencias/capturas_flujo.json`, clave `codigoFuente.purchaseOrder`). |
| Postcondiciones | El carrito queda vacío tras la petición `POST /deletecart` (al volver a `cart.html` la tabla muestra cero filas, según la clave `verificacionCarritoVacio`). El usuario recibe en pantalla un comprobante con identificador numérico y resumen de compra. El navegador es redirigido a `index.html`. Como el cliente no envía los datos del pedido a ningún servicio, desde lo observable la orden no queda registrada en ninguna parte. |
| Reglas de negocio observadas | 1. Identificador de compra pseudoaleatorio: El Id del comprobante se genera de manera local en el cliente mediante la expresión `Math.floor((Math.random() * 10000000) + 1)`, asignando un número entero entre 1 y 10.000.000 sin consultar al servidor, por lo que nada garantiza que no se repita (`04_informe_final/evidencias/capturas_flujo.json`, clave `codigoFuente.purchaseOrder`).<br>2. Ausencia de persistencia de órdenes: El sistema no envía los datos del pedido a ningún servicio de la API; la orden se resuelve íntegramente en el cliente sin persistencia remota (`04_informe_final/evidencias/capturas_flujo.json`, clave `codigoFuente.purchaseOrder`).<br>3. Vaciado del carrito: La confirmación del pedido invoca la función `deleteCart()`, que realiza una petición asíncrona `POST /deletecart` con el identificador del usuario (`cookie`) para eliminar los registros del carrito en el backend (`04_informe_final/evidencias/capturas_flujo.json`, claves `codigoFuente.purchaseOrder` y `codigoFuente.deleteCart`).<br>4. Desfase en la construcción de la fecha: La fecha del comprobante se genera con `new Date()` mediante la concatenación `date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear()`. Como `getMonth()` indexa los meses desde cero (enero corresponde a 0 y octubre a 9), la fecha muestra un mes de retraso (`04_informe_final/evidencias/capturas_flujo.json`, clave `codigoFuente.purchaseOrder`).<br>5. Redirección obligatoria: Al presionar el botón OK en el diálogo SweetAlert, la función callback ejecuta `location.href = 'index.html'`, forzando el retorno a la página de inicio (`04_informe_final/evidencias/capturas_flujo.json`, clave `codigoFuente.purchaseOrder`). |

Fuente: elaboración propia a partir de `04_informe_final/evidencias/capturas_flujo.json`, `04_informe_final/evidencias/recorrido_sitio.json` y `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`.

### 2.3. Uso de capturas reales en lugar de mockups

El numeral 2 de la guía docente establece que los bocetos o mockups de interfaz deben emplearse únicamente si las políticas de seguridad o confidencialidad de la empresa impiden capturar pantallas reales del software en producción. Al tratarse DemoBlaze de una plataforma pública de demostración sin fines comerciales ni restricciones de confidencialidad, optamos por incorporar capturas directas del sistema en su entorno productivo, las cuales reflejan con mayor fidelidad los componentes visuales, la distribución gráfica y el comportamiento de la interfaz ante las acciones del usuario. Las imágenes fueron recolectadas mediante una sesión automatizada de Playwright 1.64.1 en navegador Chromium sobre una ventana gráfica de 1280 por 800 píxeles, ejecutada el 25 de octubre de 2026 a la 1:08 a. m., hora de Colombia (`04_informe_final/evidencias/capturas_flujo.json`). En el diligenciamiento del proceso de facturación se utilizaron datos ficticios de prueba plenamente identificables (nombre Usuario de prueba USCO, ciudad Neiva y país Colombia), y el número de tarjeta ingresado (4111111111111111) corresponde a una numeración de prueba que no compromete información financiera real.

### 2.4. Secuencia visual del flujo de compra

Presentamos a continuación la secuencia cronológica de pantallas que componen el flujo crítico de compra en DemoBlaze, documentada a través de siete capturas de pantalla reales anotadas con recuadros rojos que identifican los elementos clave de interacción en cada etapa.

Figura 2. Página inicial del catálogo y panel lateral de categorías

![Figura 2. Página inicial del catálogo y panel lateral de categorías](capturas/01_inicio.png)

Fuente: captura propia de https://www.demoblaze.com, 25 de octubre de 2026.

La vista principal de la tienda despliega la barra superior de navegación, el carrusel publicitario y la cuadrícula inicial de nueve productos del catálogo general. El recuadro rojo señala el enlace Laptops en el panel lateral de categorías, el cual permite filtrar el inventario hacia computadores portátiles.

Figura 3. Catálogo filtrado por la categoría Laptops

![Figura 3. Catálogo filtrado por la categoría Laptops](capturas/02_categoria_laptops.png)

Fuente: captura propia de https://www.demoblaze.com, 25 de octubre de 2026.

Tras completarse la respuesta del servicio `/bycat`, la interfaz actualiza la cuadrícula mostrando los seis modelos de computadores portátiles disponibles. El recuadro rojo resalta la tarjeta del producto Sony vaio i5, sobre cuyo título hace clic el usuario para acceder a su ficha detallada.

Figura 4. Ficha de detalle de producto y botón de adición al carrito

![Figura 4. Ficha de detalle de producto y botón de adición al carrito](capturas/03_detalle_producto.png)

Fuente: captura propia de https://www.demoblaze.com, 25 de octubre de 2026.

La página de detalle `prod.html?idp_=8` exhibe el nombre, la fotografía, el precio (790 dólares, con la nota "includes tax") y la descripción técnica del computador portátil seleccionado. El recuadro rojo señala el botón Add to cart, dispuesto para agregar el artículo al carrito de compras mediante una petición a la API.

Figura 5. Estado de la barra de navegación tras agregar un producto

![Figura 5. Estado de la barra de navegación tras agregar un producto](capturas/04_carrito_sin_contador.png)

Fuente: captura propia de https://www.demoblaze.com, 25 de octubre de 2026.

Inmediatamente después de pulsar el botón Add to cart y aceptar el diálogo nativo del navegador con el texto "Product added", la pantalla regresa a la vista de detalle. El recuadro rojo evidencia que el enlace Cart en la barra de navegación superior sigue sin indicar cantidad de artículos ni mostrar insignias visuales numéricas, manteniendo el texto plano sin elementos secundarios.

Figura 6. Vista del carrito de compras y botón Place Order

![Figura 6. Vista del carrito de compras y botón Place Order](capturas/05_carrito.png)

Fuente: captura propia de https://www.demoblaze.com, 25 de octubre de 2026.

Al acceder a `cart.html`, el sistema consulta los servicios `/viewcart` y `/view` para construir la tabla de compras, la cual despliega una fila con el producto agregado, la opción para su eliminación y un total de 790. El recuadro rojo resalta el botón Place Order, requerido para avanzar hacia el formulario de facturación.

Figura 7. Formulario modal de pedido Place Order con datos de facturación

![Figura 7. Formulario modal de pedido Place Order con datos de facturación](capturas/06_formulario_pedido.png)

Fuente: captura propia de https://www.demoblaze.com, 25 de octubre de 2026.

El formulario modal `#orderModal` presenta seis campos de entrada para registrar la información del comprador y del medio de pago, los cuales fueron completados con datos de prueba evidentes. El recuadro rojo señala el botón Purchase, con el que el usuario confirma la compra.

Figura 8. Comprobante de confirmación de compra emitido por SweetAlert

![Figura 8. Comprobante de confirmación de compra emitido por SweetAlert](capturas/07_confirmacion_compra.png)

Fuente: captura propia de https://www.demoblaze.com, 25 de octubre de 2026.

Tras pulsar el botón Purchase, el sistema despliega una ventana emergente generada con la librería SweetAlert con el título "Thank you for your purchase!" y este texto literal de comprobante, que se reproduce con punto y coma en lugar de los saltos de línea originales: Id: 5317288; Amount: 790 USD; Card Number: 4111111111111111; Name: Usuario de prueba USCO; Date: 25/9/2026 (`04_informe_final/evidencias/capturas_flujo.json`, clave `comprobante`).

El recuadro rojo destaca el comprobante generado en el navegador, en el cual se aprecia que la fecha registra el mes 9 en lugar del mes 10 (`25/9/2026`), manifestando el desfase provocado por la indexación en base cero de `date.getMonth()` analizado previamente en el Punto 1.5.

## 3. Selección de criterios ISO/IEC 25010 y definición de población y muestra

La guía de trabajo práctico señala que no es posible evaluar la totalidad de un software con un solo instrumento, por lo que exige seleccionar características y subcaracterísticas concretas del estándar y advierte que "a mayor cantidad de dimensiones elegidas, mayor exigencia metodológica". Atendiendo a este criterio, elegimos tres características y nueve subcaracterísticas del modelo de calidad de producto definido en la norma ISO/IEC 25010:2023 (International Organization for Standardization y International Electrotechnical Commission, 2023). En esta sección fundamentamos el alcance seleccionado, justificamos las dimensiones excluidas, presentamos las equivalencias terminológicas con la edición de 2011 y delimitamos la población y la muestra para las pruebas con usuarios.

### 3.1. Características y subcaracterísticas seleccionadas

En la Tabla 5 detallamos las tres características y las nueve subcaracterísticas que conforman el alcance de esta evaluación, junto con su definición conceptual y el aspecto concreto del flujo de compra de DemoBlaze que se examina en cada una.

Tabla 5. Características y subcaracterísticas evaluadas

| Característica (2023) | Subcaracterística (2023) | Definición | Aspecto del flujo de compra que se evalúa |
| :--- | :--- | :--- | :--- |
| Adecuación funcional | Pertinencia funcional | Capacidad del producto de software para ofrecer un conjunto de funciones que faciliten la realización de las tareas y los objetivos del usuario. | Si las funciones del flujo permiten comprar sin pasos redundantes ni carencias: retroalimentación al agregar al carrito y número de clics para localizar un producto. |
| Eficiencia de desempeño | Comportamiento temporal | Grado en que los tiempos de respuesta y de procesamiento del producto cumplen lo esperado cuando ejecuta sus funciones. | Tiempos de respuesta de los servicios web y tiempos de renderizado de la interfaz en el navegador. |
| Eficiencia de desempeño | Capacidad | Grado en que los límites máximos de un parámetro del producto cumplen lo requerido al operar bajo condiciones de carga. | Comportamiento del sistema y tasa de fallos de las peticiones HTTP con 50 usuarios concurrentes. |
| Eficiencia de desempeño | Utilización de recursos | Grado en que las cantidades y los tipos de recursos empleados por el producto al llevar a cabo sus funciones resultan adecuados. | Recursos consumidos solo del lado del cliente y de la red (peso total transferido en la carga inicial), porque no hay acceso al servidor. |
| Capacidad de interacción | Aprendibilidad | Capacidad del producto para permitir que el usuario aprenda su funcionamiento dentro de un tiempo especificado. | Si un comprador nuevo logra completar las tareas del flujo de compra sin extraviarse en la navegación. |
| Capacidad de interacción | Operabilidad | Capacidad del producto para contar con atributos que permitan al usuario operarlo y controlarlo con facilidad. | Facilidad para operar el flujo de compra, tasa de éxito en las tareas asignadas y presencia de enlaces que funcionan sin errores de red. |
| Capacidad de interacción | Protección contra errores de usuario | Capacidad del sistema para prevenir que los usuarios cometan errores durante su operación. | Si el formulario del modal Place Order valida las entradas y bloquea el envío de datos incompletos o inválidos, y si la eliminación en el carrito previene borrados accidentales. |
| Capacidad de interacción | Involucramiento del usuario | Capacidad del producto para presentar sus funciones e información de forma atractiva y motivadora para el usuario (en 2011 se llamaba Estética de la interfaz de usuario). | Consistencia tipográfica entre los elementos de la interfaz y consistencia cromática de los componentes entre las vistas del flujo. |
| Capacidad de interacción | Inclusividad | Capacidad de un producto para ser utilizado por personas con distintos contextos, capacidades, edades o culturas (en 2011 formaba parte de Accesibilidad). | Relación de contraste entre texto y fondo, etiquetado de campos en modales, validez del marcado y ausencia de violaciones críticas de accesibilidad. |

Fuente: elaboración propia a partir de ISO/IEC 25010:2023 (International Organization for Standardization y International Electrotechnical Commission, 2023) y de las definiciones de ISO 25000 (s. f.).

Seleccionamos estas tres características porque el flujo de compra de punta a punta es una tarea ejecutada directamente por el usuario final desde el navegador. En una transacción de comercio electrónico el comprador percibe directamente tres aspectos: que las funciones disponibles resulten pertinentes para elegir el artículo y confirmar la orden sin pasos superfluos (Adecuación funcional), que las páginas y peticiones carguen en un tiempo razonable incluso cuando varios compradores concurren en la tienda (Eficiencia de desempeño) y que la interfaz sea fácil de aprender y operar, prevenga equivocaciones al ingresar los datos de pago y sea accesible para distintos perfiles de comprador (Capacidad de interacción).

Además de su relevancia para el comprador, estas tres dimensiones son las que pueden medirse con rigor desde fuera del sistema mediante pruebas automatizadas sobre el cliente y la red combinadas con observación directa y cuestionarios aplicados a usuarios reales. Limitar el alcance a estas nueve subcaracterísticas nos permite cumplir la exigencia de triangulación metodológica de la guía sin dispersar la recolección de evidencias en dimensiones para las cuales no tenemos acceso técnico.

### 3.2. Características excluidas

Excluimos del alcance las seis características restantes del modelo ISO/IEC 25010:2023: Compatibilidad, Fiabilidad, Seguridad, Mantenibilidad, Flexibilidad y Protección (en inglés, Safety, incorporada como característica nueva en la edición de 2023). Esta decisión responde a que DemoBlaze es un sistema externo en producción sobre el cual no tenemos acceso al servidor, a los registros internos de fallos ni al código fuente del backend, lo que impide auditar la mantenibilidad del software o el uso interno de recursos del servidor. Asimismo, carecemos de autorización de BlazeMeter para ejecutar pruebas dinámicas de seguridad, las cuales resultan intrusivas cuando se dirigen contra un sitio en producción perteneciente a un tercero. La propia guía de la docente menciona Seguridad y Fiabilidad entre los ejemplos posibles de evaluación, pero comprobar un parámetro de fiabilidad como una disponibilidad operativa del 99,9 % exige monitorear el servicio de manera continua durante una ventana prolongada que este trabajo académico no tiene.

Dentro de las tres características que sí seleccionamos, también dejamos fuera del alcance evaluativo las subcaracterísticas de Completitud funcional, Corrección funcional, Reconocibilidad de la adecuación, Asistencia al usuario y Autodescriptividad. El archivo de evidencia técnica `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json` agrupa algunos registros bajo las claves completitudFuncional y correccionFuncional. En este informe, los hallazgos relativos a la ausencia de un buscador por texto (buscadorPorTexto) y a la imposibilidad de modificar la cantidad de unidades en el carrito (modificacionCantidadEnCarrito) se analizan dentro de Pertinencia funcional, mientras que la comprobación de que el recorrido entre catálogo, producto y carrito opera de principio a fin (correccionFuncional) se emplea en el Paso 1 como validación del funcionamiento operativo inicial, por lo que no se evalúan como subcaracterísticas independientes.

### 3.3. Equivalencias entre las ediciones 2023 y 2011 de la norma

En este trabajo adoptamos como referencia principal la norma ISO/IEC 25010:2023, que reemplazó técnicamente a la primera edición de 2011 (International Organization for Standardization y International Electrotechnical Commission, 2011, 2023). Dado que buena parte de la literatura de ingeniería de software y varias herramientas de auditoría aún emplean las denominaciones de 2011, en la Tabla 6 relacionamos los nombres de ambas ediciones para las características y subcaracterísticas vinculadas con nuestro alcance.

Tabla 6. Equivalencias entre ISO/IEC 25010:2023 e ISO/IEC 25010:2011 para el alcance evaluado

| Nombre en 2023 | Nombre en 2011 | Cambio |
| :--- | :--- | :--- |
| Capacidad de interacción | Usabilidad | Cambio de nombre. |
| Aprendibilidad | Aprendibilidad | Sin cambio. |
| Operabilidad | Operabilidad | Sin cambio. |
| Protección contra errores de usuario | Protección contra errores de usuario | Sin cambio. |
| Involucramiento del usuario | Estética de la interfaz de usuario | Reemplazo. |
| Inclusividad y Asistencia al usuario | Accesibilidad | Accesibilidad se dividió en dos subcaracterísticas; en este trabajo se evalúa solo Inclusividad. |
| Autodescriptividad | No existía | Nueva. |
| Pertinencia funcional, Comportamiento temporal, Capacidad, Utilización de recursos | Pertinencia funcional, Comportamiento temporal, Capacidad, Utilización de recursos | Sin cambio. |
| Flexibilidad | Portabilidad | Cambio de nombre (excluida). |
| Protección (Safety) | No existía | Nueva característica (excluida). |

Fuente: elaboración propia a partir de Starke (s. f.), que reproduce el resumen de cambios de ISO, y de International Organization for Standardization y International Electrotechnical Commission (2011, 2023).

Los nombres en español empleados en las tablas y en la prosa de este informe corresponden a los acordados por el grupo. El portal iso25000.com traduce Learnability como Aprendizabilidad y User engagement como Involucración del usuario (ISO 25000, s. f.).

### 3.4. Población incluyente y excluyente

De acuerdo con el numeral 3 de la guía de la docente, antes de aplicar los instrumentos cualitativos y cuantitativos es necesario delimitar con precisión a quién se va a estudiar mediante criterios de inclusión y exclusión. Como explicamos en el apartado 1.6, DemoBlaze es una tienda demostrativa que no cuenta con compradores ni transacciones comerciales reales; por consiguiente, definimos la población de estudio como el conjunto de compradores en línea potenciales que podrían interactuar con un comercio electrónico de tecnología de estas características. En la Tabla 7 establecemos los criterios que delimitan quiénes forman parte de la población incluyente y quiénes quedan descartados en la población excluyente.

Tabla 7. Criterios de inclusión y exclusión de la población

| Criterio | Población incluyente | Población excluyente | Razón |
| :--- | :--- | :--- | :--- |
| Edad | Personas mayores de edad (18 años o más). | Personas menores de edad. | El flujo de compra simula el diligenciamiento de una tarjeta bancaria y la celebración de una compra en línea, operaciones orientadas a personas mayores de edad. |
| Experiencia en comercio electrónico | Personas que han comprado en línea al menos una vez. | Personas que nunca han realizado una compra por internet. | Se requiere que el participante reconozca las convenciones básicas de un carrito de compras digital para que los extravíos observados obedezcan al diseño de DemoBlaze y no al desconocimiento general del medio. |
| Conocimiento previo del sitio | Personas sin experiencia previa de uso o estudio sobre DemoBlaze. | Personas que ya conocen DemoBlaze antes de la sesión de prueba. | El conocimiento previo del catálogo o de la interfaz impediría evaluar en condiciones reales la aprendibilidad del sistema ante un primer contacto. |
| Relación con la evaluación técnica | Personas externas a la ejecución de las pruebas técnicas de este proyecto. | Quienes participaron en las pruebas técnicas de este trabajo. | Quienes diseñaron o corrieron las pruebas automatizadas ya conocen de antemano la estructura del flujo y sus fallas, lo cual sesgaría la observación directa y las respuestas del cuestionario. |

Fuente: elaboración propia a partir de la guía de la docente (numeral 3) y de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`.

En la sección 2 de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`, el integrante 3 definió la población objetivo como "Usuarios con alfabetización digital básica e intermedia acostumbrados a navegar en computadores personales y realizar consultas o compras en plataformas web". La muestra conformada satisface el criterio de edad (de 23 a 50 años) y el de relación con la evaluación técnica (participantes externos al equipo evaluador). En la misma sección, el integrante 3 registró que "Los 5 participantes ya habían comprado en línea al menos una vez y cada uno afirmó no conocer DemoBlaze", con lo cual la muestra satisface también los criterios de experiencia en comercio electrónico y de conocimiento previo del sitio. Como el desconocimiento de DemoBlaze se basa en la declaración de cada participante, lo retomamos en las amenazas a la validez del Paso 4.

### 3.5. Tamaño y características de la muestra

Para la aplicación de la observación directa y del cuestionario SUS seleccionamos una muestra no probabilística por conveniencia compuesta por n = 5 participantes que cumplen los criterios de la población incluyente. Sustentamos este tamaño en Nielsen (2000), según quien un estudio con cinco participantes encuentra cerca del 85 % de los problemas de usabilidad de una interfaz. El cálculo parte de la fórmula N(1 - (1 - L)^n), donde N es el total de problemas, n el número de usuarios y L la proporción que encuentra un solo usuario, con un valor típico de L = 31 %. La estimación vale siempre que los participantes correspondan a usuarios comparables ("comparable users") que utilicen el sitio de maneras razonablemente similares.

Una muestra de n = 5 participantes sirve para descubrir problemas de interacción durante la observación de tareas, pero no tiene alcance para generalizar estadísticamente el puntaje del cuestionario SUS a toda la población. De hecho, el mismo Nielsen (2000) recomienda evaluar al menos 20 usuarios cuando se realizan estudios cuantitativos orientados a estimar métricas de usabilidad con precisión estadística. Por esta razón, en este informe reportamos el puntaje SUS junto con su intervalo de confianza y lo interpretamos como un indicio descriptivo sobre la percepción de los cinco participantes evaluados, sin atribuirle carácter de medida poblacional.

A partir de la Tabla 1 de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`, la muestra quedó conformada por cinco participantes anónimos identificados como U1 a U5, con un rango de edad de 23 a 50 años, una edad media de 39,2 años y una mediana de 45 años. La composición etaria reúne a dos adultos jóvenes (U5 de 23 años y U3 de 28 años) y tres adultos de 45 y 50 años (U4 de 45 años, y U1 y U2 de 50 años). Respecto a su nivel de familiaridad, U1 y U2 poseen una destreza básica a intermedia centrada en el manejo de computadores personales; U4 cuenta con una familiaridad intermedia en computadores y navegación web; y U3 y U5 presentan un nivel alto como compradores digitales frecuentes. En las cinco sesiones se mantuvo un entorno técnico homogéneo: todos los participantes utilizaron un computador portátil con el navegador Mozilla Firefox sobre una conexión inalámbrica Wi-Fi.

Aclaramos que las pruebas técnicas automatizadas corrieron en Chromium y las sesiones con usuarios en Firefox, por lo que los tiempos de las tareas humanas no se comparan con los de las herramientas automatizadas.

## 4. Instrumentos de medición, métricas y parámetros de comportamiento

El numeral 4 de la guía de la docente establece que el diseño de la evaluación debe fijar de antemano los instrumentos, las métricas y los parámetros o límites de aceptación que determinan si el software cumple o no cada criterio, sin recurrir a datos numéricos ficticios. En consecuencia, en este capítulo definimos exclusivamente las fórmulas operativas y los umbrales de decisión, mientras que los valores medidos en las pruebas se reservan para el Punto 5. Dado que la norma ISO/IEC 25010 define el modelo de características y subcaracterísticas de calidad pero no prescribe umbrales numéricos, cada límite de comportamiento declara de manera explícita su fuente documental real, ya sea la guía de la docente, los criterios de Core Web Vitals y Google Lighthouse, las pautas WCAG 2.1 del W3C, los estudios de referencia de Sauro o una decisión justificada del grupo.

### 4.1. Tabla de instrumentos, métricas y límites de decisión

En la Tabla 8 consolidamos la matriz metodológica de evaluación desglosada por subcaracterística, conservando en la primera, tercera, cuarta y quinta columna los encabezados literales de la guía de la docente e incorporando la subcaracterística específica y la fuente documental de cada umbral.

Tabla 8. Instrumentos, métricas y límites de decisión por subcaracterística

| Dimensión ISO 25010 | Subcaracterística | Instrumento de Recolección / Herramienta | Métrica a Evaluar | Parámetros y Límites de Comportamiento (Umbrales de Éxito/Fracaso) | Fuente del umbral |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Adecuación funcional | Pertinencia funcional | Playwright (prueba funcional automatizada) y observación directa (Tareas 1 a 3) | Retroalimentación persistente: RP (%) = (acciones críticas que dejan una señal visible en la página después de ejecutarse, sin depender solo de un diálogo nativo del navegador / acciones críticas evaluadas) x 100. Acciones críticas evaluadas: agregar al carrito (Add to cart) y confirmar la compra (Purchase). Datos complementarios de la observación: comentarios registrados sobre la confirmación de Add to cart y el acceso al carrito, y tiempo de permanencia del diálogo nativo en pantalla | RP = 100 % | Decisión del grupo apoyada en Laubheimer (2018). |
| Adecuación funcional | Pertinencia funcional | Playwright (ruta automatizada) | Clics para localizar un producto: C = número de clics desde index.html hasta abrir la página de detalle del producto objetivo (Sony vaio i5). La observación directa no contó clics; aporta el tiempo de la Tarea 1 y los comentarios sobre la falta de buscador como dato complementario | C ≤ 3 clics | Decisión del grupo. |
| Eficiencia de desempeño | Comportamiento temporal | k6 con 50 usuarios virtuales concurrentes | Tiempo de respuesta promedio: T (s) = suma de las duraciones de las peticiones HTTP / número de peticiones | T < 2,0 s con 50 usuarios concurrentes | Guía de la docente, numeral 4. |
| Eficiencia de desempeño | Comportamiento temporal | Lighthouse en emulación móvil con throttling simulado (RTT 150 ms, ~1,6 Mbps, CPU x4), en dos corridas independientes | Largest Contentful Paint (LCP): tiempo desde el inicio de la navegación hasta que se pinta el elemento de contenido más grande | LCP ≤ 2,5 s | Walton y Pollard (2025), Core Web Vitals. |
| Eficiencia de desempeño | Comportamiento temporal | Lighthouse (mismas condiciones, dos corridas) | First Contentful Paint (FCP): tiempo hasta que se pinta el primer contenido | FCP ≤ 1,8 s | Walton (2023). |
| Eficiencia de desempeño | Comportamiento temporal | Lighthouse (mismas condiciones, dos corridas) | Cumulative Layout Shift (CLS): suma de los desplazamientos inesperados del contenido durante la carga. Mide la estabilidad visual mientras la página termina de cargar, un aspecto del comportamiento de la página en el tiempo | CLS ≤ 0,1 | Mihajlija y Walton (2023), Core Web Vitals. |
| Eficiencia de desempeño | Comportamiento temporal | Lighthouse (mismas condiciones, dos corridas) | Puntaje de rendimiento de Lighthouse (0 a 100), que combina las métricas de carga ponderadas | Puntaje ≥ 90 | Chrome for Developers (2019b), rango "Good". |
| Eficiencia de desempeño | Comportamiento temporal | Script de medición HTTP con Node.js (fetch y performance.now()) | Tiempo de respuesta HTTP de los servicios /view y /bycat de la API: promedio de las duraciones de las peticiones respondidas con HTTP 200. Las peticiones fallidas se reportan aparte | < 2,0 s, por extensión del límite de la guía | Guía de la docente, numeral 4 (extensión propuesta por el grupo). |
| Eficiencia de desempeño | Capacidad | k6 con 50 usuarios virtuales concurrentes | Tasa de error: E (%) = (peticiones HTTP fallidas / peticiones HTTP totales) x 100 | E ≤ 1 % (una tasa mayor al 1 % indica fallo de rendimiento) | Guía de la docente, numeral 4. |
| Eficiencia de desempeño | Utilización de recursos | Lighthouse (dos corridas) y medición de recursos con Playwright (Resource Timing y CDP) | Peso total transferido: P (KiB) = suma de los bytes transferidos por todas las peticiones de la carga inicial de index.html / 1.024 | P < 1.600 KiB | Chrome for Developers (2019a). |
| Capacidad de interacción | Aprendibilidad | Observación directa (Tareas 1 a 4) | Extravíos: X(p, t) = número de extravíos del participante p en la tarea t, según la definición operativa del apartado 4.2. Datos complementarios: promedio de extravíos por participante y proporción de participantes con 2 o menos | Una tarea falla si algún participante registra más de 2 extravíos en ella | Guía de la docente, numeral 4 ("si el usuario se extravía más de 2 veces en una tarea básica, el diseño de interacción falla"). |
| Capacidad de interacción | Aprendibilidad | Cuestionario SUS, ítems 4 y 10 | Subescala de aprendizaje (dato complementario): A = ((5 - X4) + (5 - X10)) x 12,5, de 0 a 100, donde X4 y X10 son las respuestas de 1 a 5 a los ítems 4 y 10; se reporta el promedio de los 5 participantes | Sin umbral propio: se reporta como dato complementario y la decisión de Aprendibilidad depende del conteo de extravíos | Lewis y Sauro (2009) y Sauro (2011a) para su origen; Sauro (2017) para la advertencia. |
| Capacidad de interacción | Operabilidad | Cuestionario SUS (10 ítems, escala de 1 a 5) | SUS individual = (suma de (X - 1) en los ítems impares + suma de (5 - X) en los ítems pares) x 2,5; SUS global = promedio de los 5 participantes | SUS global ≥ 68 sobre 100 | Guía de la docente, numeral 4, y Sauro (2011a). |
| Capacidad de interacción | Operabilidad | Observación directa (Tareas 1 a 4) | Éxito por tarea: S(t) (%) = (participantes que completan la tarea t sin asistencia del observador / 5) x 100 | S(t) ≥ 80 % (al menos 4 de 5) en cada tarea | Decisión del grupo apoyada en Sauro (2011b), que reporta un 78 % promedio en casi 1.200 tareas; 80 % es el valor alcanzable con n = 5 más cercano. |
| Capacidad de interacción | Operabilidad | Verificación de enlaces con Playwright (dos corridas independientes) | Enlaces rotos: número de enlaces e imágenes de las vistas del flujo que responden con HTTP 404 o 5xx | 0 enlaces rotos | Decisión del grupo. |
| Capacidad de interacción | Protección contra errores de usuario | Playwright (pruebas negativas del formulario Place Order) y observación directa (Tarea 4: dudas registradas sobre el formato y la obligatoriedad de los campos) | Tasa de rechazo: R (%) = (envíos inválidos que el sistema bloquea / envíos inválidos probados) x 100. Es inválido un envío con campos obligatorios vacíos o con un número de tarjeta con formato no numérico | R = 100 % | Decisión del grupo. |
| Capacidad de interacción | Protección contra errores de usuario | Playwright (prueba funcional con intercepción de red) y observación directa (Tarea 3, que incluye la eliminación instruida del Apple monitor 24) | Confirmación de borrado: D (%) = (acciones Delete que piden confirmación u ofrecen deshacer / acciones Delete probadas) x 100 | D = 100 % | Decisión del grupo. |
| Capacidad de interacción | Involucramiento del usuario | Playwright (estilos computados, dos auditorías independientes) | Uniformidad tipográfica: UT (%), fórmula del apartado 4.2 | UT ≥ 90 % | Decisión justificada del grupo. |
| Capacidad de interacción | Involucramiento del usuario | Playwright (estilos computados, dos auditorías independientes) | Consistencia cromática entre componentes: CCC (%), fórmula del apartado 4.2 | CCC = 100 % | Decisión justificada del grupo. |
| Capacidad de interacción | Inclusividad | axe-core (reglas WCAG 2.1 niveles A y AA) | Número de violaciones con impacto crítico ("critical") en index.html y cart.html | 0 violaciones críticas | Decisión del grupo basada en WCAG 2.1 (Kirkpatrick et al., 2025). |
| Capacidad de interacción | Inclusividad | axe-core (regla color-contrast) y cálculo de la relación de contraste | Conformidad de contraste: CC (%) = (elementos de texto auditados con relación de contraste ≥ 4,5:1, o ≥ 3:1 si son texto grande / elementos de texto auditados) x 100 | CC = 100 % | Kirkpatrick et al. (2025), WCAG 2.1, criterio 1.4.3, nivel AA. |
| Capacidad de interacción | Inclusividad | Playwright y axe-core con los modales abiertos | Etiquetado de campos: EC (%) = (campos de los modales con etiqueta asociada o nombre accesible / campos auditados) x 100 | EC = 100 % | Decisión del grupo basada en WCAG 2.1. |
| Capacidad de interacción | Inclusividad | W3C Nu Html Checker (servicio de validación de marcado del W3C) | Número de errores de marcado HTML en index.html (mensajes de tipo error; las advertencias se reportan aparte) | 0 errores | Decisión del grupo. |

Fuente: elaboración propia a partir de la guía de la docente (numeral 4), del acuerdo del grupo y de las fuentes citadas en la última columna.

Cuatro aspectos de la Tabla 8 requieren aclaración. Primero, en las métricas LCP, FCP y CLS utilizamos el operador "menor o igual" porque la documentación oficial de web.dev formula así el rango aceptable mediante la expresión "or less" (Mihajlija y Walton, 2023; Walton, 2023; Walton y Pollard, 2025), mientras que en el tiempo de respuesta promedio y en el peso transferido empleamos el operador "menor que" por fidelidad literal a la guía de la docente y a la recomendación de Lighthouse ("below 1,600 KiB"; Chrome for Developers, 2019a). Segundo, la corrida automatizada de Lighthouse se ejecutó bajo emulación móvil con throttling simulado (RTT de 150 ms, ancho de banda aproximado de 1,6 Mbps y ralentización de CPU por un factor de 4), condición más exigente que una conexión de escritorio; al respecto, Chrome for Developers (2019b) advierte que las ejecuciones en escritorio y en móvil aplican curvas de puntuación diferentes. Tercero, la subescala de aprendizaje derivada de los ítems 4 y 10 del SUS (Lewis y Sauro, 2009; Sauro, 2011a) no tiene un umbral de decisión propio porque Sauro (2017), junto con Lewis, recomienda tratar el SUS como una medida unidimensional de usabilidad percibida y no calcular sus subescalas de manera rutinaria, razón por la cual la incluimos únicamente como dato descriptivo de apoyo. Cuarto, el diseño inicial preveía PageSpeed Insights, GTmetrix y las extensiones de Chrome Check My Links, WhatFont y ColorZilla; la tabla nombra los instrumentos que finalmente se aplicaron y el Paso 2 (después de la Tabla 13) explica cada sustitución.

### 4.2. Definiciones operativas

Para que las métricas de apariencia visual y de comportamiento del usuario durante las sesiones prácticas puedan replicarse sin ambigüedad, establecemos a continuación sus definiciones operativas, diferenciando con precisión el ámbito de cada indicador.

#### Uniformidad tipográfica y consistencia cromática

Evaluamos la consistencia visual dentro de la subcaracterística de Involucramiento del usuario mediante dos fórmulas complementarias:

1. Uniformidad tipográfica: UT (%) = (elementos auditados cuya familia tipográfica computada coincide con la familia dominante del sitio / elementos auditados) x 100.

2. Consistencia cromática entre componentes: CCC (%) = (elementos auditados cuyo color de texto y color de fondo efectivo son iguales a los de su homólogo en otra vista / elementos auditados que tienen homólogo en otra vista) x 100.

Consideramos homólogos aquellos elementos que comparten la misma clase y cumplen la misma función interactiva en vistas distintas del flujo (por ejemplo, el botón verde de acción principal en prod.html y el de cart.html). La propiedad tipográfica queda fuera del cálculo de CCC porque ya es medida por el indicador UT. Asimismo, la relación de contraste entre el color de texto y el fondo no se incluye dentro de Involucramiento del usuario, sino que se evalúa exclusivamente en la subcaracterística de Inclusividad bajo el criterio 1.4.3 de WCAG 2.1 (Kirkpatrick et al., 2025), evitando así penalizar dos veces un mismo defecto cromático. En cuanto a los límites de decisión, fijamos UT ≥ 90 % y no 100 % porque el sitio integra librerías externas como Bootstrap cuyos estilos por defecto pueden introducir variaciones menores en ciertos controles; en cambio, un mismo componente sí debe conservar exactamente su esquema de color en todas las vistas donde aparece, razón por la cual exigimos CCC = 100 %.

#### Extravío y éxito de tarea

Para evaluar la observación directa de las tareas asignadas a los participantes, definimos de manera operativa qué eventos observables constituyen un extravío y cuándo una tarea se considera exitosa:

1. Eventos que suman un extravío: se contabiliza un extravío cada vez que el participante, mientras intenta resolver una tarea sin asistencia, incurre en cualquiera de tres conductas observables: primero, un desvío de ruta o de categoría al abrir una vista, un modal o un filtro que no forma parte de la ruta mínima de la tarea; segundo, un clic sobre un elemento que aparenta ser interactivo pero carece de destino útil para la tarea, o el uso del botón de retroceso del navegador o del enlace Home para deshacer un desvío previo; y tercero, pedir ayuda al observador o manifestar verbalmente que no sabe cómo continuar.

2. Eventos que no cuentan como extravío: excluimos del conteo de extravíos los errores de digitación o de formato cometidos cuando el participante ya se encuentra dentro del formulario correcto (como ingresar letras en el campo de tarjeta del modal Place Order o dejar casillas vacías), dado que en ese escenario no existe desorientación espacial en la navegación y el fenómeno pertenece a la subcaracterística de Protección contra errores de usuario. Tampoco suman extravío los clics repetidos por impaciencia sobre un mismo botón correcto mientras responde la red, los cuales se registran aparte como clics innecesarios. Cada extravío se cuenta como un número entero por participante y por tarea individual en las cuatro tareas.

3. Éxito de tarea: consideramos que una tarea es exitosa cuando el participante logra completarla por sus propios medios sin recibir asistencia del observador. Si el participante finaliza la tarea con dificultad o tras desviarse de la ruta óptima, la tarea cuenta igualmente como exitosa y esa fricción queda capturada en el número de extravíos registrados; por el contrario, si solicita ayuda para poder avanzar, la tarea se califica como no exitosa y dicha solicitud añade además un extravío al registro.

En la Tabla 9 presentamos las rutas mínimas de referencia y el número mínimo de clics de las cuatro tareas aplicadas en el protocolo de observación directa, que sirven como patrón de comparación para el conteo de clics y extravíos.

Tabla 9. Rutas mínimas de referencia de las tareas de observación directa

| Tarea | Objetivo | Ruta mínima | Clics mínimos |
| :--- | :--- | :--- | :--- |
| Tarea 1 (Sony vaio i5) | Localizar el Sony vaio i5 desde index.html y agregarlo al carrito. | Ruta A: Laptops, Sony vaio i5, Add to cart (3 clics). Ruta B: el Sony vaio i5 ya aparece en el catálogo inicial; clic en el producto y en Add to cart (2 clics). | 2 clics |
| Tarea 2 (Apple monitor 24) | Aceptar el diálogo del producto anterior, volver al catálogo, localizar el Apple monitor 24 (prod.html?idp_=10) y agregarlo. | OK del diálogo, Home, Monitors, Apple monitor 24, Add to cart. Alternativa equivalente: Next en lugar de Monitors, porque el producto está en la segunda página del catálogo. | 5 clics |
| Tarea 3 (Carrito) | Aceptar el diálogo, ir al carrito, eliminar el Apple monitor 24 y abrir el formulario. | OK del diálogo, Cart, Delete en la fila del Apple monitor 24 (la página se recarga), Place Order. | 4 clics |
| Tarea 4 (Formulario y compra) | Diligenciar el formulario Place Order, confirmar la compra y cerrar el comprobante. | Escritura en los campos (el sistema solo exige Name y Credit card; la instrucción pide completar el formulario de seis campos), Purchase, OK. | 2 clics, más escritura |

Fuente: elaboración propia a partir de `03_investigacion_usuarios_ux/evidencia_sesiones/Cuestionario.pdf`, `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`, `04_informe_final/evidencias/recorrido_sitio.json`, `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json` (enlace Home) y `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/prueba_delete_carrito.json` (recarga tras Delete).

La instrucción de la prueba figura en el encabezado del formulario del cuestionario, en la página 1 de `03_investigacion_usuarios_ux/evidencia_sesiones/Cuestionario.pdf`, como una misión de tres pasos: "Imagina que vas a comprar en esta tienda en línea. Tu misión tiene 3 pasos: 1. Encuentra el portátil Sony vaio i5 y agrégalo al carrito de compras. 2. Regresa al catálogo, encuentra el monitor Apple monitor 24 y agrégalo también al carrito. 3. Ve a tu carrito de compras, elimina el monitor para quedarte solo con el portátil y finaliza la compra completando el formulario del botón Place Order". En el análisis posterior, el integrante 3 dividió el tercer paso en las Tareas 3 y 4 a partir de los hitos del video, contabilizando el cierre de cada diálogo nativo en la tarea siguiente. Los envíos inválidos del formulario no formaron parte de la instrucción y se evalúan solo con Playwright, mediante la tasa de rechazo R; en la Tarea 4, la observación registra las dudas de los participantes sobre el formato y la obligatoriedad de los campos. Según el punto 2, los errores de digitación dentro del formulario no cuentan como extravíos, pero pedir ayuda al evaluador sí cuenta, según el punto 1.

### 4.3. Triangulación de instrumentos

El numeral 4 de la guía de la docente exige aplicar triangulación metodológica, combinando las mediciones obtenidas mediante herramientas técnicas automatizadas con instrumentos de percepción y desempeño humano para evitar sesgos de un único método. En la Tabla 10 sintetizamos cómo se articula este cruce para cada característica y subcaracterística evaluada.

Tabla 10. Triangulación entre métricas automatizadas e instrumentos humanos

| Característica | Métricas automatizadas | Instrumento humano | Tipo de cruce |
| :--- | :--- | :--- | :--- |
| Adecuación funcional (Pertinencia funcional) | Verificación en el DOM de la retroalimentación al pulsar Add to cart y Purchase, ausencia de buscador y conteo mínimo de clics con Playwright. | Observación directa de las Tareas 1 a 3: tiempos por tarea, comentarios y preguntas sobre la falta de buscador y el acceso al carrito, y tiempo de permanencia del diálogo nativo de Add to cart | Directo |
| Capacidad de interacción (Aprendibilidad, Operabilidad y Protección contra errores de usuario) | Verificación de enlaces con Playwright en dos corridas independientes, inyección de pruebas negativas en el formulario Place Order y prueba de borrado (Delete) con Playwright. | Cuestionario SUS (puntaje global y subescala de aprendizaje) y observación directa de las Tareas 1 a 4 (éxito por tarea, extravíos, eliminación instruida del Apple monitor 24 y dudas registradas al diligenciar el formulario Place Order) | Directo |
| Capacidad de interacción (Involucramiento del usuario e Inclusividad) | Dos auditorías independientes de familias tipográficas y colores computados con Playwright; escaneo de reglas WCAG 2.1 con axe-core y validación de marcado con el W3C Nu Html Checker. | Comentarios sobre la apariencia visual o la legibilidad anotados por el evaluador durante la observación directa | Débil (sin comentarios registrados) |
| Eficiencia de desempeño (Comportamiento temporal, Capacidad y Utilización de recursos) | Pruebas de carga con 50 usuarios virtuales en k6, métricas LCP, FCP, CLS, puntaje de rendimiento, peso transferido en dos corridas de Lighthouse y medición de recursos con Playwright (Resource Timing y CDP). | Registro de tiempos por tarea y de comentarios anotados por el evaluador sobre demoras o esperas percibidas durante la observación directa. | Indirecto |

Fuente: elaboración propia a partir de la guía de la docente (numeral 4) y del diseño metodológico del grupo.

En Adecuación funcional y en las tres primeras subcaracterísticas de Capacidad de interacción (Aprendibilidad, Operabilidad y Protección contra errores de usuario) la triangulación es directa, pues el mismo fenómeno técnico auditado por los scripts (como la ausencia de contador en el enlace Cart, la falta de barra de búsqueda o la aceptación de una tarjeta alfabética en el modal Place Order) se enfrenta con el comportamiento observable y las respuestas de los cinco participantes al ejecutar las Tareas 1 a 4 y al diligenciar el cuestionario SUS. En cambio, para Involucramiento del usuario e Inclusividad el contraste con la percepción humana dependía de que las sesiones recogieran menciones sobre el aspecto gráfico o el contraste de los textos; no obstante, la matriz de observación del integrante 3 (`03_investigacion_usuarios_ux/datos/matriz_observacion_5_usuarios.csv`) no registra comentarios sobre el aspecto gráfico ni sobre la legibilidad. Por consiguiente, en el Paso 4 declaramos que el cruce para ambas subcaracterísticas es débil y que su análisis descansa de manera prioritaria en la evidencia técnica.

En Eficiencia de desempeño el cruce tiene un alcance menor. No contamos con un instrumento humano diseñado para medir velocidades de red o milisegundos de renderizado, por lo que la triangulación en esta dimensión es indirecta y se apoya en los comentarios anotados por el evaluador sobre posibles demoras y en el tiempo total empleado en cada tarea. Aclaramos que el estudio no aplicó un protocolo estructurado de pensamiento en voz alta ni registró transcripciones verbales continuas (sección 6 de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`). Dado que el tiempo de tarea de un participante incluye el lapso que la persona dedica a leer, pensar y decidir qué hacer, dicha medida no es directamente comparable con métricas técnicas como el LCP o el tiempo de respuesta de la API, sino que sirve únicamente para verificar si los usuarios percibieron esperas molestas durante la navegación. Esta limitación metodológica se retoma de manera explícita dentro del análisis de amenazas a la validez en el Paso 4.

## 5. Proceso de evaluación paso a paso

En este capítulo documentamos la aplicación empírica del proceso de evaluación estructurado según los cinco pasos definidos en la guía de la docente. Comenzamos con la preparación del ambiente de pruebas y la determinación de la línea base operativa, para luego registrar las mediciones obtenidas mediante herramientas técnicas automatizadas y los resultados de las pruebas con usuarios. Con estos insumos procedemos a la triangulación frente a los parámetros definidos en el Punto 4 y a la formulación de recomendaciones de mejora para el sistema evaluado.

### Paso 1. Preparación del entorno y línea base

El primer paso de la guía exige configurar el ambiente de pruebas o conectarse de manera segura con el software en producción, contando con la debida autorización, y validar su funcionamiento operativo inicial antes de ejecutar los instrumentos de medición. A continuación detallamos las características del entorno técnico empleado y comprobamos la disponibilidad previa tanto del flujo crítico como de la infraestructura de red.

#### Configuración del ambiente de pruebas

Para garantizar la reproducibilidad de las mediciones, en la Tabla 11 consolidamos los parámetros del entorno de hardware, software, red y perfiles de emulación empleados durante la ejecución de las pruebas técnicas.

Tabla 11. Ambiente de ejecución de las pruebas técnicas

| Elemento | Valor | Evidencia |
| :--- | :--- | :--- |
| Fecha y hora de ejecución técnica (integrante 1) | 24 de octubre de 2026, de 21:37:55 a 21:42:56 (UTC-5; 25 de octubre de 2026, de 02:37:55 a 02:42:56 UTC) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` y `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json` |
| Segunda ejecución técnica (integrante 1) | 25 de octubre de 2026, de 21:04:13 a 21:11:16 (UTC-5; 26 de octubre de 2026, de 02:04:13 a 02:11:16 UTC). Se ejecutaron el inventario de versiones, los tiempos de respuesta HTTP de /view y /bycat, la auditoría de etiquetas con los modales abiertos y la prueba funcional de Delete en el carrito | `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json`, `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/tiempos_http_view_bycat.json`, `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/auditoria_labels_modales_abiertos.json` y `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/prueba_delete_carrito.json` |
| Sistema operativo del equipo (integrante 1) | Windows 11 Pro de 64 bits, versión 10.0.26200.9711, según el inventario de versiones. La cadena User-Agent registrada por Lighthouse identifica el sistema como Windows NT 10.0 de 64 bits (environment.hostUserAgent) | `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json` y `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Equipo y procesador (integrante 1) | Procesador 12th Gen Intel(R) Core(TM) i5-12500H, con 16 núcleos lógicos y una velocidad de 3.110 MHz según el sistema operativo. Memoria RAM de 39,69 GiB (42.619.752.448 bytes; cálculo propio: división de bytes entre 1.024³). Índice de rendimiento de CPU en Lighthouse: 2.473,50 (benchmarkIndex) | `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json` y `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Herramientas y versiones principales (integrante 1) | Lighthouse 13.5.0; HeadlessChrome 155.0.0.0; axe-core 4.14.0; Playwright 1.64.1; @playwright/test 1.64.1; @axe-core/playwright 4.14.0 | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json`, `pnpm-lock.yaml` y `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json` |
| Herramientas de línea de comandos (integrante 1) | k6 2.2.0 (go1.26.5, windows/amd64); Node.js 24.16.0; pnpm 12.15.0; fast-cli 6.0.0; Lighthouse CLI 13.5.0 | `01_pruebas_automatizadas_cli/evidencias/versiones_herramientas.json` |
| Conectividad y red (integrante 1) | Proveedor: Claro; ubicación geográfica del cliente: Neiva, CO; servidores de medición: Bogota, CO y Miami, US | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Perfil de emulación y throttling de Lighthouse | Factor de forma: mobile; método de regulación: simulate; RTT: 150 ms; ancho de banda: 1.638,40 Kbps (1,60 Mbps); multiplicador de CPU: 4x; pantalla: 412 x 823 px (deviceScaleFactor 1,75); dispositivo emulado: moto g power (2022). Las dos corridas de Lighthouse, la del integrante 1 y la del integrante 2, usaron este mismo perfil | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` y `02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json` |
| Ventana gráfica de Playwright | 1280 x 800 px (línea 7) | `01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs` |
| Ejecución de la auditoría web (integrante 2) | 25 de octubre de 2026, de 22:42:57 a 22:49:42 (UTC-5; 26 de octubre de 2026, de 03:42:57 a 03:49:42 UTC). En ese orden se ejecutaron la línea base con Fast.com, la segunda corrida de Lighthouse, la medición de recursos, la verificación de enlaces, la auditoría de estilos computados y la validación W3C | `02_auditoria_extensiones_ui/datos/01_red.json` a `02_auditoria_extensiones_ui/datos/06_estilos_ui.json` |
| Equipo y herramientas (integrante 2) | La evidencia no registra el procesador, la memoria ni la versión del sistema operativo del equipo: `[PENDIENTE: integrante 2, procesador, memoria RAM y versión del sistema operativo del equipo]`. La cadena User-Agent registrada por Lighthouse identifica el sistema como Windows NT 10.0 de 64 bits y el navegador como HeadlessChrome 156.0.0.0 (environment.hostUserAgent). Índice de rendimiento de CPU en Lighthouse: 1.377 (benchmarkIndex). Herramientas: Lighthouse CLI 13.5.0, ejecutado de forma local por el script de captura con el Chromium de Playwright (línea 91 de `02_auditoria_extensiones_ui/scripts/02_captura_pagespeed.mjs`); Playwright con Chromium en modo headless; W3C Nu Html Checker 26.10.18 | `02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json`, `02_auditoria_extensiones_ui/datos/05_w3c.json` y `02_auditoria_extensiones_ui/scripts/02_captura_pagespeed.mjs` |
| Conectividad y red (integrante 2) | Proveedor: no registrado (el campo isp de la medición de Fast.com quedó vacío); ubicación geográfica del cliente: Rivera, CO; servidores de medición: Medellin, CO, Bogota, CO y Miami, US | `02_auditoria_extensiones_ui/datos/01_red.json` |
| Ventana gráfica de los scripts (integrante 2) | 1440 x 900 px en los seis scripts (constante VIEWPORT, línea 5 en cinco de ellos y línea 11 en `02_captura_pagespeed.mjs`) | `02_auditoria_extensiones_ui/scripts/` |
| Corridas de modelado y capturas (integrante 4) | Recorrido del sitio: 25 de octubre de 2026, 00:23:34 (UTC-5; 2026-10-25T05:23:34.927Z UTC); capturas de flujo: 25 de octubre de 2026, 01:08:31 (UTC-5; 2026-10-25T06:08:31.612Z UTC). Herramienta: Playwright 1.64.1 en Chromium headless con ventana gráfica de 1280x800 px. Equipo: AMD Ryzen 7 7445HS (6 núcleos, 12 hilos), 15,2 GB de RAM, Windows 11 Home Single Language de 64 bits (versión 10.0.26200) y Node.js 24.16.0 | `04_informe_final/evidencias/recorrido_sitio.json` y `04_informe_final/evidencias/capturas_flujo.json` |

Fuente: elaboración propia a partir de los archivos de evidencia citados.

El integrante 1 levantó el inventario de versiones y las características de su equipo en la segunda ejecución técnica, un día después de la primera sesión. Las versiones de Lighthouse 13.5.0 y HeadlessChrome 155 de la primera ejecución constan en su propio reporte de auditoría. Por su parte, asumimos que las versiones de k6, Node.js y fast-cli de la primera ejecución coinciden con las documentadas al día siguiente, dado que se utilizó el mismo equipo de cómputo y el repositorio no dispone de un registro técnico con fecha de la primera jornada. A su vez, el integrante 2 ejecutó su auditoría el 25 de octubre de 2026 desde otro equipo y otra conexión, en Rivera, CO. El índice de rendimiento de CPU que registró Lighthouse en su equipo (1.377) es distinto del registrado en el equipo del integrante 1 (2.473,50).

Respecto al acceso al sistema y las autorizaciones requeridas, señalamos que DemoBlaze es un portal web público que BlazeMeter presenta como uno de sus sitios de demostración y que usa en su propia documentación para ejecutar pruebas (Panetti, 2023). No contamos con una autorización escrita de su propietario. Por esta razón limitamos nuestras intervenciones exclusivamente a pruebas no intrusivas: navegación automatizada mediante scripts de consulta, auditorías del lado del cliente ejecutadas directamente en el navegador y una prueba de carga acotada a 50 usuarios virtuales durante un lapso total de 30 segundos, dividida en rampa de 5 segundos hasta 50 usuarios, meseta de 20 segundos con 50 usuarios y descenso de 5 segundos hasta 0 usuarios (`01_pruebas_automatizadas_cli/scripts/carga_k6.js`). No se realizaron pruebas de seguridad dinámicas ni análisis de vulnerabilidades, de conformidad con lo expuesto en el apartado 3.2.

#### Validación del funcionamiento operativo inicial

Antes de iniciar la recolección sistemática de métricas, el integrante 1 ejecutó una prueba de humo sobre el flujo crítico para confirmar que los servicios y componentes principales de DemoBlaze respondían. Dicha comprobación constató que la vista principal del catálogo listó tres categorías de productos (Phones, Laptops, Monitors) y nueve artículos iniciales. Al seleccionar el filtro Laptops, el catálogo desplegó seis computadores portátiles y permitió localizar el producto objetivo Sony vaio i5, cuya página de detalle se cargó en la dirección https://www.demoblaze.com/prod.html?idp_=8. Posteriormente, tras incorporarlo al carrito, la vista de compras presentó una fila de producto con un total registrado de 790. Esta secuencia quedó documentada en cinco capturas de pantalla ubicadas en `01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/`, dentro de las cuales se encuentran las tres primeras correspondientes al catálogo (`01_home_catalogo.png`), el detalle del producto (`02_detalle_producto.png`) y el carrito de compras (`03_carrito_compras.png`). En el archivo `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`, este registro aparece rotulado bajo la clave correccionFuncional; señalamos que en este documento se emplea únicamente como verificación del funcionamiento inicial y no como una subcaracterística evaluada de manera formal, según lo expuesto en el apartado 3.2.

Además, la sesión de captura del integrante 4 reseñada en el Punto 2 completó una transacción completa con datos de prueba, obteniendo el comprobante visual emitido por SweetAlert con el identificador Id: 5317288, monto de 790 USD, tarjeta 4111111111111111, nombre Usuario de prueba USCO y fecha 25/9/2026 (`04_informe_final/evidencias/capturas_flujo.json`), ilustrado en la Figura 8.

Asimismo, establecimos la línea base de conectividad y tiempos de respuesta de la red previa al inicio de las mediciones, cuyos resultados presentamos en la Tabla 12.

Tabla 12. Línea base de red previa a las pruebas

| Herramienta | Medición | Valor | Evidencia |
| :--- | :--- | :--- | :--- |
| Fast.com (Playwright, integrante 1) | Velocidad de descarga | 760,00 Mbps | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Fast.com (Playwright, integrante 1) | Velocidad de subida | 530,00 Mbps | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Fast.com (Playwright, integrante 1) | Latencia sin carga | 9 ms | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Fast.com (Playwright, integrante 1) | Latencia bajo carga | 13 ms | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| fast-cli | Velocidad de descarga | 580,00 Mbps | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| fast-cli | Velocidad de subida | 510,00 Mbps | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| fast-cli | Latencia sin carga | 10 ms | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| fast-cli | Bufferbloat | 22 ms | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Tiempo de respuesta HTTP frontend (método HEAD, 10 peticiones) | Promedio, mínimo y máximo registrados | Promedio: 378,67 ms; mínimo: 266,05 ms; máximo: 690,57 ms | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Tiempo de respuesta HTTP frontend (cálculo propio sin muestra fallida) | Promedio, mínimo y máximo recalculados | Promedio: 391,18 ms; mínimo: 266,41 ms; máximo: 690,57 ms (sobre 9 muestras exitosas) | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Tiempo de respuesta HTTP backend /entries (método GET, 10 peticiones) | Promedio, mínimo, máximo y códigos 200 | Promedio: 337,61 ms; mínimo: 157,63 ms; máximo: 1.354,52 ms; 10 muestras con status 200 (de 10 iteraciones) | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Resumen global combinado | Promedio de respuesta de DemoBlaze | 358,14 ms | `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` |
| Fast.com (Playwright, integrante 2) | Velocidad de descarga | 80,00 Mbps | `02_auditoria_extensiones_ui/datos/01_red.json` |
| Fast.com (Playwright, integrante 2) | Velocidad de subida | 88,00 Mbps | `02_auditoria_extensiones_ui/datos/01_red.json` |
| Fast.com (Playwright, integrante 2) | Latencia sin carga | 11 ms | `02_auditoria_extensiones_ui/datos/01_red.json` |
| Fast.com (Playwright, integrante 2) | Latencia bajo carga | 1.100 ms (Fast.com la muestra en pantalla como 1.1 s) | `02_auditoria_extensiones_ui/datos/01_red.json` |

Fuente: elaboración propia a partir de `01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json` y `02_auditoria_extensiones_ui/datos/01_red.json`.

Los valores de la Tabla 12 requieren cinco aclaraciones. En primer lugar, lo que el script `medir_red.mjs` llama latencia no es un ping ICMP, sino el tiempo que tarda una petición HTTP ejecutada con la función `fetch` de JavaScript. En segundo lugar, las mediciones de fast-cli provienen de una ejecución previa del integrante 1: el script `medir_red.mjs` no ejecuta el binario de fast-cli en tiempo de ejecución (carece de invocaciones mediante child_process, exec o spawn) y asigna el bloque de datos a partir de la variable fastCliPrevio (línea 133), la cual recupera del archivo preexistente mediante `fs.readFileSync(OUTPUT_PATH)` (línea 136), por lo que dichos registros no tienen una marca de tiempo generada durante la sesión automatizada. En tercer lugar, durante el muestreo sobre el frontend web, la iteración 9 arrojó un resultado con código ERROR (latencia de 266,05 ms con ok = false). Según la lógica de `medir_red.mjs`, la rutina asignó el estado ERROR en la línea 30 pero el cálculo estadístico de la línea 37 filtró únicamente por tipo numérico, incorporando la muestra fallida dentro del cómputo del promedio (378,67 ms) y del valor mínimo (266,05 ms). Por tal motivo efectuamos un cálculo propio excluyendo dicha muestra, a partir del cual el promedio de las nueve muestras válidas se sitúa en 391,18 ms (suma de 3.520,61 ms dividida entre 9), con un valor mínimo de 266,41 ms en la iteración 8 y un máximo de 690,57 ms en la iteración 1. El archivo JSON de evidencia no registra la causa del fallo de esa petición. En cuarto lugar, el README de la carpeta `02_auditoria_extensiones_ui/` preveía Speedtest by Ookla, pero el integrante 2 midió con Fast.com mediante `02_auditoria_extensiones_ui/scripts/01_captura_red.mjs`; la medición se hizo el 25 de octubre de 2026 a las 22:42:57 (UTC-5), desde Rivera, CO, con un equipo y una conexión distintos a los del integrante 1; la captura `02_auditoria_extensiones_ui/capturas/01_speedtest.png` conserva en su nombre la herramienta prevista, pero muestra la interfaz de Fast.com; y en esa medición la latencia pasó de 11 ms sin carga a 1.100 ms bajo carga. En quinto lugar, en este paso no emitimos juicios de evaluación sobre las condiciones de red, limitándonos al registro objetivo de las variables observadas.

### Paso 2. Ejecución de herramientas técnicas

En concordancia con el numeral 5 de la guía de la docente, en esta etapa configuramos los instrumentos técnicos y corremos las pruebas automatizadas registrando las salidas y los registros del sistema. En este paso reportamos exclusivamente los valores medidos y su correspondencia con los archivos de evidencia del repositorio. La contrastación frente a los umbrales de aceptación de la Tabla 8 y la formulación de los veredictos de calidad se desarrollan en el Paso 4. Asimismo, las métricas cuyo cálculo exige la participación de usuarios humanos (conteo de extravíos, tasa de éxito por tarea y puntaje SUS) se reportan en el Paso 3.

En la Tabla 13 detallamos las especificaciones de configuración aplicadas a cada una de las herramientas técnicas utilizadas.

Tabla 13. Configuración de las herramientas técnicas

| Herramienta | Configuración | Evidencia |
| :--- | :--- | :--- |
| k6 | Etapas de carga: etapa 1 (línea 6) de 5 s hasta 50 usuarios virtuales; etapa 2 (línea 7) de 20 s hasta 50 usuarios virtuales; etapa 3 (línea 8) de 5 s hasta 0 usuarios virtuales. Peticiones por iteración: 2 peticiones (https://www.demoblaze.com/index.html y https://api.demoblaze.com/entries) con pausa de 1 s mediante sleep(1). Umbrales declarados en el script: `http_req_duration` con `avg<2000` y `p(95)<2000` (en milisegundos); `http_req_failed` con `rate<0.01`. La prueba solicitó exclusivamente la página de inicio y el listado de productos de la API (/entries), sin abarcar los servicios que usa el flujo de compra (/bycat, /view, /addtocart, /viewcart y /deletecart, observados en `04_informe_final/evidencias/capturas_flujo.json`) | `01_pruebas_automatizadas_cli/scripts/carga_k6.js` |
| Lighthouse (primera corrida, integrante 1) | Perfil móvil simulado según la Tabla 11: factor de forma mobile; método de throttling simulate; RTT de 150 ms; ancho de banda de 1.638,40 Kbps (1,60 Mbps); ralentización de CPU de 4x; pantalla emulada de 412 x 823 px con deviceScaleFactor 1,75; y dispositivo emulado moto g power (2022) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Script de medición HTTP de /view y /bycat | Endpoints evaluados mediante método POST: https://api.demoblaze.com/bycat con cuerpo {"cat":"notebook"} y https://api.demoblaze.com/view con cuerpo {"id":"8"}. Cada endpoint evaluó un bloque de 20 peticiones secuenciales (líneas 139 a 143) y 10 concurrentes mediante Promise.all (líneas 145 a 150), junto con validaciones adicionales de 5 peticiones por cuerpo para las categorías phone y monitor en /bycat y el identificador 1 en /view (ejecutadas en las líneas 154 a 163, con los cuerpos definidos en las líneas 196, 197 y 205). Medición de duraciones con fetch y performance.now() (líneas 88 y 122). Las estadísticas descriptivas se calcularon exclusivamente sobre las respuestas con código HTTP 200 (filtro en líneas 13 y 17) y el percentil 95 se calculó por interpolación lineal (líneas 52 a 59) | `01_pruebas_automatizadas_cli/scripts/medir_endpoints_view_bycat.mjs` |
| Playwright | Navegador Chromium en modo headless con resolución de ventana gráfica fijada en 1280 x 800 px (línea 7). Los scripts de prueba de Delete y de auditoría de etiquetas con modales abiertos emplearon esta misma resolución de 1280 x 800 px (líneas 8 y 20 de `01_pruebas_automatizadas_cli/scripts/prueba_delete_carrito.mjs`, y líneas 8 y 191 de `01_pruebas_automatizadas_cli/scripts/auditoria_labels_modales_abiertos.mjs`) | `01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs`, `01_pruebas_automatizadas_cli/scripts/prueba_delete_carrito.mjs` y `01_pruebas_automatizadas_cli/scripts/auditoria_labels_modales_abiertos.mjs` |
| axe-core | Biblioteca @axe-core/playwright 4.14.0 ejecutada mediante `new AxeBuilder({ page }).analyze()` en las líneas 431 y 611 de `auditoria_funcional_ui.mjs`. Como no se usó `withTags()` ni `withRules()`, axe-core aplicó su conjunto de reglas por defecto, que incluye reglas de WCAG y reglas de buenas prácticas (best-practice); el archivo declara como estándar evaluado WCAG 2.0 y 2.1, niveles A y AA, más buenas prácticas. Las reglas best-practice violadas fueron landmark-one-main, page-has-heading-one y region. En la segunda ejecución técnica, axe-core se aplicó a cada modal abierto con `AxeBuilder({ page }).include(selector del modal)` (línea 129 de `01_pruebas_automatizadas_cli/scripts/auditoria_labels_modales_abiertos.mjs`) | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json`, `01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs` y `01_pruebas_automatizadas_cli/scripts/auditoria_labels_modales_abiertos.mjs` |
| Lighthouse (segunda corrida, integrante 2) | Lighthouse CLI 13.5.0 ejecutado de forma local con el Chromium de Playwright. El script intentó primero abrir PageSpeed Insights en https://pagespeed.web.dev/ (constante PSI_URL en la línea 12 y función intentarPageSpeedWeb en las líneas 17 a 87) y, como respaldo, ejecutó Lighthouse CLI (función ejecutarLighthouseFallback, líneas 89 a 180); el campo fuente de `02_auditoria_extensiones_ui/datos/02_pagespeed.json` registra Lighthouse CLI 13.5.0. Perfil móvil simulado idéntico al de la primera corrida (Tabla 11) | `02_auditoria_extensiones_ui/scripts/02_captura_pagespeed.mjs`, `02_auditoria_extensiones_ui/datos/02_pagespeed.json` y `02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json` |
| Medición de recursos con Playwright (integrante 2) | Chromium en modo headless con ventana de 1440 x 900 px. El script intentó primero usar https://gtmetrix.com/ (función intentarGtmetrixWeb, líneas 23 a 77) y registró que GTmetrix restringe las pruebas a cuentas autenticadas (campo motivoFallbackGtmetrix). La medición abrió una sesión CDP con Network.enable y la caché desactivada (líneas 84 a 86), registró las peticiones y respuestas de red (líneas 90 a 129) y leyó las entradas de navegación y de recursos de la API de rendimiento del navegador (performance.timing y performance.getEntriesByType('resource'), líneas 152 a 167). El tiempo de carga completa es el mayor entre el fin del evento load, el fin del último recurso registrado y el tiempo de reloj medido menos una espera fija de 800 ms (líneas 225 a 229). La medición no aplicó throttling de red ni de CPU | `02_auditoria_extensiones_ui/scripts/03_captura_gtmetrix_recursos.mjs` y `02_auditoria_extensiones_ui/datos/03_recursos_gtmetrix.json` |
| Verificación de enlaces con Playwright (integrante 2) | Recorre los enlaces de index.html. Los que tienen href vacío, "#" o "javascript:void" se clasifican como anclas sin destino (líneas 72 a 84); los demás se solicitan con fetch, método GET y cache: 'no-store', desde el contexto de la página (líneas 89 a 96). Esta corrida no evaluó imágenes | `02_auditoria_extensiones_ui/scripts/04_captura_check_my_links.mjs` y `02_auditoria_extensiones_ui/datos/04_enlaces.json` |
| Auditoría de estilos computados con Playwright (integrante 2) | 13 componentes de https://www.demoblaze.com/index.html, https://www.demoblaze.com/prod.html?idp_=1 y https://www.demoblaze.com/cart.html. De cada uno se leyeron con window.getComputedStyle (líneas 35 y 50) la familia, el tamaño y el peso tipográficos, el color de texto y el color de fondo efectivo | `02_auditoria_extensiones_ui/scripts/06_captura_whatfont_colorzilla.mjs` y `02_auditoria_extensiones_ui/datos/06_estilos_ui.json` |
| W3C Nu Html Checker 26.10.18 (integrante 2) | Validación de https://www.demoblaze.com/index.html mediante la API del validador con salida JSON (constante W3C_JSON_URL en la línea 7: https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.demoblaze.com%2Findex.html&out=json) | `02_auditoria_extensiones_ui/scripts/05_captura_w3c.mjs` y `02_auditoria_extensiones_ui/datos/05_w3c.json` |

Fuente: elaboración propia a partir de los scripts y archivos de evidencia citados.

El diseño preveía PageSpeed Insights, GTmetrix y tres extensiones de Chrome (Check My Links, WhatFont y ColorZilla), que no se aplicaron en su forma original. En lugar de PageSpeed Insights se ejecutó una segunda corrida de Lighthouse con el mismo perfil móvil. La captura `02_auditoria_extensiones_ui/capturas/02_pagespeed.png` es el reporte HTML de esa corrida local, no la interfaz web de PageSpeed Insights. GTmetrix exige una cuenta autenticada, de modo que el peso y los tiempos de carga se midieron con Resource Timing y CDP. Por lo mismo, no hay grado ni Structure Score de GTmetrix. Las tres extensiones se reemplazaron por scripts de Playwright que siguen su mismo criterio (campo herramientasEmuladas de `02_auditoria_extensiones_ui/datos/06_estilos_ui.json`). Las capturas `02_auditoria_extensiones_ui/capturas/03_gtmetrix_recursos.png`, `02_auditoria_extensiones_ui/capturas/04_check_my_links.png` y `02_auditoria_extensiones_ui/capturas/06_whatfont_colorzilla.png` muestran paneles que los propios scripts escriben sobre la página con el nombre de la herramienta prevista. Las líneas que los escriben son: línea 351 de `03_captura_gtmetrix_recursos.mjs` (overlay.innerHTML), línea 178 de `04_captura_check_my_links.mjs` (panel.innerHTML) y línea 235 de `06_captura_whatfont_colorzilla.mjs` (hud.innerHTML). Como no son la interfaz de esas herramientas, no las usamos como figuras y en las tablas nombramos el procedimiento que realmente se aplicó. Como consecuencia, la verificación de enlaces y la auditoría de estilos tienen dos corridas independientes con el mismo tipo de instrumento (Playwright) y no un contraste entre instrumentos distintos. Esto se retoma en las amenazas a la validez del Paso 4. El validador W3C y Fast.com sí se ejecutaron en la herramienta real.

A continuación presentamos los resultados de las mediciones técnicas agrupados por cada una de las características evaluadas.

#### Adecuación funcional

En la Tabla 14 presentamos los resultados de las pruebas automatizadas para la subcaracterística de Pertinencia funcional dentro de la característica de Adecuación funcional, siguiendo el orden establecido en la matriz metodológica de la Tabla 8.

Tabla 14. Resultados de las mediciones técnicas para Adecuación funcional

| Subcaracterística | Métrica | Herramienta | Resultado medido | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| Pertinencia funcional | Retroalimentación persistente (RP) | Playwright (prueba funcional automatizada) | RP = 50,00 % (cálculo propio). La acción Add to cart utiliza un window.alert nativo bloqueante del navegador con el texto "Product added"; tras aceptarlo, el innerHTML del elemento Cart en la barra superior permanece como "Cart" sin insignias ni contadores numéricos (false). La confirmación Purchase despliega una ventana modal SweetAlert (.sweet-alert.showSweetAlert.visible p.lead) con el título "Thank you for your purchase!" | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json` y `04_informe_final/evidencias/capturas_flujo.json` |
| Pertinencia funcional | Clics para localizar un producto (C) | Playwright (prueba funcional automatizada) | C = 2 clics en la ruta automatizada: laptopsLink.click() en la línea 441 y sonyLink.click() en la línea 455 | `01_pruebas_automatizadas_cli/scripts/auditoria_funcional_ui.mjs` |

Fuente: elaboración propia a partir de las evidencias citadas.

Notas relativas a la Tabla 14:
1. Cálculo de Retroalimentación persistente: el valor de RP constituye un cálculo propio derivado de la fórmula operativa descrita en el apartado 4.1. De las dos acciones críticas analizadas, Add to cart recurre a un diálogo nativo efímero que al cerrarse no deja señal visible en la pantalla, mientras que Purchase despliega un comprobante visible dentro de la propia página, que no es un diálogo nativo del navegador; por consiguiente, RP = (1 / 2) x 100 = 50,00 %.
2. Hallazgos adicionales de Pertinencia funcional sin fila en la matriz:
- Ausencia de buscador por texto: la inspección del DOM constató que DemoBlaze no posee elementos `<input type="search">` (conteo 0), ni atributos placeholder con texto de búsqueda (conteo 0), ni elementos con rol `role="search"` (false). No existen campos `<input>` visibles en la página principal del catálogo; los seis únicos inputs del DOM pertenecen a las ventanas modales ocultas `#exampleModal`, `#logInModal` y `#signInModal` (`01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`, clave completitudFuncional.buscadorPorTexto).
- Imposibilidad de modificar cantidades en el carrito: la tabla del carrito (`#tbodyid`) solo exhibe columnas de imagen, título, precio y el enlace Delete, careciendo de controles numéricos o botones de ajuste para modificar las unidades de un producto agregado (`01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json`, clave completitudFuncional.modificacionCantidadEnCarrito).

#### Eficiencia de desempeño

En la Tabla 15 documentamos las mediciones obtenidas para la característica de Eficiencia de desempeño en las subcaracterísticas de Comportamiento temporal, Capacidad y Utilización de recursos, ordenadas según la Tabla 8.

Tabla 15. Resultados de las mediciones técnicas para Eficiencia de desempeño

| Subcaracterística | Métrica | Herramienta | Resultado medido | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| Comportamiento temporal | Tiempo de respuesta promedio (T) con 50 usuarios concurrentes | k6 | T = 188,00 ms (http_req_duration.avg). Mediana: 159,00 ms; percentil 90 (p90): 401,34 ms; percentil 95 (p95): 423,04 ms; mínimo: 68,92 ms; máximo: 1.421,99 ms; tiempo promedio de espera de respuesta del servidor (waiting avg): 178,09 ms; usuarios virtuales máximos concurrentes: 50 | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/k6_summary.json` |
| Comportamiento temporal | Largest Contentful Paint (LCP) | Lighthouse, primera corrida (emulación móvil) | LCP = 3.740,94 ms (3,74 s) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Comportamiento temporal | First Contentful Paint (FCP) | Lighthouse, primera corrida (emulación móvil) | FCP = 1.790,94 ms (1,79 s) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Comportamiento temporal | Cumulative Layout Shift (CLS) | Lighthouse, primera corrida (emulación móvil) | CLS = 0,235. Nodos contribuyentes: body > div#footc (score 0,2350) y nav#narvbarx > div#navbarExample > ul.navbar-nav > li.nav-item (score 0,0001; causa: Web font loaded) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Comportamiento temporal | Puntaje de rendimiento de Lighthouse | Lighthouse, primera corrida (emulación móvil) | 70 / 100 (cálculo propio: puntuación de 0,70 en categories.performance.score multiplicada por 100) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Comportamiento temporal | Tiempos de respuesta HTTP de /view y /bycat | Script de medición HTTP (Node.js) | En /bycat con el cuerpo {"cat":"notebook"}: 20 secuenciales, todas con HTTP 200, con promedio de 203,22 ms, p95 de 472,97 ms y máximo de 560,84 ms; 10 concurrentes, 9 con HTTP 200 y 1 fallida sin respuesta ("fetch failed" a los 10.213,19 ms), con promedio de las 9 exitosas de 442,70 ms y máximo de 1.013,99 ms. En /view con el cuerpo {"id":"8"} (Sony vaio i5): 20 secuenciales, todas con HTTP 200, con promedio de 311,28 ms, p95 de 656,78 ms y máximo de 1.034,43 ms; 10 concurrentes, todas con HTTP 200, con promedio de 644,02 ms, p95 de 1.480,25 ms y máximo de 1.589,25 ms. En el consolidado global: 59 peticiones con HTTP 200 sobre 60 (98,33 %), promedio de 351,09 ms, mediana de 236,33 ms, p95 de 1.016,03 ms y máximo de 1.589,25 ms | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/tiempos_http_view_bycat.json` y `01_pruebas_automatizadas_cli/scripts/medir_endpoints_view_bycat.mjs` |
| Capacidad | Tasa de error (E) con 50 usuarios concurrentes | k6 | E = 0,00 % (cálculo propio: 0 peticiones fallidas sobre 1.632 ejecutadas). Tasa media: 52,60 peticiones por segundo; iteraciones completadas: 816; verificaciones de estado exitosas (checks passes): 1.632 (fails: 0) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/k6_summary.json` |
| Utilización de recursos | Peso total transferido (P) | Lighthouse, primera corrida (emulación móvil) | P = 1.392,84 KiB (1.426.268 B; cálculo propio: división de 1.426.268 entre 1.024) | `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Comportamiento temporal | LCP, FCP, CLS y puntaje de rendimiento, segunda corrida | Lighthouse, segunda corrida (emulación móvil) | LCP = 7.083,32 ms (7,08 s); FCP = 2.127,67 ms (2,13 s); CLS = 0,284, con nodos contribuyentes body > div#footc (score 0,2350), div#tbodyid > div.col-lg-4 > div.card > div.card-block (score 0,0493) y nav#narvbarx > div#navbarExample > ul.navbar-nav > li.nav-item (score 0,0001; causa: fuente web cargada, Lato-Regular.woff2); puntaje de rendimiento: 54 / 100 (cálculo propio: puntuación de categories.performance.score multiplicada por 100) | `02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json` |
| Utilización de recursos | Peso total transferido (P), segunda corrida | Lighthouse, segunda corrida (emulación móvil) | P = 2.221,27 KiB (2.274.576 B; cálculo propio: división de 2.274.576 entre 1.024); 31 peticiones en el resumen de recursos | `02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json` |
| Utilización de recursos y Comportamiento temporal | Peso transferido y tiempos de carga sin throttling | Medición de recursos con Playwright (Resource Timing y CDP) | P = 2.230,24 KiB (2.283.764 B; cálculo propio: división de 2.283.764 entre 1.024; el archivo rotula el valor como KB); 31 solicitudes HTTP; carga completa: 6.722 ms (6,72 s); tiempo hasta el primer byte (TTFB): 262 ms; DOMContentLoaded: 797 ms; fin del evento load: 819 ms | `02_auditoria_extensiones_ui/datos/03_recursos_gtmetrix.json` |

Fuente: elaboración propia a partir de las evidencias citadas.

Notas relativas a la Tabla 15:
1. Métricas diagnósticas complementarias de Lighthouse: la auditoría arrojó un Total Blocking Time (TBT) de 108,00 ms (0,11 s), un Speed Index (SI) de 6.508,15 ms (6,51 s), un Time to Interactive (TTI) de 6.887,64 ms (6,89 s) y un tiempo de respuesta del servidor para el documento inicial (Server Response Time / TTFB) de 1.148,00 ms (1,15 s). Asimismo, registró puntuaciones de 100 / 100 en Mejores Prácticas, 82 / 100 en SEO y 82 / 100 en Accesibilidad.
2. Desglose del peso por tipología de recurso: el resumen de recursos distribuye la transferencia en Media con 3 peticiones (535,92 KiB); Image con 12 peticiones (344,90 KiB); Script con 6 peticiones (285,28 KiB); Font con 1 petición (178,79 KiB); Stylesheet con 4 peticiones (40,28 KiB); Document con 1 petición (4,51 KiB); Other con 3 peticiones (3,16 KiB); y Third-party con 0 peticiones (0,00 KiB), totalizando 30 peticiones y 1.392,84 KiB (1.426.268 B).
3. Peso atribuible a los componentes de video: los recursos vinculados al reproductor de video del modal About us (librerías de reproducción y fragmentos de video HLS) suman 779.525 B (761,25 KiB), lo que equivale al 54,65 % de la carga total transferida por la página principal, aun cuando el usuario no abra dicho modal ni active el contenido multimedia. Este valor procede de un cálculo propio que agrupa cinco solicitudes: video.min.js (158.934 B), videojs-contrib-hls.min.js (71.811 B), index.m3u8 (972 B), about_demo_hls_600k.m3u8 (5.574 B) y el segmento de video about_demo_hls_600k00000.ts (542.234 B).
4. Discrepancia en el conteo de solicitudes de Lighthouse: la auditoría de peticiones de red (network-requests) consigna 31 elementos frente a los 30 del consolidado de recursos (resource-summary). La diferencia responde a una petición interna generada en memoria con esquema `blob:` (blob:https://www.demoblaze.com/37f52b7e-59af-4acc-ad7e-1626072645a0, de tipo Script, con código -1 y 0 B de transferencia), la cual no representa tráfico sobre la red HTTP. Adicionalmente, dos imágenes registraron código -1 por haber quedado inconclusas al cerrar la sesión de auditoría (galaxy_s6.jpg y xperia_z5.jpg).
5. Convenciones de exportación de k6: en el archivo `k6_summary.json`, la métrica `http_req_failed` es una métrica de tasa donde el campo `passes` contabiliza las peticiones en las que se cumplió la condición de fallo (0 solicitudes) y `fails` las solicitudes exitosas (1.632). En la clave `thresholds`, el valor booleano `false` indica que el umbral fijado en el script no fue rebasado.
6. Petición fallida y validaciones adicionales: los promedios reportados en la tabla se calculan exclusivamente a partir de las peticiones respondidas con código HTTP 200. Si se incluyera la petición fallida con su duración hasta el error (10.213,19 ms), el promedio global ascendería a 515,46 ms (cálculo propio: suma de tiempos de las 59 peticiones exitosas de 20.714,36 ms más 10.213,19 ms de la muestra fallida, dividida entre las 60 peticiones). Las validaciones complementarias arrojaron un promedio de 338,11 ms para la categoría phone y de 173,48 ms para la categoría monitor en /bycat, ambas con 5 peticiones exitosas sobre 5 (100 % de respuestas HTTP 200); en /view, el producto con identificador 1 promedió 417,87 ms, igualmente con 5 peticiones exitosas sobre 5 (100 % de respuestas HTTP 200).
7. Fecha y condiciones de medición: las pruebas sobre /view y /bycat corresponden a la segunda ejecución técnica (Tabla 11); se realizaron desde el equipo del integrante 1, sin mecanismos de regulación ni emulación de throttling, midiendo el tiempo de respuesta HTTP de cada solicitud y no la latencia ICMP de la red.
8. Condiciones de la segunda corrida de Lighthouse: se ejecutó el 25 de octubre de 2026 a las 22:44:15 (UTC-5; 26 de octubre de 2026, 03:44:15 UTC) en el equipo del integrante 2, con Lighthouse 13.5.0, HeadlessChrome 156.0.0.0 y el mismo perfil móvil de la primera corrida; su índice de rendimiento de CPU fue 1.377, frente a 2.473,50 en la primera. Métricas diagnósticas: TBT de 248 ms, Speed Index de 3.138,23 ms, TTI de 8.125,76 ms y tiempo de respuesta del servidor de 131 ms. Puntuaciones de las demás categorías: 82 / 100 en Accesibilidad, 100 / 100 en Mejores Prácticas y 82 / 100 en SEO. La auditoría network-requests consigna 32 elementos frente a 31 en resource-summary; la diferencia es otra vez una petición interna con esquema `blob:` (de tipo Script, con código -1 y 0 B). A diferencia de la primera corrida, ninguna imagen quedó con código -1. La comparación entre las dos corridas se hace en el Paso 4.
9. Desglose del peso en la segunda corrida: Image, 12 peticiones (1.196.497 B); Media, 4 (553.882 B); Script, 6 (291.987 B); Font, 1 (183.079 B); Stylesheet, 4 (41.308 B); Document, 1 (4.613 B); Other, 3 (3.210 B); Third-party, 0 (0 B). Total: 31 peticiones y 2.274.576 B. Componentes de video del modal About us (cálculo propio con los transferSize de network-requests): seis recursos que suman 784.475 B (766,09 KiB), el 34,49 % del peso total. Son video.min.js (158.800 B), videojs-contrib-hls.min.js (71.793 B), index.m3u8 (993 B), about_demo_hls_600k.m3u8 (5.547 B), about_demo_hls_600k00000.ts (542.234 B) y about_demo_hls_1M.m3u8 (5.108 B). Frente a los cinco recursos de la primera corrida, se agrega la lista de reproducción about_demo_hls_1M.m3u8.
10. Medición de recursos con Playwright: desglose por tipo según el script: HTML, 1 solicitud (17.436 B); CSS, 4 (42.049 B); imágenes, 12 (1.197.788 B); JavaScript, 6 (292.994 B); fuentes, 1 (183.088 B); XHR o API, 2 (1.645 B); video o media, 4 (548.764 B); otros, 1 (0 B). Los cinco recursos más pesados: about_demo_hls_600k00000.ts (542.224 B), Nexus_6.jpg (232.270 B), iphone_6.jpg (201.291 B), Lato-Regular.woff2 (183.088 B) y video.min.js (158.881 B). Se ejecutó el 25 de octubre de 2026 a las 22:46:32 (UTC-5), sin throttling y con la caché desactivada. Por eso sus tiempos no son comparables con los de Lighthouse, que aplica throttling simulado.

#### Capacidad de interacción

En la Tabla 16 consolidamos las mediciones técnicas de la característica de Capacidad de interacción, correspondientes a Operabilidad, Protección contra errores de usuario, Involucramiento del usuario e Inclusividad, conforme a las filas de la Tabla 8. Las métricas que requieren la aplicación de pruebas con usuarios se reportan en el Paso 3.

Tabla 16. Resultados de las mediciones técnicas para Capacidad de interacción

| Subcaracterística | Métrica | Herramienta | Resultado medido | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| Aprendibilidad | Extravíos en tareas y subescala de aprendizaje | Observación directa y Cuestionario SUS | Resultados de las sesiones con usuarios, reportados en el Paso 3 (Tablas 17 a 21) | `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md` y `03_investigacion_usuarios_ux/datos/` |
| Operabilidad | Puntaje global SUS y éxito por tarea | Cuestionario SUS y observación directa | Resultados de las sesiones con usuarios, reportados en el Paso 3 (Tablas 17 a 21) | `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md` y `03_investigacion_usuarios_ux/datos/` |
| Operabilidad | Enlaces rotos | Playwright y verificación de enlaces (dos corridas) | Primera corrida (integrante 1): 0 errores de red con código HTTP 404 o 5xx sobre 33 enlaces evaluados (23 con HTTP 200 y 10 anclas sin destino); 0 errores en 14 imágenes evaluadas (14 con HTTP 200). Segunda corrida (integrante 2): 0 enlaces con HTTP 404 o 5xx sobre 33 enlaces de index.html (23 con HTTP 200, el 69,70 %, y 10 anclas sin destino, el 30,30 %); esta corrida no evaluó imágenes | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json` y `02_auditoria_extensiones_ui/datos/04_enlaces.json` |
| Protección contra errores de usuario | Tasa de rechazo (R) en el formulario Place Order | Playwright (pruebas negativas) | R = 50,00 % (cálculo propio: 1 de 2 pruebas negativas bloqueó el envío). Inspección HTML5: los 6 campos del formulario (#name, #country, #city, #card, #month, #year) tienen type="text" con required=false, pattern=null, minLength=null, maxLength=null e inputMode=null. Prueba negativa 1 (formulario vacío): bloquea el envío con window.alert nativo ("Please fill out Name and Creditcard."). Prueba negativa 2 (tarjeta alfabética "TARJETA_FALSA_SIN_NUMEROS_ABC" y campos vacíos): no rechaza el envío; procesa la compra y emite comprobante SweetAlert con Id: 3747911, Amount: 790 USD, Card Number: TARJETA_FALSA_SIN_NUMEROS_ABC, Date: 24/9/2026. Hallazgo complementario: con el carrito vacío procesa la orden y emite comprobante con Amount: 0 USD (Id: 7686879) | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/pruebas_funcionales_y_errores.json` y `04_informe_final/evidencias/capturas_flujo.json` |
| Protección contra errores de usuario | Confirmación en borrado del carrito (Delete) | Playwright (prueba funcional con intercepción de red) | D = 0,00 % (cálculo propio: 0 de 1). Con el producto Sony vaio i5 en el carrito (1 fila y total de 790), la pulsación del enlace Delete ejecutó la función deleteItem. Dicha función envió una petición POST a https://api.demoblaze.com/deleteitem (código HTTP 200 y duración de 361,55 ms) y recargó la página mediante location.reload(). La tabla del carrito quedó con 0 filas y el total vacío. Durante el proceso no se activó ningún diálogo nativo ni ventana modal de confirmación, ni se presentó opción para deshacer la acción | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/prueba_delete_carrito.json`, `01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/06_borrado_sin_confirmacion_carrito.png` y `01_pruebas_automatizadas_cli/scripts/prueba_delete_carrito.mjs` |
| Involucramiento del usuario | Uniformidad tipográfica (UT) | Playwright (estilos computados, dos auditorías) | Primera auditoría (integrante 1): UT = 80,00 % sobre 10 registros auditados (8 de 10 emplean la familia dominante LatoWeb; cálculo propio). Si se consideran únicamente los 9 selectores base sin la variante en carrito, UT = 88,89 % (8 de 9; cálculo propio). Segunda auditoría (integrante 2): UT = 84,62 % sobre 13 componentes de index.html, prod.html y cart.html (11 de 13 emplean la familia dominante LatoWeb; cálculo propio). Los 2 componentes restantes, el botón Place Order (button.btn-success, en cart.html) y el botón .btn-primary del modal de contacto (Send message, en index.html), usan sans-serif | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json` y `02_auditoria_extensiones_ui/datos/06_estilos_ui.json` |
| Involucramiento del usuario | Consistencia cromática entre componentes (CCC) | Playwright (estilos computados, dos auditorías) | Primera auditoría (integrante 1): CCC = 100,00 % (cálculo propio: 2 de 2 registros con componente homólogo coinciden en color de texto #FFFFFF y fondo efectivo #34A853). Se identificaron 6 colores hexadecimales únicos en la interfaz: #868688, #FAFCFF, #292B2C, #FFFFFF, #0275D8, #34A853. Segunda auditoría (integrante 2): CCC = 100,00 % (cálculo propio: 2 de 2; a.btn-success en prod.html y button.btn-success en cart.html coinciden en color de texto #FFFFFF y fondo efectivo #34A853). Esta auditoría registró 4 colores de texto únicos (#868688, #FFFFFF, #0275D8, #292B2C) y 5 colores de fondo únicos (#292B2C, #FFFFFF, #34A853, #0275D8, #FAFCFF) | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json` y `02_auditoria_extensiones_ui/datos/06_estilos_ui.json` |
| Inclusividad | Violaciones con impacto crítico | axe-core | 1 regla crítica única violada (image-alt), con 5 nodos afectados en total (2 en index.html y 3 en cart.html). En conjunto se detectaron 6 reglas únicas violadas en ambas páginas (critical: 1 [image-alt], serious: 2 [color-contrast, link-name], moderate: 3 [landmark-one-main, page-has-heading-one, region], minor: 0) | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json` |
| Inclusividad | Conformidad de contraste (CC) | axe-core y cálculo de luminancia WCAG 2.1 | CC = 40,00 % (cálculo propio: 4 de 10 registros de texto auditados alcanzan la relación mínima de WCAG 2.1, de 4,5:1 o de 3:1 en texto grande, calculada con la fórmula de luminancia relativa). axe-core reportó la regla color-contrast con 18 nodos afectados en index.html (relación de 3,63:1) y 2 nodos en cart.html (relaciones de 4,13:1 y 3,05:1). Puntaje de accesibilidad en Lighthouse: 82 / 100 | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/estilos_ui_colorzilla_whatfont.json`, `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json` y `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Inclusividad | Etiquetado de campos en modales | Playwright y axe-core con los modales abiertos | EC = 76,92 % (cálculo propio: 10 de 13 campos con etiqueta asociada o nombre accesible). Sobre los 13 campos auditados (12 de tipo input y 1 de tipo textarea), se registraron 3 nodos de la regla label con impacto crítico: el campo de correo en Contact, cuya etiqueta visual "Contact Email:" apunta a for="recipient-name", y los dos campos de Log in, cuyas etiquetas visuales apuntan a identificadores inexistentes (for="log-name" y for="log-pass"). Por su parte, los modales Place Order (6 de 6 campos) y Sign up (2 de 2 campos) no presentaron violaciones de la regla label. Ninguno de los 13 controles evaluados dispone de atributos aria-label, placeholder ni required. Con los modales cerrados durante la inspección inicial, Lighthouse había marcado la auditoría label como no aplicable con puntuación nula | `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/auditoria_labels_modales_abiertos.json`, `01_pruebas_automatizadas_cli/scripts/auditoria_labels_modales_abiertos.mjs` y `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` |
| Inclusividad | Errores de marcado HTML | W3C Nu Html Checker 26.10.18 | 7 errores y 4 advertencias en index.html (11 mensajes en total, 0 informativos). Errores: 3 etiquetas label cuyo atributo for no corresponde al identificador de un control de formulario visible, según el mensaje del validador (líneas 384 y 388, con for="log-name" y for="log-pass" en el modal Log in, y línea 392, una etiqueta vacía con id="errorl" y for="log-pass"); 2 imágenes del logotipo blazemeter-favicon-512x512.png sin atributo alt (líneas 435 y 555); y 2 repeticiones del identificador itemc (líneas 504 y 505, en los enlaces de las categorías Laptops y Monitors). Advertencias: 2 que señalan la primera aparición de itemc (línea 503, enlace Phones), 1 por el atributo type innecesario en un script (línea 529) y 1 porque el documento no tiene un encabezado de nivel 1 (línea 303) | `02_auditoria_extensiones_ui/datos/05_w3c.json` y `02_auditoria_extensiones_ui/capturas/05_w3c_validator.png` |

Fuente: elaboración propia a partir de las evidencias citadas.

Notas relativas a la Tabla 16:
1. Enlaces clasificados como anclas sin destino: los diez enlaces clasificados bajo esta categoría corresponden a elementos que despliegan ventanas modales o ejecutan instrucciones JavaScript locales: Contact (href="#"), About us (href="#"), Log in (href="#"), Log out (href="#"), un enlace sin contenido textual visible (href="#"), Sign up (href="#"), CATEGORIES (href=""), Phones (href="#"), Laptops (href="#") y Monitors (href="#"). Por su parte, los dos controles del carrusel (Previous y Next con atributo "#carouselExampleIndicators") fueron clasificados con código HTTP 200 en la auditoría a pesar de apuntar a fragmentos internos de la misma página.
2. Tamaño del denominador en el indicador CCC: el denominador para el cálculo de CCC comprende únicamente dos registros debido a que en el muestreo de componentes estilísticos solo un elemento (.btn-success) contó con presencia homóloga en dos vistas del recorrido (`prod.html` y `cart.html`).
3. Tratamiento metodológico de las violaciones de axe-core: el resumen global reportado en `accesibilidad_axe.json` exhibe once reglas violadas consolidando ambas vistas (dos críticas, tres serias y seis moderadas) como resultado de sumar de forma simple las violaciones de index.html (seis) y cart.html (cinco). Al deduplicar los identificadores entre ambas páginas, el conjunto efectivo se compone de seis reglas únicas: color-contrast, image-alt, landmark-one-main, link-name, page-has-heading-one y region. De estas seis reglas, tres corresponden a mejores prácticas de desarrollo web (landmark-one-main, page-has-heading-one y region), las cuales no forman parte de los criterios formalmente numerados de la pauta WCAG 2.1.
4. Relación de contraste en botones de acción: el cálculo de luminancia de WCAG 2.1 para texto blanco (#FFFFFF) sobre el botón verde (#34A853) arroja una relación de 3,06:1, mientras que axe-core reporta 3,05:1 en `accesibilidad_axe.json`. La diferencia es de redondeo y no cambia el valor de CC.
5. Discrepancia entre instrumentos sobre el texto alternativo de las imágenes: el archivo `integridad_enlaces.json` señala once imágenes sin atributo alt. En contraste, en el HTML que guardó axe-core en `accesibilidad_axe.json`, las nueve imágenes de las tarjetas de producto en index.html sí disponen del atributo alt, pero con valor vacío (`alt=""`, como en `<a href="prod.html?idp_=1"><img class="card-img-top img-fluid" src="imgs/galaxy_s6.jpg" alt=""></a>`). En consecuencia, axe-core califica esas imágenes bajo la regla `link-name` (enlaces interactivos sin nombre accesible) y limita la infracción `image-alt` a las dos imágenes del logotipo (`blazemeter-favicon-512x512.png`) en la página principal y, en el carrito, a esas dos imágenes más la miniatura del producto. Esta discrepancia se analiza en el Paso 4.
6. Contraste con los modales abiertos: la auditoría especializada con los modales abiertos registró violaciones de la regla color-contrast (calificada con severidad serious) en tres de las cuatro ventanas: el modal Contact presentó 4 nodos afectados, mientras que Log in y Sign up presentaron 3 nodos afectados cada uno (10 nodos en total). El modal Place Order no registró infracciones de contraste.
7. Violaciones críticas adicionales: los 3 nodos detectados para la regla label corresponden a una severidad crítica (critical) según la taxonomía de axe-core y fueron observados con los modales en estado abierto. Estos nodos se suman a la regla crítica image-alt documentada previamente en la inspección con los modales cerrados. El tratamiento conjunto de ambas observaciones y su confrontación frente al criterio de violaciones críticas se analizan en el Paso 4.
8. Métricas derivadas de usuarios: recordamos que los resultados de Aprendibilidad (extravíos y subescala de aprendizaje) y de Operabilidad (puntaje SUS y tasa de éxito) derivados de las sesiones con participantes se presentan en el Paso 3.
9. Dos auditorías de estilos con el mismo instrumento: la primera auditoría tiene 10 registros y la segunda, 13 componentes, por lo que sus valores de UT (80,00 % y 84,62 %) provienen de muestras distintas de componentes. Ambas identifican a LatoWeb como familia dominante y a los mismos dos componentes con sans-serif: el botón .btn-primary y el botón .btn-success de cart.html (Place Order). Las dos coinciden también en CCC = 100,00 %.
10. Validación W3C frente a axe-core: las dos imágenes sin atributo alt que reporta el validador son el logotipo blazemeter-favicon-512x512.png, las mismas dos que axe-core marcó con la regla image-alt en index.html (nota 5). Los errores de las líneas 384 y 388 corresponden a los dos campos de Log in que axe-core marcó con la regla label (nota 7); el tercer nodo de axe-core, el campo de correo del modal Contact, no figura entre los errores del validador. El validador solo revisó index.html.

### Paso 3. Aplicación de instrumentos con usuarios

Según el numeral 5 de la guía de la docente, este paso consiste en aplicar los instrumentos cualitativos y cuantitativos a la muestra seleccionada y consolidar las respuestas en una matriz de datos. El integrante 3 administró la observación directa del flujo de compra y el cuestionario SUS a los cinco participantes descritos en el apartado 3.5. Las respuestas al cuestionario se diligenciaron el 25 de octubre de 2026, entre las 11:57:11 (UTC-5) y las 12:50:57 (UTC-5), según consta en las marcas temporales registradas en `03_investigacion_usuarios_ux/Encuesta.csv`. Las cinco sesiones de evaluación se encuentran grabadas de forma íntegra en la carpeta `03_investigacion_usuarios_ux/evidencia_sesiones/`, bajo los archivos Usuario 1.mp4 a Usuario 5.mp4. En este apartado exponemos los resultados cuantitativos y cualitativos obtenidos con fines estrictamente descriptivos, reservando el análisis cruzado frente a los umbrales de aceptación para el Paso 4.

#### Observación directa

Las sesiones prácticas siguieron la misión de tres pasos que figura en el encabezado del cuestionario (las rutas mínimas están en la Tabla 9 del apartado 4.2 y el texto íntegro en el Anexo C), la cual requería localizar el portátil Sony vaio i5, agregar el monitor Apple monitor 24 y gestionar el carrito eliminando el monitor para comprar únicamente el portátil mediante el formulario del modal Place Order. Los tiempos por tarea se obtuvieron a partir de la diferencia entre hitos temporales objetivos verificados en las grabaciones en video (`03_investigacion_usuarios_ux/datos/hitos_video.csv`), con una precisión de aproximadamente 0,5 s, de acuerdo con la sección 3 de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`. Por su parte, el registro cualitativo se limita a las preguntas y los comentarios espontáneos que el evaluador anotó durante las sesiones, dado que no se aplicó un protocolo estructurado de pensamiento en voz alta ni se efectuaron transcripciones verbales continuas.

Tabla 17. Tiempos por tarea y permanencia del diálogo nativo (segundos)

| Participante | Tarea 1 | Tarea 2 | Tarea 3 | Tarea 4 | Total | Diálogo del Sony vaio i5 | Diálogo del Apple monitor 24 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| U1 | 26 s | 38 s | 38 s | 110 s | 212 s | 5,9 s | 3,5 s |
| U2 | 44 s | 70 s | 43 s | 88 s | 245 s | 9,9 s | 5,1 s |
| U3 | 23 s | 32 s | 30 s | 42 s | 127 s | 2,6 s | 5,4 s |
| U4 | 39 s | 48 s | 28 s | 69 s | 184 s | 3,4 s | 1,7 s |
| U5 | 39 s | 27 s | 23 s | 68 s | 157 s | 2,7 s | 1,9 s |
| Media | 34,2 s | 43,0 s | 32,4 s | 75,4 s | 185,0 s | 4,9 s | 3,5 s |
| Mediana | 39 s | 38 s | 30 s | 69 s | 184 s | 3,4 s | 3,5 s |
| Desviación estándar | 9,15 s | 17,00 s | 8,02 s | 25,33 s | 46,04 s | 3,10 s | 1,73 s |
| Mínimo | 23 s | 27 s | 23 s | 42 s | 127 s | 2,6 s | 1,7 s |
| Máximo | 44 s | 70 s | 43 s | 110 s | 245 s | 9,9 s | 5,4 s |

Fuente: `03_investigacion_usuarios_ux/datos/hitos_video.csv` (cálculo propio).

Notas relativas a la Tabla 17:
1. Procedimiento de cálculo: los tiempos por tarea se calcularon redondeando cada hito del video al segundo y restando hitos consecutivos; la permanencia del diálogo nativo corresponde a la diferencia entre el cierre y la aparición del diálogo, calculada con un decimal.
2. Proporción del tiempo en la Tarea 4: la Tarea 4 concentra el 40,76 % del tiempo total (cálculo propio: media de la Tarea 4 dividida entre la media del tiempo total multiplicada por 100, es decir, 75,4 s / 185,0 s x 100 = 40,76 %).
3. Discrepancias en la permanencia del diálogo nativo: existen diferencias de 0,1 s con respecto a la Tabla 3 del estudio del integrante 3 en tres registros. Para el diálogo del Sony vaio i5 en U3, el cálculo a partir de hitos arroja 2,6 s mientras que el estudio reportó 2,7 s; para el diálogo del Apple monitor 24 en U3, los hitos arrojan 5,4 s frente a 5,3 s del estudio; y para el diálogo del Sony vaio i5 en U5, los hitos arrojan 2,7 s frente a 2,6 s del estudio. En este informe empleamos los valores derivados de los hitos objetivos del video (`03_investigacion_usuarios_ux/datos/hitos_video.csv`). Las medias de permanencia grupal (4,9 s para el diálogo del Sony vaio i5 y 3,5 s para el del Apple monitor 24) coinciden entre ambas fuentes.

Tabla 18. Registro cualitativo y extravíos por participante

| Participante | Edad | Extravíos registrados | Observación en navegación y carrito (Tareas 1 a 3) | Observación en el formulario Place Order (Tarea 4) | Solicitudes de ayuda según el apartado 4.2 (con la tarea) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| U1 | 50 años | 1 extravío | "Tenía problemas para salir de la ventana de confirmación al añadir un producto al carrito." | "No sabía cómo escribir el número de tarjeta de crédito." | Ninguna solicitud de ayuda registrada |
| U2 | 50 años | 1 extravío | "Tuvo problemas para encontrar cómo acceder al carrito." | "No sabía en qué formato escribir el mes, el año y el número de tarjeta de crédito." | Ninguna solicitud de ayuda registrada |
| U3 | 28 años | 0 extravíos | "Intuyó cómo filtrar artículos por categorías y salir de la confirmación de carrito." | "Escribió los datos de la tarjeta de crédito como pensó que era (sin restricción del sistema)." | Ninguna solicitud de ayuda registrada |
| U4 | 45 años | 1 extravío | "Le pareció extraño que no se puedan buscar los productos por el nombre." | "Preguntó cómo escribir la tarjeta de crédito y sus datos." | 1 solicitud en Tarea 4 ("Preguntó cómo escribir la tarjeta de crédito y sus datos.") |
| U5 | 23 años | 1 extravío | "Durante la tarea 2 preguntó si había una barra de búsqueda de productos." | "Preguntó sobre los datos de la tarjeta de crédito y si debía llenar todos los campos." | 2 solicitudes: 1 en Tarea 2 ("Durante la tarea 2 preguntó si había una barra de búsqueda de productos.") y 1 en Tarea 4 ("Preguntó sobre los datos de la tarjeta de crédito y si debía llenar todos los campos.") |

Fuente: `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md` (Tabla 2) y `03_investigacion_usuarios_ux/datos/matriz_observacion_5_usuarios.csv`.

En el registro consolidado de la observación, los extravíos presentaron una media de 0,80 extravíos (cálculo propio: suma de 1 + 1 + 0 + 1 + 1 dividida entre 5), una mediana de 1 extravío, una desviación estándar muestral de 0,45 (cálculo propio: raíz cuadrada de 0,8 / 4), un mínimo de 0 extravíos (U3) y un máximo de 1 extravío (U1, U2, U4 y U5). El registro elaborado por el integrante 3 reporta los extravíos a nivel global de la sesión completa y no desglosados por tarea individual, sin detallar qué evento particular de la navegación fue contabilizado como extravío. Al contrastar las conductas observadas con la definición operativa del apartado 4.2, identificamos 3 solicitudes de ayuda en total que suman un extravío cada una: la solicitud de U4 en la Tarea 4 ("Preguntó cómo escribir la tarjeta de crédito y sus datos."), la solicitud de U5 en la Tarea 4 ("Preguntó sobre los datos de la tarjeta de crédito y si debía llenar todos los campos.") y la solicitud de U5 en la Tarea 2 ("Durante la tarea 2 preguntó si había una barra de búsqueda de productos."). Asimismo, las expresiones de no saber cómo continuar correspondientes a U1 en Tarea 4 y U2 en Tarea 4 podrían sumar un extravío cada una en caso de haberse formulado de manera verbal al observador, circunstancia no precisada en la fuente original. Aun considerando la suma acumulada de estas incidencias, dado que cada participante tiene registrado como máximo un extravío y que en una misma tarea solo podría coincidir a lo sumo un evento adicional, el cálculo propio de la cota superior sitúa en 2 el máximo de extravíos de un participante en una misma tarea (1 + 1 = 2). De este modo, 5 de 5 participantes (100 %) registran 2 o menos extravíos en cada una de las tareas del recorrido.

Tabla 19. Éxito por tarea según la definición operativa del apartado 4.2

| Tarea | Participantes que completan la tarea sin solicitar ayuda | S(t) | Solicitudes de ayuda registradas |
| :--- | :--- | :--- | :--- |
| Tarea 1 (Sony vaio i5) | 5 de 5 | 100 % | Ninguna solicitud de ayuda registrada |
| Tarea 2 (Apple monitor 24) | 4 de 5 | 80 % | 1 solicitud (U5 preguntó si había una barra de búsqueda de productos) |
| Tarea 3 (Carrito) | 5 de 5 | 100 % | Ninguna solicitud de ayuda registrada |
| Tarea 4 (Formulario y compra) | 3 de 5 | 60 % | 2 solicitudes (U4 preguntó cómo escribir la tarjeta y sus datos; U5 preguntó sobre los datos de la tarjeta y si debía llenar todos los campos) |

Fuente: elaboración propia a partir de la Tabla 18 y del apartado 4.2.

Notas relativas a la Tabla 19:
1. Ubicación de la consulta de U5: la Tabla 2 de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md` precisa que U5 preguntó por la barra de búsqueda durante la Tarea 2, es decir, al localizar el Apple monitor 24. Por eso la Tarea 2 queda en 4 de 5 participantes (80 %) y la Tarea 1 en 5 de 5 (100 %).
2. Relación con el éxito reportado en el estudio de usuarios: las grabaciones en video comprueban que los 5 participantes alcanzaron la confirmación de compra y finalizaron el flujo (sección 6, limitación 4, de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`). La diferencia frente al 100 % de éxito consignado en dicho estudio radica en la aplicación estricta del apartado 4.2, donde cualquier solicitud de ayuda al evaluador impide calificar la tarea individual como exitosa.

#### Cuestionario SUS

Al concluir la prueba práctica, cada participante diligenció de manera individual los 10 ítems del cuestionario SUS en Google Formularios. La escala de respuesta abarcó desde 1 (Totalmente en desacuerdo) hasta 5 (Totalmente de acuerdo), con carácter obligatorio en todos los enunciados (Anexo B). El cálculo del puntaje individual se efectuó aplicando la regla de conversión descrita por Sauro (2011a): en los ítems con tono positivo (impares) se resta 1 a la respuesta cruda (X - 1); en los ítems con tono negativo (pares) se resta la respuesta cruda de 5 (5 - X); finalmente, se suman los diez valores resultantes y la suma acumulada (entre 0 y 40) se multiplica por 2,5 para obtener la escala de 0 a 100. Recalculamos los puntajes de forma directa a partir de las respuestas crudas de `03_investigacion_usuarios_ux/Encuesta.csv`, y coinciden, en los cinco participantes, con los de `03_investigacion_usuarios_ux/datos/calculo_cuestionario_sus.csv`.

Tabla 20. Respuestas al cuestionario SUS y puntajes por participante

| Participante | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Suma convertida (0 a 40) | SUS (0 a 100) | Subescala de aprendizaje (0 a 100) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| U1 | 2 | 3 | 5 | 3 | 3 | 5 | 2 | 5 | 2 | 3 | 15 | 37,50 | 50,00 |
| U2 | 3 | 3 | 5 | 3 | 4 | 3 | 2 | 4 | 1 | 2 | 20 | 50,00 | 62,50 |
| U3 | 2 | 2 | 5 | 2 | 4 | 3 | 2 | 4 | 3 | 2 | 23 | 57,50 | 75,00 |
| U4 | 1 | 2 | 5 | 2 | 3 | 3 | 2 | 5 | 1 | 1 | 19 | 47,50 | 87,50 |
| U5 | 1 | 2 | 5 | 1 | 2 | 3 | 1 | 5 | 1 | 1 | 18 | 45,00 | 100,00 |

Fuente: `03_investigacion_usuarios_ux/Encuesta.csv` (cálculo propio).

Notas relativas a la Tabla 20:
1. Fórmulas de cálculo propio: la suma convertida suma los diez valores transformados por participante. El puntaje individual SUS multiplica dicha suma por 2,5. La subescala de aprendizaje se calculó con la expresión ((5 - X4) + (5 - X10)) x 12,5 a partir de las respuestas crudas a los ítems 4 y 10 (Sauro, 2011a).

En el conjunto de la muestra, el puntaje global SUS registró una media de 47,50 puntos (cálculo propio: media aritmética de los cinco valores individuales: (37,50 + 50,00 + 57,50 + 47,50 + 45,00) / 5 = 47,50), una mediana de 47,50 puntos (cálculo propio: valor central de los puntajes ordenados [37,50; 45,00; 47,50; 50,00; 57,50]), una desviación estándar muestral de 7,29 puntos (cálculo propio: raíz cuadrada de la suma de diferencias cuadráticas dividida entre 4 grados de libertad, es decir, raíz cuadrada de 212,5 / 4 = 7,2887) y un error estándar de 3,26 puntos (cálculo propio: desviación estándar dividida entre la raíz cuadrada de 5, es decir, 7,2887 / 2,2361 = 3,2596). A partir del valor crítico de la distribución t de Student de 2,776 para 4 grados de libertad con un nivel de confianza bilateral del 95 %, el intervalo de confianza se sitúa en [38,45; 56,55] puntos (cálculo propio: media más y menos el margen de error, 47,50 ± (2,776 x 3,2596) = 47,50 ± 9,05). El puntaje mínimo correspondió al participante U1 con 37,50 puntos y el máximo al participante U3 con 57,50 puntos. Como dato complementario sin umbral propio (apartado 4.1), sustentado en Lewis y Sauro (2009), la subescala de aprendizaje presentó una media de 75,00 puntos (cálculo propio: (50,00 + 62,50 + 75,00 + 87,50 + 100,00) / 5 = 75,00), con un mínimo de 50,00 puntos en U1 y un máximo de 100,00 puntos en U5. Conforme señalamos en el apartado 3.5, al tratarse de una muestra de n = 5 participantes, este puntaje tiene un carácter descriptivo y no pretende generalizarse a la población.

Tabla 21. Resultados por ítem del cuestionario SUS

| Ítem | Enunciado | Media de respuesta (1 a 5) | Desviación estándar | Media convertida (0 a 4) |
| :--- | :--- | :--- | :--- | :--- |
| Q1 | Creo que me gustaría utilizar este sitio web con frecuencia | 1,80 | 0,84 | 0,80 |
| Q2 | Encontré este sitio web innecesariamente complejo | 2,40 | 0,55 | 2,60 |
| Q3 | Pensé que el sitio web era fácil de usar | 5,00 | 0,00 | 4,00 |
| Q4 | Creo que necesitaría el apoyo de una persona con conocimientos técnicos para poder utilizar este sitio web. | 2,20 | 0,84 | 2,80 |
| Q5 | Encontré que las diversas funciones de este sitio web estaban bien integradas | 3,20 | 0,84 | 2,20 |
| Q6 | Pensé que había demasiada inconsistencia en este sitio web | 3,40 | 0,89 | 1,60 |
| Q7 | Me imagino que la mayoría de las personas aprenderían a utilizar este sitio web muy rápidamente | 1,80 | 0,45 | 0,80 |
| Q8 | Encontré el sitio web muy engorroso o incómodo de utilizar | 4,60 | 0,55 | 0,40 |
| Q9 | Me sentí muy seguro y confiado utilizando este sitio web | 1,60 | 0,89 | 0,60 |
| Q10 | Necesité aprender muchas cosas antes de poder manejarme en este sitio web | 1,80 | 0,84 | 3,20 |

Fuente: `03_investigacion_usuarios_ux/Encuesta.csv` (cálculo propio).

Notas relativas a la Tabla 21:
1. Cálculos de la tabla: las medias de respuesta cruda, desviaciones estándar muestrales y medias convertidas corresponden a cálculos propios realizados sobre las respuestas de los cinco participantes.

En el desglose por ítem, la media convertida más alta correspondió a Q3 con 4,00 puntos sobre 4, donde los cinco participantes marcaron la puntuación máxima de 5 en la respuesta cruda. En contraste, las medias convertidas más bajas se registraron en Q8 con 0,40 puntos (media cruda de 4,60), en Q9 con 0,60 puntos (media cruda de 1,60) y en Q1 y Q7 con 0,80 puntos cada uno (medias crudas de 1,80).

### Paso 4. Análisis cruzado frente a los parámetros definidos

Según el numeral 5 de la guía de la docente, en este paso contrastamos los resultados de los Pasos 2 y 3 con los umbrales de la Tabla 8 y comprobamos si las fuentes coinciden.

#### Regla de decisión

Para que cada veredicto se pueda reproducir a partir de los datos, aplicamos una regla de decisión en tres niveles:

1. Una métrica cumple cuando todas sus mediciones quedan dentro del umbral de la Tabla 8. Si hay dos mediciones de la misma métrica (dos corridas de Lighthouse, dos verificaciones de enlaces, dos auditorías de estilos) y no coinciden, se decide con la más desfavorable, y la diferencia se analiza en la triangulación.
2. Una subcaracterística cumple cuando todas sus métricas con umbral cumplen. Los datos complementarios sin umbral (subescala de aprendizaje, tiempos por tarea, comentarios) no deciden; sirven para explicar.
3. Una característica cumple cuando todas sus subcaracterísticas evaluadas cumplen.

Además del veredicto, reportamos como dato descriptivo, sin umbral, cuántas métricas quedaron dentro de su límite. Optamos por esta regla estricta porque la guía de la docente pide límites de aceptación claros; una regla de mayoría permitiría que una métrica que no cumple quedara oculta detrás de otras que sí cumplen.

#### Triangulación por subcaracterística

En la Tabla 22 contrastamos cada una de las 22 métricas con umbral, y también la subescala de aprendizaje como dato complementario, con los resultados de las pruebas automatizadas del integrante 1, las herramientas web del integrante 2 y las sesiones con usuarios del integrante 3. En la Tabla 23 agrupamos esos veredictos por subcaracterística y característica e indicamos el tipo de cruce con los usuarios.

Tabla 22. Veredicto por métrica frente a su umbral

| Subcaracterística | Métrica y umbral | Pruebas automatizadas (integrante 1) | Herramientas web (integrante 2) | Usuarios (Paso 3) | Veredicto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Pertinencia funcional | RP = 100 % | RP = 50,00 %: Add to cart usa un diálogo nativo y el enlace Cart no muestra contador; Purchase muestra un comprobante en la página | No aplica | Permanencia media del diálogo: 4,9 s (Sony vaio i5) y 3,5 s (Apple monitor 24). U1 tuvo problemas para salir de la confirmación y U2 para encontrar el carrito | No cumple |
| Pertinencia funcional | C ≤ 3 clics | C = 2 clics | No aplica | U4 comentó que no se pueden buscar productos por nombre y U5 preguntó por una barra de búsqueda. Tarea 1: media de 34,2 s | Cumple |
| Comportamiento temporal | T < 2,0 s con 50 usuarios | T = 188,00 ms (k6) | No aplica | Sin comentarios sobre demoras | Cumple |
| Comportamiento temporal | LCP ≤ 2,5 s | 3,74 s (primera corrida de Lighthouse) | 7,08 s (segunda corrida) | Sin comentarios sobre demoras | No cumple |
| Comportamiento temporal | FCP ≤ 1,8 s | 1,79 s | 2,13 s | Sin comentarios sobre demoras | No cumple |
| Comportamiento temporal | CLS ≤ 0,1 | 0,235 | 0,284 | Sin comentarios | No cumple |
| Comportamiento temporal | Puntaje de rendimiento ≥ 90 | 70 | 54 | Sin comentarios | No cumple |
| Comportamiento temporal | Tiempo HTTP de /view y /bycat < 2,0 s | Promedio global de 351,09 ms (59 de 60 peticiones con HTTP 200) | No aplica | Sin comentarios sobre demoras | Cumple |
| Capacidad | E ≤ 1 % | E = 0,00 % (0 fallidas de 1.632) | No aplica | Los cinco participantes llegaron a la confirmación de compra | Cumple |
| Utilización de recursos | P < 1.600 KiB | 1.392,84 KiB (primera corrida, con imágenes que no terminaron de descargarse) | 2.221,27 KiB (segunda corrida) y 2.230,24 KiB (medición con Playwright) | No aplica | No cumple |
| Aprendibilidad | Ningún participante con más de 2 extravíos en una tarea | No aplica | No aplica | Cota superior de 2 extravíos por participante y tarea; 4 de 5 participantes con 1 extravío en la sesión | Cumple |
| Aprendibilidad | Subescala de aprendizaje (sin umbral) | No aplica | No aplica | 75,00 | Dato complementario |
| Operabilidad | SUS global ≥ 68 | No aplica | No aplica | 47,50 (IC 95 % de 38,45 a 56,55) | No cumple |
| Operabilidad | S(t) ≥ 80 % en cada tarea | No aplica | No aplica | Tarea 1: 100 %; Tarea 2: 80 %; Tarea 3: 100 %; Tarea 4: 60 % | No cumple |
| Operabilidad | 0 enlaces rotos | 0 de 33 enlaces y 0 de 14 imágenes | 0 de 33 enlaces | Sin comentarios sobre enlaces que fallaran | Cumple |
| Protección contra errores de usuario | R = 100 % | R = 50,00 %: bloquea el formulario vacío y acepta una tarjeta alfabética | No aplica | Las observaciones de los cinco participantes en la Tarea 4 se refieren a la tarjeta: 4 de 5 (80 %) tuvieron dudas de formato y U3 la escribió sin restricción del sistema; U4 y U5 pidieron ayuda | No cumple |
| Protección contra errores de usuario | D = 100 % | D = 0,00 % | No aplica | Los cinco eliminaron el monitor porque la instrucción lo pedía (Tarea 3: 100 %); no hubo borrados accidentales que observar | No cumple |
| Involucramiento del usuario | UT ≥ 90 % | 80,00 % (10 registros) | 84,62 % (13 componentes) | Sin comentarios sobre la apariencia; Q6: media de 3,40 | No cumple |
| Involucramiento del usuario | CCC = 100 % | 100,00 % | 100,00 % | Sin comentarios sobre la apariencia | Cumple |
| Inclusividad | 0 violaciones críticas | Reglas image-alt (5 nodos) y label (3 nodos con los modales abiertos) | No aplica | Sin comentarios sobre la legibilidad | No cumple |
| Inclusividad | CC = 100 % | 40,00 % (4 de 10) | No aplica | Sin comentarios sobre la legibilidad | No cumple |
| Inclusividad | EC = 100 % | 76,92 % (10 de 13) | No aplica | Sin comentarios | No cumple |
| Inclusividad | 0 errores de marcado | No aplica | 7 errores y 4 advertencias (W3C Nu Html Checker) | Sin comentarios | No cumple |

Fuente: elaboración propia a partir de la Tabla 8 y de las Tablas 14 a 21.

Tabla 23. Veredicto por subcaracterística y característica

| Característica | Subcaracterística | Métricas que cumplen | Cruce con usuarios | Resultado del cruce | Veredicto de la subcaracterística | Veredicto de la característica |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Adecuación funcional | Pertinencia funcional | 1 de 2 | Directo | Coincide en RP; contradicción parcial en C | No cumple | No cumple (0 de 1 subcaracterísticas) |
| Eficiencia de desempeño | Comportamiento temporal | 2 de 6 | Indirecto | Contradicción explicada por las condiciones de medición | No cumple | No cumple (1 de 3) |
| Eficiencia de desempeño | Capacidad | 1 de 1 | Indirecto | Coincide | Cumple | No cumple (1 de 3) |
| Eficiencia de desempeño | Utilización de recursos | 0 de 1 | Indirecto | Sin percepción registrada | No cumple | No cumple (1 de 3) |
| Capacidad de interacción | Aprendibilidad | 1 de 1 | Directo | Contradicción parcial con Q7 del SUS | Cumple | No cumple (1 de 5) |
| Capacidad de interacción | Operabilidad | 1 de 3 | Directo | Coincide | No cumple | No cumple (1 de 5) |
| Capacidad de interacción | Protección contra errores de usuario | 0 de 2 | Directo en R; sin cruce en D | Coincide en R | No cumple | No cumple (1 de 5) |
| Capacidad de interacción | Involucramiento del usuario | 1 de 2 | Débil | Sin comentarios registrados | No cumple | No cumple (1 de 5) |
| Capacidad de interacción | Inclusividad | 0 de 4 | Débil | Sin comentarios registrados; axe-core y el validador W3C coinciden entre sí | No cumple | No cumple (1 de 5) |

Fuente: elaboración propia a partir de la Tabla 22 y de la regla de decisión.

En conjunto, cumplen 7 de las 22 métricas con umbral (31,82 %): 1 de 2 en Adecuación funcional (50,00 %), 3 de 8 en Eficiencia de desempeño (37,50 %) y 3 de 12 en Capacidad de interacción (25,00 %). Al aplicar la regla de decisión cumplen 2 de las 9 subcaracterísticas (22,22 %), Capacidad y Aprendibilidad, una en cada característica. Las otras siete tienen al menos una métrica fuera de su límite, de modo que ninguna de las tres características cumple. Estos conteos salen de las Tablas 22 y 23 (cálculo propio).

Pertinencia funcional. RP coincide con lo observado: U1 tuvo problemas para salir de la confirmación, y U1 y U2 tardaron 5,9 s y 9,9 s en cerrar el diálogo del Sony vaio i5, frente a valores de 2,6 s a 3,4 s en U3, U4 y U5 (Tabla 17). U2 tuvo problemas para encontrar el carrito, que no muestra contador (Tabla 14). Sobre C: cumple, pero U4 y U5 echaron de menos un buscador. No es una contradicción de la métrica sino un límite de lo que mide: C cuenta los clics de la ruta mínima cuando el usuario ya sabe en qué categoría buscar, y el Sony vaio i5 aparece en la primera página del catálogo (Tabla 9). La falta de buscador (Tabla 14, nota 2) afecta a quien no sabe dónde está el producto y queda como hallazgo adicional.

Comportamiento temporal. Del lado del servidor, k6 dio 188,00 ms con 50 usuarios y /view y /bycat promediaron 351,09 ms. Del lado del cliente fallan LCP, CLS y el puntaje en las dos corridas. En CLS, el pie de página (div#footc) aporta 0,2350 en las dos corridas, es decir, el 100,00 % del CLS de la primera y el 82,61 % del de la segunda (cálculo propio con los valores sin redondear de `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json` y `02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json`). FCP: la primera corrida queda dentro por 9,06 ms y la segunda fuera, así que no cumple por la regla 1. Los participantes no comentaron demoras. La contradicción se explica por las condiciones: Lighthouse emula un teléfono con throttling (RTT de 150 ms, unos 1,6 Mbps y CPU x4), mientras que los participantes usaron portátiles con Firefox y Wi-Fi (apartado 3.5). La medición con Playwright sin throttling registró el fin del evento load a los 819 ms (Tabla 15). Por eso el incumplimiento describe la experiencia en un teléfono con red lenta, no la de las sesiones. Entre una corrida y otra, el puntaje bajó 16 puntos y el LCP subió 3.342,38 ms (cálculo propio con los mismos reportes). Las corridas se hicieron en equipos con índice de rendimiento distinto (2.473,50 y 1.377, Tabla 15, nota 8), en redes distintas (Tabla 11) y con tiempos de respuesta del servidor de 1.148,00 ms y 131 ms (Tabla 15, notas 1 y 8). La documentación de Lighthouse (GoogleChrome, s. f.) enumera estos factores como causas de variabilidad y recomienda la mediana de varias corridas; con dos corridas aplicamos la más desfavorable. LCP, CLS y puntaje no cumplen en ninguna, así que el veredicto no depende de la corrida.

Capacidad. E = 0,00 % sobre 1.632 peticiones. Pero k6 solo pidió index.html y /entries, no los servicios del flujo de compra (Tabla 13). En la medición aparte de /view y /bycat falló 1 de 60 peticiones (1,67 %; cálculo propio con `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/tiempos_http_view_bycat.json`), dentro del bloque de 10 peticiones concurrentes a /bycat. No entra en E porque es otro instrumento y otra carga, pero indica que los servicios del flujo no se probaron con 50 usuarios. El cruce con usuarios es indirecto: los cinco llegaron a la confirmación de compra (Tabla 19, nota 2), en sesiones individuales y no concurrentes. El veredicto vale para index.html y /entries.

Utilización de recursos. Tres mediciones: 1.392,84 KiB, 2.221,27 KiB y 2.230,24 KiB. La primera corrida tiene 7 imágenes (galaxy_s6.jpg, Lumia_1520.jpg, Nexus_6.jpg, iphone_6.jpg, xperia_z5.jpg, HTC_M9.jpg, sony_vaio_5.jpg) del catálogo sin terminar de descargarse (campo finished en false; 2 con código -1 y el resto con una transferencia parcial, según `01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/lighthouse_report.report.json`). Sus imágenes suman 353.176 B (344,90 KiB), frente a 1.196.497 B (1.168,45 KiB) en la segunda (`02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json`). La diferencia en imágenes, de 843.321 B (823,56 KiB), explica el 99,41 % de la diferencia de peso total entre las dos corridas, que es de 848.308 B (828,43 KiB) (cálculo propio con los dos reportes de Lighthouse). La segunda corrida y la medición con Playwright coinciden y superan el límite. En la segunda corrida, las imágenes son el 52,60 % del peso y el video del modal About us el 34,49 % (Tabla 15, nota 9). No hay instrumento humano para el peso; el cruce es indirecto.

Aprendibilidad. Con la cota superior de 2 extravíos por participante y tarea (Paso 3), ninguna tarea supera el límite. Dato complementario: subescala de aprendizaje de 75,00. Contradicción parcial: Q7 ("la mayoría de las personas aprenderían a utilizar este sitio web muy rápidamente") tuvo una media de 1,80. Los participantes completaron el flujo con pocos extravíos, pero no creen que otros lo aprendan rápido. El registro no precisa qué evento se contó como extravío, pero las observaciones de navegación de los cuatro participantes con un extravío describen fricciones que coinciden con hallazgos automatizados: el diálogo nativo (U1), el carrito sin contador (U2) y la falta de buscador (U4 y U5).

Operabilidad. SUS 47,50; el límite superior del IC (56,55) queda 11,45 puntos por debajo de 68 (`03_investigacion_usuarios_ux/Encuesta.csv`, cálculo propio), así que el veredicto se sostiene aun considerando la incertidumbre que introduce una muestra de cinco participantes. La Tarea 4 tiene el 60 % y concentra el 40,76 % del tiempo (Tabla 17, nota 2). Los 0 enlaces rotos de las dos corridas coinciden con la ausencia de comentarios sobre enlaces. La falla está en el formulario Place Order: los 6 campos son type="text" sin required ni pattern (Tabla 16), y cuatro participantes tuvieron dudas sobre cómo escribir la tarjeta. Inconsistencia: Q3 ("fácil de usar") tuvo 5 en los cinco participantes y Q8 ("muy engorroso") una media de 4,60. Sauro y Lewis (2011) encontraron que en 21 de 158 cuestionarios (13 %) los participantes se equivocaron en los ítems de tono negativo; es una explicación posible, no comprobada en esta muestra. Recalculamos los puntajes desde las respuestas crudas (Paso 3), como recomiendan esos autores para la codificación, y se retoma en las amenazas.

Protección contra errores de usuario. R = 50,00 %: el formulario bloquea el envío vacío pero acepta una tarjeta alfabética, y con el carrito vacío emite un comprobante por 0 USD (Tabla 16). La coincidencia con los usuarios es fuerte. Las observaciones de los cinco participantes en la Tarea 4 se refieren a la tarjeta, y la fila de resumen de `03_investigacion_usuarios_ux/datos/matriz_observacion_5_usuarios.csv` registra que 4 de 5 (80 %) tuvieron dudas de formato y de obligatoriedad. U4 y U5 pidieron ayuda, y U3, el único sin dudas, escribió los datos "como pensó que era (sin restricción del sistema)" (Tabla 18). Que el formulario aceptara lo que U3 escribió es la misma falla que mide R. D = 0,00 %: no hay confirmación ni opción para deshacer. Aquí no hay cruce: la instrucción pedía eliminar el monitor, así que la observación no podía registrar un borrado accidental. El veredicto de D descansa en la prueba automatizada.

Involucramiento del usuario. UT no cumple en ninguna auditoría (80,00 % y 84,62 %). Las dos coinciden en los mismos dos botones con sans-serif (Tabla 16, nota 9). CCC = 100,00 % en ambas. No hay comentarios sobre la apariencia. Q6 ("demasiada inconsistencia") tuvo una media de 3,40, pero el ítem es general y no permite atribuirlo a la tipografía ni a los colores. El cruce es débil y el veredicto descansa en la evidencia técnica. La falla se limita a dos botones.

Inclusividad. La herramienta axe-core registró 2 reglas críticas distintas con 8 nodos en total: image-alt con los modales cerrados y label con los modales abiertos (cálculo propio con `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json` y `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/auditoria_labels_modales_abiertos.json`). CC = 40,00 %, EC = 76,92 % y 7 errores de marcado. Dos instrumentos independientes coinciden: el validador W3C y axe-core señalan el mismo logotipo sin alt y los mismos dos campos de Log in (Tabla 16, nota 10). Discrepancia del atributo alt (Tabla 16, nota 5): `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/integridad_enlaces.json` cuenta once imágenes sin alt, pero el HTML que guardó axe-core muestra que las nueve imágenes de producto tienen alt="" dentro de un enlace. Adoptamos la lectura de axe-core porque se basa en el HTML de la página: son enlaces sin nombre accesible (link-name), no imágenes sin atributo. El veredicto no cambia con ninguna de las dos lecturas. No hay comentarios sobre la legibilidad y la muestra no incluyó personas con discapacidad, así que el cruce es débil.

#### Amenazas a la validez

A continuación exponemos las limitaciones de diseño, muestreo e instrumentación que condicionan el alcance de las conclusiones obtenidas. En la Tabla 24 detallamos cada amenaza identificada, las conclusiones que afecta y el tratamiento metodológico aplicado para mitigar su efecto en el informe.

Tabla 24. Amenazas a la validez y su tratamiento

| Amenaza | Conclusiones que afecta | Tratamiento |
| :--- | :--- | :--- |
| Muestra de 5 participantes, no probabilística | SUS, éxito por tarea y extravíos | Se reporta el IC 95 % del SUS; su límite superior queda por debajo de 68, así que ese veredicto se sostiene. En S(t), cada participante equivale a 20 puntos porcentuales, por lo que una sola solicitud de ayuda cambia el resultado de una tarea. |
| El desconocimiento previo de DemoBlaze se basa en la declaración de cada participante (apartado 3.4) | Aprendibilidad | Se acepta la declaración registrada por el integrante 3. Si algún participante conocía el sitio, el conteo de extravíos podría subestimar la dificultad que enfrenta un comprador nuevo, y el veredicto favorable de Aprendibilidad sería menos sólido. |
| Dos corridas de Lighthouse en equipos, redes y momentos distintos (Tablas 11 y 15) | Comportamiento temporal y Utilización de recursos | Regla 1: se decide con la más desfavorable. LCP, CLS y puntaje no cumplen en ninguna. La documentación de Lighthouse recomienda la mediana de varias corridas (GoogleChrome, s. f.), que este trabajo no tiene. |
| Imágenes sin terminar de descargarse en la primera corrida | Utilización de recursos | El peso de la segunda corrida se corrobora con la medición de Playwright (2.221,27 KiB y 2.230,24 KiB). |
| k6 no incluyó los servicios del flujo de compra | Capacidad y tiempo de respuesta con 50 usuarios | El veredicto se limita a index.html y /entries. /view y /bycat se midieron aparte con 10 peticiones concurrentes. |
| Herramientas sustituidas: PageSpeed Insights, GTmetrix y tres extensiones (Paso 2) | Enlaces, estilos y peso | Las dos corridas de enlaces y de estilos usan el mismo tipo de instrumento. Donde sí hay instrumentos distintos (axe-core y el validador W3C), coinciden. |
| Respuestas inconsistentes entre Q3 y Q8 | SUS | Puntajes recalculados desde las respuestas crudas. Sauro y Lewis (2011) documentan errores de los participantes en los ítems de tono negativo. |
| Extravíos registrados por sesión y no por tarea, sin indicar qué evento se contó | Aprendibilidad | Se usa la cota superior de 2 extravíos por participante y tarea. Con ella el veredicto no cambia. |
| Firefox en portátiles con Wi-Fi (usuarios) frente a Chromium headless con emulación móvil (herramientas) | Cruce de Eficiencia de desempeño | Los tiempos de tarea no se comparan con los técnicos; el cruce se declara indirecto. |
| Sin comentarios sobre apariencia ni legibilidad, y sin participantes con discapacidad | Involucramiento del usuario e Inclusividad | El cruce se declara débil y el veredicto descansa en la evidencia técnica. |
| Sitio de demostración público, medido en una sola ventana de tiempo (Tabla 11) | Todas | DemoBlaze no procesa transacciones reales y su comportamiento puede cambiar sin aviso. Los resultados describen el sitio en las fechas de medición. |

Fuente: elaboración propia.

### Paso 5. Conclusiones y recomendaciones de mejora

A partir del análisis integrado de las mediciones técnicas y las pruebas con usuarios, emitimos el dictamen técnico sobre el flujo de compra de punta a punta de DemoBlaze. De las 22 métricas con umbral evaluadas cumplen 7 (31,82 %); cumplen 2 de las 9 subcaracterísticas (Capacidad y Aprendibilidad, el 22,22 %) y ninguna de las tres características. El flujo permite completar la compra, pues los cinco participantes llegaron a la confirmación, pero las fallas se concentran en cuatro frentes: el formulario Place Order, la retroalimentación de Add to cart y del borrado, la carga del lado del cliente y la accesibilidad. La percepción de los usuarios (SUS 47,50) queda por debajo del límite.

#### Fortalezas

- Respuesta del servidor en lo medido: T = 188,00 ms y E = 0,00 % con 50 usuarios (Tabla 15), y /view y /bycat con 351,09 ms en promedio.
- 0 enlaces rotos en las dos corridas (Tabla 16).
- CCC = 100,00 % en las dos auditorías (Tabla 16).
- C = 2 clics para llegar al Sony vaio i5 (Tabla 14).
- Aprendibilidad: ningún participante superó 2 extravíos en una tarea (Tabla 18); los cinco completaron la compra (Tabla 19, nota 2) y la Tarea 3 (carrito y borrado) tuvo 100 % (Tabla 19).
- Purchase muestra un comprobante visible en la página (Tabla 14).
- 100 / 100 en Mejores prácticas de Lighthouse en las dos corridas (Tabla 15, notas 1 y 8).

#### Debilidades

1. Formulario Place Order sin validación: R = 50,00 %, tarjeta alfabética aceptada, comprobante de 0 USD con el carrito vacío (Tabla 16); Tarea 4 con 60 % (Tabla 19) y el 40,76 % del tiempo (Tabla 17, nota 2).
2. Usabilidad percibida baja: SUS 47,50 (IC 95 % de 38,45 a 56,55, Tabla 20); Q9 ("me sentí muy seguro y confiado") con media de 1,60 (Tabla 21).
3. Add to cart con un diálogo nativo y sin contador: RP = 50,00 % (Tabla 14); dificultades de U1 y U2 (Tabla 18).
4. Borrado sin confirmación: D = 0,00 % (Tabla 16).
5. Carga del lado del cliente: LCP, CLS y puntaje fuera de límite en las dos corridas (Tabla 15); 2.221,27 KiB (Tabla 15), con el video del modal About us descargado sin abrir el modal (34,49 %, Tabla 15, nota 9) y las imágenes con 52,60 % del peso (`02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json`).
6. Accesibilidad: 2 reglas críticas (image-alt, label) con 8 nodos (`01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/accesibilidad_axe.json` y `01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/auditoria_labels_modales_abiertos.json`), CC = 40,00 %, EC = 76,92 % y 7 errores de marcado (Tabla 16).
7. Uniformidad tipográfica: dos botones en sans-serif (UT = 80,00 % y 84,62 %, Tabla 16).

Quedan además hallazgos sin una métrica propia en la Tabla 8, por lo que no reciben veredicto. Dentro de Pertinencia funcional, como se anunció en el apartado 3.2, están la falta de un buscador por texto y la imposibilidad de cambiar la cantidad en el carrito (Tabla 14, nota 2). Fuera del alcance evaluado, porque Corrección funcional quedó excluida en ese mismo apartado, está la fecha del comprobante, que se construye con getMonth() sin sumar 1, anomalía ya descrita en los apartados 1.5 y 2.2.

#### Planes de acción correctivos

Cada acción de la Tabla 25 lleva una prioridad según este criterio:

- alta: la acción atiende una falla ligada a una métrica de usuarios que no cumple (SUS o éxito por tarea) o a una violación crítica de accesibilidad;
- media: corrige una métrica técnica que no cumple y no se asocia a una métrica de usuarios que falle;
- baja: atiende hallazgos sin una métrica que incumpla.

Tabla 25. Plan de acción correctivo para DemoBlaze

| N.º | Acción | Hallazgo que atiende | Métrica de verificación y meta | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Validar el formulario Place Order: required en los campos obligatorios, inputmode numérico y longitud en la tarjeta, mes y año como listas de selección, verificación del dígito de control definido en ISO/IEC 7812-1:2017 (algoritmo de Luhn), mensajes de error junto a cada campo (Scott, 2024) e impedir la compra con el carrito vacío | R = 50,00 %; comprobante de 0 USD; S(Tarea 4) = 60 % | R = 100 % al repetir las pruebas negativas de Playwright | Alta |
| 2 | Mostrar en cada campo del formulario el formato esperado y cuáles son obligatorios | Dudas de formato en 4 de 5 participantes en la Tarea 4; S(Tarea 4) = 60 % | S(t) ≥ 80 % en la Tarea 4 y SUS ≥ 68 en una nueva aplicación | Alta |
| 3 | Corregir la accesibilidad: alt en el logotipo, nombre accesible en los enlaces de producto, atributos for que apunten a los campos de Log in y de Contact, e identificadores únicos en los enlaces de categoría | Reglas críticas image-alt y label; EC = 76,92 %; 7 errores W3C | 0 violaciones críticas en axe-core, EC = 100 % y 0 errores en el validador W3C | Alta |
| 4 | Reemplazar el diálogo nativo de Add to cart por un aviso dentro de la página y mostrar un contador en el enlace Cart (Laubheimer, 2018) | RP = 50,00 % | RP = 100 % | Media |
| 5 | Pedir confirmación u ofrecer deshacer al pulsar Delete | D = 0,00 % | D = 100 % | Media |
| 6 | Cargar el reproductor y los archivos del video solo cuando se abra el modal About us | Video con el 34,49 % del peso | P < 1.600 KiB. Sin el video, el peso de la segunda corrida sería de 1.490.101 B, es decir, 1.455,18 KiB (cálculo propio con `02_auditoria_extensiones_ui/datos/pagespeed_lighthouse.report.json`) | Media |
| 7 | Comprimir y redimensionar las imágenes del catálogo | Imágenes con 52,60 % del peso; LCP de 7,08 s | LCP ≤ 2,5 s, P < 1.600 KiB y puntaje ≥ 90 | Media |
| 8 | Reservar el espacio del pie de página (div#footc) y de las tarjetas de producto antes de que cargue el contenido | CLS de 0,235 y 0,284 | CLS ≤ 0,1 | Media |
| 9 | Ajustar los colores de texto y del botón verde hasta alcanzar 4,5:1 (Kirkpatrick et al., 2025) | CC = 40,00 % | CC = 100 % | Media |
| 10 | Aplicar la familia LatoWeb al botón .btn-primary y al botón Place Order | UT = 80,00 % y 84,62 % | UT ≥ 90 % | Media |
| 11 | Agregar un buscador por nombre de producto | Comentarios de U4 y U5 (hallazgo adicional) | C ≤ 3 y ninguna pregunta por el buscador en una nueva sesión | Baja |

Fuente: elaboración propia a partir de las Tablas 22 y 23.

Para comprobar las mejoras habría que repetir las mismas pruebas e incluir lo que faltó en esta evaluación: k6 con los servicios del flujo de compra (/bycat, /view, /addtocart, /viewcart y /deletecart), al menos cinco corridas de Lighthouse para usar la mediana (GoogleChrome, s. f.) y una nueva aplicación del SUS con el registro de extravíos por tarea.

## Referencias

Baymard Institute. (2025, 22 de septiembre). *50 Cart Abandonment Rate Statistics 2026*. Baymard Institute. https://baymard.com/lists/cart-abandonment-rate

Cámara Colombiana de Comercio Electrónico. (2025, 13 de junio). *Informe Trimestral del Comercio Electrónico en Colombia 2025-I*. CCCE. https://ccce.org.co/noticias/informe-trimestral-del-comercio-electronico-en-colombia-2025-i/

Chrome for Developers. (2019a, 2 de mayo). *Avoid enormous network payloads*. Google. https://developer.chrome.com/docs/lighthouse/performance/total-byte-weight

Chrome for Developers. (2019b, 19 de septiembre). *Lighthouse performance scoring*. Google. https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

GoogleChrome. (s. f.). *Score variability*. GitHub. https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md

International Organization for Standardization y International Electrotechnical Commission. (2011). *ISO/IEC 25010:2011 Systems and software engineering: Systems and software Quality Requirements and Evaluation (SQuaRE): System and software quality models*. ISO. https://www.iso.org/standard/35733.html

International Organization for Standardization y International Electrotechnical Commission. (2017). *ISO/IEC 7812-1:2017 Identification cards: Identification of issuers: Part 1: Numbering system* (5.ª ed.). ISO. https://www.iso.org/standard/70484.html

International Organization for Standardization y International Electrotechnical Commission. (2023). *ISO/IEC 25010:2023 Systems and software engineering: Systems and software Quality Requirements and Evaluation (SQuaRE): Product quality model* (2.ª ed.). ISO. https://www.iso.org/standard/78176.html

ISO 25000. (s. f.). *ISO/IEC 25010*. iso25000.com. https://iso25000.com/index.php/normas-iso-25000/iso-25010

Kirkpatrick, A., O Connor, J., Campbell, A., y Cooper, M. (Eds.). (2025, 6 de mayo). *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C. https://www.w3.org/TR/WCAG21/

Laubheimer, P. (2018, 17 de junio). *Adding an Item to a Shopping Cart: Provide Clear, Persistent Feedback*. Nielsen Norman Group. https://www.nngroup.com/articles/cart-feedback/

Lewis, J. R., y Sauro, J. (2009). The Factor Structure of the System Usability Scale. En *Proceedings of the Human Computer Interaction International Conference (HCII 2009)*. Springer. https://doi.org/10.1007/978-3-642-02806-9_12

Mihajlija, M., y Walton, P. (2023, 12 de abril). *Cumulative Layout Shift (CLS)*. web.dev. https://web.dev/articles/cls

Nielsen, J. (2000, 18 de marzo). *Why You Only Need to Test with 5 Users*. Nielsen Norman Group. https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/

Panetti, J. (2023, 23 de mayo). *Running Your Own Gatling Script in Blazemeter Cloud*. Perforce BlazeMeter. https://www.blazemeter.com/blog/gatling-script

Sauro, J. (2011a, 3 de febrero). *Measuring Usability with the System Usability Scale (SUS)*. MeasuringU. https://measuringu.com/sus/

Sauro, J. (2011b, 21 de marzo). *What Is A Good Task-Completion Rate?* MeasuringU. https://measuringu.com/task-completion/

Sauro, J. (2017, 8 de noviembre). *Recent Advances with the System Usability Scale*. MeasuringU. https://measuringu.com/sus-advances/

Sauro, J., y Lewis, J. R. (2011). When designing usability questionnaires, does it hurt to be positive? En *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems* (pp. 2215-2224). ACM. https://doi.org/10.1145/1978942.1979266

Scott, E. (2024, 9 de enero). *Usability Testing of Inline Form Validation: 31% Don’t Have It, 4% Get It Wrong*. Baymard Institute. https://baymard.com/research-articles/inline-form-validation

Starke, G. (s. f.). *Update on ISO 25010, version 2023*. arc42 Quality Model. https://quality.arc42.org/articles/iso-25010-update-2023

Walton, P. (2023, 6 de diciembre). *First Contentful Paint (FCP)*. web.dev. https://web.dev/articles/fcp

Walton, P., y Pollard, B. (2025, 4 de septiembre). *Largest Contentful Paint (LCP)*. web.dev. https://web.dev/articles/lcp

## Anexos

Reúne el material de soporte que respalda las cifras del informe.

### Anexo A. Inventario de evidencias

Relaciona cada archivo de evidencia del repositorio con la sección del informe que lo usa.

### Anexo B. Cuestionario SUS aplicado

El cuestionario de usabilidad fue administrado mediante Google Formularios bajo el título "Cuestionario SUS - DemoBlaze", al terminar cada sesión práctica de observación (sección 4 de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`). El encabezado del formulario contiene la instrucción de la prueba práctica, que se reproduce en el Anexo C. El instrumento constó de diez ítems obligatorios formulados en español, evaluados mediante una escala Likert de 1 (Totalmente en desacuerdo) a 5 (Totalmente de acuerdo), alternando afirmaciones de tono positivo y negativo según la estructura estandarizada de la escala. En la Tabla B1 presentamos los enunciados literales utilizados en la evaluación.

Tabla B1. Ítems del cuestionario SUS aplicado

| N.º | Enunciado | Tono del ítem |
| :--- | :--- | :--- |
| 1 | Creo que me gustaría utilizar este sitio web con frecuencia | Positivo |
| 2 | Encontré este sitio web innecesariamente complejo | Negativo |
| 3 | Pensé que el sitio web era fácil de usar | Positivo |
| 4 | Creo que necesitaría el apoyo de una persona con conocimientos técnicos para poder utilizar este sitio web. | Negativo |
| 5 | Encontré que las diversas funciones de este sitio web estaban bien integradas | Positivo |
| 6 | Pensé que había demasiada inconsistencia en este sitio web | Negativo |
| 7 | Me imagino que la mayoría de las personas aprenderían a utilizar este sitio web muy rápidamente | Positivo |
| 8 | Encontré el sitio web muy engorroso o incómodo de utilizar | Negativo |
| 9 | Me sentí muy seguro y confiado utilizando este sitio web | Positivo |
| 10 | Necesité aprender muchas cosas antes de poder manejarme en este sitio web | Negativo |

Fuente: `03_investigacion_usuarios_ux/evidencia_sesiones/Cuestionario.pdf`.

### Anexo C. Protocolo de observación directa

La instrucción de la prueba, tal como figura en el encabezado del formulario del cuestionario (página 1 de `03_investigacion_usuarios_ux/evidencia_sesiones/Cuestionario.pdf`), es la siguiente:

> Imagina que vas a comprar en esta tienda en línea. Tu misión tiene 3 pasos:
> 1. Encuentra el portátil Sony vaio i5 y agrégalo al carrito de compras.
> 2. Regresa al catálogo, encuentra el monitor Apple monitor 24 y agrégalo también al carrito.
> 3. Ve a tu carrito de compras, elimina el monitor para quedarte solo con el portátil y finaliza la compra completando el formulario del botón Place Order.

Tabla C1. Hitos del video que delimitan las tareas

| Hito | Evento visible en el video | Tarea que cierra |
| :--- | :--- | :--- |
| H0 | Inicio de la grabación | Ninguna (inicio del flujo) |
| H1 | Aparece el diálogo de confirmación ("Product added") del Sony vaio i5 | Tarea 1 |
| H2 | Aparece el diálogo de confirmación ("Product added") del Apple monitor 24 | Tarea 2 |
| H3 | Se abre la ventana modal Place Order | Tarea 3 |
| H4 | Fin de la grabación (confirmación de compra y clic en OK) | Tarea 4 |

Fuente: `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`.

Las rutas mínimas de navegación y el número mínimo de clics de referencia para cada una de estas cuatro tareas se encuentran detallados en la Tabla 9 del apartado 4.2, donde también se establecen las definiciones operativas de extravío y de éxito de tarea. Durante cada sesión, el evaluador registró el número global de extravíos observados y las anotaciones cualitativas correspondientes a la navegación por el catálogo, la gestión del carrito y el diligenciamiento del formulario de compra; los tiempos de cada tarea se derivaron después, a partir de los hitos de las grabaciones. Conforme a las limitaciones metodológicas declaradas en la sección 6 de `03_investigacion_usuarios_ux/ESTUDIO_USUARIOS_Y_SUS.md`, el registro no incluyó un conteo de clics innecesarios y no se aplicó un protocolo estructurado de pensamiento en voz alta con transcripciones continuas de verbalizaciones.
