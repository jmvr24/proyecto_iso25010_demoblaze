# Estudio de Investigación con Usuarios y Evaluación UX (ISO/IEC 25010) — DemoBlaze

## 1. Propósito del Estudio
Este documento presenta el diseño metodológico, los registros de observación directa y el procesamiento cuantitativo y cualitativo de las pruebas ejecutadas con **5 usuarios reales** ($n = 5$) sobre la plataforma de comercio electrónico **DemoBlaze** (`https://www.demoblaze.com/index.html`). El estudio evalúa en producción las dimensiones de **Capacidad de Interacción (Usabilidad)** y **Adecuación Funcional (Pertinencia Funcional)** bajo los lineamientos de la norma **ISO/IEC 25010**.

---

## 2. Definición de Población y Muestra ($n = 5$)

* **Población Objetivo:** Usuarios con alfabetización digital básica e intermedia acostumbrados a navegar en computadores personales y realizar consultas o compras en plataformas web.
* **Técnica de Muestreo:** Muestreo **no probabilístico por conveniencia**, seleccionando 5 participantes externos al equipo evaluador (evaluación de caja negra).
* **Justificación del Tamaño de Muestra ($n = 5$):** Fundamentado en el modelo heurístico de **Jakob Nielsen (Nielsen Norman Group)**, el cual establece que una muestra de 5 usuarios permite identificar aproximadamente el $85\%$ de los problemas de usabilidad e interacción de una interfaz en un flujo crítico.
* **Estratificación Demográfica:** La muestra abarca un rango etario de **23 a 50 años** (media: $39.2$ años; mediana: $45.0$ años), permitiendo contrastar el desempeño de adultos jóvenes habituados a patrones modernos de e-commerce ($23$ y $28$ años) frente a adultos intermedios ($45$ y $50$ años).
* **Anonimización:** Los participantes se identifican únicamente como **U1 a U5**. No se publican nombres en las tablas ni en los archivos de datos.

### Tabla 1. Perfilamiento Anónimo Demográfico y Tecnológico de la Muestra

| ID Usuario | Edad (Años) | Cohorte Etaria | Nivel de Familiaridad Digital / E-commerce | Dispositivo y Navegador | Tipo de Conexión |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **Usuario 1 (U1)** | 50 | Adulto Intermedio | Básico - Intermedio (Manejo de PC) | PC Portátil / Firefox | Wi-Fi |
| **Usuario 2 (U2)** | 50 | Adulto Intermedio | Básico - Intermedio (Manejo de PC) | PC Portátil / Firefox | Wi-Fi |
| **Usuario 3 (U3)** | 28 | Adulto Joven | Alto (Comprador digital frecuente) | PC Portátil / Firefox | Wi-Fi |
| **Usuario 4 (U4)** | 45 | Adulto Intermedio | Intermedio (Manejo de PC y web) | PC Portátil / Firefox | Wi-Fi |
| **Usuario 5 (U5)** | 23 | Adulto Joven | Alto (Compradora digital frecuente) | PC Portátil / Firefox | Wi-Fi |

---

## 3. Matriz de Observación Directa (Pruebas de Tareas)

Cada participante ejecutó sin asistencia del evaluador el **Flujo Crítico de Compra**, que consiste en localizar y comprar dos productos del catálogo: el **Sony Vaio i5** (categoría Laptops) y el **Apple monitor 24** (categoría Monitors). Las sesiones quedaron grabadas en video (`evidencia_sesiones/Usuario 1.mp4` a `Usuario 5.mp4`) y el cuestionario aplicado está en `evidencia_sesiones/Cuestionario.pdf` (Los nombres que aparecen en el vídeo son ficticios). El flujo se dividió en 4 tareas consecutivas:

1. **Tarea 1 (Exploración y búsqueda del Sony Vaio i5):** Localizar el producto partiendo desde `index.html` (sin barra de búsqueda) y agregarlo al carrito.
2. **Tarea 2 (Exploración y búsqueda del Apple monitor 24):** Cerrar la confirmación (`alert` nativo) del producto anterior, volver al catálogo, localizar el segundo producto y agregarlo al carrito.
3. **Tarea 3 (Carrito y gestión de ítems):** Cerrar la confirmación, ubicar el acceso `Cart` (sin contador numérico o `badge`), revisar `cart.html` y abrir el modal `Place Order`. En los 5 videos se observa que el participante elimina el Apple monitor 24 antes de pagar (el total pasa de 1190 a 790).
4. **Tarea 4 (Checkout, validación de errores y feedback):** Diligenciar los campos de pago (nombre, país, ciudad, tarjeta de crédito, mes y año), confirmar la orden (`Purchase`) y cerrar la confirmación `Thank you for your purchase!`.

### Medición de los tiempos por tarea

Los tiempos por tarea se obtuvieron de los videos con hitos objetivos y consecutivos. El tiempo de cada tarea es la diferencia entre dos hitos:

| Hito | Evento visible en el video | Cierra la tarea |
| :---: | :--- | :---: |
| H0 | Inicio de la grabación | — |
| H1 | Aparece el `alert` de "Product added" del Sony Vaio i5 | Tarea 1 |
| H2 | Aparece el `alert` de "Product added" del Apple monitor 24 | Tarea 2 |
| H3 | Se abre el modal `Place Order` | Tarea 3 |
| H4 | Fin de la grabación (confirmación de compra y clic en `OK`) | Tarea 4 |

Los hitos se detectaron analizando los cambios de brillo de la pantalla (cada `alert` y cada modal oscurece la página) y se verificaron visualmente en los fotogramas. La precisión es de aproximadamente $\pm 0.5$ s, por lo que los tiempos se reportan en segundos enteros. La duración de cada grabación coincide con el tiempo total del flujo. Los hitos de cada sesión están en `datos/hitos_video.csv`. Este proceso se automatizó con ayuda de inteligencia artificial.

### Tabla 2. Registro Consolidado de Observación Directa

| ID Participante | Perfil (Edad) | ¿Completó Tarea Crítica? (% Éxito) | Tiempo (min:seg) | Tiempo Total (s) | N.º de Extravíos (Límite: $\le 2$) | Observaciones en Navegación y Carrito *(Tarea 1, 2 y 3: Operabilidad y Pertinencia Funcional)* | Observaciones en Checkout `Place Order` *(Tarea 4: Protección contra Errores)* |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **U1** | 50 años | Sí (`100%`) | `03:32` | `212 s` | `1` | Tenía problemas para salir de la ventana de confirmación al añadir un producto al carrito. | No sabía cómo escribir el número de tarjeta de crédito. |
| **U2** | 50 años | Sí (`100%`) | `04:05` | `245 s` | `1` | Tuvo problemas para encontrar cómo acceder al carrito. | No sabía en qué formato escribir el mes, el año y el número de tarjeta de crédito. |
| **U3** | 28 años | Sí (`100%`) | `02:07` | `127 s` | `0` | Intuyó cómo filtrar artículos por categorías y salir de la confirmación de carrito. | Escribió los datos de la tarjeta de crédito como pensó que era (sin restricción del sistema). |
| **U4** | 45 años | Sí (`100%`) | `03:04` | `184 s` | `1` | Le pareció extraño que no se puedan buscar los productos por el nombre. | Preguntó cómo escribir la tarjeta de crédito y sus datos. |
| **U5** | 23 años | Sí (`100%`) | `02:37` | `157 s` | `1` | Preguntó si había una barra de búsqueda de productos. | Preguntó sobre los datos de la tarjeta de crédito y si debía llenar todos los campos. |
| **GLOBAL** | **23 a 50 años ($n=5$)** | **100% Éxito** | **`03:05`** | **185.00 s** | **0.80** | **80% de los usuarios presentó al menos 1 fricción de operabilidad o pertinencia funcional.** | **80% de los usuarios (4 de 5) expresó dudas sobre el formato o la obligatoriedad de los campos; solo U3 completó el formulario sin dudas.** |

### Tabla 3. Tiempos por Tarea (segundos) y Permanencia del `alert` Nativo

| ID | Tarea 1: Sony Vaio i5 | Tarea 2: Apple monitor 24 | Tarea 3: Carrito y `Place Order` | Tarea 4: Formulario y compra | Total | `alert` del Sony (s en pantalla) | `alert` del Apple (s en pantalla) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **U1** | 26 | 38 | 38 | 110 | 212 | 5.9 | 3.5 |
| **U2** | 44 | 70 | 43 | 88 | 245 | 9.9 | 5.1 |
| **U3** | 23 | 32 | 30 | 42 | 127 | 2.7 | 5.3 |
| **U4** | 39 | 48 | 28 | 69 | 184 | 3.4 | 1.7 |
| **U5** | 39 | 27 | 23 | 68 | 157 | 2.6 | 1.9 |
| **Media** | **34.2** | **43.0** | **32.4** | **75.4** | **185.0** | **4.9** | **3.5** |
| **Mediana** | 39 | 38 | 30 | 69 | 184 | 3.4 | 3.5 |
| **Desv. estándar ($s$)** | 9.15 | 17.00 | 8.02 | 25.33 | 46.04 | 3.10 | 1.70 |
| **Mín / Máx** | 23 / 44 | 27 / 70 | 23 / 43 | 42 / 110 | 127 / 245 | 2.6 / 9.9 | 1.7 / 5.3 |

**Lectura de los tiempos por tarea:**
* La **Tarea 4** (formulario `Place Order`) concentra el $41\%$ del tiempo total (75.4 s de 185.0 s) y es la tarea más variable. La mayor duración fue la de U1 (110 s), quien indicó no saber cómo escribir el número de tarjeta, y la menor la de U3 (42 s), quien completó los datos sin dudas.
* En el primer `alert`, U1 y U2 (50 años) tardaron 5.9 s y 9.9 s en continuar, frente a 2.6 a 3.4 s de U3, U4 y U5. Esto coincide con la observación de U1, quien tuvo problemas para salir de la ventana de confirmación.
* En la **Tarea 3**, U2 registró el mayor tiempo (43 s), coherente con su observación de que tuvo problemas para encontrar cómo acceder al carrito.

### Resumen Estadístico de Métricas de Observación ($n = 5$)
* **Tiempo de Ejecución (segundos):**
  * **Media ($\bar{x}$):** $185.00\text{ s}$ (`03:05` min:seg)
  * **Mediana ($Me$):** $184.00\text{ s}$ (`03:04` min:seg)
  * **Desviación Estándar ($s$):** $46.04\text{ s}$
  * **Mínimo / Máximo:** $127\text{ s}$ (`02:07` en U3, 28 años) / $245\text{ s}$ (`04:05` en U2, 50 años)
* **Número de Extravíos por Usuario:**
  * **Media ($\bar{x}$):** $0.80$ extravíos (Cumple el umbral de $\le 2$ extravíos por tarea básica)
  * **Mediana ($Me$):** $1.00$ extravío
  * **Desviación Estándar ($s$):** $0.45$ extravíos
  * **Mínimo / Máximo:** $0$ extravíos (U3) / $1$ extravío (U1, U2, U4, U5)

---

## 4. Procesamiento y Cálculo del Cuestionario SUS (*System Usability Scale*)

Al finalizar la prueba práctica, los 5 participantes diligenciaron los 10 ítems estándar del cuestionario SUS en escala Likert de `1` (*Totalmente en desacuerdo*) a `5` (*Totalmente de acuerdo*).

### Aplicación de la Fórmula Oficial SUS
$$\text{SUS}_u = \left( \sum_{i \in \{1,3,5,7,9\}} (X_i - 1) + \sum_{j \in \{2,4,6,8,10\}} (5 - X_j) \right) \times 2.5$$

### Tabla 4. Matriz de Respuestas Crudas (`1-5`), Valores Convertidos (`0-4`) y Puntaje SUS

*(Formato de celda por pregunta: **`Respuesta Cruda` $\rightarrow$ `[Valor Convertido]`**)*

| ID | Marca Temporal | Q1 (+) | Q2 (-) | Q3 (+) | Q4 (-) | Q5 (+) | Q6 (-) | Q7 (+) | Q8 (-) | Q9 (+) | Q10 (-) | Suma Conv. ($0-40$) | Puntaje SUS ($0-100$) | Dictamen ($\ge 68.0$) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **U1** | `11:57:11 a.m.` | 2 `[1]` | 3 `[2]` | 5 `[4]` | 3 `[2]` | 3 `[2]` | 5 `[0]` | 2 `[1]` | 5 `[0]` | 2 `[1]` | 3 `[2]` | **15** | **37.50** | Reprobado |
| **U2** | `12:24:49 p.m.` | 3 `[2]` | 3 `[2]` | 5 `[4]` | 3 `[2]` | 4 `[3]` | 3 `[2]` | 2 `[1]` | 4 `[1]` | 1 `[0]` | 2 `[3]` | **20** | **50.00** | Reprobado |
| **U3** | `12:26:43 p.m.` | 2 `[1]` | 2 `[3]` | 5 `[4]` | 2 `[3]` | 4 `[3]` | 3 `[2]` | 2 `[1]` | 4 `[1]` | 3 `[2]` | 2 `[3]` | **23** | **57.50** | Reprobado |
| **U4** | `12:49:00 p.m.` | 1 `[0]` | 2 `[3]` | 5 `[4]` | 2 `[3]` | 3 `[2]` | 3 `[2]` | 2 `[1]` | 5 `[0]` | 1 `[0]` | 1 `[4]` | **19** | **47.50** | Reprobado |
| **U5** | `12:50:57 p.m.` | 1 `[0]` | 2 `[3]` | 5 `[4]` | 1 `[4]` | 2 `[1]` | 3 `[2]` | 1 `[0]` | 5 `[0]` | 1 `[0]` | 1 `[4]` | **18** | **45.00** | Reprobado |
| **PROM.** | **—** | **1.80** `[0.8]` | **2.40** `[2.6]` | **5.00** `[4.0]` | **2.20** `[2.8]` | **3.20** `[2.2]` | **3.40** `[1.6]` | **1.80** `[0.8]` | **4.60** `[0.4]` | **1.60** `[0.6]` | **1.80** `[3.2]` | **19.00** | **47.50** | **REPROBADO** |

### Estadísticos Descriptivos del Puntaje SUS ($n = 5$)
* **Promedio Global ($\overline{\text{SUS}}$):** **$47.50 / 100$** (Inferior al umbral mínimo de aceptación de $68.0$ puntos en $-20.50$ puntos).
* **Mediana ($Me$):** $47.50$ puntos.
* **Desviación Estándar ($s$):** $7.29$ puntos.
* **Intervalo de Confianza al 95% ($\text{IC}_{95\%}$):** $[38.45,\ 56.55]$ puntos ($t_{0.025,\,4} = 2.776$, error estándar $SE = 3.26$; todo el intervalo se ubica por debajo del umbral de $68.0$).
* **Valor Mínimo / Valor Máximo:** $37.50$ puntos (U1) / $57.50$ puntos (U3).

### Tabla 5. Análisis Estadístico por Ítem del Cuestionario SUS

| Ítem | Enunciado Estándar SUS | Media Cruda ($1-5$) | Mediana Cruda | Desv. Estándar ($s$) | Mín / Máx | Media Convertida ($0-4$) | Interpretación del Patrón / Hallazgo |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Q1** | Creo que me gustaría utilizar este sitio web con frecuencia | 1.80 | 2.0 | 0.84 | 1 / 3 | 0.80 | Baja intención de recompra o uso frecuente. |
| **Q2** | Encontré este sitio web innecesariamente complejo | 2.40 | 2.0 | 0.55 | 2 / 3 | 2.60 | La arquitectura del sitio es percibida como simple. |
| **Q3** | Pensé que el sitio web era fácil de usar | 5.00 | 5.0 | 0.00 | 5 / 5 | 4.00 | Unanimidad absoluta: el flujo base es fácil de comprender. |
| **Q4** | Creo que necesitaría el apoyo de una persona con conocimientos técnicos... | 2.20 | 2.0 | 0.84 | 1 / 3 | 2.80 | Baja dependencia técnica, mayor en la cohorte de 50 años (puntuaron 3). |
| **Q5** | Encontré que las diversas funciones de este sitio web estaban bien integradas | 3.20 | 3.0 | 0.84 | 2 / 4 | 2.20 | Percepción neutra; penalizada por la falta de buscador y badge en carrito. |
| **Q6** | Pensé que había demasiada inconsistencia en este sitio web | 3.40 | 3.0 | 0.89 | 3 / 5 | 1.60 | Penalización alta en U1 (5) por el uso de `alert` nativo y falta de feedback. |
| **Q7** | Me imagino que la mayoría de las personas aprenderían a utilizar este sitio web muy rápidamente | 1.80 | 2.0 | 0.45 | 1 / 2 | 0.80 | Los usuarios perciben que la falta de ayudas visuales dificulta el aprendizaje inicial. |
| **Q8** | Encontré el sitio web muy engorroso o incómodo de utilizar | 4.60 | 5.0 | 0.55 | 4 / 5 | 0.40 | **Punto crítico 1:** Aunque es simple (Q3=5), resulta muy incómodo de operar (Q8=4.6). |
| **Q9** | Me sentí muy seguro y confiado utilizando este sitio web | 1.60 | 1.0 | 0.89 | 1 / 3 | 0.60 | **Punto crítico 2:** Desconfianza severa provocada por la nula validación en `Place Order`. |
| **Q10** | Necesité aprender muchas cosas antes de poder manejarme en este sitio web | 1.80 | 2.0 | 0.84 | 1 / 3 | 3.20 | Baja curva de aprendizaje previa requerida. |

---

## 5. Triangulación y Dictamen Técnico según ISO/IEC 25010

El cruce entre la **Observación Directa** y el **Cuestionario SUS** revela una paradoja de diseño fundamental en `demoblaze.com`:

1. **Contraste entre Simplicidad Estructural (Q3 = 5.00) e Incomodidad Operativa (Q8 = 4.60):** Todos los usuarios completaron la compra ($100\%$ de éxito) con un promedio de $0.80$ extravíos (cumpliendo el umbral operativo $\le 2$). Sin embargo, calificaron el sitio como altamente engorroso porque carece de funciones esenciales de **Pertinencia Funcional** (ausencia de barra de búsqueda reportada por U4 y U5, y ausencia de indicador numérico en el botón `Cart`, que desorientó a U2; además, el `alert` nativo retrasó a U1 y a U2, que tardaron 5.9 s y 9.9 s en cerrarlo).
2. **Impacto de la Protección contra Errores de Usuario en la Confianza (Q9 = 1.60):** El $80\%$ de los participantes (4 de 5: U1, U2, U4 y U5) manifestó dudas explícitas al diligenciar el formulario `Place Order`; U3 lo completó sin dudas, escribiendo los datos como supuso que debían ir. La ausencia de etiquetas de campos obligatorios, máscaras de entrada para tarjeta de crédito (`XXXX-XXXX-XXXX-XXXX`), formato de fecha (`MM/AAAA`) y validación de tipos de datos desplomó la confianza percibida en el sistema (media convertida de $0.60/4.00$ en Q9), arrastrando el puntaje global SUS a **$47.50 / 100$** (**REPROBADO**, al ser $< 68.0$).

---

## 6. Limitaciones del Estudio

1. **Clics innecesarios:** No se contó el número de clics innecesarios por tarea. El indicador `N.º de Extravíos` es el conteo que registró el evaluador durante cada sesión y no un conteo de clics.
2. **Protocolo *Think-Aloud*:** No se aplicó de forma estructurada ni se transcribieron los comentarios en voz alta. Las observaciones cualitativas se limitan a los comentarios y preguntas que los participantes hicieron durante la sesión y que quedaron registrados en la matriz de observación.
3. **Tiempos por tarea:** Se derivaron de los videos con una precisión de aproximadamente $\pm 0.5$ s. Las tareas son consecutivas y se delimitan por los hitos de la sección 3, así que el cierre de cada `alert` se contabiliza en la tarea siguiente.
4. **Éxito por tarea:** El éxito se registró para el flujo completo. En los videos se verifica que los 5 participantes llegaron a la confirmación de compra.
5. **Muestra pequeña:** Con $n = 5$ y muestreo por conveniencia, el puntaje SUS es descriptivo y no se puede generalizar a toda la población. Nielsen recomienda cerca de 20 usuarios para estimar métricas cuantitativas con precisión estadística.
