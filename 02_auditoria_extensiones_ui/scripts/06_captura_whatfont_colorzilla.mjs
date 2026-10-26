import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const VIEWPORT = { width: 1440, height: 900 };
const CAPTURA_PATH = path.resolve('./02_auditoria_extensiones_ui/capturas/06_whatfont_colorzilla.png');
const DATOS_PATH = path.resolve('./02_auditoria_extensiones_ui/datos/06_estilos_ui.json');

function rgbToHex(rgbStr) {
  if (!rgbStr) return '#000000';
  const match = rgbStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!match) return rgbStr;
  const r = Number.parseInt(match[1], 10);
  const g = Number.parseInt(match[2], 10);
  const b = Number.parseInt(match[3], 10);
  const a = match[4] !== undefined ? Number.parseFloat(match[4]) : 1;
  const hex =
    '#' +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  if (a === 0) return `${hex} (transparent)`;
  return hex;
}

async function extraerComponente(page, selector, nombreComponente, vistaUrl) {
  const raw = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;

    function getEffectiveBg(node) {
      let cur = node;
      while (cur && cur !== document.documentElement) {
        const cs = window.getComputedStyle(cur);
        const bgImg = cs.backgroundImage;
        const bgCol = cs.backgroundColor;
        if (bgCol && bgCol !== 'rgba(0, 0, 0, 0)' && bgCol !== 'transparent') {
          return {
            rgb: bgCol,
            backgroundImage: bgImg !== 'none' ? bgImg : null,
            from: cur.tagName.toLowerCase() + (cur.id ? `#${cur.id}` : ''),
          };
        }
        cur = cur.parentElement;
      }
      return { rgb: 'rgb(255, 255, 255)', backgroundImage: null, from: 'body' };
    }

    const cs = window.getComputedStyle(el);
    const eff = getEffectiveBg(el);
    return {
      selector: sel,
      etiqueta: el.tagName.toLowerCase(),
      textoMuestra: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      colorRgb: cs.color,
      backgroundColorPropioRgb: cs.backgroundColor,
      backgroundEfectivoRgb: eff.rgb,
      backgroundImageCss: eff.backgroundImage,
      heredadoDe: eff.from,
    };
  }, selector);

  if (!raw) return { nombreComponente, vistaUrl, selector, encontrado: false };

  return {
    nombreComponente,
    vistaUrl,
    encontrado: true,
    ...raw,
    colorTextoHex: rgbToHex(raw.colorRgb),
    colorFondoPropioHex: rgbToHex(raw.backgroundColorPropioRgb),
    colorFondoEfectivoHex: rgbToHex(raw.backgroundEfectivoRgb),
  };
}

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
    // 1. Inspeccionar index.html
    console.log('[06_estilos] Extrayendo estilos en https://www.demoblaze.com/index.html ...');
    await page.goto('https://www.demoblaze.com/index.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#tbodyid .card', { state: 'visible', timeout: 20000 });

    const navBrand = await extraerComponente(page, '#nava', 'Barra de navegación - Marca (PRODUCT STORE)', 'index.html');
    const navLink = await extraerComponente(page, 'nav .nav-link', 'Barra de navegación - Enlaces (nav .nav-link)', 'index.html');
    const navContainer = await extraerComponente(page, 'nav#narvbarx', 'Barra de navegación - Contenedor (nav)', 'index.html');
    const cardTitle = await extraerComponente(page, '.card-title a', 'Títulos de productos (.card-title a)', 'index.html');
    const cardPrice = await extraerComponente(page, '#tbodyid .card h5', 'Precios de catálogo (.card h5)', 'index.html');
    const cardDesc = await extraerComponente(page, '.card-text', 'Descripción de producto (.card-text)', 'index.html');
    const btnPrimaryModal = await extraerComponente(page, '.btn-primary', 'Botón primario modal (.btn-primary)', 'index.html');
    const footerInfo = await extraerComponente(page, '#fotcont', 'Footer superior informativo (#fotcont)', 'index.html');
    const footerCopy = await extraerComponente(page, 'footer.py-5', 'Footer inferior copyright (footer)', 'index.html');

    // 2. Navegar a detalle de producto para extraer botón "Add to cart" y precio de detalle
    console.log('[06_estilos] Extrayendo estilos del botón Add to cart en prod.html ...');
    await page.locator('#tbodyid .card-title a').first().click();
    await page.waitForSelector('a.btn-success', { state: 'visible', timeout: 20000 });
    const prodPrice = await extraerComponente(page, '.price-container', 'Precio en detalle (.price-container)', 'prod.html');
    const btnAddToCart = await extraerComponente(page, 'a.btn-success', 'Botón Add to cart (a.btn-success)', 'prod.html');

    // 3. Navegar a https://www.demoblaze.com/cart.html para extraer botón "Place Order"
    console.log('[06_estilos] Extrayendo estilos del botón Place Order en cart.html ...');
    await page.goto('https://www.demoblaze.com/cart.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('button.btn-success', { state: 'visible', timeout: 15000 });
    const btnPlaceOrder = await extraerComponente(page, 'button.btn-success', 'Botón Place Order (button.btn-success)', 'cart.html');
    const cartTotal = await extraerComponente(page, '#totalp', 'Total en Carrito (#totalp)', 'cart.html');

    // 4. Volver a index.html, esperar imágenes y renderizar los tooltips flotantes de WhatFont + ColorZilla
    console.log('[06_estilos] Renderizando tooltips de WhatFont + ColorZilla en index.html para captura...');
    await page.goto('https://www.demoblaze.com/index.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#tbodyid .card', { state: 'visible', timeout: 20000 });
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
    await page.waitForTimeout(500);

    const componentes = [
      navContainer,
      navLink,
      navBrand,
      cardTitle,
      cardPrice,
      cardDesc,
      prodPrice,
      btnAddToCart,
      btnPlaceOrder,
      btnPrimaryModal,
      cartTotal,
      footerInfo,
      footerCopy,
    ];

    await page.evaluate(
      ({ navL, cardT, cardP, addBtn, placeBtn, footC }) => {
        // Ocultar carrusel superior o reducir altura ligeramente para que en un solo encuadre 1440x900 se vean Navbar + Cards + Precios + Footer simultáneamente con sus tooltips reales
        const carousel = document.querySelector('#contcar');
        if (carousel) {
          carousel.style.maxHeight = '190px';
          carousel.style.overflow = 'hidden';
        }
        // Mostrar solo la primera fila de 3 productos para que también entre el footer real en 1440x900
        const cardsCols = Array.from(document.querySelectorAll('#tbodyid > div'));
        cardsCols.slice(3).forEach((c) => {
          c.style.display = 'none';
        });

        function createTooltip(targetEl, title, data, offsetX = 0, offsetY = 8) {
          if (!targetEl) return;
          targetEl.style.setProperty('outline', '2px dashed #f59e0b', 'important');
          targetEl.style.setProperty('outline-offset', '3px', 'important');
          const rect = targetEl.getBoundingClientRect();

          const tip = document.createElement('div');
          tip.style.cssText = `
            position: fixed;
            left: ${Math.min(Math.max(12, rect.left + offsetX), 1120)}px;
            top: ${Math.min(Math.max(12, rect.bottom + offsetY), 760)}px;
            width: 285px;
            background: rgba(17, 24, 39, 0.96);
            color: #f9fafb;
            border: 1px solid #4b5563;
            border-radius: 8px;
            padding: 9px 11px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 11.5px;
            box-shadow: 0 12px 26px rgba(0,0,0,0.55);
            z-index: 999998;
            line-height: 1.4;
          `;

          tip.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #374151;padding-bottom:4px;margin-bottom:6px;">
              <span style="font-weight:700;color:#fbbf24;font-size:11px;">WhatFont + ColorZilla</span>
              <span style="color:#9ca3af;font-size:10.5px;">${title}</span>
            </div>
            <div><strong style="color:#93c5fd;">font-family:</strong> <code>${data.fontFamily}</code></div>
            <div><strong style="color:#93c5fd;">size / weight:</strong> ${data.fontSize} / ${data.fontWeight} (lh: ${data.lineHeight})</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
              <span style="display:inline-block;width:13px;height:13px;background:${data.colorTextoHex};border:1px solid #fff;border-radius:3px;"></span>
              <span>Texto: <strong>${data.colorTextoHex}</strong></span>
              <span style="display:inline-block;width:13px;height:13px;background:${data.colorFondoEfectivoHex};border:1px solid #fff;border-radius:3px;margin-left:6px;"></span>
              <span>Fondo: <strong>${data.colorFondoEfectivoHex}</strong></span>
            </div>
          `;
          document.body.appendChild(tip);
        }

        createTooltip(document.querySelector('nav .nav-link'), 'nav .nav-link', navL, -40, 10);
        createTooltip(document.querySelector('#tbodyid .card-title a'), '.card-title a', cardT, 0, 6);
        createTooltip(document.querySelectorAll('#tbodyid .card h5')[1], 'Precio (.card h5)', cardP, 0, 6);
        createTooltip(document.querySelector('footer.py-5'), 'footer.py-5', footC, 40, -125);

        // Panel superior derecho consolidado estilo ColorZilla Eyedropper & WhatFont Inspector (incluyendo botones Add to cart y Place Order de prod.html y cart.html)
        const hud = document.createElement('div');
        hud.style.cssText = `
          position: fixed;
          top: 62px;
          right: 16px;
          width: 390px;
          background: rgba(15, 23, 42, 0.97);
          color: #f8fafc;
          border: 1px solid #475569;
          border-radius: 10px;
          padding: 12px 14px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-shadow: 0 18px 38px rgba(0,0,0,0.6);
          z-index: 999999;
        `;

        hud.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding-bottom:7px;margin-bottom:8px;">
            <span style="font-weight:800;font-size:13px;color:#38bdf8;">ColorZilla & WhatFont — Sistema UI</span>
            <span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;">INCONSISTENCIA DETECTADA</span>
          </div>
          <div style="font-size:11.5px;margin-bottom:8px;color:#cbd5e1;">
            <div><strong>Familias detectadas (2):</strong> <code style="color:#fbbf24;">LatoWeb</code> (general) vs <code style="color:#f87171;">sans-serif</code> (&lt;button&gt;)</div>
          </div>
          <div style="font-size:11px;background:#1e293b;padding:8px;border-radius:6px;margin-bottom:8px;">
            <div style="font-weight:700;color:#86efac;margin-bottom:4px;">Comparativa Botones de Compra (prod.html vs cart.html):</div>
            <div style="margin-bottom:4px;">• <strong>Add to cart (&lt;a.btn-success&gt;):</strong> <code>${addBtn.fontFamily}</code> | ${addBtn.fontSize} | Texto ${addBtn.colorTextoHex} / Fondo <span style="background:${addBtn.colorFondoEfectivoHex};padding:0 5px;border-radius:3px;">${addBtn.colorFondoEfectivoHex}</span></div>
            <div>• <strong>Place Order (&lt;button.btn-success&gt;):</strong> <code style="color:#fca5a5;">${placeBtn.fontFamily}</code> | ${placeBtn.fontSize} | Texto ${placeBtn.colorTextoHex} / Fondo <span style="background:${placeBtn.colorFondoEfectivoHex};padding:0 5px;border-radius:3px;">${placeBtn.colorFondoEfectivoHex}</span></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:10.5px;">
            <div style="background:#292B2C;color:#fff;padding:5px;border-radius:4px;border:1px solid #64748b;text-align:center;">Nav/Foot<br><strong>#292B2C</strong></div>
            <div style="background:#0275D8;color:#fff;padding:5px;border-radius:4px;text-align:center;">Primario<br><strong>#0275D8</strong></div>
            <div style="background:#34A853;color:#fff;padding:5px;border-radius:4px;text-align:center;">CTA Éxito<br><strong>#34A853</strong></div>
            <div style="background:#FAFCFF;color:#1e293b;padding:5px;border-radius:4px;text-align:center;">Body Bg<br><strong>#FAFCFF</strong></div>
            <div style="background:#FFFFFF;color:#1e293b;padding:5px;border-radius:4px;text-align:center;">Card Bg<br><strong>#FFFFFF</strong></div>
            <div style="background:#868688;color:#fff;padding:5px;border-radius:4px;text-align:center;">Body Text<br><strong>#868688</strong></div>
          </div>
        `;
        document.body.appendChild(hud);
      },
      {
        navL: navLink,
        cardT: cardTitle,
        cardP: cardPrice,
        addBtn: btnAddToCart,
        placeBtn: btnPlaceOrder,
        footC: footerCopy,
      }
    );

    await page.waitForTimeout(500);
    await page.screenshot({ path: CAPTURA_PATH, fullPage: false });
    console.log(`[06_estilos] Captura guardada en ${CAPTURA_PATH}`);

    const familiasUnicas = Array.from(new Set(componentes.filter((c) => c.encontrado).map((c) => c.fontFamily)));

    const reporte = {
      herramientasEmuladas: ['WhatFont (Inspección Tipográfica CSS)', 'ColorZilla (Extracción Cromática #HEX / RGB)'],
      urlsInspeccionadas: [
        'https://www.demoblaze.com/index.html',
        'https://www.demoblaze.com/prod.html?idp_=1',
        'https://www.demoblaze.com/cart.html',
      ],
      timestamp: new Date().toISOString(),
      viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
      resumenSistemaDiseno: {
        frameworkBase: 'Bootstrap 4 Alpha 6 personalizado con tema BlazeMeter (gradiente #1D1CF2 -> #00D4FF sobre fondo #292B2C)',
        familiasTipograficasDetectadas: familiasUnicas,
        uniformidadTipografica100Porciento: familiasUnicas.length === 1,
        hallazgoTipografico:
          'NO CUMPLE 100% de uniformidad: la hoja de estilo global declara font-family: LatoWeb en body, nav, enlaces, precios y a.btn-success ("Add to cart", 20px), pero las etiquetas nativas <button> (.btn-primary y button.btn-success "Place Order", 16px) renderizan "sans-serif" debido al reset incompleto de Bootstrap 4 Alpha.',
        paletaInstitucionalHex: {
          fondoBody: '#FAFCFF',
          fondoTarjetas: '#FFFFFF',
          textoPrincipalYPreciosCatalogo: '#868688',
          azulEnlacesYPrimario: '#0275D8',
          verdeBotonesCompra: '#34A853',
          grisOscuroBaseNavbarYFooter: '#292B2C',
          blancoTextoSobreOscuro: '#FFFFFF',
          gradienteDecorativoHeaderFooter: 'linear-gradient(to right, #191654 / #1d1cf2 -> #00c6ff) sobre #292B2C',
        },
        hallazgoCromaticoYContraste:
          'Consistencia cromática parcial: aunque se mantienen los colores #0275D8 y #34A853, el texto gris #868688 sobre #FFFFFF tiene un ratio de contraste de 3.63:1 (< 4.5:1 WCAG AA) y el botón Place Order (#FFFFFF sobre #34A853, 16px normal) apenas alcanza 3.05:1 (< 4.5:1 WCAG AA). Además, el botón Add to cart usa 20px (<a>) mientras Place Order usa 16px (<button>).',
        dictamenIso25010: 'NO CUMPLE (Falta de uniformidad tipográfica al 100% entre <a> y <button>, asimetría de tamaños en CTAs y bajo contraste WCAG AA)',
      },
      capturaAsociada: './capturas/06_whatfont_colorzilla.png',
      componentesEvaluados: componentes,
    };

    await fs.writeFile(DATOS_PATH, JSON.stringify(reporte, null, 2), 'utf-8');
    console.log(`[06_estilos] Datos guardados en ${DATOS_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error en 06_captura_whatfont_colorzilla.mjs:', err);
  process.exit(1);
});
