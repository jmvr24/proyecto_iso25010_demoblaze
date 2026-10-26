import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const OUTPUT_PATH = path.resolve(
  './01_pruebas_automatizadas_cli/evidencias/04_desempeno_metricas_y_k6/tiempos_http_view_bycat.json'
);

const UMBRAL_ISO_MS = 2000;

/**
 * Calcula estadísticas descriptivas exactas sobre un conjunto de muestras HTTP.
 * Filtra únicamente muestras exitosas (ok === true y status === 200) para el cálculo de tiempos.
 */
function calcularEstadisticas(muestras) {
  const totalPeticiones = muestras.length;
  const exitosas = muestras.filter((m) => m.ok === true && m.status === 200 && typeof m.latencia_ms === 'number');
  const fallidas = totalPeticiones - exitosas.length;
  const tasaExitoPct = totalPeticiones > 0 ? Number(((exitosas.length / totalPeticiones) * 100).toFixed(2)) : 0;
  const tasaErrorPct = totalPeticiones > 0 ? Number(((fallidas / totalPeticiones) * 100).toFixed(2)) : 0;

  const tiempos = exitosas.map((m) => m.latencia_ms).sort((a, b) => a - b);
  const n = tiempos.length;

  if (n === 0) {
    return {
      total_peticiones: totalPeticiones,
      peticiones_exitosas_http_200: 0,
      peticiones_fallidas: fallidas,
      tasa_exito_porcentaje: 0,
      tasa_error_porcentaje: 100,
      min_ms: null,
      promedio_ms: null,
      mediana_p50_ms: null,
      p95_ms: null,
      max_ms: null,
      cumple_umbral_iso25010_2000ms: false
    };
  }

  const sumaTotalMs = Number(tiempos.reduce((acc, val) => acc + val, 0).toFixed(2));
  const minMs = Number(tiempos[0].toFixed(2));
  const maxMs = Number(tiempos[n - 1].toFixed(2));
  const promedioMs = Number((sumaTotalMs / n).toFixed(2));

  // Mediana (p50) estándar
  const medianaP50Ms =
    n % 2 === 1
      ? Number(tiempos[Math.floor(n / 2)].toFixed(2))
      : Number(((tiempos[n / 2 - 1] + tiempos[n / 2]) / 2).toFixed(2));

  // Percentil 95 (interpolación lineal estándar tipo R-7 / Excel / NumPy)
  const pos95 = 0.95 * (n - 1);
  const base95 = Math.floor(pos95);
  const resto95 = pos95 - base95;
  const p95InterpoladoMs =
    base95 + 1 < n
      ? Number((tiempos[base95] + resto95 * (tiempos[base95 + 1] - tiempos[base95])).toFixed(2))
      : Number(tiempos[base95].toFixed(2));

  // Percentil 95 por rango más cercano (nearest-rank: ceil(0.95 * n) - 1)
  const idxNearest95 = Math.min(n - 1, Math.max(0, Math.ceil(0.95 * n) - 1));
  const p95NearestRankMs = Number(tiempos[idxNearest95].toFixed(2));

  return {
    total_peticiones: totalPeticiones,
    peticiones_exitosas_http_200: n,
    peticiones_fallidas: fallidas,
    codigos_http_observados: Array.from(new Set(muestras.map((m) => m.status))),
    tasa_exito_porcentaje: tasaExitoPct,
    tasa_error_porcentaje: tasaErrorPct,
    suma_tiempos_ms: sumaTotalMs,
    min_ms: minMs,
    promedio_ms: promedioMs,
    mediana_p50_ms: medianaP50Ms,
    p95_ms: p95InterpoladoMs,
    p95_nearest_rank_ms: p95NearestRankMs,
    max_ms: maxMs,
    umbral_iso25010_ms: UMBRAL_ISO_MS,
    cumple_umbral_iso25010_2000ms: promedioMs < UMBRAL_ISO_MS && p95InterpoladoMs < UMBRAL_ISO_MS
  };
}

/**
 * Ejecuta una petición POST JSON midiendo el tiempo hasta la descarga y parseo del cuerpo JSON.
 */
async function ejecutarPostJson(url, payload, iteracion, modo) {
  const inicio = performance.now();
  let status = null;
  let ok = false;
  let bytesRecibidos = 0;
  let resumenPayloadRespuesta = null;
  let errorDetalle = null;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache'
      },
      body: JSON.stringify(payload)
    });
    status = resp.status;
    ok = resp.ok;
    const rawText = await resp.text();
    bytesRecibidos = Buffer.byteLength(rawText, 'utf8');
    const data = JSON.parse(rawText);

    if (Array.isArray(data?.Items)) {
      resumenPayloadRespuesta = { items_count: data.Items.length, primer_item: data.Items[0]?.title || null };
    } else if (data && typeof data === 'object') {
      resumenPayloadRespuesta = { id: data.id ?? null, title: data.title ?? null, price: data.price ?? null };
    }
  } catch (err) {
    status = 'ERROR';
    ok = false;
    errorDetalle = err.message;
  }

  const fin = performance.now();
  const latenciaMs = Number((fin - inicio).toFixed(2));

  return {
    iteracion,
    modo,
    payload_enviado: payload,
    latencia_ms: latenciaMs,
    status,
    ok,
    bytes_recibidos: bytesRecibidos,
    resumen_respuesta: resumenPayloadRespuesta,
    ...(errorDetalle ? { error: errorDetalle } : {})
  };
}

async function medirSerieEndpoint(url, payloadPrincipal, payloadsAdicionales = []) {
  const muestrasSecuenciales = [];
  for (let i = 1; i <= 20; i++) {
    const m = await ejecutarPostJson(url, payloadPrincipal, i, 'secuencial');
    muestrasSecuenciales.push(m);
  }

  const inicioConcurrente = performance.now();
  const promesasConcurrentes = Array.from({ length: 10 }, (_, idx) =>
    ejecutarPostJson(url, payloadPrincipal, idx + 1, 'concurrente')
  );
  const muestrasConcurrentes = await Promise.all(promesasConcurrentes);
  const duracionBloqueConcurrenteMs = Number((performance.now() - inicioConcurrente).toFixed(2));

  const muestrasCombinadas30 = [...muestrasSecuenciales, ...muestrasConcurrentes];

  const pruebasAdicionales = {};
  for (const item of payloadsAdicionales) {
    const muestrasExtra = [];
    for (let j = 1; j <= item.iteraciones; j++) {
      muestrasExtra.push(await ejecutarPostJson(url, item.payload, j, 'secuencial_complementaria'));
    }
    pruebasAdicionales[item.etiqueta] = {
      payload: item.payload,
      estadisticas: calcularEstadisticas(muestrasExtra),
      muestras: muestrasExtra
    };
  }

  return {
    endpoint: url,
    metodo: 'POST',
    headers: { 'Content-Type': 'application/json' },
    payload_principal: payloadPrincipal,
    estadisticas_secuencial_20: calcularEstadisticas(muestrasSecuenciales),
    estadisticas_concurrente_10: {
      ...calcularEstadisticas(muestrasConcurrentes),
      tiempo_total_bloque_concurrente_ms: duracionBloqueConcurrenteMs
    },
    estadisticas_combinadas_30: calcularEstadisticas(muestrasCombinadas30),
    validaciones_payloads_adicionales: pruebasAdicionales,
    muestras_secuenciales_20: muestrasSecuenciales,
    muestras_concurrentes_10: muestrasConcurrentes
  };
}

async function main() {
  console.log('Iniciando medición de tiempos de respuesta HTTP para /bycat y /view...');

  // Warmup ligero de DNS/TLS (1 petición por endpoint, no incluida en las muestras)
  await ejecutarPostJson('https://api.demoblaze.com/bycat', { cat: 'notebook' }, 0, 'warmup');
  await ejecutarPostJson('https://api.demoblaze.com/view', { id: '8' }, 0, 'warmup');

  console.log('1) Midiendo POST https://api.demoblaze.com/bycat (20 secuenciales + 10 concurrentes + phone/monitor)...');
  const resultadoBycat = await medirSerieEndpoint(
    'https://api.demoblaze.com/bycat',
    { cat: 'notebook' },
    [
      { etiqueta: 'categoria_phone', payload: { cat: 'phone' }, iteraciones: 5 },
      { etiqueta: 'categoria_monitor', payload: { cat: 'monitor' }, iteraciones: 5 }
    ]
  );

  console.log('2) Midiendo POST https://api.demoblaze.com/view (20 secuenciales + 10 concurrentes + id=1)...');
  const resultadoView = await medirSerieEndpoint(
    'https://api.demoblaze.com/view',
    { id: '8' },
    [{ etiqueta: 'producto_id_1_galaxy_s6', payload: { id: '1' }, iteraciones: 5 }]
  );

  const todasMuestrasPrincipales = [
    ...resultadoBycat.muestras_secuenciales_20,
    ...resultadoBycat.muestras_concurrentes_10,
    ...resultadoView.muestras_secuenciales_20,
    ...resultadoView.muestras_concurrentes_10
  ];

  const reporte = {
    norma: 'ISO/IEC 25010',
    caracteristica: 'Eficiencia de desempeño',
    subcaracteristica: 'Comportamiento temporal',
    paso: 'Paso 2: Medición de Tiempos de Respuesta HTTP de Endpoints de Detalle (/view) y Categoría (/bycat)',
    fecha_medicion: new Date().toISOString(),
    script_fuente: '01_pruebas_automatizadas_cli/scripts/medir_endpoints_view_bycat.mjs',
    umbral_decision_iso25010: {
      criterio: 'Tiempo de respuesta promedio y p95 < 2000 ms (2,0 s); tasa de éxito HTTP 200 = 100 %',
      umbral_ms: UMBRAL_ISO_MS
    },
    resumen_global_endpoints: calcularEstadisticas(todasMuestrasPrincipales),
    endpoints: {
      bycat: resultadoBycat,
      view: resultadoView
    }
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(reporte, null, 2), 'utf8');
  console.log('Evidencia guardada en:', OUTPUT_PATH);
  console.log(
    JSON.stringify(
      {
        resumen_global: reporte.resumen_global_endpoints,
        bycat_secuencial_20: resultadoBycat.estadisticas_secuencial_20,
        bycat_concurrente_10: resultadoBycat.estadisticas_concurrente_10,
        bycat_combinado_30: resultadoBycat.estadisticas_combinadas_30,
        bycat_phone_5: resultadoBycat.validaciones_payloads_adicionales.categoria_phone.estadisticas,
        bycat_monitor_5: resultadoBycat.validaciones_payloads_adicionales.categoria_monitor.estadisticas,
        view_secuencial_20: resultadoView.estadisticas_secuencial_20,
        view_concurrente_10: resultadoView.estadisticas_concurrente_10,
        view_combinado_30: resultadoView.estadisticas_combinadas_30,
        view_id1_5: resultadoView.validaciones_payloads_adicionales.producto_id_1_galaxy_s6.estadisticas
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error('Error en medir_endpoints_view_bycat.mjs:', err);
  process.exit(1);
});
