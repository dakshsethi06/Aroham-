// ---------- Cart page + checkout (calls backend, then Razorpay) ----------

// Global store for the checkout address
window.checkoutAddress = null;

function cartSubtotal() { return getCart().reduce((s, i) => s + i.price * i.qty, 0); }

function changeQty(id, delta) {
  let cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart(cart);
  
  // If cart is edited, reset address state and go back to cart view
  resetCheckoutState();
  renderCart();
}

function removeItem(id) {
  let cart = getCart();
  cart = cart.filter((i) => i.id !== id);
  saveCart(cart);
  resetCheckoutState();
  renderCart();
}

function resetCheckoutState() {
  window.checkoutAddress = null;
  document.getElementById("btn-pay").classList.add("hidden");
  showCartSection();
}

function renderCart() {
  const wrap = document.getElementById("cart-items-list");
  const actionsBlock = document.getElementById("cart-items-actions");
  const summaryItemsWrap = document.getElementById("summary-items-list");
  
  const cart = getCart();
  
  if (cart.length === 0) {
    wrap.innerHTML = `<p class="empty-msg">Your shopping bag is empty. <a href="../index.html">Shop products →</a></p>`;
    actionsBlock.classList.add("hidden");
    summaryItemsWrap.innerHTML = `<p class="empty-msg" style="font-size: 0.85rem; padding: 12px 0;">No items in cart</p>`;
    
    document.getElementById("summary-subtotal").textContent = "₹0";
    document.getElementById("summary-shipping").textContent = "Free";
    document.getElementById("summary-total").textContent = "₹0";
    return;
  }
  
  // Render Left Cart List (Premium Layout matching the image)
  wrap.innerHTML = cart.map((i) => `
    <div class="cart-item-premium">
      <div class="cip-img-wrap">
        ${i.emoji || "🕉️"}
      </div>
      <div class="cip-details">
        <strong class="cip-name">${i.name}</strong>
        <span class="cip-desc">${i.description || "Purified & Vedic Consecrated"}</span>
        <div class="cip-qty-box">
          <button onclick="changeQty(${i.id}, -1)">−</button>
          <span>${i.qty}</span>
          <button onclick="changeQty(${i.id}, 1)">+</button>
        </div>
      </div>
      <div class="cip-right">
        <strong class="cip-price">${formatINR(i.price * i.qty)}</strong>
        <button class="cip-remove-btn" onclick="removeItem(${i.id})" title="Remove item">🗑️</button>
      </div>
    </div>`).join("");
    
  // Render Right Summary Items List (Mini summary)
  summaryItemsWrap.innerHTML = cart.map((i) => `
    <div class="summary-item-row">
      <span>${i.name} × ${i.qty}</span>
      <span>${formatINR(i.price * i.qty)}</span>
    </div>`).join("");
    
  // Calculations
  const subtotal = cartSubtotal();
  // Free shipping over ₹999 (99900 paise)
  const shipping = subtotal >= 99900 ? 0 : 10000; // 10000 paise = ₹100
  const grandTotal = subtotal + shipping;
  
  document.getElementById("summary-subtotal").textContent = formatINR(subtotal);
  document.getElementById("summary-shipping").textContent = shipping > 0 ? formatINR(shipping) : "Free";
  document.getElementById("summary-total").textContent = formatINR(grandTotal);
  
  actionsBlock.classList.remove("hidden");
}

async function showAddressSection() {
  const user = await requireLogin();
  if (!user) return;
  
  // Prefill shipping email/name if available
  document.getElementById("shipping-email").value = user.email || "";
  
  // Transition views
  document.getElementById("cart-items-section").classList.add("hidden");
  document.getElementById("address-section").classList.remove("hidden");
}

function showCartSection() {
  document.getElementById("address-section").classList.add("hidden");
  document.getElementById("cart-items-section").classList.remove("hidden");
}

function proceedToPayment(e) {
  e.preventDefault();
  
  // Collect shipping address details
  window.checkoutAddress = {
    name: document.getElementById("shipping-name").value.trim(),
    phone: document.getElementById("shipping-phone").value.trim(),
    email: document.getElementById("shipping-email").value.trim(),
    address: document.getElementById("shipping-address").value.trim(),
    city: document.getElementById("shipping-city").value.trim(),
    pincode: document.getElementById("shipping-pincode").value.trim()
  };
  
  showToast("Shipping address confirmed!");
  
  // Display the Pay button on the right-side summary card
  document.getElementById("btn-pay").classList.remove("hidden");
  
  // Smooth scroll to the summary card on mobile/tablet views
  document.querySelector(".cart-right-col").scrollIntoView({ behavior: "smooth" });
}

async function payNow() {
  if (!window.checkoutAddress) {
    return showToast("Please confirm your shipping address first");
  }
  
  const user = await getUser();
  if (!user) return requireLogin();
  
  try {
    const items = getCart().map((i) => ({ id: i.id, qty: i.qty }));
    const address = window.checkoutAddress;
    
    showToast("Initiating secure checkout...");
    
    // Create pending order on the backend
    const o = await api("/orders", { 
      method: "POST", 
      body: JSON.stringify({ items, address }) 
    });

    // Launch Razorpay checkout
    new Razorpay({
      key: o.keyId,
      order_id: o.razorpayOrderId,
      amount: o.amount,
      currency: o.currency,
      name: "Aroham",
      description: "Sacred Vedic Products Purchase",
      prefill: { 
        name: address.name,
        email: address.email,
        contact: address.phone
      },
      theme: { color: "#ef9b2d" },
      handler: (r) => verifyPayment(o.orderId, r),
      modal: { ondismiss: () => reportFailure(o.orderId, "Checkout closed by user") },
    }).open();
    
  } catch (e) {
    showToast(e.message);
  }
}

async function verifyPayment(orderId, r) {
  try {
    await api("/payments/verify", { method: "POST", body: JSON.stringify({ orderId, ...r }) });
    saveCart([]);
    showToast("Payment verified! Order confirmed 🎉");
    setTimeout(() => (window.location.href = "orders.html"), 1200);
  } catch (e) {
    showToast("Verification failed: " + e.message);
  }
}

async function reportFailure(orderId, reason) {
  try { 
    await api("/payments/failed", { method: "POST", body: JSON.stringify({ orderId, reason }) }); 
  } catch {}
  showToast("Payment not completed. Stock released.");
}

document.addEventListener("DOMContentLoaded", renderCart);
