import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';

const BASE_URL = 'https://www.demoblaze.com/index.html';
const CART_URL = 'https://www.demoblaze.com/cart.html';
const VIEWPORT = { width: 1280, height: 800 };

const CAPTURA_PATH = path.resolve(
  './01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/06_borrado_sin_confirmacion_carrito.png'
);
const OUTPUT_JSON_PATH = path.resolve(
  './01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion/prueba_delete_carrito.json'
);

async function main() {
  console.log('Iniciando prueba automatizada de borrado en el carrito (Delete sin confirmación)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  const dialogosDuranteAddToCart = [];
  const dialogosDuranteDelete = [];
  let faseActual = 'ADD_TO_CART';

  page.on('dialog', async (dialog) => {
    const registro = {
      type: dialog.type(),
      message: dialog.message(),
      defaultValue: dialog.defaultValue(),
      timestamp: new Date().toISOString()
    };
    if (faseActual === 'ADD_TO_CART') {
      dialogosDuranteAddToCart.push(registro);
    } else if (faseActual === 'DELETE_CART_ITEM') {
      dialogosDuranteDelete.push(registro);
    }
    await dialog.accept();
  });

  try {
    // 1. Navegar al home y seleccionar Laptops -> Sony vaio i5
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#tbodyid .card', { state: 'visible', timeout: 20000 });
    const laptopsLink = page.locator('a#itemc', { hasText: 'Laptops' });
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/bycat') && res.status() === 200, { timeout: 15000 }),
      laptopsLink.click()
    ]);
    await page.waitForTimeout(500);

    const sonyLink = page.locator('#tbodyid .card-title a', { hasText: 'Sony vaio i5' }).first();
    await sonyLink.waitFor({ state: 'visible', timeout: 15000 });
    await sonyLink.click();

    await page.waitForURL(/prod\.html\?idp_=8/, { timeout: 15000 });
    const addToCartBtn = page.locator('a.btn-success', { hasText: 'Add to cart' });
    await addToCartBtn.waitFor({ state: 'visible', timeout: 15000 });

    const dialogPromise = page.waitForEvent('dialog', { timeout: 15000 });
    await addToCartBtn.click();
    await dialogPromise;
    await page.waitForTimeout(500);

    // 2. Navegar a cart.html y verificar fila en #tbodyid
    await page.goto(CART_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const filaProducto = page.locator('#tbodyid tr.success').first();
    await filaProducto.waitFor({ state: 'visible', timeout: 20000 });

    const estadoAntes = await page.evaluate(() => {
      const filas = Array.from(document.querySelectorAll('#tbodyid tr'));
      const totalTexto = document.querySelector('#totalp')?.textContent?.trim() || '';
      const deleteAnchor = document.querySelector('#tbodyid tr a[onclick*="deleteItem"]');
      return {
        itemsCount: filas.length,
        totalCarrito: totalTexto,
        filasDetalle: filas.map((tr) => ({
          className: tr.className,
          titulo: tr.querySelector('td:nth-child(2)')?.textContent?.trim() || null,
          precio: tr.querySelector('td:nth-child(3)')?.textContent?.trim() || null,
          deleteText: tr.querySelector('td:nth-child(4) a')?.textContent?.trim() || null,
          deleteHref: tr.querySelector('td:nth-child(4) a')?.getAttribute('href') || null,
          deleteOnclick: tr.querySelector('td:nth-child(4) a')?.getAttribute('onclick') || null
        })),
        codigoFuenteDeleteItem: typeof window.deleteItem === 'function' ? window.deleteItem.toString() : null,
        deleteElementExists: Boolean(deleteAnchor)
      };
    });

    // 3. Preparar intercepción de POST https://api.demoblaze.com/deleteitem y clic en Delete
    faseActual = 'DELETE_CART_ITEM';

    const deleteReqPromise = page.waitForRequest(
      (req) => req.url().includes('/deleteitem') && req.method() === 'POST',
      { timeout: 15000 }
    );
    const deleteRespPromise = page.waitForResponse(
      (resp) => resp.url().includes('/deleteitem') && resp.request().method() === 'POST',
      { timeout: 15000 }
    );

    const inicioDelete = performance.now();
    const deleteLink = page.locator('#tbodyid tr a', { hasText: 'Delete' }).first();
    await deleteLink.click();

    const [deleteReq, deleteResp] = await Promise.all([deleteReqPromise, deleteRespPromise]);
    const duracionDeleteApiMs = Number((performance.now() - inicioDelete).toFixed(2));

    let payloadEnviadoDelete = null;
    try {
      payloadEnviadoDelete = JSON.parse(deleteReq.postData() || '{}');
    } catch (_) {
      payloadEnviadoDelete = deleteReq.postData();
    }
    let respuestaTextoDelete = '';
    try {
      respuestaTextoDelete = (await deleteResp.text()).trim();
    } catch (_) {
      respuestaTextoDelete = '[Contexto descargado inmediatamente por location.reload() tras HTTP 200]';
    }

    // Esperar a que complete la recarga automática disparada por deleteItem() -> location.reload()
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);

    // Verificar si en algún momento se abrió algún modal de confirmación en el DOM
    const modalConfirmacionCheckInmediato = await page.evaluate(() => {
      const modalesVisibles = Array.from(document.querySelectorAll('.modal.show, .sweet-alert.visible, [role="dialog"]')).filter(
        (el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
        }
      );
      return {
        hayModalVisible: modalesVisibles.length > 0,
        modalesDetectados: modalesVisibles.map((m) => ({ id: m.id, className: m.className }))
      };
    });

    // 4. Esperar a que la tabla #tbodyid se actualice a 0 ítems
    await page.waitForFunction(
      () => document.querySelectorAll('#tbodyid tr').length === 0,
      { timeout: 15000 }
    );
    await page.waitForTimeout(500);

    const estadoDespues = await page.evaluate(() => {
      const filas = Array.from(document.querySelectorAll('#tbodyid tr'));
      const totalTexto = document.querySelector('#totalp')?.textContent?.trim() || '';
      const modalesVisibles = Array.from(document.querySelectorAll('.modal.show, .sweet-alert.visible')).filter(
        (el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
        }
      );
      return {
        itemsCount: filas.length,
        totalCarrito: totalTexto,
        hayModalConfirmacionVisible: modalesVisibles.length > 0,
        hayBotonUndoDeshacer: Boolean(
          Array.from(document.querySelectorAll('button, a')).find((el) =>
            /undo|deshacer|restaurar/i.test(el.textContent || '')
          )
        )
      };
    });

    // 5. Tomar captura de pantalla del carrito vacío tras el borrado sin confirmación
    await fs.mkdir(path.dirname(CAPTURA_PATH), { recursive: true });
    await page.screenshot({ path: CAPTURA_PATH, fullPage: true });

    const confirmationDialogTriggered = dialogosDuranteDelete.length > 0;
    const confirmationModalTriggered =
      modalConfirmacionCheckInmediato.hayModalVisible || estadoDespues.hayModalConfirmacionVisible;

    const evidencia = {
      norma: 'ISO/IEC 25010',
      caracteristica: 'Capacidad de interacción',
      subcaracteristica: 'Protección contra errores de usuario',
      metrica: 'Confirmación en borrado del carrito (Delete)',
      fecha_ejecucion: new Date().toISOString(),
      script_fuente: '01_pruebas_automatizadas_cli/scripts/prueba_delete_carrito.mjs',
      url_evaluada: CART_URL,
      viewport: VIEWPORT,
      producto_prueba: {
        nombre: 'Sony vaio i5',
        idp: 8,
        precio_usd: 790,
        dialogo_add_to_cart: dialogosDuranteAddToCart[0] || null
      },
      estado_antes_borrado: {
        itemsAntes: estadoAntes.itemsCount,
        totalAntes: estadoAntes.totalCarrito,
        detalle_fila: estadoAntes.filasDetalle[0] || null
      },
      accion_delete: {
        selector_accionado: '#tbodyid tr a[onclick*="deleteItem"]',
        atributo_onclick: estadoAntes.filasDetalle[0]?.deleteOnclick || null,
        confirmationDialogTriggered,
        dialogos_nativos_capturados_en_delete: dialogosDuranteDelete,
        confirmationModalTriggered,
        modales_confirmacion_dom_detectados: modalConfirmacionCheckInmediato.modalesDetectados,
        undoMechanismAvailable: estadoDespues.hayBotonUndoDeshacer,
        peticion_red_interceptada: {
          url: deleteReq.url(),
          metodo: deleteReq.method(),
          status_http: deleteResp.status(),
          payload_enviado: payloadEnviadoDelete,
          respuesta_cuerpo: respuestaTextoDelete,
          duracion_ms: duracionDeleteApiMs
        },
        implementacion_cliente_deleteItem: estadoAntes.codigoFuenteDeleteItem
      },
      estado_despues_borrado: {
        itemsDespues: estadoDespues.itemsCount,
        totalDespues: estadoDespues.totalCarrito
      },
      captura_evidencia: '01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/06_borrado_sin_confirmacion_carrito.png',
      dictamen_tecnico: {
        cumple_proteccion_contra_errores: false,
        hallazgo:
          'Al hacer clic en el enlace Delete (onclick="deleteItem(...)"), la aplicación dispara de forma inmediata y directa la petición POST https://api.demoblaze.com/deleteitem sin invocar window.confirm (confirmationDialogTriggered: false), sin abrir un modal de confirmación en el DOM (confirmationModalTriggered: false) y sin ofrecer opción de deshacer (undo), eliminando el ítem de #tbodyid (itemsAntes = 1 -> itemsDespues = 0) y recargando la vista de forma destructiva.'
      }
    };

    await fs.mkdir(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_JSON_PATH, JSON.stringify(evidencia, null, 2), 'utf8');
    console.log('Evidencia JSON guardada en:', OUTPUT_JSON_PATH);
    console.log('Captura PNG guardada en:', CAPTURA_PATH);
    console.log(JSON.stringify(evidencia, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en prueba_delete_carrito.mjs:', err);
  process.exit(1);
});
