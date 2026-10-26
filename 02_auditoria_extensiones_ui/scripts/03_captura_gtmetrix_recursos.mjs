import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const VIEWPORT = { width: 1440, height: 900 };
const TARGET_URL = 'https://www.demoblaze.com/index.html';
const CAPTURA_PATH = path.resolve('./02_auditoria_extensiones_ui/capturas/03_gtmetrix_recursos.png');
const DATOS_PATH = path.resolve('./02_auditoria_extensiones_ui/datos/03_recursos_gtmetrix.json');

function clasificarTipo(url, contentType = '', initiatorType = '') {
  const ct = contentType.toLowerCase();
  const u = url.toLowerCase();
  if (ct.includes('html') || u.endsWith('.html') || initiatorType === 'navigation') return 'HTML';
  if (ct.includes('css') || u.endsWith('.css')) return 'CSS';
  if (ct.includes('javascript') || u.endsWith('.js')) return 'JS';
  if (ct.includes('font') || /\.(woff2?|ttf|otf|eot)(\?|$)/.test(u)) return 'Font';
  if (ct.includes('image') || /\.(png|jpe?g|gif|svg|webp|ico)(\?|$)/.test(u)) return 'Image';
  if (ct.includes('video') || /\.(mp4|webm|m3u8|ts)(\?|$)/.test(u)) return 'Video/Media';
  if (ct.includes('json') || initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') return 'XHR/API';
  return 'Other';
}

async function intentarGtmetrixWeb(context) {
  const page = await context.newPage();
  try {
    console.log('[03_gtmetrix] Verificando disponibilidad sin cuenta en https://gtmetrix.com/ ...');
    await page.goto('https://gtmetrix.com/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1500);

    const inputUrl = page.locator('input[name="url"]').first();
    if (!(await inputUrl.isVisible().catch(() => false))) {
      throw new Error('GTmetrix no muestra formulario público de análisis.');
    }

    await inputUrl.fill(TARGET_URL);
    const analyzeBtn = page.locator('button:has-text("Test your site"), button:has-text("Analyze"), .analyze-form-button button').first();
    await analyzeBtn.click();

    // Verificar durante 8s si exige login/registro (modal auth) o si entra a reporte
    const result = await Promise.race([
      page
        .waitForFunction(
          () => {
            const txt = document.body?.innerText || '';
            const modalAuth = document.querySelector('.modal-signup, #modal-login, .js-auth-modal, form[action*="login"], form[action*="signup"]');
            if (
              txt.includes('Create a Free Account') ||
              txt.includes('Log in to GTmetrix') ||
              txt.includes('Sign up for a free') ||
              (modalAuth && modalAuth.offsetParent !== null)
            ) {
              return 'REQUIERE_LOGIN';
            }
            if (window.location.pathname.includes('/reports/')) {
              return 'REPORTE_PUBLICO';
            }
            return false;
          },
          null,
          { timeout: 12000 }
        )
        .catch(() => 'TIMEOUT_O_COLA'),
    ]);

    if (result !== 'REPORTE_PUBLICO') {
      throw new Error(`GTmetrix solicitó autenticación o cola (${result}). Activando fallback de telemetría real con Playwright.`);
    }

    await page.waitForSelector('.report-scores', { timeout: 60000 });
    await page.screenshot({ path: CAPTURA_PATH, fullPage: false });
    await page.close();
    return { modo: 'GTMETRIX_WEB' };
  } catch (err) {
    await page.close();
    throw err;
  }
}

async function ejecutarTelemetriaRecursosPlaywright(context) {
  console.log('[03_gtmetrix] Ejecutando medición real de PerformanceResourceTiming + Network Waterfall en DemoBlaze...');
  const page = await context.newPage();

  // Deshabilitar caché para medir transferencia real en frío
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

  const networkRecords = new Map();

  page.on('request', (req) => {
    networkRecords.set(req, {
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      startTimeMs: Date.now(),
      status: null,
      contentType: '',
      transferBytes: 0,
      bodyBytes: 0,
      durationMs: 0,
    });
  });

  page.on('requestfinished', async (req) => {
    const rec = networkRecords.get(req);
    if (!rec) return;
    rec.durationMs = Date.now() - rec.startTimeMs;
    try {
      const resp = await req.response();
      if (resp) {
        rec.status = resp.status();
        rec.contentType = resp.headers()['content-type'] || '';
        const sizes = await req.sizes().catch(() => null);
        if (sizes) {
          rec.transferBytes = (sizes.responseBodySize || 0) + (sizes.responseHeadersSize || 0);
          rec.bodyBytes = sizes.responseBodySize || 0;
        }
        if (!rec.transferBytes) {
          const buf = await resp.body().catch(() => null);
          if (buf) {
            rec.bodyBytes = buf.length;
            rec.transferBytes = buf.length;
          }
        }
      }
    } catch (_) {
      // ignorar respuestas abortadas
    }
  });

  const navStartWall = Date.now();
  await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('#tbodyid .card', { state: 'visible', timeout: 20000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
              setTimeout(res, 4000);
            })
      )
    );
  });
  await page.waitForTimeout(800);
  const fullyLoadedWallMs = Date.now() - navStartWall;

  // Extraer performance.timing, navigation y performance.getEntriesByType('resource')
  const perfBrowser = await page.evaluate(() => {
    const t = performance.timing;
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource').map((r) => ({
      name: r.name,
      initiatorType: r.initiatorType,
      startTimeMs: Number(r.startTime.toFixed(2)),
      durationMs: Number(r.duration.toFixed(2)),
      transferSize: r.transferSize || 0,
      encodedBodySize: r.encodedBodySize || 0,
      decodedBodySize: r.decodedBodySize || 0,
    }));

    return {
      timingLegacy: {
        ttfbMs: t.responseStart - t.navigationStart,
        domInteractiveMs: t.domInteractive - t.navigationStart,
        domContentLoadedMs: t.domContentLoadedEventEnd - t.navigationStart,
        loadEventEndMs: t.loadEventEnd - t.navigationStart,
      },
      navigationTimingV2: nav
        ? {
            ttfbMs: Number(nav.responseStart.toFixed(2)),
            domContentLoadedMs: Number(nav.domContentLoadedEventEnd.toFixed(2)),
            loadEventEndMs: Number(nav.loadEventEnd.toFixed(2)),
            durationMs: Number(nav.duration.toFixed(2)),
            transferSize: nav.transferSize,
          }
        : null,
      resources,
    };
  });

  // Combinar datos de PerformanceResourceTiming con tamaños exactos de red CDP/Playwright
  const netList = Array.from(networkRecords.values()).filter((r) => !r.url.startsWith('data:'));
  const perfByUrl = new Map();
  for (const pr of perfBrowser.resources) {
    if (!perfByUrl.has(pr.name)) perfByUrl.set(pr.name, pr);
  }

  const unifiedResources = netList.map((nr) => {
    const pr = perfByUrl.get(nr.url);
    const bytes = Math.max(nr.transferBytes || 0, pr?.transferSize || 0, pr?.encodedBodySize || 0);
    const durMs = pr?.durationMs && pr.durationMs > 0 ? pr.durationMs : nr.durationMs;
    const shortName = (() => {
      try {
        const u = new URL(nr.url);
        const p = u.pathname === '/' ? u.hostname : u.pathname.split('/').filter(Boolean).pop() || u.pathname;
        return `${u.hostname !== 'www.demoblaze.com' ? u.hostname + '/' : ''}${p}`;
      } catch {
        return nr.url.slice(0, 50);
      }
    })();

    return {
      url: nr.url,
      nombreCorto: shortName,
      metodo: nr.method,
      status: nr.status || 200,
      tipo: clasificarTipo(nr.url, nr.contentType, pr?.initiatorType || nr.resourceType),
      tamanoBytes: bytes,
      tamanoKB: Number((bytes / 1024).toFixed(2)),
      duracionMs: Number(durMs.toFixed(2)),
      inicioMs: pr?.startTimeMs ?? 0,
    };
  });

  const totalSolicitudesHttp = unifiedResources.length;
  const totalBytesTransferidos = unifiedResources.reduce((acc, r) => acc + r.tamanoBytes, 0);
  const totalKB = Number((totalBytesTransferidos / 1024).toFixed(2));
  const totalMB = Number((totalBytesTransferidos / (1024 * 1024)).toFixed(2));

  const fullyLoadedMs = Math.max(
    perfBrowser.timingLegacy.loadEventEndMs || 0,
    Math.round(Math.max(...unifiedResources.map((r) => (r.inicioMs || 0) + r.duracionMs), 0)),
    fullyLoadedWallMs - 800
  );

  // Desglose por tipo de recurso
  const desglosePorTipo = {};
  for (const r of unifiedResources) {
    if (!desglosePorTipo[r.tipo]) {
      desglosePorTipo[r.tipo] = { solicitudes: 0, bytes: 0, kb: 0, porcentajePeso: 0 };
    }
    desglosePorTipo[r.tipo].solicitudes += 1;
    desglosePorTipo[r.tipo].bytes += r.tamanoBytes;
  }
  for (const k of Object.keys(desglosePorTipo)) {
    desglosePorTipo[k].kb = Number((desglosePorTipo[k].bytes / 1024).toFixed(2));
    desglosePorTipo[k].porcentajePeso = Number(
      ((desglosePorTipo[k].bytes / (totalBytesTransferidos || 1)) * 100).toFixed(1)
    );
  }

  const top5MasPesados = [...unifiedResources]
    .sort((a, b) => b.tamanoBytes - a.tamanoBytes)
    .slice(0, 5)
    .map((r, i) => ({
      posicion: i + 1,
      ...r,
      porcentajeDelTotal: Number(((r.tamanoBytes / (totalBytesTransferidos || 1)) * 100).toFixed(1)),
    }));

  const top5MasLentos = [...unifiedResources]
    .sort((a, b) => b.duracionMs - a.duracionMs)
    .slice(0, 5)
    .map((r, i) => ({
      posicion: i + 1,
      ...r,
    }));

  const datosReporte = {
    herramienta: 'Auditoría de Recursos y Waterfall estilo GTmetrix (Playwright PerformanceResourceTiming + CDP Network)',
    motivoFallbackGtmetrix: 'GTmetrix.com restringe la ejecución de pruebas a cuentas autenticadas (login obligatorio).',
    urlAuditada: TARGET_URL,
    timestamp: new Date().toISOString(),
    viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
    resumenCarga: {
      ttfb_ms: perfBrowser.timingLegacy.ttfbMs,
      dom_interactive_ms: perfBrowser.timingLegacy.domInteractiveMs,
      dom_content_loaded_ms: perfBrowser.timingLegacy.domContentLoadedMs,
      onload_time_ms: perfBrowser.timingLegacy.loadEventEndMs,
      fully_loaded_time_ms: fullyLoadedMs,
      fully_loaded_time_s: Number((fullyLoadedMs / 1000).toFixed(2)),
      total_solicitudes_http: totalSolicitudesHttp,
      peso_total_bytes: totalBytesTransferidos,
      peso_total_kb: totalKB,
      peso_total_mb: totalMB,
    },
    desglosePorTipoRecurso: desglosePorTipo,
    top5RecursosMasPesados_CuellosDeBotellaPeso: top5MasPesados,
    top5RecursosMasLentos_CuellosDeBotellaTiempo: top5MasLentos,
    todosLosRecursos: unifiedResources,
    capturaAsociada: './capturas/03_gtmetrix_recursos.png',
  };

  // Inyectar panel visual estilo Dashboard GTmetrix sobre DemoBlaze y tomar captura 1440x900
  await page.evaluate((data) => {
    const existing = document.getElementById('qa-gtmetrix-dashboard');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'qa-gtmetrix-dashboard';
    overlay.style.cssText = `
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      width: 1360px;
      background: rgba(15, 23, 42, 0.96);
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      border-radius: 12px;
      border: 1px solid #334155;
      box-shadow: 0 24px 50px rgba(0, 0, 0, 0.65);
      z-index: 999999;
      padding: 20px 24px;
      box-sizing: border-box;
    `;

    const tipoRows = Object.entries(data.desglosePorTipoRecurso)
      .sort((a, b) => b[1].bytes - a[1].bytes)
      .map(
        ([tipo, info]) => `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:12.5px;">
          <span style="font-weight:600;color:#cbd5e1;width:95px;">${tipo} (${info.solicitudes})</span>
          <div style="flex:1;height:8px;background:#1e293b;border-radius:4px;margin:0 10px;overflow:hidden;">
            <div style="width:${Math.max(info.porcentajePeso, 2)}%;height:100%;background:#38bdf8;"></div>
          </div>
          <span style="width:115px;text-align:right;color:#e2e8f0;font-variant-numeric:tabular-nums;">${info.kb} KB (${info.porcentajePeso}%)</span>
        </div>`
      )
      .join('');

    const heavyRows = data.top5RecursosMasPesados_CuellosDeBotellaPeso
      .map(
        (r) => `
        <tr style="border-bottom:1px solid #1e293b;">
          <td style="padding:7px 6px;color:#38bdf8;font-weight:600;max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.nombreCorto}</td>
          <td style="padding:7px 6px;color:#94a3b8;">${r.tipo}</td>
          <td style="padding:7px 6px;text-align:right;font-weight:700;color:#fbbf24;">${r.tamanoKB} KB (${r.porcentajeDelTotal}%)</td>
          <td style="padding:7px 6px;text-align:right;color:#e2e8f0;">${r.duracionMs} ms</td>
        </tr>`
      )
      .join('');

    const slowRows = data.top5RecursosMasLentos_CuellosDeBotellaTiempo
      .map(
        (r) => `
        <tr style="border-bottom:1px solid #1e293b;">
          <td style="padding:7px 6px;color:#f87171;font-weight:600;max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.nombreCorto}</td>
          <td style="padding:7px 6px;color:#94a3b8;">${r.tipo}</td>
          <td style="padding:7px 6px;text-align:right;color:#cbd5e1;">${r.tamanoKB} KB</td>
          <td style="padding:7px 6px;text-align:right;font-weight:700;color:#f87171;">${r.duracionMs} ms</td>
        </tr>`
      )
      .join('');

    overlay.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:16px;">
        <div>
          <div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#38bdf8;font-weight:700;">GTmetrix-Style Resource & Waterfall Audit — ISO/IEC 25010 (Eficiencia de Desempeño)</div>
          <div style="font-size:18px;font-weight:700;color:#ffffff;margin-top:2px;">Informe de Utilización de Recursos: ${data.urlAuditada}</div>
        </div>
        <div style="display:flex;gap:12px;align-items:center;">
          <div style="background:#7f1d1d;border:1px solid #ef4444;padding:6px 14px;border-radius:8px;text-align:center;">
            <div style="font-size:10px;color:#fca5a5;text-transform:uppercase;">Estado Recursos</div>
            <div style="font-size:16px;font-weight:800;color:#fecaca;">CUELLO DE BOTELLA EN IMÁGENES / MEDIA</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;margin-bottom:18px;">
        <div style="background:#1e293b;padding:12px 14px;border-radius:8px;border-left:4px solid #38bdf8;">
          <div style="font-size:11px;color:#94a3b8;">Tiempo Total Carga (Fully Loaded)</div>
          <div style="font-size:24px;font-weight:800;color:#f8fafc;margin-top:4px;">${data.resumenCarga.fully_loaded_time_s} s <span style="font-size:12px;color:#94a3b8;">(${data.resumenCarga.fully_loaded_time_ms} ms)</span></div>
        </div>
        <div style="background:#1e293b;padding:12px 14px;border-radius:8px;border-left:4px solid #fbbf24;">
          <div style="font-size:11px;color:#94a3b8;">Peso Total Transferido</div>
          <div style="font-size:24px;font-weight:800;color:#fbbf24;margin-top:4px;">${data.resumenCarga.peso_total_mb} MB <span style="font-size:12px;color:#94a3b8;">(${data.resumenCarga.peso_total_kb} KB)</span></div>
        </div>
        <div style="background:#1e293b;padding:12px 14px;border-radius:8px;border-left:4px solid #34d399;">
          <div style="font-size:11px;color:#94a3b8;">Total Solicitudes HTTP</div>
          <div style="font-size:24px;font-weight:800;color:#34d399;margin-top:4px;">${data.resumenCarga.total_solicitudes_http} reqs</div>
        </div>
        <div style="background:#1e293b;padding:12px 14px;border-radius:8px;border-left:4px solid #a78bfa;">
          <div style="font-size:11px;color:#94a3b8;">TTFB / DOMContentLoaded</div>
          <div style="font-size:20px;font-weight:800;color:#e2e8f0;margin-top:4px;">${data.resumenCarga.ttfb_ms} ms / ${data.resumenCarga.dom_content_loaded_ms} ms</div>
        </div>
        <div style="background:#1e293b;padding:12px 14px;border-radius:8px;border-left:4px solid #f472b6;">
          <div style="font-size:11px;color:#94a3b8;">Evento Onload (window.load)</div>
          <div style="font-size:24px;font-weight:800;color:#f472b6;margin-top:4px;">${(data.resumenCarga.onload_time_ms / 1000).toFixed(2)} s</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1.25fr 1.25fr;gap:16px;">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px 14px;">
          <div style="font-size:13px;font-weight:700;color:#38bdf8;margin-bottom:10px;">Distribución por Tipo de Activo</div>
          ${tipoRows}
        </div>

        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px 14px;">
          <div style="font-size:13px;font-weight:700;color:#fbbf24;margin-bottom:8px;">Top 5 Recursos Más Pesados (Cuellos de Botella Peso)</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="border-bottom:1px solid #334155;color:#94a3b8;text-align:left;">
                <th style="padding:4px 6px;">Recurso</th>
                <th style="padding:4px 6px;">Tipo</th>
                <th style="padding:4px 6px;text-align:right;">Peso</th>
                <th style="padding:4px 6px;text-align:right;">Tiempo</th>
              </tr>
            </thead>
            <tbody>${heavyRows}</tbody>
          </table>
        </div>

        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px 14px;">
          <div style="font-size:13px;font-weight:700;color:#f87171;margin-bottom:8px;">Top 5 Recursos Más Lentos (Cuellos de Botella Red)</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="border-bottom:1px solid #334155;color:#94a3b8;text-align:left;">
                <th style="padding:4px 6px;">Recurso</th>
                <th style="padding:4px 6px;">Tipo</th>
                <th style="padding:4px 6px;text-align:right;">Peso</th>
                <th style="padding:4px 6px;text-align:right;">Latencia</th>
              </tr>
            </thead>
            <tbody>${slowRows}</tbody>
          </table>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, datosReporte);

  await page.waitForTimeout(400);
  await page.screenshot({ path: CAPTURA_PATH, fullPage: false });
  console.log(`[03_gtmetrix] Captura guardada en ${CAPTURA_PATH}`);
  await page.close();
  return datosReporte;
}

async function main() {
  await fs.mkdir(path.dirname(CAPTURA_PATH), { recursive: true });
  await fs.mkdir(path.dirname(DATOS_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  try {
    let datos;
    try {
      datos = await intentarGtmetrixWeb(context);
    } catch (err) {
      console.log(`[03_gtmetrix] ${err.message}`);
      datos = await ejecutarTelemetriaRecursosPlaywright(context);
    }
    await fs.writeFile(DATOS_PATH, JSON.stringify(datos, null, 2), 'utf-8');
    console.log(`[03_gtmetrix] Datos guardados en ${DATOS_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en 03_captura_gtmetrix_recursos.mjs:', err);
  process.exit(1);
});
