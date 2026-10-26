import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const VIEWPORT = { width: 1440, height: 900 };
const CAPTURA_PATH = path.resolve('./02_auditoria_extensiones_ui/capturas/01_speedtest.png');
const DATOS_PATH = path.resolve('./02_auditoria_extensiones_ui/datos/01_red.json');

function normalizarMbps(valorStr, unidadStr = 'Mbps') {
  const valor = Number.parseFloat(String(valorStr || '').replace(',', '.'));
  if (Number.isNaN(valor)) return null;
  const u = String(unidadStr || 'Mbps').toLowerCase();
  if (u.includes('gbps')) return Number((valor * 1000).toFixed(2));
  if (u.includes('kbps')) return Number((valor / 1000).toFixed(2));
  return Number(valor.toFixed(2));
}

async function medirFastComEs(page) {
  console.log('[01_red] Navegando a https://fast.com/es/ ...');
  await page.goto('https://fast.com/es/', { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('[01_red] Esperando finalización de velocidad de descarga (#speed-value.succeeded)...');
  await page.waitForSelector('#speed-value.succeeded', { timeout: 90000 });

  const moreBtn = page.locator('#show-more-details-link');
  if (await moreBtn.isVisible().catch(() => false)) {
    console.log('[01_red] Haciendo clic en "Mostrar más información"...');
    await moreBtn.click();
  }

  console.log('[01_red] Esperando finalización de latencia y velocidad de subida (#upload-value.succeeded)...');
  await page.waitForFunction(
    () => {
      const el = document.querySelector('#upload-value.succeeded');
      const val = parseFloat((el?.textContent || '0').replace(',', '.'));
      return Boolean(el) && val > 0;
    },
    null,
    { timeout: 90000 }
  );
  await page.waitForTimeout(1200);

  await page.screenshot({ path: CAPTURA_PATH, fullPage: false });
  console.log(`[01_red] Captura guardada exitosamente en ${CAPTURA_PATH}`);

  const raw = await page.evaluate(() => {
    const txt = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
    return {
      dlVal: txt('#speed-value'),
      dlUnit: txt('#speed-units'),
      ulVal: txt('#upload-value'),
      ulUnit: txt('#upload-units'),
      pingUnloaded: txt('#latency-value'),
      pingUnloadedUnit: txt('#latency-units'),
      pingLoaded: txt('#bufferbloat-value'),
      pingLoadedUnit: txt('#bufferbloat-units'),
      isp: txt('#user-isp'),
      ip: txt('#user-ip'),
      location: txt('#user-location'),
      servers: txt('#server-locations'),
    };
  });

  const descarga = normalizarMbps(raw.dlVal, raw.dlUnit);
  const subida = normalizarMbps(raw.ulVal, raw.ulUnit);
  const ping = Number.parseFloat(String(raw.pingUnloaded || '0').replace(',', '.'));
  const pingCargado = Number.parseFloat(String(raw.pingLoaded || '0').replace(',', '.'));

  return {
    herramienta: 'FAST.com (https://fast.com/es/) — Prueba de Velocidad y Latencia en Navegador Real',
    urlEvidencia: 'https://fast.com/es/',
    timestamp: new Date().toISOString(),
    viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
    valoresPantallaExactos: {
      descargaTexto: `${raw.dlVal} ${raw.dlUnit}`,
      subidaTexto: `${raw.ulVal} ${raw.ulUnit}`,
      pingDescargadaTexto: `${raw.pingUnloaded} ${raw.pingUnloadedUnit || 'ms'}`,
      pingCargadaTexto: `${raw.pingLoaded} ${raw.pingLoadedUnit || 'ms'}`,
    },
    metricas: {
      ping_ms: ping,
      latencia_bajo_carga_ms: pingCargado,
      descarga_mbps: descarga,
      subida_mbps: subida,
      diferencia_subida_vs_descarga_mbps: Number((subida - descarga).toFixed(2)),
    },
    proveedorRed: {
      isp: raw.isp,
      ipCliente: raw.ip,
      ubicacionCliente: raw.location,
      servidoresPrueba: raw.servers,
    },
    evaluacionPrerrequisitoIso25010: {
      umbralDescargaMbps: '> 30 Mbps',
      umbralSubidaMbps: '> 8 Mbps',
      cumpleDescarga: descarga > 30,
      cumpleSubida: subida > 8,
      pingEstable: ping < 100,
      dictamen: descarga > 30 && subida > 8 ? 'CUMPLE' : 'NO CUMPLE',
    },
    capturaAsociada: './capturas/01_speedtest.png',
  };
}

async function main() {
  await fs.mkdir(path.dirname(CAPTURA_PATH), { recursive: true });
  await fs.mkdir(path.dirname(DATOS_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: 'es-CO',
  });
  const page = await context.newPage();

  try {
    const resultado = await medirFastComEs(page);
    await fs.writeFile(DATOS_PATH, JSON.stringify(resultado, null, 2), 'utf-8');
    console.log(`[01_red] Datos guardados en ${DATOS_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en 01_captura_red.mjs:', err);
  process.exit(1);
});
