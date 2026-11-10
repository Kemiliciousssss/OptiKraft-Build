/* ==========================================================================
   OPTIKRAFT EXTERNAL JAVASCRIPT FILE (script.js)
   Used by index.html, products.html, cart.html and checkout.html
   Linked via <script src="script.js" defer></script>
   ========================================================================== */

/* ---------- Settings (edit these) ---------- */
var CART_KEY = "optikraftCart";
var WISHLIST_KEY = "optikraftWishlist";
var SHIPPING_FLAT_MYR = 15;          // shipping fee for small orders
var FREE_SHIPPING_OVER_MYR = 500;    // orders from this amount ship free
var MAX_QTY = 99;

/* ---------- Storage helpers (the cart survives page changes and reloads) ---------- */
function loadStored(key) {
  try {
    var raw = localStorage.getItem(key);
    var data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function saveStored(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

function loadCartItems() {
  return loadStored(CART_KEY).filter(function (it) {
    return it &&
      typeof it.name === "string" &&
      typeof it.img === "string" &&
      typeof it.price === "number" && isFinite(it.price) && it.price >= 0 &&
      Math.floor(it.qty) === it.qty && it.qty >= 1;
  });
}

/* ---------- Global state ---------- */
var cartItems = loadCartItems();           // [{ name, price (MYR), img, qty }]
var cartCount = 0;                         // total quantity of items
var cartSubtotalMYR = 0;                   // always stored in MYR

var wishlist = loadStored(WISHLIST_KEY).filter(function (n) { return typeof n === "string"; });
var wishlistCount = wishlist.length;       // used by the inline wishlist alert in index.html

var orderPlaced = false;
var cartCloseTimer = null;

// Approximate fixed rates (index.html only; cart and checkout always use MYR).
var currencies = {
  MYR: { rate: 1,    symbol: "RM " },
  USD: { rate: 0.23, symbol: "$" },
  SGD: { rate: 0.30, symbol: "SGD " }
};
var currentCurrency = "MYR";

/* ---------- Small helpers ---------- */
function formatMoney(amountMYR) {
  var c = currencies[currentCurrency] || currencies.MYR;
  var value = (amountMYR * c.rate).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return c.symbol + value;
}

function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setText(id, text) {
  var node = document.getElementById(id);
  if (node) node.textContent = text;
}

function show(id, visible) {
  var node = document.getElementById(id);
  if (node) node.style.display = visible ? "" : "none";
}

function updateTotals() {
  cartCount = 0;
  cartSubtotalMYR = 0;
  for (var i = 0; i < cartItems.length; i++) {
    cartCount += cartItems[i].qty;                               // += operator
    cartSubtotalMYR += cartItems[i].price * cartItems[i].qty;
  }
}

function getShipping(subtotalMYR) {
  if (subtotalMYR <= 0) return 0;
  return subtotalMYR >= FREE_SHIPPING_OVER_MYR ? 0 : SHIPPING_FLAT_MYR;
}

/* 1. Toggle Mobile Navigation Menu */
function toggleMobileMenu() {
  var nav = document.getElementById("mainNav");
  if (nav) nav.classList.toggle("show");
}

/* 2. Header cart dropdown (open / close / toggle) */
function openCartDropdown() {
  var dropdown = document.getElementById("cartDropdown");
  if (dropdown) dropdown.classList.add("open");
}

function closeCartDropdown() {
  var dropdown = document.getElementById("cartDropdown");
  if (dropdown) dropdown.classList.remove("open");
}

function toggleCartDropdown() {
  var dropdown = document.getElementById("cartDropdown");
  if (dropdown) dropdown.classList.toggle("open");
}

/* 3. Draw the header cart (list, badge, summary, subtotal) */
function renderCart() {
  updateTotals();

  var listEl = document.getElementById("cartItemsList");
  if (listEl) {
    listEl.textContent = "";

    if (cartItems.length === 0) {
      listEl.appendChild(el("p", "cart-empty", "Your cart is empty."));
    }

    cartItems.forEach(function (item) {
      var widget = el("div", "product-widget");

      var img = el("img");
      img.src = item.img;
      img.alt = item.name;
      img.width = 55;
      img.height = 55;

      var body = el("div", "product-body");

      var h3 = el("h3");
      var link = el("a", null, item.name);
      link.href = "products.html";
      h3.appendChild(link);

      var h4 = el("h4");
      h4.appendChild(el("span", null, item.qty + "x "));
      h4.appendChild(document.createTextNode(formatMoney(item.price)));

      body.appendChild(h3);
      body.appendChild(h4);
      widget.appendChild(img);
      widget.appendChild(body);
      listEl.appendChild(widget);
    });
  }

  setText("cartQtyBadge", cartCount);
  setText("cartSummaryCount", cartCount + " Item(s) selected");
  setText("cartSubTotalText", "SUBTOTAL: " + formatMoney(cartSubtotalMYR));   // capital T matches the HTML
}

/* 4. Fill a Subtotal / Shipping / Total block (used on cart and checkout pages) */
function fillSummary(subId, shipId, totalId, hintId) {
  var sub = cartSubtotalMYR;
  var ship = getShipping(sub);

  setText(subId, formatMoney(sub));
  setText(shipId, (ship === 0 && sub > 0) ? "FREE" : formatMoney(ship));
  setText(totalId, formatMoney(sub + ship));

  if (hintId) {
    if (sub > 0 && ship > 0) {
      setText(hintId, "Add " + formatMoney(FREE_SHIPPING_OVER_MYR - sub) + " more for free shipping.");
    } else if (sub > 0) {
      setText(hintId, "You qualify for free shipping.");
    } else {
      setText(hintId, "");
    }
  }
}

/* 5. Cart page (cart.html) */
function renderCartPage() {
  var body = document.getElementById("cartPageItems");
  if (!body) return;                      // not on the cart page

  updateTotals();
  var hasItems = cartItems.length > 0;
  show("cartPageContent", hasItems);
  show("cartPageEmpty", !hasItems);

  body.textContent = "";

  cartItems.forEach(function (item, index) {
    var tr = el("tr");

    // Product
    var tdProduct = el("td");
    var wrap = el("div", "cart-product");
    var img = el("img");
    img.src = item.img;
    img.alt = item.name;
    img.width = 64;
    img.height = 64;
    var link = el("a", null, item.name);
    link.href = "products.html";
    wrap.appendChild(img);
    wrap.appendChild(link);
    tdProduct.appendChild(wrap);

    // Unit price
    var tdPrice = el("td", null, formatMoney(item.price));

    // Quantity controls
    var tdQty = el("td");
    var qc = el("div", "qty-control");
    var minus = el("button", null, "\u2212");
    minus.type = "button";
    minus.setAttribute("aria-label", "Decrease quantity of " + item.name);
    minus.addEventListener("click", function () { changeQty(index, -1); });
    var qtyText = el("span", null, String(item.qty));
    var plus = el("button", null, "+");
    plus.type = "button";
    plus.setAttribute("aria-label", "Increase quantity of " + item.name);
    plus.addEventListener("click", function () { changeQty(index, 1); });
    qc.appendChild(minus);
    qc.appendChild(qtyText);
    qc.appendChild(plus);
    tdQty.appendChild(qc);

    // Line total
    var tdTotal = el("td");
    tdTotal.appendChild(el("strong", null, formatMoney(item.price * item.qty)));

    // Remove
    var tdRemove = el("td");
    var removeBtn = el("button", "remove-btn", "Remove");
    removeBtn.type = "button";
    removeBtn.setAttribute("aria-label", "Remove " + item.name + " from cart");
    removeBtn.addEventListener("click", function () { removeItem(index); });
    tdRemove.appendChild(removeBtn);

    tr.appendChild(tdProduct);
    tr.appendChild(tdPrice);
    tr.appendChild(tdQty);
    tr.appendChild(tdTotal);
    tr.appendChild(tdRemove);
    body.appendChild(tr);
  });

  fillSummary("cartSubtotal", "cartShipping", "cartTotal", "shippingHint");
}

/* 6. Checkout page (checkout.html): order summary */
function renderCheckoutSummary() {
  var list = document.getElementById("checkoutItems");
  if (!list || orderPlaced) return;       // not on checkout, or the order is done

  updateTotals();
  var hasItems = cartItems.length > 0;
  show("checkoutContent", hasItems);
  show("checkoutEmpty", !hasItems);

  list.textContent = "";
  cartItems.forEach(function (item) {
    var row = el("div", "summary-row");
    row.appendChild(el("span", null, item.name + " \u00D7 " + item.qty));
    row.appendChild(el("strong", null, formatMoney(item.price * item.qty)));
    list.appendChild(row);
  });

  fillSummary("coSubtotal", "coShipping", "coTotal", "coHint");
}

/* 7. Place the order (demo: no real payment is processed) */
function placeOrder(e) {
  e.preventDefault();
  if (cartItems.length === 0) return false;

  var form = e.target;
  updateTotals();
  var total = cartSubtotalMYR + getShipping(cartSubtotalMYR);
  var orderId = "OK-" + Date.now().toString(36).toUpperCase();

  setText("orderId", orderId);
  setText("orderName", form.elements["fullName"].value.trim());
  setText("orderEmail", form.elements["email"].value.trim());
  setText("orderMethod", form.elements["payment"].value);
  setText("orderTotal", formatMoney(total));

  orderPlaced = true;
  show("checkoutContent", false);
  show("checkoutEmpty", false);
  show("orderSuccess", true);

  cartItems = [];
  refreshCart();
  window.scrollTo(0, 0);
  return false;
}

/* 8. Cart actions */
function refreshCart() {
  saveStored(CART_KEY, cartItems);
  renderCart();
  renderCartPage();
  renderCheckoutSummary();
}

function addToCart(productName, priceMYR, imgUrl) {
  var found = false;

  // Same product already in the cart? Increase its quantity (++ operator)
  for (var i = 0; i < cartItems.length; i++) {
    if (cartItems[i].name === productName) {
      if (cartItems[i].qty < MAX_QTY) cartItems[i].qty++;
      found = true;
      break;
    }
  }

  if (!found) {
    cartItems.push({ name: productName, price: priceMYR, img: imgUrl, qty: 1 });
  }

  refreshCart();

  if (document.getElementById("cartDropdown")) {
    openCartDropdown();
    clearTimeout(cartCloseTimer);
    cartCloseTimer = setTimeout(closeCartDropdown, 3500);
  } else {
    // Pages without the dropdown (e.g. products.html) just confirm
    alert("Added '" + productName + "' to your cart.");
  }
}

function changeQty(index, delta) {
  var item = cartItems[index];
  if (!item) return;
  item.qty = Math.min(MAX_QTY, Math.max(1, item.qty + delta));
  refreshCart();
}

function removeItem(index) {
  cartItems.splice(index, 1);
  refreshCart();
}

function clearCart() {
  cartItems = [];
  refreshCart();
}

/* 9. Wishlist */
function updateWishlistBadge() {
  setText("wishlistQtyBadge", wishlistCount);
}

function addToWishlist(productName) {
  if (wishlist.indexOf(productName) !== -1) {
    alert("'" + productName + "' is already in Your Wishlist.");
    return;
  }
  wishlist.push(productName);
  wishlistCount = wishlist.length;
  saveStored(WISHLIST_KEY, wishlist);
  updateWishlistBadge();
  alert("Added '" + productName + "' to Your Wishlist!");
}

function resetWishlist() {
  wishlist = [];
  wishlistCount = 0;
  saveStored(WISHLIST_KEY, wishlist);
  updateWishlistBadge();
}

/* 10. Currency Switcher (index.html: MYR / USD / SGD) */
function switchCurrency(selectEl) {
  currentCurrency = currencies[selectEl.value] ? selectEl.value : "MYR";

  var prices = document.querySelectorAll(".js-price");
  for (var i = 0; i < prices.length; i++) {
    var baseMYR = parseFloat(prices[i].getAttribute("data-myr"));
    var oldMYR = parseFloat(prices[i].getAttribute("data-old-myr"));
    if (isNaN(baseMYR)) continue;

    prices[i].textContent = formatMoney(baseMYR) + " ";
    if (!isNaN(oldMYR)) {
      var del = document.createElement("del");
      del.className = "product-old-price";
      del.textContent = formatMoney(oldMYR);
      prices[i].appendChild(del);
    }
  }

  renderCart();
}

/* 11. Filter Product Tabs */
function filterTab(category, linkEl) {
  var links = linkEl.parentElement.parentElement.querySelectorAll("a");
  for (var i = 0; i < links.length; i++) {
    links[i].classList.remove("active");
  }
  linkEl.classList.add("active");

  var cards = document.querySelectorAll("#newProductsGrid .product");
  for (var j = 0; j < cards.length; j++) {
    var cardCat = cards[j].getAttribute("data-cat");
    cards[j].style.display = (category === "all" || cardCat === category) ? "" : "none";
  }
}

/* 12. Hot Deal Live Countdown Timer */
function startHotDealTimer() {
  var dEl = document.getElementById("cdDays");
  var hEl = document.getElementById("cdHours");
  var mEl = document.getElementById("cdMins");
  var sEl = document.getElementById("cdSecs");
  if (!dEl || !hEl || !mEl || !sEl) return;

  var KEY = "optikraftDealEnd";
  var end = NaN;
  try { end = parseInt(localStorage.getItem(KEY), 10); } catch (e) {}
  if (!end || end < Date.now()) {
    end = Date.now() + 7 * 24 * 60 * 60 * 1000;
    try { localStorage.setItem(KEY, String(end)); } catch (e) {}
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function tick() {
    var total = Math.max(0, Math.floor((end - Date.now()) / 1000));
    dEl.textContent = pad(Math.floor(total / 86400));
    hEl.textContent = pad(Math.floor((total % 86400) / 3600));
    mEl.textContent = pad(Math.floor((total % 3600) / 60));
    sEl.textContent = pad(total % 60);
  }

  tick();
  setInterval(tick, 1000);
}

/* 13. Wishlist viewer */
function showWishlist() {
  if (wishlist.length === 0) {
    alert("Your wishlist is empty.");
    return;
  }
  alert("Your Wishlist (" + wishlist.length + "):\n- " + wishlist.join("\n- "));
}

/* 14. Demo accounts (saved in THIS browser only; real logins need a secure server) */

// Set to true ONLY when the pages are served by XAMPP/PHP and handle_auth.php exists.
// While false, the forms are checked and handled in the browser.
var USE_PHP_BACKEND = false;
function usePhp() { return USE_PHP_BACKEND; }

var USERS_KEY = "optikraftUsers";
var SESSION_KEY = "optikraftSession";

// Small non-cryptographic hash so passwords are never stored as plain text (demo only)
function hashText(str) {
  var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (var i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function registerUser(name, email, password) {
  var key = email.trim().toLowerCase();
  var users = loadStored(USERS_KEY);
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === key) {
      return { ok: false, error: "An account with this email already exists." };
    }
  }
  users.push({ name: name, email: key, hash: hashText(key + ":" + password) });
  saveStored(USERS_KEY, users);
  return { ok: true };
}

function loginUser(email, password, remember) {
  var key = email.trim().toLowerCase();
  var users = loadStored(USERS_KEY);
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === key && users[i].hash === hashText(key + ":" + password)) {
      var session = JSON.stringify({ name: users[i].name, email: users[i].email });
      try {
        (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, session);
      } catch (e) {}
      return { ok: true, name: users[i].name };
    }
  }
  return { ok: false, error: "Incorrect email or password." };
}

function getSession() {
  try {
    var raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    var s = raw ? JSON.parse(raw) : null;
    return (s && typeof s.name === "string") ? s : null;
  } catch (e) {
    return null;
  }
}

function logoutUser() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
  window.location.href = "index.html";
}

// Header: "My Account" becomes "Hi, Name" + Logout, and the Login / Sign Up menu items hide
function renderAccountLinks() {
  var session = getSession();

  var guestItems = document.querySelectorAll("[data-guest-only]");
  for (var i = 0; i < guestItems.length; i++) {
    guestItems[i].style.display = session ? "none" : "";
  }

  var link = document.getElementById("accountLink");
  if (!link || !session) return;

  link.textContent = "Hi, " + session.name.split(" ")[0];
  link.setAttribute("href", "#");
  link.addEventListener("click", function (e) { e.preventDefault(); });

  if (!document.getElementById("logoutLink")) {
    var li = el("li");
    var out = el("a", null, "Logout");
    out.id = "logoutLink";
    out.href = "#";
    out.addEventListener("click", function (e) { e.preventDefault(); logoutUser(); });
    li.appendChild(out);
    link.parentElement.parentElement.appendChild(li);
  }
}

// Checkout: fill name and email for logged-in customers
function prefillCheckout() {
  var session = getSession();
  var nameField = document.getElementById("fullName");
  var emailField = document.getElementById("email");
  if (!session || !nameField || !emailField) return;
  if (!nameField.value) nameField.value = session.name;
  if (!emailField.value) emailField.value = session.email;
}

/* 15. Start-up */
function initOptiKraft() {
  var picker = document.getElementById("currencyPicker");
  if (picker) {
    switchCurrency(picker);        // also draws the header cart
  } else {
    renderCart();
  }
  renderCartPage();
  renderCheckoutSummary();
  updateWishlistBadge();

  // Remove the plain-text password the old sign-up page used to save
  try {
    ["optikraft_user", "optikraft_email", "optikraft_pass"].forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {}

  renderAccountLinks();
  prefillCheckout();

  // Click on "Your Cart" toggles the dropdown (touch screens too)
  var dropdown = document.getElementById("cartDropdown");
  if (dropdown && dropdown.parentElement) {
    var cartLink = dropdown.parentElement.querySelector("a");
    if (cartLink) {
      cartLink.addEventListener("click", function (e) {
        e.preventDefault();
        toggleCartDropdown();
      });
    }
    document.addEventListener("click", function (e) {
      if (!dropdown.parentElement.contains(e.target)) closeCartDropdown();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCartDropdown();
  });

  // Keep several open tabs in sync
  window.addEventListener("storage", function (e) {
    if (e.key === CART_KEY) {
      cartItems = loadCartItems();
      renderCart();
      renderCartPage();
      renderCheckoutSummary();
    }
  });

  startHotDealTimer();
}

window.addEventListener("DOMContentLoaded", initOptiKraft);