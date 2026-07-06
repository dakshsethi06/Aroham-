// ---------- My Orders page (fetched from backend /api/orders) ----------

function orderCard(o) {
  const date = new Date(o.created_at).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const items = (o.order_items || []).map(
    (i) => `<li>${i.emoji || "🕉️"} ${i.name} × ${i.qty} — ${formatINR(i.price * i.qty)}</li>`
  ).join("");
  const pay = (o.payments && o.payments[0]) || {};
  const statusClass = o.status === "CONFIRMED" ? "paid" : o.status === "PENDING" ? "pending" : "failed";
  
  let addressHtml = "";
  if (o.address) {
    const addr = typeof o.address === "string" ? JSON.parse(o.address) : o.address;
    addressHtml = `
      <div class="order-shipping-details" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--line); font-size: 0.85rem;">
        <strong style="display:block; margin-bottom:4px; color:var(--night);">Shipping Address:</strong>
        <span style="display:block; color:var(--muted);">${addr.name} | ${addr.phone}</span>
        <span style="display:block; color:var(--muted);">${addr.address}, ${addr.city} - ${addr.pincode}</span>
      </div>
    `;
  }

  return `
    <div class="order-card" onclick="toggleOrderDetails(this)" style="cursor: pointer;">
      <div class="order-head">
        <div>
          <strong>Order #${String(o.id).slice(0, 8)}</strong>
          <span class="order-date">${date}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="status status-${statusClass}">${o.status.replace("_", " ")}</span>
          <span class="toggle-arrow" style="font-size: 0.8rem; color: var(--muted);">▼</span>
        </div>
      </div>
      
      <div class="order-details hidden" style="margin-top: 14px;">
        <ul class="order-items" style="margin: 0 0 14px 0;">${items}</ul>
        ${addressHtml}
        <div class="order-foot" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line);">
          <span class="pay-id">Payment: ${pay.razorpay_payment_id || pay.status || "—"}</span>
          <strong>${formatINR(o.amount)}</strong>
        </div>
      </div>
    </div>`;
}

function toggleOrderDetails(el) {
  const details = el.querySelector(".order-details");
  const arrow = el.querySelector(".toggle-arrow");
  if (details) {
    const isHidden = details.classList.toggle("hidden");
    if (arrow) arrow.textContent = isHidden ? "▼" : "▲";
  }
}

async function renderOrders() {
  const wrap = document.getElementById("orders-list");
  const user = await requireLogin();
  if (!user) return;
  try {
    const orders = await api("/orders");
    wrap.innerHTML = orders.length
      ? orders.map(orderCard).join("")
      : `<p class="empty-msg">No orders yet. <a href="../index.html">Start shopping →</a></p>`;
  } catch (e) {
    wrap.innerHTML = `<p class="empty-msg">Could not load orders: ${e.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", renderOrders);
