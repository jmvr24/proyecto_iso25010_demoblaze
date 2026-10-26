# Investigación con Usuarios y Evaluación UX — Integrante 3

## 1. Propósito del Módulo
Este directorio concentra el diseño metodológico, los registros de campo y el procesamiento cuantitativo/cualitativo de las pruebas con **usuarios reales** sobre **DemoBlaze** (`https://www.demoblaze.com/index.html`), evaluando las subcaracterísticas de **Capacidad de Interacción (Usabilidad)** y **Adecuación Funcional** del estándar **ISO/IEC 25010**.

---

## 2. Entregables Requeridos para el Integrante 3

### A. Definición de Población y Muestra (`n = 5`)
- **Población Objetivo:** Usuarios con experiencia básica o intermedia en compras por comercio electrónico (estudiantes universitarios / compradores digitales frecuentes).
- **Tamaño de la Muestra:** **5 usuarios reales** ($n = 5$), fundamentado en el modelo de **Jakob Nielsen (Nielsen Norman Group)**, el cual demuestra que 5 participantes permiten detectar aproximadamente el $85\%$ de los problemas de usabilidad de una interfaz.
- **Perfilamiento demográfico y tecnológico:** Tabla anónima (`Usuario 1` a `Usuario 5`) indicando edad, nivel de familiaridad con e-commerce, dispositivo/navegador utilizado y tipo de conexión.

### B. Matriz de Observación Directa (Pruebas de Tareas)
Cada uno de los 5 usuarios debe ejecutar el mismo **Flujo Crítico de Compra** sin asistencia del evaluador:
1. **Tarea 1 (Exploración y Búsqueda):** Localizar un producto específico (por ejemplo, una laptop *Sony vaio i5*) partiendo desde el Home (`index.html`). Documentar la reacción del usuario ante la **ausencia de barra de búsqueda**.
2. **Tarea 2 (Adición al Carrito):** Agregar el producto al carrito e identificar cuántos productos hay actualmente en el carrito desde la barra de navegación (documentar el impacto de la **ausencia de contador/badge** en `Cart`).
3. **Tarea 3 (Checkout y Pago):** Ir al carrito (`cart.html`), abrir el formulario `Place Order` y completar la orden de compra.
4. **Tarea 4 (Validación de Errores / Observación de Feedback):** Registrar si el usuario nota inconsistencias en la validación del formulario (campos vacíos o formato de tarjeta de crédito).

Para cada usuario y tarea, registrar en la matriz:
- **Éxito de la tarea:** Completada sin ayuda (`100%`), completada con dificultad (`50%`) o fallida (`0%`).
- **Tiempo empleado (en segundos)** por tarea y tiempo total del flujo.
- **Número de errores / clics innecesarios** cometidos.
- **Observaciones cualitativas:** Comentarios en voz alta (*Think-Aloud Protocol*), gestos de frustración o dudas.

### C. Cálculos del Cuestionario SUS (*System Usability Scale*)
Al finalizar la sesión práctica, cada uno de los 5 usuarios debe responder los **10 ítems estándar del cuestionario SUS** en escala Likert de `1` (Totalmente en desacuerdo) a `5` (Totalmente de acuerdo):

#### Regla de Cálculo Oficial SUS:
1. **Ítems impares (1, 3, 5, 7, 9 — afirmaciones positivas):** Restar 1 a la puntuación dada por el usuario ($X_i - 1$).
2. **Ítems pares (2, 4, 6, 8, 10 — afirmaciones negativas):** Restar la puntuación del usuario a 5 ($5 - X_i$).
3. **Puntaje SUS Individual:** Sumar los 10 valores convertidos (rango `0` a `40`) y **multiplicar por `2.5`** para obtener el puntaje en escala de `0` a `100`:
   $$\text{SUS}_u = \left( \sum_{\text{impares}} (X_i - 1) + \sum_{\text{pares}} (5 - X_i) \right) \times 2.5$$
4. **Puntaje SUS Global:** Promedio aritmético de los 5 usuarios ($\overline{\text{SUS}}$).
   - **Criterio de Aceptación ISO/IEC 25010:** $\overline{\text{SUS}} \ge 68.0$ puntos (**APRUEBA** si es $\ge 68$, **REPRUEBA / Deficiente** si es $< 68$).

---

## 3. Estructura Sugerida del Directorio

```text
03_investigacion_usuarios_ux/
├── README.md                                # Esta guía de trabajo
├── ESTUDIO_USUARIOS_Y_SUS.md                # Documento completo (Población/Muestra, Observación Directa, SUS y Limitaciones)
├── Encuesta.csv                             # Respuestas crudas del formulario SUS (1-5)
├── datos/
│   ├── matriz_observacion_5_usuarios.csv    # Tiempos por tarea, errores y tasas de éxito (usuarios anónimos U1-U5)
│   ├── hitos_video.csv                      # Instantes del video usados para calcular los tiempos por tarea
│   └── calculo_cuestionario_sus.csv         # Respuestas crudas (1-5) y puntajes SUS calculados
└── evidencia_sesiones/                      # Videos de las 5 sesiones (Usuario 1-5.mp4) y Cuestionario.pdf
```

> **Nota sobre los videos:** En las grabaciones de `evidencia_sesiones/` los participantes ingresaron nombres y números de tarjeta ficticios de prueba en el formulario `Place Order`. En las tablas y archivos CSV del estudio se identifican de forma anónima como `U1` a `U5`.

> **Limitaciones:** No se registró el conteo de clics innecesarios ni se aplicó un protocolo *Think-Aloud* estructurado. Solo se cuenta con los comentarios y preguntas anotados en la matriz de observación. Ver la sección 6 de `ESTUDIO_USUARIOS_Y_SUS.md`.

---

## 4. Flujo de Entrega en Git

```bash
git checkout -b integrante3/investigacion-usuarios
git add 03_investigacion_usuarios_ux/
git commit -m "docs: estudio de observación directa y cálculo SUS con 5 usuarios"
git push -u origin integrante3/investigacion-usuarios
```
