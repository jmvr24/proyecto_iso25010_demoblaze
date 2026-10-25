# Estudio de Investigación con Usuarios y Evaluación UX (ISO/IEC 25010) — DemoBlaze

## 1. Propósito del Estudio
Este documento presenta el diseño metodológico, los registros de observación directa y el procesamiento cuantitativo y cualitativo de las pruebas ejecutadas con **5 usuarios reales** ($n = 5$) sobre la plataforma de comercio electrónico **DemoBlaze** (`https://www.demoblaze.com/index.html`). El estudio evalúa en producción las dimensiones de **Capacidad de Interacción (Usabilidad)** y **Adecuación Funcional (Pertinencia Funcional)** bajo los lineamientos de la norma **ISO/IEC 25010**.

---

## 2. Definición de Población y Muestra ($n = 5$)

* **Población Objetivo:** Usuarios con alfabetización digital básica e intermedia acostumbrados a navegar en computadores personales y realizar consultas o compras en plataformas web.
* **Técnica de Muestreo:** Muestreo **no probabilístico por conveniencia**, seleccionando 5 participantes externos al equipo evaluador (evaluación de caja negra).
* **Justificación del Tamaño de Muestra ($n = 5$):** Fundamentado en el modelo heurístico de **Jakob Nielsen (Nielsen Norman Group)**, el cual establece que una muestra de 5 usuarios permite identificar aproximadamente el $85\%$ de los problemas de usabilidad e interacción de una interfaz en un flujo crítico.
* **Estratificación Demográfica:** La muestra abarca un rango etario de **23 a 50 años** (media: $39.2$ años; mediana: $45.0$ años), permitiendo contrastar el desempeño de adultos jóvenes habituados a patrones modernos de e-commerce ($23$ y $28$ años) frente a adultos intermedios ($45$ y $50$ años).

### Tabla 1. Perfilamiento Anónimo Demográfico y Tecnológico de la Muestra

| ID Usuario | Nombre de Referencia | Edad (Años) | Cohorte Etaria | Nivel de Familiaridad Digital / E-commerce | Dispositivo y Navegador | Tipo de Conexión |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- |
| **Usuario 1 (U1)** | Gildardo 1 | 50 | Adulto Intermedio | Básico - Intermedio (Manejo de PC) | PC Portátil / Firefox | Wi-Fi |
| **Usuario 2 (U2)** | Luz Dary | 50 | Adulto Intermedio | Básico - Intermedio (Manejo de PC) | PC Portátil / Firefox | Wi-Fi |
| **Usuario 3 (U3)** | Luis | 28 | Adulto Joven | Alto (Comprador digital frecuente) | PC Portátil / Firefox | Wi-Fi |
| **Usuario 4 (U4)** | Carlos | 45 | Adulto Intermedio | Intermedio (Manejo de PC y web) | PC Portátil / Firefox | Wi-Fi |
| **Usuario 5 (U5)** | Luisa | 23 | Adulto Joven | Alto (Compradora digital frecuente) | PC Portátil / Firefox | Wi-Fi |

---

## 3. Matriz de Observación Directa (Pruebas de Tareas)

Cada participante ejecutó sin asistencia del evaluador el **Flujo Crítico de Compra** compuesto por 4 etapas:
1. **Tarea 1 (Exploración y Búsqueda):** Localizar un producto específico partiendo desde `index.html`.
2. **Tarea 2 (Adición al Carrito):** Añadir el artículo al carrito, gestionar la ventana de confirmación (`alert` nativo) y ubicar el acceso al carrito sin contador numérico (`badge`).
3. **Tarea 3 (Checkout y Pago):** Acceder a `cart.html`, gestionar los ítems y abrir el modal `Place Order`.
4. **Tarea 4 (Validación de Errores y Feedback):** Diligenciar los campos de pago (nombre, país, ciudad, tarjeta de crédito, mes y año) y confirmar la orden (`Purchase`).

### Tabla 2. Registro Consolidado de Observación Directa y Tiempos de Ejecución

| ID Participante | Perfil (Edad) | ¿Completó Tarea Crítica? (% Éxito) | Tiempo (min:seg) | Tiempo Total (s) | N.º de Extravíos (Límite: $\le 2$) | Observaciones en Navegación y Carrito *(Tarea 1 y Tarea 2: Operabilidad y Pertinencia Funcional)* | Observaciones en Checkout `Place Order` *(Tarea 3 y Tarea 4: Protección contra Errores)* |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **U1** | Gildardo 1 (50a) | Sí (`100%`) | `03:30` | `210 s` | `1` | Tenía problemas para salir de la ventana de confirmación al añadir un producto al carrito. | No sabía cómo escribir el número de tarjeta de crédito. |
| **U2** | Luz Dary (50a) | Sí (`100%`) | `04:05` | `245 s` | `1` | Tuvo problemas para encontrar cómo acceder al carrito. | No sabía en qué formato escribir el mes, el año y el número de tarjeta de crédito. |
| **U3** | Luis (28a) | Sí (`100%`) | `02:07` | `127 s` | `0` | Intuyó cómo filtrar artículos por categorías y salir de la confirmación de carrito. | Escribió los datos de la tarjeta de crédito como pensó que era (sin restricción del sistema). |
| **U4** | Carlos (45a) | Sí (`100%`) | `03:04` | `184 s` | `1` | Le pareció extraño que no se puedan buscar los productos por el nombre. | Preguntó cómo escribir la tarjeta de crédito y sus datos. |
| **U5** | Luisa (23a) | Sí (`100%`) | `02:37` | `157 s` | `1` | Preguntó si había una barra de búsqueda de productos. | Preguntó sobre los datos de la tarjeta de crédito y si debía llenar todos los campos. |
| **GLOBAL** | **23 a 50 años ($n=5$)** | **100% Éxito** | **`03:05`** | **184.60 s** | **0.80** | **80% de los usuarios presentó al menos 1 fricción de operabilidad o pertinencia funcional.** | **100% de los usuarios experimentó incertidumbre por ausencia de validación en el formulario.** |

### Resumen Estadístico de Métricas de Observación ($n = 5$)
* **Tiempo de Ejecución (segundos):**
  * **Media ($\bar{x}$):** $184.60\text{ s}$ (`03:05` min:seg)
  * **Mediana ($Me$):** $184.00\text{ s}$ (`03:04` min:seg)
  * **Desviación Estándar ($s$):** $45.75\text{ s}$
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

### Tabla 3. Matriz de Respuestas Crudas (`1-5`), Valores Convertidos (`0-4`) y Puntaje SUS

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
* **Valor Mínimo / Valor Máximo:** $37.50$ puntos (U1) / $57.50$ puntos (U3).

### Tabla 4. Análisis Estadístico por Ítem del Cuestionario SUS

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

1. **Contraste entre Simplicidad Estructural (Q3 = 5.00) e Incomodidad Operativa (Q8 = 4.60):** Todos los usuarios completaron la compra ($100\%$ de éxito) con un promedio de $0.80$ extravíos (cumpliendo el umbral operativo $\le 2$). Sin embargo, calificaron el sitio como altamente engorroso porque carece de funciones esenciales de **Pertinencia Funcional** (ausencia de barra de búsqueda reportada por U4 y U5, y ausencia de indicador numérico en el botón `Cart` que desorientó a U1 y U2).
2. **Impacto de la Protección contra Errores de Usuario en la Confianza (Q9 = 1.60):** El $100\%$ de los participantes manifestó dudas explícitas al diligenciar el formulario `Place Order`. La ausencia de etiquetas de campos obligatorios, máscaras de entrada para tarjeta de crédito (`XXXX-XXXX-XXXX-XXXX`), formato de fecha (`MM/AAAA`) y validación de tipos de datos desplomó la confianza percibida en el sistema (media convertida de $0.60/4.00$ en Q9), arrastrando el puntaje global SUS a **$47.50 / 100$** (**REPROBADO**, al ser $< 68.0$).