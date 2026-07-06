// ---------- Cart checkout & payment verification ----------
async function showAddressSection() {
  const user = await requireLogin();
  if (!user) return;
  document.getElementById("shipping-email").value = user.email || "";
  try {
    const saved = await api("/addresses");
    let container = document.getElementById("saved-addresses-container");
    if (!container) {
      container = document.createElement("div"); container.id = "saved-addresses-container"; container.className = "form-group";
      const form = document.getElementById("address-form"); form.insertBefore(container, form.firstChild);
    }
    if (!saved || saved.length === 0) container.innerHTML = "";
    else {
      container.innerHTML = `<label>Select Saved Address</label>
        <select onchange="autofillAddress(this)" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--line); background:#fff; font-family:inherit; margin-bottom:12px;">
          <option value="">-- Enter New Address --</option>
          ${saved.map(a => `<option value='${JSON.stringify(a)}'>${a.name} (${a.city}, ${a.pincode})</option>`).join("")}
        </select>`;
    }
  } catch (e) { console.error(e); }
  document.getElementById("cart-items-section").classList.add("hidden");
  document.getElementById("address-section").classList.remove("hidden");
}

function autofillAddress(select) {
  if (!select.value) { document.getElementById("address-form").reset(); return; }
  const a = JSON.parse(select.value);
  document.getElementById("shipping-name").value = a.name || "";
  document.getElementById("shipping-phone").value = a.phone || "";
  document.getElementById("shipping-email").value = a.email || "";
  document.getElementById("shipping-address").value = a.address || "";
  document.getElementById("shipping-city").value = a.city || "";
  document.getElementById("shipping-pincode").value = a.pincode || "";
}

async function proceedToPayment(e) {
  e.preventDefault();
  window.checkoutAddress = {
    name: document.getElementById("shipping-name").value.trim(),
    phone: document.getElementById("shipping-phone").value.trim(),
    email: document.getElementById("shipping-email").value.trim(),
    address: document.getElementById("shipping-address").value.trim(),
    city: document.getElementById("shipping-city").value.trim(),
    pincode: document.getElementById("shipping-pincode").value.trim()
  };
  try {
    await api("/addresses", { method: "POST", body: JSON.stringify(window.checkoutAddress) });
  } catch (err) { console.error("Failed to save address", err); }
  showToast("Shipping address confirmed!");
  document.getElementById("btn-pay").classList.remove("hidden");
  document.querySelector(".cart-right-col").scrollIntoView({ behavior: "smooth" });
}

async function payNow() {
  if (!window.checkoutAddress) return showToast("Please confirm your shipping address first");
  const user = await getUser(); if (!user) return requireLogin();
  try {
    showToast("Initiating secure checkout...");
    const cart = await fetchCartItems();
    const items = cart.map(i => ({ id: i.id, qty: i.qty }));
    const o = await api("/orders", {
      method: "POST",
      body: JSON.stringify({ items, address: window.checkoutAddress, checkoutType: window.isBuyNow ? "buy_now" : "regular" })
    });
    new Razorpay({
      key: o.keyId, order_id: o.razorpayOrderId, amount: o.amount, currency: o.currency,
      name: "Aroham", description: "Sacred Vedic Products Purchase",
      prefill: { name: window.checkoutAddress.name, email: window.checkoutAddress.email, contact: window.checkoutAddress.phone },
      theme: { color: "#ef9b2d" },
      handler: (r) => verifyPayment(o.orderId, r),
      modal: { ondismiss: () => reportFailure(o.orderId, "Checkout closed by user") },
    }).open();
  } catch (e) { showToast(e.message); }
}

async function verifyPayment(orderId, r) {
  try {
    await api("/payments/verify", { method: "POST", body: JSON.stringify({ orderId, ...r }) });
    if (!window.isBuyNow) saveCart([]); // If standard checkout, clear client backup
    showToast("Payment verified! Order confirmed 🎉");
    setTimeout(() => (window.location.href = "orders.html"), 1200);
  } catch (e) { showToast("Verification failed: " + e.message); }
}

async function reportFailure(orderId, reason) {
  try { await api("/payments/failed", { method: "POST", body: JSON.stringify({ orderId, reason }) }); } catch {}
  showToast("Payment not completed. Stock released.");
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.isBuyNow) {
    setTimeout(showAddressSection, 150);
  }
});
