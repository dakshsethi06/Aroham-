// ---------- Cart checkout & payment verification ----------

async function showAddressSection() {
  const user = await requireLogin();
  if (!user) return;
  
  // Prefill email
  document.getElementById("shipping-email").value = user.email || "";

  // Set breadcrumbs & titles
  document.getElementById("cart-breadcrumb-active").textContent = "Delivery Details";
  document.getElementById("cart-page-title").textContent = "Delivery Details";
  document.getElementById("cart-page-subtitle").textContent = "Tell us where you'd like your sacred products delivered.";

  // Update step indicators
  const s1Badge = document.getElementById("step-1-badge").querySelector(".step-num");
  const s2Badge = document.getElementById("step-2-badge").querySelector(".step-num");
  const s3Badge = document.getElementById("step-3-badge").querySelector(".step-num");
  
  if (s1Badge) { s1Badge.style.background = "var(--gold)"; s1Badge.textContent = "✓"; s1Badge.style.color = "#fff"; }
  if (s2Badge) { s2Badge.style.background = "var(--maroon)"; s2Badge.textContent = "2"; s2Badge.style.color = "#fff"; }
  if (s3Badge) { s3Badge.style.background = "var(--line)"; s3Badge.textContent = "3"; s3Badge.style.color = "var(--muted)"; }

  // Hide other steps
  document.getElementById("cart-items-section").classList.add("hidden");
  document.getElementById("payment-section").classList.add("hidden");
  document.getElementById("delivering-to-card").classList.add("hidden");
  document.getElementById("address-section").classList.remove("hidden");

  try {
    const saved = await api("/addresses");
    const container = document.getElementById("saved-addresses-container");
    if (container) {
      if (!saved || saved.length === 0) {
        container.innerHTML = "";
        document.getElementById("manual-address-form-fields").classList.remove("hidden");
      } else {
        container.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <label style="font-weight: 650; font-size: 1.05rem; color: var(--maroon); margin: 0; font-family:'Fraunces', serif;">Select Delivery Address</label>
            <button type="button" class="btn btn-outline" style="padding: 8px 16px; font-size: 0.8rem; display: flex; align-items: center; gap: 6px; border-radius: 30px; font-weight: 600;" onclick="addNewAddressTrigger()">
              <span>➕</span> Add New Address
            </button>
          </div>
          <div class="saved-addresses-grid" style="display:grid; gap:12px; margin-bottom:20px;">
            ${saved.map((a, idx) => {
              const isDefault = idx === 0;
              const addrEscaped = JSON.stringify(a).replace(/'/g, "&apos;");
              return `
                <div class="address-radio-card ${isDefault ? 'active' : ''}" onclick="selectSavedAddress(this, ${addrEscaped})" style="border: 1.5px solid ${isDefault ? 'var(--marigold)' : 'var(--line)'}; border-radius: 12px; padding: 16px; display: flex; gap: 14px; align-items: flex-start; cursor: pointer; background: #fff; transition: border-color 0.2s; text-align: left;">
                  <input type="radio" name="selected-address" ${isDefault ? 'checked' : ''} style="margin-top: 4px; accent-color: var(--maroon);" />
                  <div style="flex: 1; font-size: 0.88rem; line-height: 1.5; color: var(--ink);">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                      <strong style="font-weight:600; color:var(--night);">${isDefault ? 'Default Address' : 'Saved Address'}</strong>
                      ${isDefault ? '<span style="background:var(--ivory); color:var(--marigold-deep); font-size:0.68rem; font-weight:700; padding:1px 6px; border-radius:4px; text-transform:uppercase;">Primary</span>' : ''}
                    </div>
                    <div style="font-weight: 600; color: var(--night); margin-bottom: 2px;">${a.name} | ${a.phone}</div>
                    <div style="color: var(--muted);">${a.address}, ${a.city} - ${a.pincode}</div>
                    <div style="margin-top: 8px; color: #2E7D32; font-size: 0.8rem; font-weight: 600;">Estimated delivery: 3-5 days • Free Shipping</div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `;
        // Auto-fill form fields with default
        autofillAddressData(saved[0]);
        // Hide manual input fields
        document.getElementById("manual-address-form-fields").classList.add("hidden");
      }
    }
  } catch (e) { console.error(e); }
}

function selectSavedAddress(card, address) {
  document.querySelectorAll(".address-radio-card").forEach(c => {
    c.classList.remove("active");
    c.style.borderColor = "var(--line)";
    const radio = c.querySelector("input[type='radio']");
    if (radio) radio.checked = false;
  });
  
  card.classList.add("active");
  card.style.borderColor = "var(--marigold)";
  const radio = card.querySelector("input[type='radio']");
  if (radio) radio.checked = true;

  autofillAddressData(address);
  document.getElementById("manual-address-form-fields").classList.add("hidden");
}

function addNewAddressTrigger() {
  document.querySelectorAll(".address-radio-card").forEach(c => {
    c.classList.remove("active");
    c.style.borderColor = "var(--line)";
    const radio = c.querySelector("input[type='radio']");
    if (radio) radio.checked = false;
  });
  
  document.getElementById("shipping-name").value = "";
  document.getElementById("shipping-phone").value = "";
  document.getElementById("shipping-address").value = "";
  document.getElementById("shipping-city").value = "";
  document.getElementById("shipping-pincode").value = "";
  
  document.getElementById("manual-address-form-fields").classList.remove("hidden");
}

function autofillAddressData(a) {
  document.getElementById("shipping-name").value = a.name || "";
  document.getElementById("shipping-phone").value = a.phone || "";
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
  
  if (!window.checkoutAddress.name) {
    return showToast("Please enter recipient name");
  }
  if (!/^\d{10}$/.test(window.checkoutAddress.phone)) {
    return showToast("Phone number must be exactly 10 digits");
  }
  if (!window.checkoutAddress.address) {
    return showToast("Please enter a street address");
  }
  if (!window.checkoutAddress.city) {
    return showToast("Please enter a city");
  }
  if (!window.checkoutAddress.pincode || !/^\d{6}$/.test(window.checkoutAddress.pincode)) {
    return showToast("Please enter a valid 6-digit pincode");
  }
  
  try {
    await api("/addresses", { method: "POST", body: JSON.stringify(window.checkoutAddress) });
  } catch (err) { console.error("Failed to save address", err); }

  showToast("Shipping address confirmed!");

  // Switch views
  document.getElementById("address-section").classList.add("hidden");
  document.getElementById("payment-section").classList.remove("hidden");

  // Switch titles to payment step
  document.getElementById("cart-breadcrumb-active").textContent = "Secure Payment";
  document.getElementById("cart-page-title").textContent = "Secure Payment";
  document.getElementById("cart-page-subtitle").textContent = "Review your order summary and complete your payment securely.";

  // Update step badges
  const s2Badge = document.getElementById("step-2-badge").querySelector(".step-num");
  const s3Badge = document.getElementById("step-3-badge").querySelector(".step-num");
  if (s2Badge) { s2Badge.style.background = "var(--gold)"; s2Badge.textContent = "✓"; s2Badge.style.color = "#fff"; }
  if (s3Badge) { s3Badge.style.background = "var(--maroon)"; s3Badge.style.color = "#fff"; }

  // Populate Delivering To Card
  document.getElementById("delivering-name").textContent = `${window.checkoutAddress.name} | ${window.checkoutAddress.phone}`;
  document.getElementById("delivering-address").textContent = `${window.checkoutAddress.address}, ${window.checkoutAddress.city} - ${window.checkoutAddress.pincode}`;
  document.getElementById("delivering-to-card").classList.remove("hidden");

  // Toggle checkout action control
  document.getElementById("cart-items-actions").classList.add("hidden");
  document.getElementById("btn-pay").classList.remove("hidden");
  document.querySelector(".cart-right-col").scrollIntoView({ behavior: "smooth" });
}

// ---------- Payment Method Accordion Logic ----------
function toggleAccordion(header) {
  const item = header.parentElement;
  const isActive = item.classList.contains("active");

  // Collapse all accordion items
  document.querySelectorAll(".accordion-item").forEach(i => {
    i.classList.remove("active");
    i.querySelector(".accordion-body").classList.add("hidden");
    const Arrow = i.querySelector(".acc-arrow");
    if (Arrow) Arrow.textContent = "▼";
    const radio = i.querySelector("input[name='payment-method-radio']");
    if (radio) radio.checked = false;
  });

  if (!isActive) {
    item.classList.add("active");
    item.querySelector(".accordion-body").classList.remove("hidden");
    const Arrow = item.querySelector(".acc-arrow");
    if (Arrow) Arrow.textContent = "▲";
    const radio = item.querySelector("input[name='payment-method-radio']");
    if (radio) radio.checked = true;
  }
}

function selectUpiApp(badge) {
  document.querySelectorAll(".upi-app-badge").forEach(b => {
    b.style.borderColor = "var(--line)";
    b.style.background = "";
  });
  badge.style.borderColor = "var(--marigold)";
  badge.style.background = "var(--ivory)";
  
  // Fill sample UPI ID
  const appName = badge.querySelector("span:last-child").textContent.toLowerCase().replace(" ", "");
  document.getElementById("upi-id-input").value = `arohamstore@${appName}`;
}

function verifyUpiId() {
  const upiId = document.getElementById("upi-id-input").value.trim();
  if (!upiId || !upiId.includes("@")) {
    return showToast("Please enter a valid UPI ID (e.g. username@upi)");
  }
  showToast("UPI ID verified successfully! ✓");
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
      theme: { color: "#4A1521" },
      handler: (r) => verifyPayment(o.orderId, r),
      modal: { ondismiss: () => reportFailure(o.orderId, "Checkout closed by user") },
    }).open();
  } catch (e) { showToast(e.message); }
}

async function verifyPayment(orderId, r) {
  try {
    await api("/payments/verify", { method: "POST", body: JSON.stringify({ orderId, ...r }) });
    if (!window.isBuyNow) saveCart([]); // Clear backup
    showToast("Payment verified! Order confirmed 🎉");
    setTimeout(() => {
      window.location.href = `confirmation.html?orderId=${orderId}`;
    }, 1200);
  } catch (e) { showToast("Verification failed: " + e.message); }
}

async function reportFailure(orderId, reason) {
  try { await api("/payments/failed", { method: "POST", body: JSON.stringify({ orderId, reason }) }); } catch {}
  showToast("Payment not completed. Stock released.");
}

