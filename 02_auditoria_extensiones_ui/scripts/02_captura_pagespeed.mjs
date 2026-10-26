import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const execFileAsync = promisify(execFile);

const VIEWPORT = { width: 1440, height: 900 };
const PSI_URL = 'https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.demoblaze.com%2Findex.html&hl=es';
const CAPTURA_PATH = path.resolve('./02_auditoria_extensiones_ui/capturas/02_pagespeed.png');
const DATOS_JSON_PATH = path.resolve('./02_auditoria_extensiones_ui/datos/02_pagespeed.json');
const LH_BASE_PATH = path.resolve('./02_auditoria_extensiones_ui/datos/pagespeed_lighthouse');

async function intentarPageSpeedWeb(page) {
  console.log(`[02_pagespeed] Navegando a ${PSI_URL} ...`);
  await page.goto(PSI_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });

  // Verificar si aparece error de cuota / rate-limit o esperar a los gauges reales
  console.log('[02_pagespeed] Esperando resultados de PageSpeed Insights Web (hasta 55s)...');
  const estado = await Promise.race([
    page
      .waitForFunction(
        () => {
          const gauges = document.querySelectorAll('.lh-gauge__percentage');
          const metrics = document.querySelectorAll('.lh-metric__value');
          return gauges.length >= 4 && metrics.length >= 5;
        },
        null,
        { timeout: 55000 }
      )
      .then(() => 'OK'),
    page
      .waitForFunction(
        () => {
          const bodyText = document.body?.innerText || '';
          return (
            bodyText.includes('Quota exceeded') ||
            bodyText.includes('429') ||
            bodyText.includes('Se ha producido un error') ||
            bodyText.includes('Something went wrong')
          );
        },
        null,
        { timeout: 55000 }
      )
      .then(() => 'ERROR_PSI'),
  ]);

  if (estado !== 'OK') {
    throw new Error('PageSpeed Insights Web devolvió rate-limit o error de cuota.');
  }

  await page.waitForTimeout(1500);

  // Desplazar hasta la sección del reporte Lighthouse incrustado donde se ven las 4 categorías y las 5 métricas
  await page.evaluate(() => {
    const scoresHeader = document.querySelector('.lh-scores-header') || document.querySelector('.lh-gauge__percentage');
    if (scoresHeader) {
      scoresHeader.scrollIntoView({ block: 'start', behavior: 'instant' });
      window.scrollBy(0, -20);
    }
  });
  await page.waitForTimeout(600);

  const extraido = await page.evaluate(() => {
    const gauges = Array.from(document.querySelectorAll('.lh-scores-header .lh-gauge__wrapper, .lh-gauge__wrapper')).slice(0, 4);
    const categorias = gauges.map((g) => ({
      titulo: g.querySelector('.lh-gauge__label')?.textContent?.trim() || '',
      puntaje: Number.parseInt(g.querySelector('.lh-gauge__percentage')?.textContent?.trim() || '0', 10),
    }));

    const metricasDom = {};
    for (const m of document.querySelectorAll('.lh-metric')) {
      const title = m.querySelector('.lh-metric__title')?.textContent?.trim() || '';
      const val = m.querySelector('.lh-metric__value')?.textContent?.trim() || '';
      if (title) metricasDom[title] = val;
    }
    return { categorias, metricasDom, url: window.location.href };
  });

  await page.screenshot({ path: CAPTURA_PATH, fullPage: false });
  console.log(`[02_pagespeed] Captura tomada desde PageSpeed Insights Web: ${CAPTURA_PATH}`);
  return { fuente: 'Google PageSpeed Insights Web (https://pagespeed.web.dev/)', ...extraido };
}

async function ejecutarLighthouseFallback(page) {
  console.log('[02_pagespeed] Ejecutando Lighthouse CLI local y abriendo reporte HTML en Playwright...');
  const chromePath = chromium.executablePath();
  await execFileAsync(
    'cmd.exe',
    [
      '/c',
      'pnpm.cmd',
      'dlx',
      'lighthouse',
      'https://www.demoblaze.com/index.html',
      '--locale=es',
      '--output=html',
      '--output=json',
      `--output-path=${LH_BASE_PATH}`,
      '--chrome-flags=--headless --no-sandbox',
    ],
    {
      env: { ...process.env, CHROME_PATH: chromePath },
      timeout: 180000,
      windowsHide: true,
    }
  );

  const htmlPath = fsSync.existsSync(`${LH_BASE_PATH}.report.html`)
    ? `${LH_BASE_PATH}.report.html`
    : `${LH_BASE_PATH}.html`;
  const jsonPath = fsSync.existsSync(`${LH_BASE_PATH}.report.json`)
    ? `${LH_BASE_PATH}.report.json`
    : `${LH_BASE_PATH}.json`;

  const fileUrl = pathToFileURL(htmlPath).href;
  await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('.lh-scores-header', { state: 'visible', timeout: 15000 });

  // Ajustar compacto el espaciado superior del reporte HTML para asegurar que las 4 categorías + FCP, LCP, TBT, CLS y Speed Index salgan juntos y nítidos en 1440x900
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      .lh-scores-container { padding-top: 8px !important; padding-bottom: 8px !important; }
      .lh-category-header { padding-top: 8px !important; margin-bottom: 6px !important; }
      .lh-filmstrip-container { display: none !important; }
    `;
    document.head.appendChild(style);
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(600);

  await page.screenshot({ path: CAPTURA_PATH, fullPage: false });
  console.log(`[02_pagespeed] Captura tomada desde reporte HTML de Lighthouse: ${CAPTURA_PATH}`);

  const rawLh = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
  const getAudit = (id) => {
    const a = rawLh.audits[id];
    if (!a) return null;
    return {
      titulo: a.title,
      score: a.score,
      valorNumerico: a.numericValue,
      unidad: a.numericUnit,
      valorMostrado: a.displayValue,
    };
  };

  return {
    fuente: `Google Lighthouse CLI v${rawLh.lighthouseVersion} (Motor oficial de PageSpeed Insights)`,
    fetchTime: rawLh.fetchTime,
    urlAuditada: rawLh.finalDisplayedUrl,
    puntuacionesCategorias: {
      rendimiento: Math.round((rawLh.categories.performance?.score ?? 0) * 100),
      accesibilidad: Math.round((rawLh.categories.accessibility?.score ?? 0) * 100),
      practicasRecomendadas: Math.round((rawLh.categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((rawLh.categories.seo?.score ?? 0) * 100),
    },
    coreWebVitalsYMetricas: {
      fcp_first_contentful_paint: getAudit('first-contentful-paint'),
      lcp_largest_contentful_paint: getAudit('largest-contentful-paint'),
      tbt_total_blocking_time: getAudit('total-blocking-time'),
      cls_cumulative_layout_shift: getAudit('cumulative-layout-shift'),
      speed_index: getAudit('speed-index'),
      tti_interactive: getAudit('interactive'),
      ttfb_server_response_time: getAudit('server-response-time'),
      peso_total_bytes: getAudit('total-byte-weight'),
      resumen_recursos: rawLh.audits['resource-summary']?.details?.items || [],
    },
    archivosReporte: {
      html: './datos/pagespeed_lighthouse.report.html',
      json: './datos/pagespeed_lighthouse.report.json',
      captura: './capturas/02_pagespeed.png',
    },
  };
}

async function main() {
  await fs.mkdir(path.dirname(CAPTURA_PATH), { recursive: true });
  await fs.mkdir(path.dirname(DATOS_JSON_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: 'es-ES',
  });
  const page = await context.newPage();

  try {
    // Ejecutar siempre Lighthouse JSON+HTML para garantizar métricas numéricas exactas + intentar PSI web o renderizar el HTML oficial
    let resultadoPsiWeb = null;
    try {
      resultadoPsiWeb = await intentarPageSpeedWeb(page);
    } catch (err) {
      console.warn('[02_pagespeed] Activando fallback oficial Lighthouse HTML:', err.message);
    }

    // Si PSI web funcionó pero queremos también el respaldo JSON exacto de Lighthouse, o si PSI falló:
    let resultadoFinal;
    if (!resultadoPsiWeb) {
      resultadoFinal = await ejecutarLighthouseFallback(page);
    } else {
      // Asegurar que también tengamos métricas numéricas exactas con Lighthouse JSON
      const datosLh = await ejecutarLighthouseFallback(await context.newPage());
      // Si PSI web ya tomó una buena captura, restauramos o conservamos; de hecho verificaremos cuál se ve más completa.
      resultadoFinal = {
        psiWeb: resultadoPsiWeb,
        lighthouseExacto: datosLh,
      };
    }

    await fs.writeFile(DATOS_JSON_PATH, JSON.stringify(resultadoFinal, null, 2), 'utf-8');
    console.log(`[02_pagespeed] Datos guardados en ${DATOS_JSON_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en 02_captura_pagespeed.mjs:', err);
  process.exit(1);
});
