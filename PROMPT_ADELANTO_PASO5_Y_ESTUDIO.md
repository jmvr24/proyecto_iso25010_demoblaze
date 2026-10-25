# INSTRUCCIONES: FLUJO EN RAMA, INGENIERÍA INVERSA PARA PASO 5 Y GUÍA DE SUSTENTACIÓN

## 1. Reglas de Git y Uso de Skills
- **Trabajo en Ramas:** Antes de crear o modificar cualquier archivo, crea y cámbiate a una nueva rama llamada `feat/adelanto-paso1-2-y-sustentacion` a partir de `main`.
- **Skill de Commits Atómicos:** Usa obligatoriamente mi **skill de commits atómicos** al finalizar cada una de las 3 tareas descritas abajo. Cada tarea debe quedar registrada en su propio commit semántico, limpio y atómico antes de pasar a la siguiente.

---

## 2. Tareas a Ejecutar Basadas en las Evidencias Recolectadas

### TAREA 1: Redacción Formal del Paso 1 y Paso 2 para el Documento Maestro
1. Lee todos los reportes `.json` y el archivo `./01_pruebas_automatizadas_cli/RESUMEN_EJECUCION_TECNICA_PASO2.md`.
2. Crea el archivo `./04_informe_final/SECCION_PASO_1_Y_PASO_2.md` redactando con lenguaje técnico formal de ingeniería de software:
   - **Paso 1: Preparación del Entorno y Línea Base:** Explicación metodológica de la configuración del entorno local, validación de conectividad de red (citando los valores exactos de latencia/ping obtenidos) y verificación operativa inicial de `https://www.demoblaze.com/index.html`.
   - **Paso 2: Ejecución de Herramientas Técnicas (Instrumentos Automatizados):** Documentación detallada de la configuración y salida real de los scripts de Playwright MCP, `@axe-core/playwright`, Google Lighthouse y las pruebas de carga en k6 con 50 usuarios concurrentes, incluyendo las tablas de resultados reales y las referencias a las rutas de las capturas de pantalla en `./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/`.
3. **Commit Atómico 1:** Ejecuta mi skill de commits atómicos para registrar únicamente este entregable documental.

### TAREA 2: Auditoría de Código Fuente Cliente (Root Cause Analysis) para el Paso 5
1. Usando `curl` o Playwright, inspecciona el código HTML de `https://www.demoblaze.com/cart.html` y `https://www.demoblaze.com/index.html` (así como sus scripts JS asociados) para localizar en el código fuente del frontend:
   - Por qué el formulario `Place Order` (`#orderModal`) permite procesar compras con tarjetas de crédito alfabéticas y campos vacíos (identifica la función JavaScript exacta que dispara el modal de SweetAlert `"Thank you for your purchase!"`).
   - Por qué las imágenes y modales arrojan violaciones en `axe-core` y qué etiquetas semánticas faltan.
2. Crea el archivo `./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/root_cause_codigo_cliente.md` documentando el fragmento de código vulnerable/deficiente actual de DemoBlaze vs. la propuesta de código refactorizado (validación Regex/Luhn en el checkout, contador reactivo en `#cartur` y atributos ARIA/alt). Este insumo nutrirá los planes de acción correctivos del Paso 5.
3. **Commit Atómico 2:** Ejecuta mi skill de commits atómicos para registrar este análisis de causa raíz.

### TAREA 3: Generación del Material de Estudio para la Sustentación/Parcial
1. Crea el archivo `./04_informe_final/GUIA_ESTUDIO_SUSTENTACION_GRUPO.md` diseñado para que los 4 integrantes del grupo estudien para la sustentación ante la docente.
2. El documento debe responder de forma directa y con los **datos numéricos reales obtenidos en nuestras pruebas**:
   - Resumen ejecutivo de todas las métricas obtenidas vs. umbrales ISO/IEC 25010 (para memorizar los números clave en 5 minutos).
   - Respuestas fundamentadas a las preguntas del Taller QA aplicadas a DemoBlaze: impacto del Ping en las pruebas, relación del LCP obtenido con el SEO y abandono de usuarios, cuellos de botella de red detectados, códigos HTTP de los enlaces (`200` vs `href="#"`), uniformidad de fuentes/colores detectada en el DOM y vulnerabilidades de validación en el Checkout.
   - Posibles preguntas difíciles de sustentación (ej. *"¿Cómo midieron Eficiencia de Desempeño si no tienen acceso al servidor de DemoBlaze?"*, *"¿Por qué eligieron esas subcaracterísticas de Capacidad de Interacción?"*) con sus respuestas técnicas exactas.
3. **Commit Atómico 3:** Ejecuta mi skill de commits atómicos para registrar la guía de estudio y realiza el `git push -u origin feat/adelanto-paso1-2-y-sustentacion` (o abre el Pull Request hacia `main` con `gh pr create`).