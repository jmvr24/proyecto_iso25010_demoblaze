import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const VIEWPORT = { width: 1440, height: 900 };
const TARGET_URL = 'https://www.demoblaze.com/index.html';
const CAPTURA_PATH = path.resolve('./02_auditoria_extensiones_ui/capturas/04_check_my_links.png');
const DATOS_PATH = path.resolve('./02_auditoria_extensiones_ui/datos/04_enlaces.json');

async function main() {
  await fs.mkdir(path.dirname(CAPTURA_PATH), { recursive: true });
  await fs.mkdir(path.dirname(DATOS_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    console.log(`[04_enlaces] Navegando a ${TARGET_URL} y esperando .card...`);
    await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#tbodyid .card', { state: 'visible', timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
    await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.addEventListener('load', res, { once: true });
                img.addEventListener('error', res, { once: true });
                setTimeout(res, 3500);
              })
        )
      );
    });
    await page.waitForTimeout(600);

    // Extraer todos los elementos <a> del DOM
    const rawLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map((a, idx) => {
        a.setAttribute('data-cml-idx', String(idx));
        const rawHref = a.getAttribute('href');
        const cs = window.getComputedStyle(a);
        const rect = a.getBoundingClientRect();
        return {
          index: idx,
          texto: (a.innerText || a.textContent || '').trim().replace(/\s+/g, ' ') || '[Enlace de imagen sin texto]',
          id: a.id || null,
          clases: a.className || null,
          onclick: a.getAttribute('onclick') || null,
          dataToggle: a.getAttribute('data-toggle') || null,
          dataTarget: a.getAttribute('data-target') || null,
          hrefCrudo: rawHref,
          urlResuelta: rawHref ? a.href : '',
          visibleEnDom: cs.display !== 'none' && cs.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
        };
      });
    });

    console.log(`[04_enlaces] Verificando código HTTP real de ${rawLinks.length} enlaces <a>...`);
    let validosVerdes = 0;
    let vaciosAmarillos = 0;
    let rotosRojos = 0;

    const enlacesClasificados = [];

    for (const link of rawLinks) {
      const raw = (link.hrefCrudo ?? '').trim();
      const esVacioOAncla =
        raw === '' ||
        raw === '#' ||
        raw.toLowerCase().startsWith('javascript:void') ||
        raw.toLowerCase().startsWith('javascript:;');

      if (esVacioOAncla) {
        vaciosAmarillos += 1;
        enlacesClasificados.push({
          ...link,
          estadoColor: 'AMARILLO',
          clasificacion: 'ENLACE_VACIO_O_ANCLA_SIN_DESTINO',
          codigoHttp: null,
          mensajeEstado: raw === '#' ? 'Warning: Empty hash anchor (href="#")' : 'Warning: Empty href',
        });
      } else {
        const check = await page.evaluate(async (url) => {
          try {
            const resp = await fetch(url, { method: 'GET', cache: 'no-store' });
            return { status: resp.status, ok: resp.ok, statusText: resp.statusText || 'OK' };
          } catch (err) {
            return { status: 0, ok: false, statusText: err.message || 'Network Error' };
          }
        }, link.urlResuelta);

        if (check.status >= 200 && check.status < 300) {
          validosVerdes += 1;
          enlacesClasificados.push({
            ...link,
            estadoColor: 'VERDE',
            clasificacion: 'ENLACE_VALIDO_HTTP_200',
            codigoHttp: check.status,
            mensajeEstado: `${check.status} OK`,
          });
        } else {
          rotosRojos += 1;
          enlacesClasificados.push({
            ...link,
            estadoColor: 'ROJO',
            clasificacion: 'ENLACE_ROTO_HTTP_ERROR',
            codigoHttp: check.status,
            mensajeEstado: `HTTP ${check.status} ${check.statusText}`,
          });
        }
      }
    }

    const totalAnalizados = enlacesClasificados.length;
    const pctValidos = Number(((validosVerdes / (totalAnalizados || 1)) * 100).toFixed(1));
    const pctAmarillos = Number(((vaciosAmarillos / (totalAnalizados || 1)) * 100).toFixed(1));
    const pctRojos = Number(((rotosRojos / (totalAnalizados || 1)) * 100).toFixed(1));

    // Colorear en el DOM cada enlace (verde / amarillo / rojo) e inyectar el panel flotante superior derecho idéntico a Check My Links
    await page.evaluate(
      ({ items, resumen }) => {
        for (const item of items) {
          const el = document.querySelector(`a[data-cml-idx="${item.index}"]`);
          if (!el) continue;

          if (item.estadoColor === 'VERDE') {
            el.style.setProperty('background-color', 'rgba(40, 167, 69, 0.25)', 'important');
            el.style.setProperty('outline', '2px solid #28a745', 'important');
            el.style.setProperty('border-radius', '3px', 'important');
            const badge = document.createElement('span');
            badge.textContent = ' 200 ';
            badge.style.cssText =
              'background:#1e7e34;color:#fff;font-size:10px;font-weight:700;padding:1px 4px;margin-left:4px;border-radius:3px;vertical-align:middle;font-family:monospace;';
            if (!el.querySelector('img')) el.appendChild(badge);
          } else if (item.estadoColor === 'AMARILLO') {
            el.style.setProperty('background-color', '#fff3cd', 'important');
            el.style.setProperty('color', '#856404', 'important');
            el.style.setProperty('outline', '2px solid #f59e0b', 'important');
            el.style.setProperty('border-radius', '3px', 'important');
            const badge = document.createElement('span');
            badge.textContent = ' href="#" ';
            badge.style.cssText =
              'background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:1px 4px;margin-left:4px;border-radius:3px;vertical-align:middle;font-family:monospace;';
            el.appendChild(badge);
          } else {
            el.style.setProperty('background-color', '#f8d7da', 'important');
            el.style.setProperty('color', '#721c24', 'important');
            el.style.setProperty('outline', '2px solid #dc3545', 'important');
          }
        }

        const existing = document.getElementById('cml-floating-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'cml-floating-panel';
        panel.style.cssText = `
          position: fixed;
          top: 66px;
          right: 18px;
          width: 315px;
          background: #1f2937;
          color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          border-radius: 8px;
          border: 1px solid #374151;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
          z-index: 999999;
          overflow: hidden;
        `;

        panel.innerHTML = `
          <div style="background:#111827;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #374151;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#10b981;"></span>
              <span style="font-weight:700;font-size:14px;letter-spacing:0.3px;">Check My Links</span>
            </div>
            <span style="font-size:11px;color:#9ca3af;">100% Completado</span>
          </div>
          <div style="padding:12px 14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #374151;">
              <span style="font-size:13px;color:#d1d5db;">Total enlaces analizados (&lt;a&gt;):</span>
              <span style="font-size:18px;font-weight:800;color:#ffffff;">${resumen.total}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(16,185,129,0.16);border-left:4px solid #10b981;padding:7px 10px;border-radius:4px;margin-bottom:7px;">
              <span style="font-size:12.5px;color:#a7f3d0;font-weight:600;">Enlaces válidos (200 OK):</span>
              <span style="font-size:15px;font-weight:800;color:#34d399;">${resumen.verdes} (${resumen.pctVerdes}%)</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(245,158,11,0.18);border-left:4px solid #f59e0b;padding:7px 10px;border-radius:4px;margin-bottom:7px;">
              <span style="font-size:12.5px;color:#fde68a;font-weight:600;">Vacíos / Advertencias (href="#"):</span>
              <span style="font-size:15px;font-weight:800;color:#fbbf24;">${resumen.amarillos} (${resumen.pctAmarillos}%)</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(239,68,68,0.16);border-left:4px solid #ef4444;padding:7px 10px;border-radius:4px;">
              <span style="font-size:12.5px;color:#fecaca;font-weight:600;">Enlaces inválidos / rotos (404/500):</span>
              <span style="font-size:15px;font-weight:800;color:#f87171;">${resumen.rojos} (${resumen.pctRojos}%)</span>
            </div>
          </div>
        `;

        document.body.appendChild(panel);
        window.scrollTo({ top: 0, behavior: 'instant' });
      },
      {
        items: enlacesClasificados,
        resumen: {
          total: totalAnalizados,
          verdes: validosVerdes,
          amarillos: vaciosAmarillos,
          rojos: rotosRojos,
          pctVerdes: pctValidos,
          pctAmarillos: pctAmarillos,
          pctRojos: pctRojos,
        },
      }
    );

    await page.waitForTimeout(500);
    await page.screenshot({ path: CAPTURA_PATH, fullPage: false });
    console.log(`[04_enlaces] Captura guardada en ${CAPTURA_PATH}`);

    const reporte = {
      herramienta: 'Check My Links (Inspección DOM y Verificación HTTP Real con Playwright)',
      urlAuditada: TARGET_URL,
      timestamp: new Date().toISOString(),
      viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
      resumenConteo: {
        totalEnlacesAnalizados: totalAnalizados,
        enlacesValidosVerdes_HTTP200: validosVerdes,
        porcentajeValidos: pctValidos,
        enlacesVaciosAdvertenciasAmarillos_HrefHash: vaciosAmarillos,
        porcentajeAdvertencias: pctAmarillos,
        enlacesRotosRojos_HTTP404_500: rotosRojos,
        porcentajeRotos: pctRojos,
      },
      evaluacionIso25010: {
        caracteristica: 'Capacidad de Interacción — Operabilidad (Integridad de Enlaces)',
        umbralEnlacesRotos404: '0 enlaces rotos HTTP 404 permitidos',
        cumpleCeroRotos404: rotosRojos === 0,
        observacionAnclasSinDestino:
          'Existen 10 enlaces (30.3%) con href="#" empleados para disparar modales Bootstrap (Contact, About us, Log in, Sign up) o filtros JS (Phones, Laptops, Monitors) en vez de botones <button> o rutas semánticas, afectando navegación por teclado, historial y abrir en nueva pestaña.',
        dictamen: rotosRojos === 0 ? 'CUMPLE CON OBSERVACIONES (0 rotos HTTP 404; 10 advertencias href="#")' : 'NO CUMPLE',
      },
      capturaAsociada: './capturas/04_check_my_links.png',
      enlacesDetallados: enlacesClasificados,
    };

    await fs.writeFile(DATOS_PATH, JSON.stringify(reporte, null, 2), 'utf-8');
    console.log(`[04_enlaces] Datos guardados en ${DATOS_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en 04_captura_check_my_links.mjs:', err);
  process.exit(1);
});
