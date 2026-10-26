import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const INDEX_URL = 'https://www.demoblaze.com/index.html';
const CART_URL = 'https://www.demoblaze.com/cart.html';
const VIEWPORT = { width: 1280, height: 800 };

const OUTPUT_JSON_PATH = path.resolve(
  './01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/auditoria_labels_modales_abiertos.json'
);

/**
 * Inspecciona directamente el DOM de un modal abierto y evalúa todos sus campos
 * (<input>, <textarea>, <select>) y etiquetas (<label>), verificando asociación programática.
 */
async function inspeccionarCamposModalDOM(page, modalSelector) {
  return page.evaluate((sel) => {
    const modal = document.querySelector(sel);
    if (!modal) return null;

    const style = window.getComputedStyle(modal);
    const modalVisible =
      modal.classList.contains('show') && style.display !== 'none' && style.visibility !== 'hidden';

    const todosLabels = Array.from(modal.querySelectorAll('label')).map((lbl) => ({
      text: (lbl.textContent || '').trim(),
      forAttr: lbl.getAttribute('for'),
      id: lbl.id || null,
      className: lbl.className || null,
      outerHTML: lbl.outerHTML
    }));

    const controles = Array.from(modal.querySelectorAll('input, textarea, select')).map((ctrl) => {
      const id = ctrl.id || null;
      const tag = ctrl.tagName.toLowerCase();
      const type = ctrl.getAttribute('type') || (tag === 'textarea' ? 'textarea' : tag);
      const ariaLabel = ctrl.getAttribute('aria-label');
      const ariaLabelledby = ctrl.getAttribute('aria-labelledby');
      const placeholder = ctrl.getAttribute('placeholder');
      const title = ctrl.getAttribute('title');
      const required = ctrl.required || ctrl.hasAttribute('required');

      // Buscar <label for="id"> exacto dentro del documento
      const labelAsociadoPorFor = id
        ? document.querySelector(`label[for="${CSS.escape(id)}"]`)
        : null;
      // Buscar <label> contenedor implícito
      const labelContenedor = ctrl.closest('label');

      // Buscar <label> vecino en el mismo .form-group (aunque tenga for incorrecto o ausente)
      const formGroup = ctrl.closest('.form-group');
      const labelEnFormGroup = formGroup ? formGroup.querySelector('label') : null;

      const tieneAsociacionProgramaticaValida = Boolean(
        labelAsociadoPorFor ||
          labelContenedor ||
          (ariaLabel && ariaLabel.trim().length > 0) ||
          (ariaLabelledby && document.getElementById(ariaLabelledby))
      );

      let causaIncumplimiento = null;
      if (!tieneAsociacionProgramaticaValida) {
        const forDelVecino = labelEnFormGroup ? labelEnFormGroup.getAttribute('for') : null;
        if (labelEnFormGroup && forDelVecino === null) {
          causaIncumplimiento = `El elemento <label> visual vecino ("${(labelEnFormGroup.textContent || '').trim()}") carece del atributo "for" para apuntar a #${id}`;
        } else if (labelEnFormGroup && forDelVecino !== id) {
          causaIncumplimiento = `Discrepancia de atributos for/id: el <label> vecino tiene for="${forDelVecino}" pero el campo tiene id="${id}"`;
        } else {
          causaIncumplimiento = `El control #${id || '(sin id)'} no tiene <label for="...">, ni aria-label, ni aria-labelledby`;
        }
      }

      return {
        tag,
        id,
        type,
        name: ctrl.getAttribute('name'),
        required,
        placeholder,
        ariaLabel,
        ariaLabelledby,
        title,
        labelVisualEnFormGroup: labelEnFormGroup
          ? {
              text: (labelEnFormGroup.textContent || '').trim(),
              forAttr: labelEnFormGroup.getAttribute('for'),
              apuntaCorrectamenteAlId: labelEnFormGroup.getAttribute('for') === id
            }
          : null,
        labelAsociadoProgramaticamente: labelAsociadoPorFor
          ? {
              text: (labelAsociadoPorFor.textContent || '').trim(),
              forAttr: labelAsociadoPorFor.getAttribute('for')
            }
          : null,
        tieneAsociacionProgramaticaValida,
        causaIncumplimiento,
        outerHTML: ctrl.outerHTML
      };
    });

    const totalCampos = controles.length;
    const camposConLabelValido = controles.filter((c) => c.tieneAsociacionProgramaticaValida).length;
    const camposSinLabelValido = totalCampos - camposConLabelValido;

    return {
      modalSelector: sel,
      modalId: modal.id,
      modalTitle: modal.querySelector('.modal-title')?.textContent?.trim() || null,
      ariaLabelledbyModal: modal.getAttribute('aria-labelledby'),
      ariaHiddenModal: modal.getAttribute('aria-hidden'),
      modalVisible,
      displayStyle: style.display,
      totalCamposFormulario: totalCampos,
      camposConLabelProgramaticoValido: camposConLabelValido,
      camposHuerfanosSinLabelProgramatico: camposSinLabelValido,
      labelsEnModal: todosLabels,
      controlesFormulario: controles
    };
  }, modalSelector);
}

/**
 * Ejecuta AxeBuilder sobre el modal abierto y resume violaciones y pases (con énfasis en 'label').
 */
async function auditarModalConAxe(page, modalSelector, nombreModal, urlPagina) {
  const axeRaw = await new AxeBuilder({ page }).include(modalSelector).analyze();

  const MapRule = (r) => ({
    id: r.id,
    impact: r.impact || null,
    description: r.description,
    help: r.help,
    helpUrl: r.helpUrl,
    tags: r.tags,
    nodesCount: r.nodes.length,
    nodes: r.nodes.map((n) => ({
      html: n.html,
      target: n.target,
      failureSummary: n.failureSummary || null,
      impact: n.impact || null
    }))
  });

  const violations = axeRaw.violations.map(MapRule);
  const passes = axeRaw.passes.map((p) => ({
    id: p.id,
    description: p.description,
    help: p.help,
    nodesCount: p.nodes.length,
    targets: p.nodes.map((n) => n.target)
  }));
  const incomplete = axeRaw.incomplete.map(MapRule);

  const reglaLabelViolada = violations.find((v) => v.id === 'label') || null;
  const reglaLabelAprobada = passes.find((p) => p.id === 'label') || null;

  const inspeccionDom = await inspeccionarCamposModalDOM(page, modalSelector);

  return {
    nombreModal,
    modalSelector,
    urlPagina,
    timestamp: axeRaw.timestamp,
    estadoReglaLabelAxe: reglaLabelViolada
      ? 'VIOLATION (critical)'
      : reglaLabelAprobada
      ? 'PASS'
      : 'NOT_APPLICABLE',
    nodosAfectadosReglaLabelAxe: reglaLabelViolada ? reglaLabelViolada.nodesCount : 0,
    detalleReglaLabelAxe: reglaLabelViolada || reglaLabelAprobada,
    resumenAxeModal: {
      totalViolationsRules: violations.length,
      totalAffectedNodes: violations.reduce((acc, v) => acc + v.nodesCount, 0),
      totalPassesRules: passes.length,
      totalIncompleteRules: incomplete.length,
      reglasVioladasIds: violations.map((v) => ({ id: v.id, impact: v.impact, nodesCount: v.nodesCount })),
      violations,
      passes,
      incomplete
    },
    inspeccionDirectaDOM: inspeccionDom
  };
}

async function main() {
  console.log('Iniciando auditoría de etiquetado de campos (label) con los 4 modales abiertos...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  const resultadosModales = [];

  try {
    // 1. Auditar #orderModal (Place Order) en cart.html
    console.log('1) Abriendo y auditando modal Place Order (#orderModal) en cart.html...');
    await page.goto(CART_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const placeOrderBtn = page.locator('button.btn-success[data-target="#orderModal"]');
    await placeOrderBtn.waitFor({ state: 'visible', timeout: 20000 });
    await placeOrderBtn.click();
    await page.waitForSelector('#orderModal.show', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);

    resultadosModales.push(
      await auditarModalConAxe(page, '#orderModal', 'Place Order (#orderModal)', CART_URL)
    );

    // Cerrar #orderModal
    await page.locator('#orderModal button[data-dismiss="modal"]').first().click();
    await page.waitForTimeout(500);

    // 2. Navegar a index.html para auditar #exampleModal (Contact), #logInModal (Log in) y #signInModal (Sign up)
    await page.goto(INDEX_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#tbodyid .card', { state: 'visible', timeout: 20000 });

    const modalesIndex = [
      {
        nombre: 'Contact (#exampleModal)',
        selectorModal: '#exampleModal',
        selectorTrigger: 'a.nav-link[data-target="#exampleModal"]'
      },
      {
        nombre: 'Log in (#logInModal)',
        selectorModal: '#logInModal',
        selectorTrigger: 'a#login2'
      },
      {
        nombre: 'Sign up (#signInModal)',
        selectorModal: '#signInModal',
        selectorTrigger: 'a#signin2'
      }
    ];

    for (const m of modalesIndex) {
      console.log(`Auditando modal ${m.nombre} en index.html...`);
      await page.locator(m.selectorTrigger).click();
      await page.waitForSelector(`${m.selectorModal}.show`, { state: 'visible', timeout: 15000 });
      await page.waitForTimeout(500);

      const res = await auditarModalConAxe(page, m.selectorModal, m.nombre, INDEX_URL);
      resultadosModales.push(res);

      const closeBtn = page.locator(`${m.selectorModal} button[data-dismiss="modal"]`).first();
      await closeBtn.click();
      await page.waitForFunction(
        (sel) => !document.querySelector(sel)?.classList.contains('show'),
        m.selectorModal,
        { timeout: 10000 }
      );
      await page.waitForTimeout(400);
    }

    // Consolidar estadísticas globales de los 4 modales abiertos
    const totalCamposAuditados = resultadosModales.reduce(
      (acc, r) => acc + (r.inspeccionDirectaDOM?.totalCamposFormulario || 0),
      0
    );
    const totalCamposConLabelValido = resultadosModales.reduce(
      (acc, r) => acc + (r.inspeccionDirectaDOM?.camposConLabelProgramaticoValido || 0),
      0
    );
    const totalCamposSinLabelValido = resultadosModales.reduce(
      (acc, r) => acc + (r.inspeccionDirectaDOM?.camposHuerfanosSinLabelProgramatico || 0),
      0
    );
    const totalNodosViolacionLabelAxe = resultadosModales.reduce(
      (acc, r) => acc + r.nodosAfectadosReglaLabelAxe,
      0
    );

    const resumenPorModal = resultadosModales.map((r) => ({
      nombreModal: r.nombreModal,
      modalSelector: r.modalSelector,
      urlPagina: r.urlPagina,
      totalCampos: r.inspeccionDirectaDOM.totalCamposFormulario,
      camposConLabelValido: r.inspeccionDirectaDOM.camposConLabelProgramaticoValido,
      camposSinLabelValido: r.inspeccionDirectaDOM.camposHuerfanosSinLabelProgramatico,
      estadoReglaLabelAxe: r.estadoReglaLabelAxe,
      nodosViolacionLabelAxe: r.nodosAfectadosReglaLabelAxe,
      reglasVioladasEnModal: r.resumenAxeModal.reglasVioladasIds,
      detalleCampos: r.inspeccionDirectaDOM.controlesFormulario.map((c) => ({
        id: c.id,
        tag: c.tag,
        type: c.type,
        required: c.required,
        placeholder: c.placeholder,
        ariaLabel: c.ariaLabel,
        labelVisualTexto: c.labelVisualEnFormGroup?.text || null,
        labelForAttr: c.labelVisualEnFormGroup?.forAttr ?? null,
        tieneAsociacionProgramaticaValida: c.tieneAsociacionProgramaticaValida,
        causaIncumplimiento: c.causaIncumplimiento
      }))
    }));

    const reporte = {
      norma: 'ISO/IEC 25010',
      caracteristica: 'Capacidad de interacción',
      subcaracteristica: 'Inclusividad',
      metrica: 'Etiquetado programático de campos de formulario en modales abiertos (regla WCAG label)',
      fecha_ejecucion: new Date().toISOString(),
      script_fuente: '01_pruebas_automatizadas_cli/scripts/auditoria_labels_modales_abiertos.mjs',
      herramientas: 'Playwright 1.64.1 + @axe-core/playwright 4.14.0 (axe-core 4.14.0) + inspección directa del DOM',
      contexto_metodologico:
        'En la corrida inicial de Lighthouse sobre index.html, los modales Bootstrap permanecían cerrados (display: none), por lo que la auditoría "label" se reportó como notApplicable (score: null). Al abrir secuencialmente los 4 modales con campos de formulario (#orderModal en cart.html; #exampleModal, #logInModal y #signInModal en index.html) y auditarlos con axe-core e inspección DOM, se determinó el estado real de asociación <label for="..."> -> <input id="...">.',
      resumen_consolidado: {
        total_modales_auditados: resultadosModales.length,
        total_campos_formulario_auditados: totalCamposAuditados,
        campos_con_label_programatico_valido: totalCamposConLabelValido,
        campos_sin_label_programatico_valido: totalCamposSinLabelValido,
        porcentaje_campos_correctamente_etiquetados: Number(
          ((totalCamposConLabelValido / totalCamposAuditados) * 100).toFixed(2)
        ),
        porcentaje_campos_huerfanos_sin_label: Number(
          ((totalCamposSinLabelValido / totalCamposAuditados) * 100).toFixed(2)
        ),
        total_nodos_violacion_regla_label_axe: totalNodosViolacionLabelAxe,
        impacto_regla_label_axe: totalNodosViolacionLabelAxe > 0 ? 'critical' : 'none',
        criterios_wcag_afectados: ['WCAG 2.1 SC 1.3.1 (Info and Relationships - Nivel A)', 'WCAG 2.1 SC 4.1.2 (Name, Role, Value - Nivel A)'],
        resumen_por_modal: resumenPorModal
      },
      auditoria_detallada_modales: resultadosModales
    };

    await fs.mkdir(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_JSON_PATH, JSON.stringify(reporte, null, 2), 'utf8');
    console.log('Reporte de auditoría de modales abiertos guardado en:', OUTPUT_JSON_PATH);
    console.log(JSON.stringify(reporte.resumen_consolidado, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en auditoria_labels_modales_abiertos.mjs:', err);
  process.exit(1);
});
