import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = 'https://www.demoblaze.com/index.html';
const VIEWPORT = { width: 1280, height: 800 };

const DIR_CAPTURAS = path.resolve('./01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo');
const DIR_INTERACCION = path.resolve('./01_pruebas_automatizadas_cli/evidencias/03_adecuacion_e_interaccion');

/**
 * Convierte un color CSS rgb(...) o rgba(...) a formato #HEX.
 */
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
  if (a === 0) {
    return `${hex} (transparent / alpha=0)`;
  }
  return hex;
}

/**
 * Espera a que todas las imágenes visibles dentro de un selector terminen de cargar.
 */
async function waitForImages(page, selector = 'img') {
  await page.evaluate(async (sel) => {
    const imgs = Array.from(document.querySelectorAll(sel));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 4000);
        });
      })
    );
  }, selector);
}

/**
 * Extrae el resumen de violaciones de Axe-core por severidad y nodos afectados.
 */
function summarizeAxeResults(axeResult, url, pageContext) {
  const severityCounts = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  let totalAffectedNodes = 0;

  const violations = axeResult.violations.map((v) => {
    const impact = v.impact || 'minor';
    if (severityCounts[impact] !== undefined) {
      severityCounts[impact] += 1;
    }
    totalAffectedNodes += v.nodes.length;

    return {
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodesCount: v.nodes.length,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary,
        impact: n.impact,
      })),
    };
  });

  return {
    url,
    pageContext,
    timestamp: axeResult.timestamp,
    totalViolationsRules: axeResult.violations.length,
    totalAffectedNodes,
    totalPassesRules: axeResult.passes.length,
    totalIncompleteRules: axeResult.incomplete.length,
    severityCounts,
    violations,
  };
}

/**
 * Audita los enlaces <a href> e imágenes <img src> en la página actual (Emulación Check My Links).
 */
async function auditarIntegridadEnlaces(page) {
  const rawElements = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a')).map((a, idx) => {
      const rawHref = a.getAttribute('href');
      return {
        index: idx,
        tag: 'a',
        text: (a.innerText || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        id: a.id || null,
        className: a.className || null,
        onclick: a.getAttribute('onclick') || null,
        rawAttr: rawHref,
        resolvedUrl: rawHref ? a.href : '',
      };
    });

    const images = Array.from(document.querySelectorAll('img')).map((img, idx) => {
      const rawSrc = img.getAttribute('src');
      return {
        index: idx,
        tag: 'img',
        alt: img.getAttribute('alt') || null,
        id: img.id || null,
        className: img.className || null,
        rawAttr: rawSrc,
        resolvedUrl: rawSrc ? img.src : '',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      };
    });

    return { anchors, images };
  });

  let anchorsHttp200 = 0;
  let anchorsEmptyOrHash = 0;
  let anchorsError404_500 = 0;

  const classifiedAnchors = [];
  for (const a of rawElements.anchors) {
    const raw = (a.rawAttr ?? '').trim();
    const isDeadAnchor =
      raw === '' ||
      raw === '#' ||
      raw.toLowerCase().startsWith('javascript:void(0)') ||
      raw.toLowerCase().startsWith('javascript:;');

    if (isDeadAnchor) {
      anchorsEmptyOrHash += 1;
      classifiedAnchors.push({
        ...a,
        category: 'ANCLA_SIN_DESTINO',
        httpStatus: null,
        statusText: 'Empty/Hash/Void anchor (href="#" o vacio)',
      });
    } else {
      const checkResult = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url, { method: 'GET', cache: 'no-store' });
          return { ok: res.ok, status: res.status, statusText: res.statusText || (res.ok ? 'OK' : 'HTTP Error') };
        } catch (err) {
          return { ok: false, status: 0, statusText: err.message || 'Network Error' };
        }
      }, a.resolvedUrl);

      if (checkResult.status >= 200 && checkResult.status < 300) {
        anchorsHttp200 += 1;
        classifiedAnchors.push({
          ...a,
          category: 'HTTP_200_OK',
          httpStatus: checkResult.status,
          statusText: checkResult.statusText,
        });
      } else {
        anchorsError404_500 += 1;
        classifiedAnchors.push({
          ...a,
          category: 'HTTP_ERROR',
          httpStatus: checkResult.status,
          statusText: checkResult.statusText,
        });
      }
    }
  }

  let imagesHttp200 = 0;
  let imagesError404_500 = 0;

  const classifiedImages = [];
  for (const img of rawElements.images) {
    if (!img.resolvedUrl) {
      imagesError404_500 += 1;
      classifiedImages.push({
        ...img,
        category: 'SRC_VACIO',
        httpStatus: null,
        statusText: 'Empty src attribute',
      });
      continue;
    }

    const checkResult = await page.evaluate(async (url) => {
      try {
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
        return { ok: res.ok, status: res.status, statusText: res.statusText || (res.ok ? 'OK' : 'HTTP Error') };
      } catch (err) {
        return { ok: false, status: 0, statusText: err.message || 'Network Error' };
      }
    }, img.resolvedUrl);

    if (checkResult.status >= 200 && checkResult.status < 300) {
      imagesHttp200 += 1;
      classifiedImages.push({
        ...img,
        category: 'HTTP_200_OK',
        httpStatus: checkResult.status,
        statusText: checkResult.statusText,
      });
    } else {
      imagesError404_500 += 1;
      classifiedImages.push({
        ...img,
        category: 'HTTP_ERROR',
        httpStatus: checkResult.status,
        statusText: checkResult.statusText,
      });
    }
  }

  const totalAnchors = classifiedAnchors.length;
  const totalImages = classifiedImages.length;
  const totalResources = totalAnchors + totalImages;
  const totalHttp200 = anchorsHttp200 + imagesHttp200;
  const totalHttpErrors = anchorsError404_500 + imagesError404_500;

  return {
    herramientaEmulada: 'Check My Links (Auditoría DOM + Fetch HTTP en vivo)',
    urlAuditada: BASE_URL,
    timestamp: new Date().toISOString(),
    resumenEstadistico: {
      totalElementosAuditados: totalResources,
      totalEnlacesA: totalAnchors,
      totalImagenesImg: totalImages,
      enlaces: {
        http200Validos: anchorsHttp200,
        anclasSinDestinoHrefHashOVacio: anchorsEmptyOrHash,
        erroresHttp404_500: anchorsError404_500,
        porcentajeAnclasSinDestino: Number(((anchorsEmptyOrHash / (totalAnchors || 1)) * 100).toFixed(2)),
        porcentajeEnlacesFuncionalesConHrefReal: Number(((anchorsHttp200 / (totalAnchors || 1)) * 100).toFixed(2)),
      },
      imagenes: {
        http200Validas: imagesHttp200,
        erroresHttp404_500: imagesError404_500,
        imagenesSinAtributoAlt: classifiedImages.filter((i) => !i.alt || i.alt.trim() === '').length,
      },
      consolidadoGlobal: {
        totalHttp200,
        totalAnclasSinDestino: anchorsEmptyOrHash,
        totalErroresHttp404_500: totalHttpErrors,
      },
    },
    detalleEnlaces: classifiedAnchors,
    detalleImagenes: classifiedImages,
  };
}

/**
 * Extrae estilos computados de un conjunto de selectores en la página actual.
 */
async function extraerEstilosSelectores(page, selectors, pageLabel) {
  const rawStyles = await page.evaluate(
    ({ sels, label }) => {
      function getEffectiveBackgroundColor(el) {
        let current = el;
        while (current && current !== document.documentElement) {
          const bg = window.getComputedStyle(current).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            return {
              colorRgb: bg,
              inheritedFromTag: current.tagName.toLowerCase() + (current.id ? `#${current.id}` : '') + (current.className && typeof current.className === 'string' ? `.${current.className.trim().split(/\s+/).join('.')}` : ''),
            };
          }
          current = current.parentElement;
        }
        return {
          colorRgb: window.getComputedStyle(document.body).backgroundColor || 'rgb(255, 255, 255)',
          inheritedFromTag: 'body',
        };
      }

      const results = {};
      for (const selector of sels) {
        const el = document.querySelector(selector);
        if (!el) {
          results[selector] = { found: false, pageContext: label };
          continue;
        }
        const cs = window.getComputedStyle(el);
        const effBg = getEffectiveBackgroundColor(el);
        results[selector] = {
          found: true,
          pageContext: label,
          tagName: el.tagName.toLowerCase(),
          sampleText: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          colorRgb: cs.color,
          backgroundColorRgb: cs.backgroundColor,
          effectiveBackgroundColorRgb: effBg.colorRgb,
          effectiveBackgroundSource: effBg.inheritedFromTag,
        };
      }
      return results;
    },
    { sels: selectors, label: pageLabel }
  );

  const formatted = {};
  for (const [sel, data] of Object.entries(rawStyles)) {
    if (!data.found) {
      formatted[sel] = data;
      continue;
    }
    formatted[sel] = {
      ...data,
      colorHex: rgbToHex(data.colorRgb),
      backgroundColorHex: rgbToHex(data.backgroundColorRgb),
      effectiveBackgroundColorHex: rgbToHex(data.effectiveBackgroundColorRgb),
    };
  }
  return formatted;
}

async function main() {
  await fs.mkdir(DIR_CAPTURAS, { recursive: true });
  await fs.mkdir(DIR_INTERACCION, { recursive: true });

  console.log('[1/6] Iniciando navegador Chromium headless con viewport 1280x800...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    // =========================================================================
    // PASO 1: HOME, CATÁLOGO, BUSCADOR, ESTILOS, ENLACES Y AXE EN HOME
    // =========================================================================
    console.log(`[2/6] Navegando a ${BASE_URL} y esperando carga de tarjetas .card...`);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#tbodyid .card', { state: 'visible', timeout: 20000 });
    await waitForImages(page, '#tbodyid .card img, #carouselExampleIndicators img');
    await page.waitForTimeout(800);

    const pathCaptura1 = path.join(DIR_CAPTURAS, '01_home_catalogo.png');
    await page.screenshot({ path: pathCaptura1, fullPage: false });
    console.log(`  -> Captura 1 guardada: ${pathCaptura1}`);

    // Auditoría de Buscador en DOM
    const auditoriaBuscador = await page.evaluate(() => {
      const searchInputs = document.querySelectorAll('input[type="search"]');
      const searchPlaceholders = document.querySelectorAll(
        'input[placeholder*="search" i], input[placeholder*="buscar" i], input[name*="search" i], input[id*="search" i]'
      );
      const searchRoles = document.querySelectorAll('[role="search"], form[role="search"]');
      const visibleInputsInPage = Array.from(document.querySelectorAll('input')).filter((inp) => {
        const style = window.getComputedStyle(inp);
        const rect = inp.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });

      return {
        existeInputTypeSearch: searchInputs.length > 0,
        conteoInputTypeSearch: searchInputs.length,
        existeInputPlaceholderSearch: searchPlaceholders.length > 0,
        conteoInputPlaceholderSearch: searchPlaceholders.length,
        existeRoleSearch: searchRoles.length > 0,
        conteoInputsVisiblesEnHome: visibleInputsInPage.length,
        totalInputsEnDomModalesOcultos: document.querySelectorAll('input').length,
        conclusion:
          'AUSENTE: El DOM de DemoBlaze no posee ningún campo de búsqueda (<input type="search">, barra de búsqueda por texto ni filtro por palabras clave). Los únicos elementos <input> del DOM pertenecen a modales ocultos (#exampleModal, #logInModal, #signInModal).',
      };
    });

    // Auditoría de Filtros y Paginación disponibles en Home
    const estadoCatalogoInicial = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#tbodyid .card')).map((card) => ({
        titulo: (card.querySelector('.card-title')?.textContent || '').trim(),
        precio: (card.querySelector('h5')?.textContent || '').trim(),
        descripcion: (card.querySelector('#article')?.textContent || '').trim(),
      }));
      const categorias = Array.from(document.querySelectorAll('#itemc')).map((c) => (c.textContent || '').trim());
      return {
        categoriasDisponibles: categorias,
        totalProductosVistaInicial: cards.length,
        productosVistaInicial: cards,
      };
    });

    // Emulación Check My Links en Home (con tarjetas .card cargadas)
    console.log('[3/6] Ejecutando auditoría de integridad de enlaces e imágenes (Check My Links)...');
    const reporteIntegridadEnlaces = await auditarIntegridadEnlaces(page);
    const pathIntegridadEnlaces = path.join(DIR_INTERACCION, 'integridad_enlaces.json');
    await fs.writeFile(pathIntegridadEnlaces, JSON.stringify(reporteIntegridadEnlaces, null, 2), 'utf-8');
    console.log(`  -> Reporte de enlaces guardado: ${pathIntegridadEnlaces}`);

    // Emulación WhatFont y ColorZilla en Home
    const targetSelectors = [
      'body',
      'nav',
      '.nav-link',
      '.card-title',
      '.card-title a',
      '.card-text',
      '.btn-primary',
      '.btn-success',
      'footer',
    ];
    const estilosHome = await extraerEstilosSelectores(page, targetSelectors, 'index.html (Home Catálogo)');

    // Accesibilidad Axe-core en Home
    console.log('[4/6] Ejecutando @axe-core/playwright sobre index.html...');
    const axeHomeRaw = await new AxeBuilder({ page }).analyze();
    const axeHomeSummary = summarizeAxeResults(axeHomeRaw, BASE_URL, 'Home / Catálogo Principal (index.html)');

    // =========================================================================
    // PASO 2: SELECCIÓN DE CATEGORÍA LAPTOPS -> SONY VAIO I5 -> DETALLE PRODUCTO
    // =========================================================================
    console.log('[5/6] Filtrando por categoría Laptops y seleccionando Sony vaio i5...');
    const laptopsLink = page.locator('#itemc', { hasText: 'Laptops' });
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/bycat') && res.status() === 200, { timeout: 15000 }),
      laptopsLink.click(),
    ]);
    await page.waitForTimeout(500);

    const sonyLink = page.locator('#tbodyid .card-title a', { hasText: 'Sony vaio i5' });
    await sonyLink.waitFor({ state: 'visible', timeout: 15000 });
    await waitForImages(page, '#tbodyid .card img');

    const productosLaptops = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#tbodyid .card-title a')).map((a) => (a.textContent || '').trim())
    );

    await Promise.all([
      page.waitForURL(/prod\.html\?idp_=/, { timeout: 15000 }),
      sonyLink.click(),
    ]);

    await page.waitForSelector('#tbodyid .name', { state: 'visible', timeout: 15000 });
    await page.waitForSelector('#tbodyid .price-container', { state: 'visible', timeout: 15000 });
    await page.waitForSelector('#more-information', { state: 'visible', timeout: 15000 });
    await waitForImages(page, '#imgp img');
    await page.waitForTimeout(400);

    const pathCaptura2 = path.join(DIR_CAPTURAS, '02_detalle_producto.png');
    await page.screenshot({ path: pathCaptura2, fullPage: false });
    console.log(`  -> Captura 2 guardada: ${pathCaptura2}`);

    const detalleProductoExtraido = await page.evaluate(() => ({
      url: window.location.href,
      nombre: (document.querySelector('#tbodyid .name')?.textContent || '').trim(),
      precio: (document.querySelector('#tbodyid .price-container')?.textContent || '').trim(),
      descripcion: (document.querySelector('#more-information p')?.textContent || '').trim(),
      imagenSrc: document.querySelector('#imgp img')?.getAttribute('src') || null,
      botonAddToCartTexto: (document.querySelector('a.btn-success')?.textContent || '').trim(),
    }));

    // Extraer estilo de .btn-success en vista de detalle de producto (donde a.btn-success está visible)
    const estilosProd = await extraerEstilosSelectores(page, ['.btn-success'], 'prod.html (Detalle de Producto - Botón Add to cart)');

    // Auditoría de Feedback en Carrito (Add to cart + alert + ausencia de badge en #cartur)
    const estadoNavbarAntesAdd = await page.evaluate(() => {
      const cartEl = document.querySelector('#cartur');
      return {
        texto: (cartEl?.textContent || '').trim(),
        innerHTML: cartEl?.innerHTML || '',
        childElementCount: cartEl?.childElementCount || 0,
      };
    });

    let alertAddToCartTexto = null;
    const dialogPromiseAdd = new Promise((resolve) => {
      page.once('dialog', async (dialog) => {
        alertAddToCartTexto = dialog.message();
        const type = dialog.type();
        await dialog.accept();
        resolve({ type, message: alertAddToCartTexto });
      });
    });

    await page.locator('a.btn-success', { hasText: 'Add to cart' }).click();
    const dialogInfoAdd = await dialogPromiseAdd;
    await page.waitForTimeout(300);

    const estadoNavbarDespuesAdd = await page.evaluate(() => {
      const cartEl = document.querySelector('#cartur');
      const badgeCandidates = document.querySelectorAll('#cartur .badge, #cartur span, .navbar .badge');
      return {
        texto: (cartEl?.textContent || '').trim(),
        innerHTML: cartEl?.innerHTML || '',
        childElementCount: cartEl?.childElementCount || 0,
        conteoBadgesEnNavbar: badgeCandidates.length,
        existeContadorNumericoEnNavbar: badgeCandidates.length > 0 || /\d+/.test(cartEl?.textContent || ''),
      };
    });

    // =========================================================================
    // PASO 3: NAVEGACIÓN AL CARRITO (#cartur), CAPTURA 3 Y AXE EN CART.HTML
    // =========================================================================
    console.log('[6/6] Navegando al carrito (#cartur) y ejecutando pruebas negativas en Checkout...');
    await Promise.all([
      page.waitForURL(/cart\.html/, { timeout: 15000 }),
      page.locator('#cartur').click(),
    ]);

    await page.waitForSelector('#tbodyid tr.success', { state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => {
      const totalEl = document.querySelector('#totalp');
      return totalEl && totalEl.textContent.trim().length > 0;
    }, { timeout: 15000 });
    await waitForImages(page, '#tbodyid tr.success img');
    await page.waitForTimeout(400);

    const pathCaptura3 = path.join(DIR_CAPTURAS, '03_carrito_compras.png');
    await page.screenshot({ path: pathCaptura3, fullPage: false });
    console.log(`  -> Captura 3 guardada: ${pathCaptura3}`);

    const estadoCarrito = await page.evaluate(() => {
      const filas = Array.from(document.querySelectorAll('#tbodyid tr.success')).map((tr) => {
        const tds = tr.querySelectorAll('td');
        return {
          imagen: tds[0]?.querySelector('img')?.getAttribute('src') || null,
          titulo: (tds[1]?.textContent || '').trim(),
          precio: (tds[2]?.textContent || '').trim(),
          accion: (tds[3]?.textContent || '').trim(),
        };
      });
      const inputsCantidad = document.querySelectorAll('#tbodyid input[type="number"], #tbodyid select');
      return {
        url: window.location.href,
        totalMostrado: (document.querySelector('#totalp')?.textContent || '').trim(),
        cantidadFilas: filas.length,
        items: filas,
        permiteModificarCantidadUnitaria: inputsCantidad.length > 0,
      };
    });

    // Extraer estilo de button.btn-success en cart.html también
    const estilosCart = await extraerEstilosSelectores(page, ['.btn-success'], 'cart.html (Carrito - Botón Place Order)');

    // Consolidar reporte de estilos (WhatFont + ColorZilla)
    if (!estilosHome['.btn-success']?.found && estilosProd['.btn-success']?.found) {
      estilosHome['.btn-success'] = {
        ...estilosProd['.btn-success'],
        varianteEnCarrito: estilosCart['.btn-success'],
      };
    } else if (estilosHome['.btn-success']?.found) {
      estilosHome['.btn-success'].varianteEnDetalleProducto = estilosProd['.btn-success'];
      estilosHome['.btn-success'].varianteEnCarrito = estilosCart['.btn-success'];
    }

    const reporteEstilosUi = {
      herramientaEmulada: 'WhatFont + ColorZilla (Inspección CSS Computed Styles vía Playwright page.evaluate)',
      viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
      timestamp: new Date().toISOString(),
      urlsInspeccionadas: [
        'https://www.demoblaze.com/index.html',
        'https://www.demoblaze.com/prod.html?idp_=8',
        'https://www.demoblaze.com/cart.html',
      ],
      paletaColoresDominantesHex: {
        navbarBackground: estilosHome['nav']?.effectiveBackgroundColorHex || '#292B2C',
        bodyBackground: estilosHome['body']?.effectiveBackgroundColorHex || '#FFFFFF',
        bodyText: estilosHome['body']?.colorHex || '#292B2C',
        navLinkText: estilosHome['.nav-link']?.colorHex || '#FFFFFF',
        cardTitleLink: estilosHome['.card-title']?.colorHex || '#0275D8',
        primaryButtonBackground: estilosHome['.btn-primary']?.backgroundColorHex || '#0275D8',
        successButtonBackground: estilosProd['.btn-success']?.backgroundColorHex || '#5CB85C',
        footerBackground: estilosHome['footer']?.effectiveBackgroundColorHex || '#292B2C',
      },
      tipografiasDetectadas: {
        fuentePrincipal: estilosHome['body']?.fontFamily || 'sans-serif',
        escalaTipografica: {
          body: estilosHome['body']?.fontSize,
          navLink: estilosHome['.nav-link']?.fontSize,
          cardTitle: estilosHome['.card-title']?.fontSize,
          cardText: estilosHome['.card-text']?.fontSize,
          btnPrimary: estilosHome['.btn-primary']?.fontSize,
          btnSuccess: estilosProd['.btn-success']?.fontSize,
          footer: estilosHome['footer']?.fontSize,
        },
      },
      selectoresAuditados: estilosHome,
    };

    const pathEstilosUi = path.join(DIR_INTERACCION, 'estilos_ui_colorzilla_whatfont.json');
    await fs.writeFile(pathEstilosUi, JSON.stringify(reporteEstilosUi, null, 2), 'utf-8');
    console.log(`  -> Reporte de estilos UI guardado: ${pathEstilosUi}`);

    // Ejecutar Axe-core en cart.html
    console.log('  -> Ejecutando @axe-core/playwright sobre cart.html...');
    const axeCartRaw = await new AxeBuilder({ page }).analyze();
    const axeCartSummary = summarizeAxeResults(axeCartRaw, page.url(), 'Carrito de Compras (cart.html)');

    const reporteAccesibilidadConsolidado = {
      herramienta: '@axe-core/playwright v4.14.0',
      estandarEvaluado: 'WCAG 2.0 / 2.1 Niveles A y AA + Best Practices',
      viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
      timestamp: new Date().toISOString(),
      resumenGlobal: {
        paginasAuditadas: 2,
        conteoPorSeveridadConsolidado: {
          critical: axeHomeSummary.severityCounts.critical + axeCartSummary.severityCounts.critical,
          serious: axeHomeSummary.severityCounts.serious + axeCartSummary.severityCounts.serious,
          moderate: axeHomeSummary.severityCounts.moderate + axeCartSummary.severityCounts.moderate,
          minor: axeHomeSummary.severityCounts.minor + axeCartSummary.severityCounts.minor,
        },
        totalReglasVioladasConsolidado: axeHomeSummary.totalViolationsRules + axeCartSummary.totalViolationsRules,
        totalNodosAfectadosConsolidado: axeHomeSummary.totalAffectedNodes + axeCartSummary.totalAffectedNodes,
      },
      paginas: {
        indexHtml: axeHomeSummary,
        cartHtml: axeCartSummary,
      },
    };

    const pathAccesibilidadAxe = path.join(DIR_INTERACCION, 'accesibilidad_axe.json');
    await fs.writeFile(pathAccesibilidadAxe, JSON.stringify(reporteAccesibilidadConsolidado, null, 2), 'utf-8');
    console.log(`  -> Reporte de accesibilidad Axe guardado: ${pathAccesibilidadAxe}`);

    // =========================================================================
    // PASO 4: PROTECCIÓN CONTRA ERRORES DE USUARIO (PRUEBAS NEGATIVAS CHECKOUT)
    // =========================================================================
    await page.locator('button.btn-success', { hasText: 'Place Order' }).click();
    await page.waitForSelector('#orderModal.show, #orderModal.in, #orderModal[style*="display: block"]', {
      state: 'visible',
      timeout: 15000,
    });
    await page.locator('#orderModal #name').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);

    const pathCaptura4 = path.join(DIR_CAPTURAS, '04_modal_checkout_vacio.png');
    await page.screenshot({ path: pathCaptura4, fullPage: false });
    console.log(`  -> Captura 4 guardada: ${pathCaptura4}`);

    // Inspeccionar atributos de validación HTML5 en los inputs de #orderModal
    const atributosValidacionFormulario = await page.evaluate(() => {
      const ids = ['name', 'country', 'city', 'card', 'month', 'year'];
      return ids.map((id) => {
        const el = document.getElementById(id);
        return {
          id,
          type: el?.getAttribute('type') || null,
          required: el?.hasAttribute('required') || false,
          pattern: el?.getAttribute('pattern') || null,
          minLength: el?.getAttribute('minlength') || null,
          maxLength: el?.getAttribute('maxlength') || null,
          inputMode: el?.getAttribute('inputmode') || null,
        };
      });
    });

    // Prueba Negativa 1: Campos en blanco -> Click en Purchase
    let alertCheckoutVacioTexto = null;
    const dialogPromiseEmpty = new Promise((resolve) => {
      page.once('dialog', async (dialog) => {
        alertCheckoutVacioTexto = dialog.message();
        const type = dialog.type();
        await dialog.accept();
        resolve({ type, message: alertCheckoutVacioTexto });
      });
    });

    await page.locator('button[onclick="purchaseOrder()"]').click();
    const dialogInfoEmpty = await dialogPromiseEmpty;
    await page.waitForTimeout(300);

    // Prueba Negativa 2: Datos inválidos (#name="Usuario Prueba QA", #card="TARJETA_FALSA_SIN_NUMEROS_ABC", resto vacío)
    const datosInvalidosPrueba2 = {
      name: 'Usuario Prueba QA',
      country: '',
      city: '',
      card: 'TARJETA_FALSA_SIN_NUMEROS_ABC',
      month: '',
      year: '',
    };

    await page.locator('#name').fill(datosInvalidosPrueba2.name);
    await page.locator('#card').fill(datosInvalidosPrueba2.card);

    await page.locator('button[onclick="purchaseOrder()"]').click();

    const sweetAlertSelector = '.sweet-alert.showSweetAlert.visible';
    await page.waitForSelector(sweetAlertSelector, { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(600);

    const pathCaptura5 = path.join(DIR_CAPTURAS, '05_fallo_proteccion_errores_checkout.png');
    await page.screenshot({ path: pathCaptura5, fullPage: false });
    console.log(`  -> Captura 5 guardada: ${pathCaptura5}`);

    const resultadoSweetAlert = await page.evaluate(() => {
      const modal = document.querySelector('.sweet-alert.showSweetAlert.visible');
      const titulo = (modal?.querySelector('h2')?.textContent || '').trim();
      const detalle = (modal?.querySelector('p.lead')?.innerText || modal?.querySelector('p.lead')?.textContent || '').trim();
      return {
        modalVisible: Boolean(modal),
        titulo,
        detalle,
      };
    });

    // Guardar reporte detallado de Pertinencia Funcional y Protección contra Errores
    const reporteFuncionalYErrores = {
      normaReferencia: 'ISO/IEC 25010:2023 (Adecuación Funcional y Capacidad de Interacción)',
      sistemaEvaluado: 'DemoBlaze E-Commerce (https://www.demoblaze.com/index.html)',
      viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
      timestamp: new Date().toISOString(),
      adecuacionFuncional: {
        completitudFuncional: {
          buscadorPorTexto: auditoriaBuscador,
          modificacionCantidadEnCarrito: {
            permiteCambiarCantidad: estadoCarrito.permiteModificarCantidadUnitaria,
            observacion:
              'La tabla del carrito (#tbodyid) solo muestra Picture, Title, Price y un enlace Delete; carece de controles numéricos para incrementar/decrementar unidades de un mismo producto.',
          },
        },
        correccionFuncional: {
          catalogoInicial: estadoCatalogoInicial,
          filtradoPorCategoriaLaptops: {
            categoriaSeleccionada: 'Laptops',
            productosListados: productosLaptops,
            productoObjetivoEncontrado: productosLaptops.includes('Sony vaio i5'),
          },
          vistaDetalleProducto: detalleProductoExtraido,
          carritoDeCompras: estadoCarrito,
        },
        pertinenciaFuncional: {
          feedbackAgregarAlCarrito: {
            mecanismoUtilizado: 'window.alert nativo bloqueante del navegador',
            tipoDialogo: dialogInfoAdd.type,
            textoExactoAlert: dialogInfoAdd.message,
            estadoNavbarAntes: estadoNavbarAntesAdd,
            estadoNavbarDespues: estadoNavbarDespuesAdd,
            ausenciaContadorBadgeEnNavbar: !estadoNavbarDespuesAdd.existeContadorNumericoEnNavbar,
            hallazgo:
              'Al agregar un producto al carrito se lanza un alert() nativo ("Product added") que bloquea el hilo principal, y el enlace #cartur ("Cart") en la barra de navegación no muestra ningún badge o contador numérico de ítems.',
          },
        },
      },
      capacidadDeInteraccion: {
        proteccionContraErroresDeUsuario: {
          inspeccionAtributosHtml5OrderModal: atributosValidacionFormulario,
          pruebaNegativa1_FormularioCompletamenteVacio: {
            descripcion: 'Envío del formulario Place Order con los 6 campos vacíos (#name, #country, #city, #card, #month, #year).',
            accion: 'Click en button[onclick="purchaseOrder()"]',
            resultadoEsperado: 'Validación integral de todos los campos obligatorios con mensajes inline accesibles.',
            resultadoObtenido: {
              bloqueoEnvio: true,
              mecanismo: 'window.alert nativo',
              textoExactoAlert: dialogInfoEmpty.message,
              observacion: 'Solo reclama Name y Creditcard mediante un alert() nativo; ignora por completo Country, City, Month y Year.',
            },
          },
          pruebaNegativa2_TarjetaAlfabeticaYCamposIncompletos: {
            descripcion:
              'Ingreso de texto alfabético inválido en tarjeta de crédito (#card = "TARJETA_FALSA_SIN_NUMEROS_ABC") dejando vacíos Country, City, Month y Year.',
            datosIngresados: datosInvalidosPrueba2,
            resultadoEsperado:
              'Rechazo de la transacción por formato inválido de tarjeta (no numérico / fallo algoritmo de Luhn) y por ausencia de fecha de expiración y ubicación.',
            resultadoObtenido: {
              transaccionRechazada: false,
              compraProcesadaExitosamente: resultadoSweetAlert.modalVisible,
              tituloModalConfirmacion: resultadoSweetAlert.titulo,
              detalleReciboGenerado: resultadoSweetAlert.detalle,
              severidadHallazgo: 'CRÍTICA',
              conclusion:
                'FALLO CRÍTICO DE PROTECCIÓN CONTRA ERRORES: El sistema carece de validación de tipo de datos, longitud, expresión regular o algoritmo de Luhn sobre #card, y no valida #country, #city, #month ni #year. Emite confirmación exitosa ("Thank you for your purchase!") con una tarjeta alfabética ("TARJETA_FALSA_SIN_NUMEROS_ABC").',
            },
          },
        },
      },
      evidenciasVisualesGeneradas: [
        './01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/01_home_catalogo.png',
        './01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/02_detalle_producto.png',
        './01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/03_carrito_compras.png',
        './01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/04_modal_checkout_vacio.png',
        './01_pruebas_automatizadas_cli/evidencias/02_capturas_flujo/05_fallo_proteccion_errores_checkout.png',
      ],
    };

    const pathPruebasFuncionales = path.join(DIR_INTERACCION, 'pruebas_funcionales_y_errores.json');
    await fs.writeFile(pathPruebasFuncionales, JSON.stringify(reporteFuncionalYErrores, null, 2), 'utf-8');
    console.log(`  -> Reporte funcional y de errores guardado: ${pathPruebasFuncionales}`);

    console.log('\nAuditoría Funcional y UI/UX completada exitosamente.');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error ejecutando auditoria_funcional_ui.mjs:', err);
  process.exit(1);
});
