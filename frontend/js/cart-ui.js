// ---------- Cart UI rendering & quantity adjustments ----------
window.checkoutAddress = null;
window.isBuyNow = new URLSearchParams(window.location.search).get("checkout") === "buy_now";

const cartSubtotal = (cart) => cart.reduce((s, i) => s + i.price * i.qty, 0);

async function fetchCartItems() {
  const user = await getUser();
  return user ? api(`/cart?temp=${window.isBuyNow}`) : getCart();
}

async function changeQty(id, delta) {
  const user = await getUser();
  if (user) {
    try {
      const cart = await fetchCartItems();
      const item = cart.find(i => i.id === id);
      if (!item) return;
      const newQty = item.qty + delta;
      if (newQty <= 0) await api(`/cart/${id}?temp=${window.isBuyNow}`, { method: "DELETE" });
      else await api(`/cart/${id}?temp=${window.isBuyNow}`, { method: "PUT", body: JSON.stringify({ qty: newQty }) });
      resetCheckoutState(); await renderCart();
    } catch (e) { showToast(e.message); }
  } else {
    let cart = getCart(); const item = cart.find(i => i.id === id); if (!item) return;
    item.qty += delta; if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart(cart); resetCheckoutState(); renderCart();
  }
}

async function removeItem(id) {
  const user = await getUser();
  if (user) {
    try {
      await api(`/cart/${id}?temp=${window.isBuyNow}`, { method: "DELETE" });
      resetCheckoutState(); await renderCart();
    } catch (e) { showToast(e.message); }
  } else {
    let cart = getCart(); cart = cart.filter(i => i.id !== id);
    saveCart(cart); resetCheckoutState(); renderCart();
  }
}

function resetCheckoutState() {
  window.checkoutAddress = null;
  const payBtn = document.getElementById("btn-pay");
  if (payBtn) payBtn.classList.add("hidden");
  showCartSection();
}

function showCartSection() {
  document.getElementById("address-section").classList.add("hidden");
  document.getElementById("cart-items-section").classList.remove("hidden");
}

async function renderCart() {
  const wrap = document.getElementById("cart-items-list");
  const actionsBlock = document.getElementById("cart-items-actions");
  const summaryItemsWrap = document.getElementById("summary-items-list");
  if (!wrap) return;
  const cart = await fetchCartItems();
  if (cart.length === 0) {
    wrap.innerHTML = `<p class="empty-msg">Your shopping bag is empty. <a href="../index.html">Shop products →</a></p>`;
    actionsBlock.classList.add("hidden");
    summaryItemsWrap.innerHTML = `<p class="empty-msg" style="font-size:0.85rem; padding:12px 0;">No items</p>`;
    document.getElementById("summary-subtotal").textContent = "₹0";
    document.getElementById("summary-shipping").textContent = "Free";
    document.getElementById("summary-total").textContent = "₹0";
    return;
  }
  wrap.innerHTML = cart.map(i => `
    <div class="cart-item-premium">
      <div class="cip-img-wrap">${i.emoji || "🕉️"}</div>
      <div class="cip-details">
        <strong class="cip-name">${i.name}</strong>
        <span class="cip-desc">${i.description || "Purified & Vedic Consecrated"}</span>
        <div class="cip-qty-box">
          <button onclick="changeQty(${i.id}, -1)">−</button><span>${i.qty}</span><button onclick="changeQty(${i.id}, 1)">+</button>
        </div>
      </div>
      <div class="cip-right">
        <strong class="cip-price">${formatINR(i.price * i.qty)}</strong>
        <button class="cip-remove-btn" onclick="removeItem(${i.id})">🗑️</button>
      </div>
    </div>`).join("");

  summaryItemsWrap.innerHTML = cart.map(i => `
    <div class="summary-item-row"><span>${i.name} × ${i.qty}</span><span>${formatINR(i.price * i.qty)}</span></div>`).join("");

  const subtotal = cartSubtotal(cart);
  const shipping = subtotal >= 99900 ? 0 : 10000;
  document.getElementById("summary-subtotal").textContent = formatINR(subtotal);
  document.getElementById("summary-shipping").textContent = shipping > 0 ? formatINR(shipping) : "Free";
  document.getElementById("summary-total").textContent = formatINR(subtotal + shipping);
  actionsBlock.classList.remove("hidden");
}
document.addEventListener("DOMContentLoaded", renderCart);
