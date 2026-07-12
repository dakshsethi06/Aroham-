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
  document.getElementById("payment-section").classList.add("hidden");
  document.getElementById("delivering-to-card").classList.add("hidden");
  document.getElementById("cart-items-section").classList.remove("hidden");
  
  // Hide pay button and show cart actions
  const btnPay = document.getElementById("btn-pay");
  if (btnPay) btnPay.classList.add("hidden");
  const cartActions = document.getElementById("cart-items-actions");
  if (cartActions) cartActions.classList.remove("hidden");
  
  // Set breadcrumbs & titles
  document.getElementById("cart-breadcrumb-active").textContent = "Your Cart";
  document.getElementById("cart-page-title").textContent = "Your Sacred Selections";
  document.getElementById("cart-page-subtitle").textContent = "You're one step closer to bringing positive energy and harmony into your life.";
  
  // Update step indicators (reset all three)
  const s1 = document.getElementById("step-1-badge").querySelector(".step-num");
  const s2 = document.getElementById("step-2-badge").querySelector(".step-num");
  const s3 = document.getElementById("step-3-badge").querySelector(".step-num");
  if (s1) { s1.style.background = "var(--maroon)"; s1.textContent = "1"; s1.style.color = "#fff"; }
  if (s2) { s2.style.background = "var(--line)"; s2.textContent = "2"; s2.style.color = "var(--muted)"; }
  if (s3) { s3.style.background = "var(--line)"; s3.textContent = "3"; s3.style.color = "var(--muted)"; }
}

async function addFrequentItem(id, name, price, emoji) {
  const user = await getUser();
  const product = { id, name, price, emoji, description: "Frequently bought together product recommendation" };
  if (user) {
    try {
      await api("/cart", { method: "POST", body: JSON.stringify({ productId: id, qty: 1, customItem: product }) });
      showToast(name + " added to cart 🛒");
      await renderCart();
      if (window.updateCartBadge) window.updateCartBadge();
    } catch (e) { showToast(e.message); }
  } else {
    const cart = getCart();
    const found = cart.find(i => i.id === id);
    if (found) found.qty += 1;
    else cart.push({ id, name, price, emoji, qty: 1, description: product.description });
    saveCart(cart);
    showToast(name + " added to cart 🛒");
    await renderCart();
    if (window.updateCartBadge) window.updateCartBadge();
  }
}

async function renderCart() {
  const wrap = document.getElementById("cart-items-list");
  const actionsBlock = document.getElementById("cart-items-actions");
  const summaryItemsWrap = document.getElementById("summary-items-list");
  const freqBlock = document.getElementById("frequently-bought-section");
  const itemsCountText = document.getElementById("summary-items-count");
  if (!wrap) return;

  const cart = await fetchCartItems();
  
  // Update total items text
  const totalItemsCount = cart.reduce((n, i) => n + i.qty, 0);
  if (itemsCountText) {
    itemsCountText.textContent = `${totalItemsCount} item${totalItemsCount !== 1 ? 's' : ''}`;
  }

  if (cart.length === 0) {
    wrap.innerHTML = `<p class="empty-msg" style="padding: 60px 0; font-size:1.1rem;">Your shopping bag is empty. <br/><a href="../index.html" style="display:inline-block; margin-top:12px; color:var(--maroon); font-weight:600;">Shop products &rarr;</a></p>`;
    actionsBlock.classList.add("hidden");
    if (freqBlock) freqBlock.classList.add("hidden");
    summaryItemsWrap.innerHTML = `<p class="empty-msg" style="font-size:0.85rem; padding:12px 0;">No items</p>`;
    document.getElementById("summary-subtotal").textContent = "₹0";
    document.getElementById("summary-shipping").textContent = "Free";
    document.getElementById("summary-gst").textContent = "₹0";
    document.getElementById("summary-total").textContent = "₹0";
    return;
  }

  if (freqBlock) freqBlock.classList.remove("hidden");

  // Calculate delivery date (5 days from today)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDate = deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  wrap.innerHTML = cart.map(i => {
    const originalPrice = Math.floor(i.price * 1.3);
    const badges = i.id % 2 === 0 
      ? `<span class="cart-tag tag-consecrated">Temple Energized</span><span class="cart-tag tag-astrologer">Astrologer Recommended</span>`
      : `<span class="cart-tag tag-consecrated">Authentic</span><span class="cart-tag tag-astrologer">Handcrafted</span>`;
    
    return `
      <div class="cart-card-premium" style="display: flex; gap: 20px; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 20px; align-items: flex-start; transition: transform 0.2s;">
        <div class="cart-card-img-wrap" style="width: 100px; height: 100px; border-radius: 12px; background: var(--ivory); display: flex; align-items: center; justify-content: center; font-size: 3rem; border: 1px solid var(--line); flex-shrink: 0;">
          ${i.emoji || "🕉️"}
        </div>
        <div class="cart-card-details" style="flex: 1; display: flex; flex-direction: column; gap: 6px; text-align: left;">
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">${badges}</div>
          <h3 style="font-family: 'Fraunces', serif; font-size: 1.25rem; font-weight: 600; color: var(--maroon); margin: 2px 0 0 0;">${i.name}</h3>
          <p style="color: var(--muted); font-size: 0.88rem; margin: 0;">${i.description || "Purified & Vedic Consecrated for positive alignment."}</p>
          <div style="font-size: 0.8rem; color: #2E7D32; font-weight: 600; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
            🚚 Arrives by ${formattedDate} • <span style="color: #4CAF50;">In Stock</span>
          </div>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--ink); cursor: pointer; margin-top: 6px; user-select: none;">
            <input type="checkbox" style="accent-color: var(--maroon);" /> Add gift packaging (+₹50)
          </label>
        </div>
        <div class="cart-card-right" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; height: 100%; min-height: 100px; flex-shrink: 0;">
          <div style="text-align: right;">
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--maroon);">${formatINR(i.price * i.qty)}</div>
            <div style="font-size: 0.85rem; color: var(--muted); text-decoration: line-through; margin-top: 2px;">${formatINR(originalPrice * i.qty)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; margin-top: 18px;">
            <div class="qty-pill-selector" style="display: flex; align-items: center; background: var(--ivory); border: 1px solid var(--line); border-radius: 999px; overflow: hidden; padding: 2px 6px;">
              <button onclick="changeQty(${i.id}, -1)" style="border: none; background: transparent; padding: 6px 12px; font-size: 0.9rem; font-weight: 700; cursor: pointer; color: var(--maroon);">-</button>
              <span style="font-size: 0.88rem; font-weight: 600; padding: 0 4px; min-width: 14px; text-align: center;">${i.qty}</span>
              <button onclick="changeQty(${i.id}, 1)" style="border: none; background: transparent; padding: 6px 12px; font-size: 0.9rem; font-weight: 700; cursor: pointer; color: var(--maroon);">+</button>
            </div>
            <button class="btn btn-outline" style="padding: 8px 10px; border-radius: 50%; font-size: 0.85rem; line-height: 1;" title="Save for later">❤️</button>
            <button class="btn btn-outline" style="padding: 8px 10px; border-radius: 50%; font-size: 0.85rem; line-height: 1; border-color: #f44336; color: #f44336;" onclick="removeItem(${i.id})" title="Remove item">🗑️</button>
          </div>
        </div>
      </div>`;
  }).join("");

  // Populate summary listing with thumbnails
  summaryItemsWrap.innerHTML = cart.map(i => `
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.88rem; color:var(--ink); padding:4px 0;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; background:var(--ivory); border-radius:6px; border:1px solid var(--line); font-size:1.1rem;">${i.emoji || "🕉️"}</span>
        <span>${i.name} <span style="color:var(--muted); font-size:0.8rem;">× ${i.qty}</span></span>
      </div>
      <strong>${formatINR(i.price * i.qty)}</strong>
    </div>`).join("");

  const subtotal = cartSubtotal(cart);
  const gst = Math.floor(subtotal * 0.05); // 5% GST
  const templeFee = 9900; // ₹99
  const shipping = subtotal >= 99900 ? 0 : 10000; // Free if >= ₹999, else ₹100
  
  document.getElementById("summary-subtotal").textContent = formatINR(subtotal);
  document.getElementById("summary-shipping").textContent = shipping > 0 ? formatINR(shipping) : "Free";
  document.getElementById("summary-gst").textContent = formatINR(gst);
  document.getElementById("summary-total").textContent = formatINR(subtotal + gst + templeFee + shipping);
  
  actionsBlock.classList.remove("hidden");
  
  if (window.isBuyNow && !window.checkoutAddress && typeof showAddressSection === "function") {
    showAddressSection();
  }
}

document.addEventListener("DOMContentLoaded", renderCart);
