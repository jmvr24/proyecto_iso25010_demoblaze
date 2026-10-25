import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';

const OUTPUT_PATH = path.resolve('./01_pruebas_automatizadas_cli/evidencias/01_red_fast_cli/linea_base_red.json');

async function medirPing(url, metodo = 'GET', iteraciones = 10) {
  const muestras = [];
  // Warmup (opcional de conexión o medimos directo las 10 peticiones reales)
  for (let i = 1; i <= iteraciones; i++) {
    const inicio = performance.now();
    let status = null;
    let ok = false;
    try {
      const resp = await fetch(url, {
        method: metodo,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      status = resp.status;
      ok = resp.ok;
      // Consumir body si es GET para medir tiempo real de respuesta completa
      if (metodo === 'GET') {
        await resp.arrayBuffer();
      }
    } catch (err) {
      status = 'ERROR';
    }
    const fin = performance.now();
    const duracionMs = Number((fin - inicio).toFixed(2));
    muestras.push({ iteracion: i, latencia_ms: duracionMs, status, ok });
  }

  const tiempos = muestras.filter(m => typeof m.latencia_ms === 'number').map(m => m.latencia_ms);
  const min_ms = Number(Math.min(...tiempos).toFixed(2));
  const max_ms = Number(Math.max(...tiempos).toFixed(2));
  const promedio_ms = Number((tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(2));

  return {
    url,
    metodo,
    iteraciones,
    promedio_ms,
    min_ms,
    max_ms,
    muestras
  };
}

function normalizarMbps(valorStr, unidadStr) {
  const valor = parseFloat(String(valorStr).replace(',', '.'));
  if (isNaN(valor)) return null;
  const u = String(unidadStr || 'Mbps').toLowerCase();
  if (u.includes('gbps')) return Number((valor * 1000).toFixed(2));
  if (u.includes('kbps')) return Number((valor / 1000).toFixed(2));
  return Number(valor.toFixed(2));
}

async function medirFastComPlaywright() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log('Navegando a https://fast.com ...');
    await page.goto('https://fast.com', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('Esperando a que finalice la medición de descarga (#speed-value.succeeded)...');
    await page.waitForSelector('#speed-value.succeeded', { timeout: 90000 });

    // Clic en "Show more info" para disparar y mostrar subida y latencia
    const moreDetailsLink = page.locator('#show-more-details-link');
    if (await moreDetailsLink.isVisible()) {
      await moreDetailsLink.click();
    }

    console.log('Esperando a que finalice la medición de subida (#upload-value.succeeded)...');
    try {
      await page.waitForFunction(() => {
        const el = document.querySelector('#upload-value.succeeded');
        const val = parseFloat(el?.textContent?.trim() || '0');
        return el !== null && val > 0;
      }, { timeout: 90000 });
    } catch (e) {
      console.warn('Timeout esperando .succeeded en upload, capturando último valor disponible...');
    }

    const datosFast = await page.evaluate(() => {
      const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
      return {
        downloadValue: getText('#speed-value'),
        downloadUnits: getText('#speed-units'),
        uploadValue: getText('#upload-value'),
        uploadUnits: getText('#upload-units'),
        latencyValue: getText('#latency-value'),
        latencyUnits: getText('#latency-units'),
        bufferbloatValue: getText('#bufferbloat-value'),
        bufferbloatUnits: getText('#bufferbloat-units'),
        userIp: getText('#user-ip'),
        userLocation: getText('#user-location'),
        userIsp: getText('#user-isp'),
        serverLocations: getText('#server-locations')
      };
    });

    await browser.close();

    const descargaMbps = normalizarMbps(datosFast.downloadValue, datosFast.downloadUnits);
    const subidaMbps = normalizarMbps(datosFast.uploadValue, datosFast.uploadUnits);
    const latenciaUnloadedMs = parseFloat(datosFast.latencyValue) || null;
    const latenciaLoadedMs = parseFloat(datosFast.bufferbloatValue) || null;

    return {
      herramienta: 'Playwright Chromium Headless -> https://fast.com',
      descarga_mbps: descargaMbps,
      subida_mbps: subidaMbps,
      latencia_unloaded_ms: latenciaUnloadedMs,
      latencia_loaded_ms: latenciaLoadedMs,
      detalles_crudos_dom: datosFast
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function main() {
  let fastCliPrevio = null;
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const raw = fs.readFileSync(OUTPUT_PATH, 'utf8').trim();
      if (raw.startsWith('{')) {
        const parsed = JSON.parse(raw);
        fastCliPrevio = parsed.fast_cli_nativo?.downloadSpeed ? parsed.fast_cli_nativo : (parsed.downloadSpeed ? {
          downloadSpeed: parsed.downloadSpeed,
          uploadSpeed: parsed.uploadSpeed,
          downloadUnit: parsed.downloadUnit,
          uploadUnit: parsed.uploadUnit,
          downloaded: parsed.downloaded,
          uploaded: parsed.uploaded,
          latency: parsed.latency,
          bufferBloat: parsed.bufferBloat,
          userLocation: parsed.userLocation,
          serverLocations: parsed.serverLocations,
          userIp: parsed.userIp
        } : null);
      }
    } catch (_) {
      // fast-cli falló o no produjo JSON válido
    }
  }

  console.log('Midiendo Ping (10 peticiones HEAD/GET) a https://www.demoblaze.com ...');
  const pingWeb = await medirPing('https://www.demoblaze.com', 'HEAD', 10);

  console.log('Midiendo Ping (10 peticiones GET) a https://api.demoblaze.com/entries ...');
  const pingApi = await medirPing('https://api.demoblaze.com/entries', 'GET', 10);

  console.log('Ejecutando medición de ancho de banda y latencia en https://fast.com con Playwright...');
  const fastCom = await medirFastComPlaywright();

  const pingGlobalPromedioMs = Number(
    ((pingWeb.promedio_ms + pingApi.promedio_ms) / 2).toFixed(2)
  );

  const resultado = {
    ...(fastCliPrevio || {}),
    norma: 'ISO/IEC 25010',
    paso: 'Paso 1: Línea Base de Conectividad y Red',
    fecha_medicion: new Date().toISOString(),
    sistema_objetivo: 'https://www.demoblaze.com/index.html',
    fast_cli_nativo: fastCliPrevio || {
      estado: 'Fallback activado (Playwright Chromium en fast.com)',
      motivo: 'fast-cli devolvió salida vacía o error de binario Puppeteer en Windows/pnpm'
    },
    fast_com: {
      descarga_mbps: fastCom.descarga_mbps,
      subida_mbps: fastCom.subida_mbps,
      latencia_ms: fastCom.latencia_unloaded_ms,
      latencia_bajo_carga_ms: fastCom.latencia_loaded_ms,
      isp: fastCom.detalles_crudos_dom.userIsp,
      ubicacion_cliente: fastCom.detalles_crudos_dom.userLocation,
      servidores_fast: fastCom.detalles_crudos_dom.serverLocations,
      crudo_dom: fastCom.detalles_crudos_dom
    },
    ping_demoblaze: {
      resumen_global: {
        promedio_combinado_ms: pingGlobalPromedioMs,
        min_global_ms: Math.min(pingWeb.min_ms, pingApi.min_ms),
        max_global_ms: Math.max(pingWeb.max_ms, pingApi.max_ms)
      },
      frontend_web: pingWeb,
      backend_api_entries: pingApi
    },
    validacion_prerrequisito_iso25010: {
      conexion_estable: fastCom.descarga_mbps >= 10 && pingWeb.promedio_ms < 500,
      veredicto: (fastCom.descarga_mbps >= 10 && pingWeb.promedio_ms < 500)
        ? 'APRUEBA (Entorno de red apto para pruebas de Eficiencia de Desempeño)'
        : 'OBSERVACIÓN (Revisar condiciones de red)'
    }
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(resultado, null, 2), 'utf8');
  console.log('Archivo guardado exitosamente en:', OUTPUT_PATH);
  console.log(JSON.stringify(resultado, null, 2));
}

main().catch((err) => {
  console.error('Error en medir_red.mjs:', err);
  process.exit(1);
});
