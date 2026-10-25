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

Presenta el software evaluado, la funcionalidad crítica elegida y las razones de negocio y de usuario que justifican evaluarla.

### 1.1. Descripción de DemoBlaze

Describe qué es DemoBlaze, quién lo publica y qué funciones ofrece al visitante.

### 1.2. Arquitectura general observable

Resume la arquitectura que se puede observar desde el cliente: un frontend estático que consume los servicios de `api.demoblaze.com`.

### 1.3. Propósito y público objetivo

Expone para qué existe el sitio y a qué tipo de usuario se dirige.

### 1.4. Funcionalidad crítica: flujo de compra de punta a punta

Delimita el recorrido evaluado, desde la categoría y el producto hasta Add to cart y Place Order.

### 1.5. Justificación de negocio

Argumenta, con fuentes verificables sobre el proceso de pago en el comercio electrónico, por qué este flujo es el que más afecta al negocio y al comprador.

### 1.6. Alcance de un sitio de demostración

Explica que DemoBlaze es un sitio de práctica sin clientes reales y por qué sirve igualmente para el ejercicio.

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

Lista en formato APA 7 las fuentes citadas en el informe.

## Anexos

Reúne el material de soporte que respalda las cifras del informe.

### Anexo A. Inventario de evidencias

Relaciona cada archivo de evidencia del repositorio con la sección del informe que lo usa.

### Anexo B. Cuestionario SUS aplicado

Reproduce los diez ítems del cuestionario en la versión entregada a los participantes.

### Anexo C. Protocolo de observación directa

Reproduce las tareas, las rutas mínimas y las instrucciones de registro usadas en las sesiones.
