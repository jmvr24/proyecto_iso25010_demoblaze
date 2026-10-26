# Informe final (integrante 4)

Esta carpeta contiene el informe de evaluación de calidad del flujo de compra de DemoBlaze (https://www.demoblaze.com/index.html) según el modelo de la norma ISO/IEC 25010:2023, consolidando la evidencia de los cuatro integrantes del equipo. El documento maestro se encuentra en formato Markdown y el archivo PDF de entrega académica se arma fuera del repositorio a partir de INFORME_ISO25010_DEMOBLAZE.md.

## Contenido de la carpeta

```text
04_informe_final/
├── GUIA_ESTUDIO_SUSTENTACION_GRUPO.md
├── INFORME_ISO25010_DEMOBLAZE.md
├── README.md
├── SECCION_PASO_1_Y_PASO_2.md
├── capturas/
│   ├── 01_inicio.png
│   ├── 02_categoria_laptops.png
│   ├── 03_detalle_producto.png
│   ├── 04_carrito_sin_contador.png
│   ├── 05_carrito.png
│   ├── 06_formulario_pedido.png
│   └── 07_confirmacion_compra.png
├── diagramas/
│   ├── casos_de_uso_demoblaze.png
│   ├── casos_de_uso_demoblaze.puml
│   └── casos_de_uso_demoblaze.svg
└── evidencias/
    ├── capturas_flujo.json
    └── recorrido_sitio.json
```

- `INFORME_ISO25010_DEMOBLAZE.md`: el informe principal de evaluación de calidad bajo la norma ISO/IEC 25010:2023.
- `capturas/`: las siete capturas anotadas de las Figuras 2 a 8.
- `diagramas/`: el diagrama de casos de uso de la Figura 1, en fuente PlantUML (.puml) y exportado a .png y .svg.
- `evidencias/`: el recorrido del sitio y las capturas del flujo hechas por el integrante 4 con Playwright.
- `GUIA_ESTUDIO_SUSTENTACION_GRUPO.md` y `SECCION_PASO_1_Y_PASO_2.md`: documentos de apoyo del integrante 1. La versión vigente de los Pasos 1 y 2 es la del informe.
- `README.md`: descripción de la carpeta y documentación del informe.

## Estructura del informe

El informe sigue los numerales de la guía de la docente. Los numerales 1 a 5 son secciones del documento; el numeral 6 (entrega en PDF un día antes de la sustentación) se cumple al armar y entregar el PDF.

1. Contextualización y justificación de la funcionalidad
2. Modelado del sistema: casos de uso y pantallas
3. Selección de criterios ISO/IEC 25010 y definición de población y muestra
4. Instrumentos de medición, métricas y parámetros de comportamiento
5. Proceso de evaluación paso a paso (Pasos 1 a 5)

Después vienen estas secciones:

- Referencias
- Anexos
  - Anexo A. Inventario de evidencias
  - Anexo B. Cuestionario SUS aplicado
  - Anexo C. Protocolo de observación directa

## Alcance evaluado

El modelo comprende tres características y nueve subcaracterísticas evaluadas sobre el flujo de compra:

- Adecuación funcional
  - Pertinencia funcional
- Eficiencia de desempeño
  - Comportamiento temporal
  - Capacidad
  - Utilización de recursos
- Capacidad de interacción
  - Aprendibilidad
  - Operabilidad
  - Protección contra errores de usuario
  - Involucramiento del usuario
  - Inclusividad

## Fuentes de la evidencia

El informe integra la evidencia recopilada en los tres directorios de trabajo:

- `01_pruebas_automatizadas_cli/` (integrante 1): aporta pruebas de interfaz con Playwright, auditoría de accesibilidad con axe-core, reporte de rendimiento con Lighthouse, pruebas de carga con k6 y tiempos de respuesta sobre servicios web.
- `02_auditoria_extensiones_ui/` (integrante 2): aporta mediciones de red en Fast.com, una segunda corrida de Lighthouse, registro de recursos con Playwright mediante Resource Timing y Chrome DevTools, revisión de enlaces y estilos, y validación con el W3C Nu Html Checker.
- `03_investigacion_usuarios_ux/` (integrante 3): aporta grabaciones de observación directa durante las tareas del flujo de compra y las respuestas individuales al cuestionario de usabilidad SUS.

Para consultar el inventario por archivo y su trazabilidad con el informe, remítase al Anexo A.

## Flujo de trabajo en git

El trabajo de integración y edición se realiza en la rama `integrante-4/informe-final`. La integración hacia la rama principal se realiza mediante pull request revisado por el administrador del repositorio; nunca se hace push directo a `main`.

```bash
git fetch origin
git merge origin/main
git push origin integrante-4/informe-final
```
