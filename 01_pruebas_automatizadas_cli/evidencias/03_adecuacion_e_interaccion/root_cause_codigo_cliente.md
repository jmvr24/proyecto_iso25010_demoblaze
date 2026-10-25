# Análisis de Causa Raíz en Código Fuente Cliente (Root Cause Analysis) — Insumo para el Paso 5 (ISO/IEC 25010)

**Sistema Auditado:** DemoBlaze E-Commerce (`https://www.demoblaze.com`)  
**Archivos Fuente Inspeccionados:** `index.html`, `cart.html`, `prod.html`, `js/index.js`, `js/cart.js` y `js/prod.js`  
**Propósito:** Identificar a nivel de líneas de código exactas en el frontend las causas raíz de los fallos críticos y serios detectados en el Paso 2 (Protección contra Errores de Usuario, Pertinencia Funcional/Reconocibilidad y Accesibilidad WCAG), y establecer el código refactorizado que sustenta el Plan de Acción Correctivo del Paso 5.

---

## 1. Causa Raíz 1: Vulnerabilidad Crítica en Checkout (`#orderModal` y `purchaseOrder()`)

### 1.1. Diagnóstico del Código Fuente Actual en Producción
Al inspeccionar `cart.html` (líneas 1160–1208) y `js/cart.js` (líneas 2641–2668), se identificaron cuatro defectos estructurales que explican por qué la **Prueba Negativa 2** aprobó una compra de `$790 USD` con la tarjeta alfabética `"TARJETA_FALSA_SIN_NUMEROS_ABC"` y cuatro campos vacíos:

1. **Ausencia total de restricciones declarativas HTML5 (`cart.html`):** Los 6 campos (`#name`, `#country`, `#city`, `#card`, `#month`, `#year`) están declarados como `<input type="text" class="form-control">` sin atributos `required`, `pattern`, `minlength`, `maxlength` ni `inputmode="numeric"`. Además, el `<label for="name" id="totalm">Total:</label>` reutiliza erróneamente el atributo `for="name"`, y existe un `<label id="errors" style="color:red">` que jamás es invocado desde JavaScript.
2. **Campos fantasma (Dead Inputs) en `js/cart.js`:** La función `purchaseOrder()` **únicamente lee `document.getElementById("name").value` y `document.getElementById("card").value`**. Los valores de `#country`, `#city`, `#month` y `#year` ni siquiera son referenciados en el script; son campos puramente decorativos en el DOM.
3. **Validación superficial sin expresión regular ni Algoritmo de Luhn:** La única condición en `purchaseOrder()` es `if (name == "" || creditcard == "")`. Cualquier cadena no vacía (incluso espacios en blanco o letras como `"TARJETA_FALSA_SIN_NUMEROS_ABC"`) supera el condicional, vacía el carrito mediante `deleteCart(...)` y dispara inmediatamente el modal `swal({ title: "Thank you for your purchase!", ... })` de `bootstrap-sweetalert`.
4. **Defecto adicional de fecha en el recibo (`off-by-one` en `Date.prototype.getMonth()`):** En la línea 2657 de `js/cart.js`, la fecha del comprobante se concatena como `date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear()`. Dado que `getMonth()` en JavaScript es base cero (`0 = Enero`, `9 = Octubre`), el recibo emitido en octubre reporta erróneamente el mes `9` (`Date: 24/9/2026`).

#### Código Vulnerable Actual (`cart.html` y `js/cart.js`)
```html
<!-- FRAGMENTO ACTUAL EN cart.html (Líneas 1171-1205) -->
<form>
  <label for="name" class="form-control-label" id="totalm">Total:</label>
  <div class="form-group">
    <label for="name" class="form-control-label">Name:</label>
    <input type="text" class="form-control" id="name">
  </div>
  <div class="form-group">
    <label for="country" class="form-control-label">Country:</label>
    <input type="text" class="form-control" id="country">
  </div>
  <div class="form-group">
    <label for="city" class="form-control-label">City:</label>
    <input type="text" class="form-control" id="city">
  </div>
  <div class="form-group">
    <label for="card" class="form-control-label">Credit card:</label>
    <input type="text" class="form-control" id="card">
  </div>
  <div class="form-group">
    <label for="month" class="form-control-label">Month:</label>
    <input type="text" class="form-control" id="month">
  </div>
  <div class="form-group">
    <label for="year" class="form-control-label">Year:</label>
    <input type="text" class="form-control" id="year">
  </div>
  <div class="form-group">
    <label id="errors" style="color:red" class="form-control-label"></label>
  </div>
</form>
```

```javascript
// FRAGMENTO ACTUAL EN js/cart.js (Líneas 2641-2668)
function purchaseOrder() {
  var idr = Math.floor((Math.random() * 10000000) + 1);
  var name = document.getElementById("name").value;
  var creditcard = document.getElementById("card").value;
  var date = new Date();
  // VULNERABILIDAD: Ignora #country, #city, #month y #year; no valida formato ni Luhn
  if (name == "" || creditcard == "") {
    alert("Please fill out Name and Creditcard.");
  } else {
    var token = getCookie("tokenp_");
    if (token.length > 0) {
      deleteCart(usern);
    } else {
      deleteCart(document.cookie);
    }
    swal({
      title: "Thank you for your purchase!",
      text: "Id: " + idr + "\n" + "Amount: " + total + " USD" + "\n" + "Card Number: " + creditcard + "\n" + "Name: " + name + "\n" + "Date: " + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear(),
      type: "success",
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "OK",
      closeOnConfirm: false
    }, function (isConfirm) {
        if (isConfirm) {
          location.href = 'index.html';
        }
      });
  }
}
```

### 1.2. Propuesta de Código Refactorizado (Validación HTML5 + Regex + Algoritmo de Luhn + Errores Accesibles)
Para remediar la subcaracterística de **Protección contra Errores de Usuario (ISO/IEC 25010)**:

```html
<!-- PROPUESTA REFACTORIZADA PARA cart.html -->
<form id="checkoutForm" novalidate aria-describedby="errors">
  <p class="form-control-label font-weight-bold" id="totalm" aria-live="polite">Total:</p>
  <div class="form-group">
    <label for="name" class="form-control-label">Name <span aria-hidden="true">*</span>:</label>
    <input type="text" class="form-control" id="name" name="name" required minlength="3" maxlength="80" autocomplete="cc-name">
  </div>
  <div class="form-group">
    <label for="country" class="form-control-label">Country <span aria-hidden="true">*</span>:</label>
    <input type="text" class="form-control" id="country" name="country" required minlength="2" maxlength="56" autocomplete="country-name">
  </div>
  <div class="form-group">
    <label for="city" class="form-control-label">City <span aria-hidden="true">*</span>:</label>
    <input type="text" class="form-control" id="city" name="city" required minlength="2" maxlength="60" autocomplete="address-level2">
  </div>
  <div class="form-group">
    <label for="card" class="form-control-label">Credit card (13-19 digits) <span aria-hidden="true">*</span>:</label>
    <input type="text" class="form-control" id="card" name="card" required inputmode="numeric" pattern="^\d{13,19}$" maxlength="19" autocomplete="cc-number">
  </div>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="month" class="form-control-label">Month (01-12) <span aria-hidden="true">*</span>:</label>
      <input type="text" class="form-control" id="month" name="month" required inputmode="numeric" pattern="^(0?[1-9]|1[0-2])$" maxlength="2" autocomplete="cc-exp-month">
    </div>
    <div class="form-group col-md-6">
      <label for="year" class="form-control-label">Year (YYYY) <span aria-hidden="true">*</span>:</label>
      <input type="text" class="form-control" id="year" name="year" required inputmode="numeric" pattern="^20\d{2}$" maxlength="4" autocomplete="cc-exp-year">
    </div>
  </div>
  <div id="errors" role="alert" aria-live="assertive" style="color:#B00020; font-weight:600;"></div>
</form>
```

```javascript
// PROPUESTA REFACTORIZADA PARA js/cart.js
function isValidLuhn(cardNumber) {
  if (!/^\d{13,19}$/.test(cardNumber)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0 && sum > 0;
}

function purchaseOrder() {
  const errorBox = document.getElementById("errors");
  errorBox.textContent = "";

  const name = document.getElementById("name").value.trim();
  const country = document.getElementById("country").value.trim();
  const city = document.getElementById("city").value.trim();
  const card = document.getElementById("card").value.replace(/\s+/g, "");
  const month = parseInt(document.getElementById("month").value.trim(), 10);
  const year = parseInt(document.getElementById("year").value.trim(), 10);

  if (total <= 0) {
    errorBox.textContent = "Your cart is empty. Add at least one product before placing an order.";
    return;
  }
  if (!name || !country || !city || !card || Number.isNaN(month) || Number.isNaN(year)) {
    errorBox.textContent = "All fields (Name, Country, City, Credit card, Month, and Year) are required.";
    return;
  }
  if (!/^[A-Za-zÀ-ÿ\s'.-]{3,80}$/.test(name)) {
    errorBox.textContent = "Please enter a valid full name (3-80 alphabetic characters).";
    return;
  }
  if (!isValidLuhn(card)) {
    errorBox.textContent = "Invalid credit card number. Must contain 13-19 digits and pass Luhn checksum.";
    return;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
    errorBox.textContent = "The credit card expiration date is invalid or expired.";
    return;
  }

  const idr = Math.floor((Math.random() * 10000000) + 1);
  const maskedCard = "*".repeat(card.length - 4) + card.slice(-4);
  const token = getCookie("tokenp_");
  if (token.length > 0) {
    deleteCart(usern);
  } else {
    deleteCart(document.cookie);
  }

  swal({
    title: "Thank you for your purchase!",
    text: `Id: ${idr}\nAmount: ${total} USD\nCard Number: ${maskedCard}\nName: ${name}\nDate: ${now.getDate()}/${currentMonth}/${currentYear}`,
    type: "success",
    confirmButtonColor: "#0275D8",
    confirmButtonText: "OK",
    closeOnConfirm: false
  }, function (isConfirm) {
    if (isConfirm) location.href = "index.html";
  });
}
```

---

## 2. Causa Raíz 2: Ausencia de Contador en `#cartur`, Bloqueo por `window.alert` y Problema N+1 en Carrito

### 2.1. Diagnóstico del Código Fuente Actual en Producción
1. **Uso de `window.alert("Product added")` y ausencia de badge en `#cartur` (`js/prod.js`, líneas 2843–2876):**
   En `addToCart(idp)`, tras completar el `POST` a `/addtocart`, el callback ejecuta `alert("Product added")` (o `alert("Product added.")` si hay sesión iniciada), bloqueando el hilo principal de ejecución. En ningún archivo JS (`index.js`, `prod.js`, `cart.js`) se actualiza el nodo `<a class="nav-link" id="cartur" href="cart.html">Cart</a>` con el número de productos acumulados.
2. **Enlace de carrito roto en `cart.html` (línea 1294 y `js/cart.js` líneas 2308–2312):**
   En `cart.html`, el enlace del navbar ni siquiera tiene `id="cartur"` ni `href="cart.html"`: está codificado como `<a class="nav-link" href="#" onClick="showcart()">Cart</a>`, donde `showcart()` en `js/cart.js` tiene todo su cuerpo comentado (`// location.href= ...`).
3. **Problema de rendimiento N+1 y ausencia de selector de cantidad en `js/cart.js` (líneas 2460–2508):**
   Al consultar `/viewcart`, por cada ítem del arreglo `data.Items`, `js/cart.js` dispara una petición `POST /view` independiente dentro de un bucle `forEach` y agrega una fila `<tr>` cruda sin agrupar productos repetidos ni ofrecer un `<input type="number">` para cambiar la cantidad.

#### Código Deficiente Actual (`js/prod.js` y `js/cart.js`)
```javascript
// FRAGMENTO ACTUAL EN js/prod.js (Líneas 2864-2874)
$.ajax({
  type: 'POST',
  url: API_URL + '/addtocart',
  data: JSON.stringify({ "id": guid(), "cookie": document.cookie, "prod_id": idp, "flag": false }),
  contentType: "application/json",
  success: function (data) {
    alert("Product added"); // Bloquea el hilo UI y no actualiza #cartur
  }
});
```

### 2.2. Propuesta de Código Refactorizado (Contador Reactivo en `#cartur` + Toast No Bloqueante)
```javascript
// PROPUESTA REFACTORIZADA PARA SINCRONIZAR EL BADGE DE CARRITO EN #cartur
function refreshCartBadge() {
  const token = getCookie("tokenp_");
  const payload = token.length > 0
    ? { cookie: token, flag: true }
    : { cookie: document.cookie, flag: false };

  $.ajax({
    type: "POST",
    url: API_URL + "/viewcart",
    data: JSON.stringify(payload),
    contentType: "application/json",
    success: function (data) {
      const count = Array.isArray(data?.Items) ? data.Items.length : 0;
      const cartLink = document.getElementById("cartur");
      if (cartLink) {
        cartLink.innerHTML = `Cart <span id="cart-badge" class="badge badge-pill badge-light" aria-label="${count} items in cart">${count}</span>`;
      }
    }
  });
}

function showToastNotification(message) {
  let toast = document.getElementById("qa-toast-feedback");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "qa-toast-feedback";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.style.cssText = "position:fixed;bottom:24px;right:24px;background:#1E7E34;color:#FFFFFF;padding:12px 20px;border-radius:6px;z-index:9999;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.25);";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}
```

---

## 3. Causa Raíz 3: Violaciones de Accesibilidad WCAG (`axe-core`) y Semántica HTML

### 3.1. Diagnóstico en el Código Fuente (`index.html`, `cart.html`, `js/index.js`, `js/cart.js`)

| Regla Violada (`axe-core`) | Severidad | Archivo y Línea Exacta | Causa Raíz en el Código Fuente |
| :--- | :---: | :--- | :--- |
| **`image-alt`** | **Critical** | `index.html` (L439, L559)<br>`cart.html` (L1280, L1381)<br>`js/cart.js` (L2469, L2499) | Los logos `<img width=50 height=50 src="blazemeter-favicon-512x512.png">` y las miniaturas inyectadas en el carrito `<img width=100 height=100 src="' + valew2["img"] + '">` omiten por completo el atributo `alt`. |
| **`link-name`** | **Serious** | `js/index.js` (L2198, L2334)<br>*(y L2268, L2293 en paginación)* | Las tarjetas se inyectan con `<a href="prod.html?idp_=' + articleItem.id + '"><img class="card-img-top img-fluid" src="' + articleItem.img + '" alt=""></a>`. Al definir `alt=""` vacío dentro de un enlace `<a>` que solo contiene una imagen, el enlace queda huérfano de nombre accesible en el árbol de accesibilidad. Peor aún, en las funciones de paginación `#next2` (L2268) y `#prev2` (L2293), el enlace de la imagen fue codificado como `<a href="#">` perdiendo incluso la navegación al producto. |
| **`color-contrast`** | **Serious** | `index.html` (L46, L284)<br>`cart.html` (L1069) | En el `<style>` inline: `body { color: #868688; }` hace que los precios `<h5>` y descripciones `<p id="article" class="card-text">` sobre fondo `.card` (`#FFFFFF`) tengan ratio **`3.63:1`** (`< 4.5:1`). Asimismo, `.btn-success { background-color: #34a853 !important; color: white !important; }` genera un ratio de **`3.05:1`** (`< 4.5:1`). Además, `js/index.js` repite el mismo `id="article"` y `id="itemc"` en múltiples nodos del DOM. |
| **`landmark-one-main`**<br>**`page-has-heading-one`**<br>**`region`** | **Moderate** | `index.html` (L500–564)<br>`cart.html` (L1315–1386) | Ninguna de las páginas utiliza la etiqueta semántica `<main>`, ni posee un encabezado `<h1>`, y el bloque `#footc` está fuera del `<footer>` semántico. |
| **Atributos ARIA rotos en Modales y Formularios** | **Moderada / Seria** | `index.html` (L315, L388, L410)<br>`cart.html` (L1248) | En `#exampleModal` ambos `<label>` apuntan a `for="recipient-name"`. En `#logInModal`, `for="log-name"` y `for="log-pass"` no coinciden con `id="loginusername"` e `id="loginpassword"`. En `cart.html` (L1248), `#videoModal` copia por error `aria-labelledby="logInModalLabel"` e `id="logInModalLabel"`. |

### 3.2. Comparativa de Refactorización DOM y CSS (`js/index.js`, `index.html` y `cart.html`)

#### Código Deficiente Actual en `js/index.js` (Línea 2198) y CSS (`index.html`, Líneas 43–48 y 283–287)
```javascript
// INYECCIÓN ACTUAL DE TARJETAS EN js/index.js (Línea 2198)
$('#tbodyid').append(
  '<div class="col-lg-4 col-md-6 mb-4">' +
    '<div class="card h-100">' +
      '<a href="prod.html?idp_=' + articleItem.id + '">' +
        '<img class="card-img-top img-fluid" src="' + articleItem.img + '" alt="">' + // Violación link-name + CLS por falta de width/height
      '</a>' +
      '<div class="card-block">' +
        '<h4 class="card-title">' +
          '<a href="prod.html?idp_=' + articleItem.id + '" class="hrefch">' + articleItem.title + '</a>' +
        '</h4>' +
        '<h5>$' + articleItem.price + '</h5>' + // Violación color-contrast (#868688 sobre #FFFFFF = 3.63:1)
        '<p id="article" class="card-text">' + articleItem.desc + ' </p>' + // ID duplicado #article + bajo contraste
      '</div>' +
    '</div>' +
  '</div>'
);
```

#### Propuesta de Código Refactorizado (Cumplimiento WCAG 2.1 AA + Prevención de CLS)
```css
/* CORRECCIÓN DE CONTRASTE CROMÁTICO WCAG 2.1 AA (Ratio >= 4.5:1) */
body {
  font-size: 11pt;
  color: #4A4A4F; /* Ratio 8.75:1 sobre #FFFFFF (antes #868688 con 3.63:1) */
  background-color: #FAFCFF;
}

.card-title a, .table a {
  color: #0056B3; /* Ratio 7.25:1 sobre #FFFFFF y 6.30:1 sobre #F2F2F2 (antes #0275D8 con 4.13:1) */
}

.btn-success {
  background-color: #1E7E34 !important; /* Ratio 5.14:1 con texto #FFFFFF (antes #34A853 con 3.05:1) */
  border-color: #1C7430 !important;
  color: #FFFFFF !important;
}
```

```javascript
// RENDERIZADO ACCESIBLE DE TARJETAS EN js/index.js (Sin IDs duplicados, con alt descriptivo y dimensiones explícitas)
$('#tbodyid').append(`
  <div class="col-lg-4 col-md-6 mb-4">
    <article class="card h-100" aria-labelledby="prod-title-${articleItem.id}">
      <a href="prod.html?idp_=${articleItem.id}" aria-label="View details for ${articleItem.title}">
        <img class="card-img-top img-fluid"
             src="${articleItem.img}"
             alt="${articleItem.title}"
             width="400"
             height="225"
             loading="lazy">
      </a>
      <div class="card-block">
        <h2 class="card-title h4" id="prod-title-${articleItem.id}">
          <a href="prod.html?idp_=${articleItem.id}" class="hrefch">${articleItem.title}</a>
        </h2>
        <p class="price-tag font-weight-bold">$${articleItem.price}</p>
        <p class="card-text article-desc">${articleItem.desc}</p>
      </div>
    </article>
  </div>
`);
```
