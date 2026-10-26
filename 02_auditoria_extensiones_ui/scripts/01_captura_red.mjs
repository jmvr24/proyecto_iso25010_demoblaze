import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
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

function obtenerHardwareEnvironment() {
  const cpus = os.cpus();
  const totalBytes = os.totalmem();
  let soEdicion = os.version();
  let soBuild = os.release().split('.').pop() || os.release();
  let soDisplayVer = null;

  try {
    if (process.platform === 'win32') {
      const psCmd =
        'powershell -NoProfile -Command "$o = Get-CimInstance Win32_OperatingSystem; $dv = (Get-ItemProperty \'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\' -ErrorAction SilentlyContinue).DisplayVersion; Write-Output ($o.Caption + \'|\' + $o.Version + \'|\' + $o.BuildNumber + \'|\' + $dv)"';
      const out = execSync(psCmd, { encoding: 'utf8' }).trim();
      const [cap, ver, bld, dv] = out.split('|');
      if (cap) soEdicion = cap.trim();
      if (bld) soBuild = bld.trim();
      if (dv) soDisplayVer = dv.trim();
    }
  } catch (_) {
    // Fallback a node:os si CIM no responde
  }

  return {
    cpu: {
      modelo: cpus[0]?.model?.trim() || 'Desconocido',
      velocidad_reportada_node_mhz: cpus[0]?.speed || null,
      nucleos_logicos: cpus.length,
      arquitectura: os.arch(),
    },
    ram: {
      capacidad_utilizable_gb: Number((totalBytes / 1024 ** 3).toFixed(2)),
      capacidad_utilizable_bytes: totalBytes,
    },
    sistema_operativo: {
      edicion: soEdicion,
      version: soDisplayVer,
      version_nt: os.release(),
      compilacion_build: soBuild,
      arquitectura: os.arch() === 'x64' ? '64 bits' : os.arch(),
    },
  };
}

async function consultarIspPublico() {
  for (const url of ['https://ipapi.co/json/', 'https://ipinfo.io/json']) {
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'curl/8.0' } });
      if (resp.ok) {
        const j = await resp.json();
        const org = j.org || j.asn || null;
        if (org) {
          return {
            isp: j.asn && !org.includes(j.asn) ? `${org} (${j.asn})` : org,
            provider: org.replace(/^AS\d+\s+/i, '').trim(),
            org,
            asn: j.asn || (org.match(/^AS\d+/i)?.[0] ?? null),
            fuente: url,
          };
        }
      }
    } catch (_) {
      // Intentar siguiente endpoint
    }
  }
  return null;
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

  const ispExterno = await consultarIspPublico();
  const hardwareEnvironment = obtenerHardwareEnvironment();

  const descarga = normalizarMbps(raw.dlVal, raw.dlUnit);
  const subida = normalizarMbps(raw.ulVal, raw.ulUnit);
  const ping = Number.parseFloat(String(raw.pingUnloaded || '0').replace(',', '.'));
  const pingCargado = Number.parseFloat(String(raw.pingLoaded || '0').replace(',', '.'));

  return {
    herramienta: 'FAST.com (https://fast.com/es/) — Prueba de Velocidad y Latencia en Navegador Real',
    urlEvidencia: 'https://fast.com/es/',
    timestamp: new Date().toISOString(),
    viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
    hardware_environment: hardwareEnvironment,
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
      isp: raw.isp || ispExterno?.isp || 'No disponible',
      provider: raw.isp || ispExterno?.provider || 'No disponible',
      asn: ispExterno?.asn || null,
      ipCliente: raw.ip,
      ubicacionCliente: raw.location,
      servidoresPrueba: raw.servers,
      fuenteVerificacionIsp: raw.isp ? 'FAST.com DOM (#user-isp)' : ispExterno?.fuente || null,
    },
    criterioAceptacionEstudio: {
      taxonomiaIso25010:
        'Prerrequisito de control ambiental para evaluar Eficiencia de Desempeño (Comportamiento temporal y Utilización de recursos)',
      notaMetodologica:
        'La norma ISO/IEC 25010 define las características y subcaracterísticas de calidad; los límites numéricos corresponden al criterio de aceptación definido por el equipo evaluador.',
      limiteDecisionDescargaMbps: '> 30 Mbps',
      limiteDecisionSubidaMbps: '> 8 Mbps',
      limiteDecisionPingMs: '< 100 ms (estable)',
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
    await fs.writeFile(DATOS_PATH, JSON.stringify(resultado, null, 2) + '\n', 'utf-8');
    console.log(`[01_red] Datos guardados en ${DATOS_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en 01_captura_red.mjs:', err);
  process.exit(1);
});
