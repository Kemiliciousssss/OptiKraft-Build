var CART_KEY = "optikraftCart";
var WISHLIST_KEY = "optikraftWishlist";
var SHIPPING_FLAT_MYR = 15;
var FREE_SHIPPING_OVER_MYR = 500;
var MAX_QTY = 99;

var CATALOG_PRODUCTS = {
  "OptiKraft X1 Mirrorless Body": {
    category: "Cameras",
    price: 6499,
    img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=200&q=80"
  },
  "OptiKraft Pro Cinema Rig": {
    category: "Cameras",
    price: 7850,
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80"
  },
  "MK-IV 35mm CMOS Sensor Unit": {
    category: "OEM Parts",
    price: 1450,
    img: "https://i.ebayimg.com/images/g/ep8AAOSwtEZdDGCz/s-l1200.jpg"
  },
  "Carbon Shutter Blade Unit": {
    category: "OEM Parts",
    price: 420,
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80"
  },
  "CNC Titanium E-Mount Bayonet Ring": {
    category: "OEM Parts",
    price: 195,
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80"
  },
  "Mainboard LCD Flex Ribbon Cable": {
    category: "OEM Parts",
    price: 140,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=200&q=80"
  },
  "KraftGlass 50mm f/1.2 Prime": {
    category: "Lenses & Rigs",
    price: 3290,
    img: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=200&q=80"
  },
  "KraftGlass 35mm f/1.4 Cine Lens": {
    category: "Lenses & Rigs",
    price: 2890,
    img: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=200&q=80"
  }
};

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

var cartItems = loadCartItems();
var cartCount = 0;
var cartSubtotalMYR = 0;

var wishlist = loadStored(WISHLIST_KEY).filter(function (n) { return typeof n === "string"; });
var wishlistCount = wishlist.length;

var orderPlaced = false;
var cartCloseTimer = null;

var currencies = {
  MYR: { rate: 1,    symbol: "RM " },
  USD: { rate: 0.23, symbol: "$" },
  SGD: { rate: 0.30, symbol: "SGD " }
};
var currentCurrency = "MYR";

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
    cartCount += cartItems[i].qty;
    cartSubtotalMYR += cartItems[i].price * cartItems[i].qty;
  }
}

function getShipping(subtotalMYR) {
  if (subtotalMYR <= 0) return 0;
  return subtotalMYR >= FREE_SHIPPING_OVER_MYR ? 0 : SHIPPING_FLAT_MYR;
}

function toggleMobileMenu() {
  var nav = document.getElementById("mainNav");
  if (nav) nav.classList.toggle("show");
}

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
  setText("cartSubTotalText", "SUBTOTAL: " + formatMoney(cartSubtotalMYR));
}

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

function renderCartPage() {
  var body = document.getElementById("cartPageItems");
  if (!body) return;

  updateTotals();
  var hasItems = cartItems.length > 0;
  show("cartPageContent", hasItems);
  show("cartPageEmpty", !hasItems);

  body.textContent = "";

  cartItems.forEach(function (item, index) {
    var tr = el("tr");

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

    var tdPrice = el("td", null, formatMoney(item.price));

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

    var tdTotal = el("td");
    tdTotal.appendChild(el("strong", null, formatMoney(item.price * item.qty)));

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

function renderCheckoutSummary() {
  var list = document.getElementById("checkoutItems");
  if (!list || orderPlaced) return;

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

function refreshCart() {
  saveStored(CART_KEY, cartItems);
  renderCart();
  renderCartPage();
  renderCheckoutSummary();
}

function pushItemToCartArray(productName, priceMYR, imgUrl) {
  var found = false;
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
}

function addToCart(productName, priceMYR, imgUrl) {
  pushItemToCartArray(productName, priceMYR, imgUrl);
  refreshCart();

  if (document.getElementById("cartDropdown")) {
    openCartDropdown();
    clearTimeout(cartCloseTimer);
    cartCloseTimer = setTimeout(closeCartDropdown, 3500);
  } else {
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

function updateWishlistBadge() {
  wishlistCount = wishlist.length;
  setText("wishlistQtyBadge", wishlistCount);
}

function renderWishlistPage() {
  var rowsEl = document.getElementById("wishlistRows");
  if (!rowsEl) return;

  var count = wishlist.length;
  setText("wlCount", count + (count === 1 ? " ITEM" : " ITEMS"));
  show("wishlistToolbar", count > 0);
  show("wishlistRows", count > 0);
  show("wishlistEmpty", count === 0);

  rowsEl.textContent = "";
  var wishlistTotalMYR = 0;

  wishlist.forEach(function (productName, index) {
    var info = CATALOG_PRODUCTS[productName] || {
      category: "Hardware",
      price: 0,
      img: "OptiKraft-Logo.jpeg"
    };

    wishlistTotalMYR += info.price;

    var row = el("div", "wl-item card-box");

    var left = el("div", "cart-product");
    var img = el("img");
    img.src = info.img;
    img.alt = productName;
    img.width = 72;
    img.height = 72;

    var meta = el("div");
    var cat = el("p", "widget-cat", info.category.toUpperCase());
    var title = el("a", null, productName);
    title.href = "products.html";
    var price = el("p", "wl-price", info.price > 0 ? formatMoney(info.price) : "View in Catalog");
    meta.appendChild(cat);
    meta.appendChild(title);
    meta.appendChild(price);

    left.appendChild(img);
    left.appendChild(meta);

    var actions = el("div", "wl-actions");
    if (info.price > 0) {
      var moveBtn = el("button", "primary-btn btn-sm", "Move to Cart");
      moveBtn.type = "button";
      moveBtn.addEventListener("click", function () {
        moveWishlistItemToCart(index);
      });
      actions.appendChild(moveBtn);

      var addBtn = el("button", "btn-outline btn-sm", "Add to Cart");
      addBtn.type = "button";
      addBtn.addEventListener("click", function () {
        addToCart(productName, info.price, info.img);
      });
      actions.appendChild(addBtn);
    }

    var removeBtn = el("button", "remove-btn", "Remove");
    removeBtn.type = "button";
    removeBtn.addEventListener("click", function () {
      removeWishlistItem(index);
    });
    actions.appendChild(removeBtn);

    row.appendChild(left);
    row.appendChild(actions);
    rowsEl.appendChild(row);
  });

  setText("wlTotalValue", formatMoney(wishlistTotalMYR));
}

function removeWishlistItem(index) {
  wishlist.splice(index, 1);
  saveStored(WISHLIST_KEY, wishlist);
  updateWishlistBadge();
  renderWishlistPage();
}

function moveWishlistItemToCart(index) {
  var productName = wishlist[index];
  if (!productName) return;
  var info = CATALOG_PRODUCTS[productName];
  if (info && info.price > 0) {
    pushItemToCartArray(productName, info.price, info.img);
    refreshCart();
  }
  wishlist.splice(index, 1);
  saveStored(WISHLIST_KEY, wishlist);
  updateWishlistBadge();
  renderWishlistPage();
  if (document.getElementById("cartDropdown")) {
    openCartDropdown();
    clearTimeout(cartCloseTimer);
    cartCloseTimer = setTimeout(closeCartDropdown, 3500);
  }
}

function moveAllWishlistToCart() {
  if (wishlist.length === 0) return;
  var movedCount = 0;

  for (var i = 0; i < wishlist.length; i++) {
    var productName = wishlist[i];
    var info = CATALOG_PRODUCTS[productName];
    if (info && info.price > 0) {
      pushItemToCartArray(productName, info.price, info.img);
      movedCount++;
    }
  }

  wishlist = [];
  saveStored(WISHLIST_KEY, wishlist);
  updateWishlistBadge();
  refreshCart();
  renderWishlistPage();

  if (movedCount > 0 && document.getElementById("cartDropdown")) {
    openCartDropdown();
    clearTimeout(cartCloseTimer);
    cartCloseTimer = setTimeout(closeCartDropdown, 3500);
  }
}

function confirmClearWishlist() {
  if (wishlist.length === 0) return;
  if (confirm("Remove all items from your wishlist?")) {
    resetWishlist();
  }
}

function addToWishlist(productName) {
  if (wishlist.indexOf(productName) !== -1) {
    window.location.href = "wishlist.html";
    return;
  }
  wishlist.push(productName);
  saveStored(WISHLIST_KEY, wishlist);
  updateWishlistBadge();
  renderWishlistPage();
  alert("Added '" + productName + "' to Your Wishlist!");
}

function resetWishlist() {
  wishlist = [];
  saveStored(WISHLIST_KEY, wishlist);
  updateWishlistBadge();
  renderWishlistPage();
}

function showWishlist() {
  window.location.href = "wishlist.html";
}

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
  renderWishlistPage();
}

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

var USE_PHP_BACKEND = false;
function usePhp() { return USE_PHP_BACKEND; }

var USERS_KEY = "optikraftUsers";
var SESSION_KEY = "optikraftSession";

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

function prefillCheckout() {
  var session = getSession();
  var nameField = document.getElementById("fullName");
  var emailField = document.getElementById("email");
  if (!session || !nameField || !emailField) return;
  if (!nameField.value) nameField.value = session.name;
  if (!emailField.value) emailField.value = session.email;
}

function initOptiKraft() {
  var picker = document.getElementById("currencyPicker");
  if (picker) {
    switchCurrency(picker);
  } else {
    renderCart();
  }
  renderCartPage();
  renderCheckoutSummary();
  updateWishlistBadge();
  renderWishlistPage();

  try {
    ["optikraft_user", "optikraft_email", "optikraft_pass"].forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {}

  renderAccountLinks();
  prefillCheckout();

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

  window.addEventListener("storage", function (e) {
    if (e.key === CART_KEY) {
      cartItems = loadCartItems();
      renderCart();
      renderCartPage();
      renderCheckoutSummary();
    }
    if (e.key === WISHLIST_KEY) {
      wishlist = loadStored(WISHLIST_KEY).filter(function (n) { return typeof n === "string"; });
      updateWishlistBadge();
      renderWishlistPage();
    }
  });

  startHotDealTimer();
}

window.addEventListener("DOMContentLoaded", initOptiKraft);