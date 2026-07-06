// ---------- My Orders page (fetched from backend /api/orders) ----------

function orderCard(o) {
  const date = new Date(o.created_at).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  
  const items = (o.order_items || []).map(i => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed rgba(74, 21, 33, 0.06);">
      <span style="font-weight: 500; color: var(--night); font-size: 0.9rem;">
        <span style="margin-right: 6px;">${i.emoji || "🕉️"}</span>${i.name}
        <span style="color: var(--muted); font-size: 0.78rem; margin-left: 6px; font-weight: normal;">× ${i.qty}</span>
      </span>
      <strong style="color: var(--maroon); font-size: 0.95rem;">${formatINR(i.price * i.qty)}</strong>
    </div>
  `).join("");

  const pay = (o.payments && o.payments[0]) || {};
  const status = String(o.status).toUpperCase();
  
  let statusBg = "#FAF7F5";
  let statusColor = "var(--muted)";
  if (status === "CONFIRMED" || status === "DELIVERED") {
    statusBg = "#EAFaf1";
    statusColor = "#2E7D32";
  } else if (status === "PENDING" || status === "PROCESSING") {
    statusBg = "#FDF2DB";
    statusColor = "#A06400";
  } else if (status.includes("FAILED") || status.includes("CANCEL")) {
    statusBg = "#FDE8E8";
    statusColor = "#C62828";
  }

  let addressHtml = "";
  if (o.address) {
    const addr = typeof o.address === "string" ? JSON.parse(o.address) : o.address;
    addressHtml = `
      <div class="order-shipping-details" style="margin-top: 16px; padding: 14px; background: #FFFDFB; border: 1.5px dashed var(--line); border-radius: 10px; font-size: 0.84rem; text-align: left; line-height: 1.45;">
        <strong style="display:block; margin-bottom:4px; color:var(--maroon); font-weight: 600;">Shipping Address</strong>
        <span style="display:block; color:var(--night); font-weight: 500; margin-bottom: 2px;">${addr.name} | ${addr.phone}</span>
        <span style="display:block; color:var(--muted);">${addr.address}, ${addr.city} - ${addr.pincode}</span>
      </div>
    `;
  }

  const isExpanded = status === "CONFIRMED"; // Auto expand confirmed orders for utility

  return `
    <div class="order-card" onclick="toggleOrderDetails(this)" style="background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 20px 24px; box-shadow: 0 4px 14px rgba(74,21,33,0.03); margin-bottom: 18px; transition: all 0.2s ease; cursor: pointer; text-align: left;">
      <div class="order-head" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <strong style="font-family: 'Fraunces', serif; font-size: 1.15rem; color: var(--night); font-weight: 600; display: block; margin-bottom: 2px;">Order #2026-${String(o.id).slice(0, 8).toUpperCase()}</strong>
          <span class="order-date" style="font-size: 0.78rem; color: var(--muted); font-weight: 500;">${date}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="status-badge" style="background: ${statusBg}; color: ${statusColor}; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 99px; letter-spacing: 0.5px;">${status.replace("_", " ")}</span>
          <span class="toggle-arrow" style="font-size: 0.75rem; color: var(--muted); transition: transform 0.2s;">${isExpanded ? "▲" : "▼"}</span>
        </div>
      </div>
      
      <div class="order-details ${isExpanded ? '' : 'hidden'}" style="margin-top: 18px; border-top: 1px solid var(--line); padding-top: 14px;">
        <div style="margin-bottom: 14px;">${items}</div>
        ${addressHtml}
        <div class="order-foot" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 0.88rem;">
          <span class="pay-id" style="color: var(--muted); font-size: 0.78rem;">Payment: <code style="background: var(--ivory); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${pay.razorpay_payment_id || pay.status || "Pending/COD"}</code></span>
          <span style="font-size: 0.95rem; color: var(--night);">Grand Total: <strong style="color: var(--maroon); font-size: 1.2rem; font-weight: 700; margin-left: 4px;">${formatINR(o.amount)}</strong></span>
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
      : `<p class="empty-msg" style="padding: 40px; text-align: center; color: var(--muted); font-size: 0.95rem;">No orders yet. <a href="../index.html" style="color: var(--maroon); text-decoration: underline; font-weight: 600;">Start shopping &rarr;</a></p>`;
  } catch (e) {
    wrap.innerHTML = `<p class="empty-msg" style="padding: 40px; text-align: center; color: var(--maroon);">Could not load orders: ${e.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", renderOrders);
