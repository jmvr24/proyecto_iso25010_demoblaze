import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const VIEWPORT = { width: 1440, height: 900 };
const W3C_HTML_URL = 'https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.demoblaze.com%2Findex.html';
const W3C_JSON_URL = 'https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.demoblaze.com%2Findex.html&out=json';
const CAPTURA_PATH = path.resolve('./02_auditoria_extensiones_ui/capturas/05_w3c_validator.png');
const DATOS_PATH = path.resolve('./02_auditoria_extensiones_ui/datos/05_w3c.json');

async function main() {
  await fs.mkdir(path.dirname(CAPTURA_PATH), { recursive: true });
  await fs.mkdir(path.dirname(DATOS_PATH), { recursive: true });

  // 1. Obtener JSON estructurado oficial del W3C Nu Html Checker
  console.log('[05_w3c] Consultando API oficial JSON de W3C Nu Html Checker...');
  const respJson = await fetch(W3C_JSON_URL, {
    headers: { 'User-Agent': 'QA-Audit-ISO25010/1.0 (Playwright)' },
  });
  if (!respJson.ok) {
    throw new Error(`W3C JSON devolvió HTTP ${respJson.status}`);
  }
  const rawJson = await respJson.json();

  // 2. Navegar en Playwright a la vista HTML oficial del Validador W3C y capturar 1440x900
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    userAgent: 'QA-Audit-ISO25010/1.0 (Playwright)',
  });
  const page = await context.newPage();

  try {
    console.log(`[05_w3c] Navegando en Playwright a ${W3C_HTML_URL} ...`);
    await page.goto(W3C_HTML_URL, { waitUntil: 'load', timeout: 45000 });
    await page.waitForSelector('#results', { state: 'visible', timeout: 20000 });
    await page.waitForTimeout(600);

    // Desplazar ligeramente para encuadrar el título del validador, la URL evaluada y la lista de Error / Warning
    await page.evaluate(() => {
      const resultsEl = document.querySelector('#results');
      if (resultsEl) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
    await page.waitForTimeout(300);

    await page.screenshot({ path: CAPTURA_PATH, fullPage: false });
    console.log(`[05_w3c] Captura oficial W3C guardada en ${CAPTURA_PATH}`);

    // Clasificar todos los mensajes de rawJson.messages
    const errores = [];
    const advertencias = [];
    const informativos = [];

    for (const [idx, m] of (rawJson.messages || []).entries()) {
      const item = {
        indice: idx + 1,
        tipoRaw: m.type,
        subTipoRaw: m.subType || null,
        clasificacion:
          m.type === 'error' ? 'Error' : m.subType === 'warning' ? 'Warning' : 'Info',
        linea: m.lastLine ?? m.firstLine ?? null,
        columnaInicio: m.firstColumn ?? null,
        columnaFin: m.lastColumn ?? null,
        mensaje: m.message,
        fragmentoHtml: (m.extract || '').trim(),
      };

      if (item.clasificacion === 'Error') {
        errores.push(item);
      } else if (item.clasificacion === 'Warning') {
        advertencias.push(item);
      } else {
        informativos.push(item);
      }
    }

    const reporte = {
      herramienta: `W3C Nu Html Checker v${rawJson.version || 'latest'} (Markup Validation Service)`,
      urlValidada: rawJson.url || 'https://www.demoblaze.com/index.html',
      urlReporteHtml: W3C_HTML_URL,
      timestamp: new Date().toISOString(),
      viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
      resumenConteo: {
        totalHallazgos: (rawJson.messages || []).length,
        errores: errores.length,
        advertencias_warnings: advertencias.length,
        informativos: informativos.length,
      },
      evaluacionIso25010: {
        caracteristica: 'Capacidad de Interacción — Accesibilidad e Interoperabilidad (Estándares W3C)',
        umbralExigido: '0 errores críticos de estructura HTML que comprometan interoperabilidad o tecnologías de asistencia',
        cumpleUmbral: errores.length === 0,
        dictamen: errores.length === 0 ? 'CUMPLE' : 'NO CUMPLE',
      },
      capturaAsociada: './capturas/05_w3c_validator.png',
      erroresDetectados: errores,
      advertenciasDetectadas: advertencias,
      informativosDetectados: informativos,
    };

    await fs.writeFile(DATOS_PATH, JSON.stringify(reporte, null, 2), 'utf-8');
    console.log(
      `[05_w3c] Datos guardados en ${DATOS_PATH} -> Errores: ${errores.length}, Warnings: ${advertencias.length}, Info: ${informativos.length}`
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en 05_captura_w3c.mjs:', err);
  process.exit(1);
});
