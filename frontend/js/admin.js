// js/admin.js — fetches and renders admin order dashboard
(async function () {
  const user = await getUser();
  if (!user) return;

  const token = (await db.auth.getSession()).data.session?.access_token;
  if (!token) return showToast("Session expired");

  const res = await fetch(API_BASE + "/admin/orders", {
    headers: { Authorization: "Bearer " + token },
  });

  if (res.status === 403) {
    document.getElementById("admin-body").innerHTML =
      '<tr><td colspan="8" style="text-align:center;padding:50px;color:var(--maroon);font-weight:600;">⛔ Access Denied. Your email is not in the admin whitelist.</td></tr>';
    return;
  }

  const orders = await res.json();
  const tbody = document.getElementById("admin-body");

  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:50px;color:var(--muted);">No orders yet. Place your first order to see it here!</td></tr>';
    return;
  }

  // Stats
  document.getElementById("stat-total").textContent = orders.length;
  document.getElementById("stat-shipped").textContent = orders.filter(o => o.awb_code).length;
  document.getElementById("stat-pending").textContent = orders.filter(o => !o.awb_code && o.status !== "CANCELLED").length;
  document.getElementById("order-count-badge").textContent = orders.length + (orders.length === 1 ? " order" : " orders");

  const totalRevenue = orders.reduce((sum, o) => {
    const payment = (o.payments || [])[0];
    return payment?.status === "PAID" || payment?.status === "SUCCESS" ? sum + (o.amount || 0) : sum;
  }, 0);
  document.getElementById("stat-revenue").textContent = "₹" + (totalRevenue / 100).toLocaleString("en-IN");

  // Render rows
  tbody.innerHTML = orders.map((o) => {
    const payment = (o.payments || [])[0];
    const payStatus = payment?.status || "UNKNOWN";
    const pillClass = payStatus === "PAID" || payStatus === "SUCCESS" ? "pill-success"
      : payStatus === "PENDING" || payStatus === "INITIATED" ? "pill-pending"
      : payStatus === "REFUNDED" ? "pill-refunded"
      : payStatus === "FAILED" ? "pill-failed" : "pill-cancelled";

    const items = (o.order_items || []).map(i => `${i.product_name || "Item"} ×${i.qty}`).join(", ");
    const date = new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const time = new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const awb = o.awb_code
      ? `<span class="awb-code">${o.awb_code}</span>`
      : `<span class="awb-none">—</span>`;

    const labelBtn = o.label_url
      ? `<a href="${o.label_url}" target="_blank" class="btn-label">🖨 Print Label</a>`
      : '';

    const cancelBtn = o.status === "CANCELLED"
      ? '<span class="btn-cancel done">Cancelled</span>'
      : `<button onclick="cancelOrder('${o.id}', this)" class="btn-cancel">✕ Cancel</button>`;

    const amount = (o.amount || 0) / 100;

    return `<tr>
      <td>
        <div class="order-id">#${o.id.slice(0, 8)}…</div>
        <div class="order-date-cell">${date} · ${time}</div>
      </td>
      <td style="font-weight:500;">${o.user_email}</td>
      <td style="font-size:0.84rem;color:var(--ink);">${items || "—"}</td>
      <td><strong style="color:var(--maroon);font-family:'Fraunces',serif;">₹${amount.toLocaleString("en-IN")}</strong></td>
      <td><span class="pill ${pillClass}">${payStatus}</span></td>
      <td>${awb}</td>
      <td>${labelBtn || '<span style="color:var(--muted);font-size:0.82rem;">N/A</span>'}</td>
      <td><div class="action-group">${cancelBtn}</div></td>
    </tr>`;
  }).join("");
})();

async function cancelOrder(orderId, btn) {
  if (!confirm("Are you sure you want to cancel this order and refund the customer?")) return;
  btn.disabled = true;
  btn.textContent = "Cancelling...";
  try {
    const session = (await db.auth.getSession()).data.session;
    const res = await fetch(API_BASE + "/admin/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
      body: JSON.stringify({ orderId })
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Order cancelled and refunded successfully");
      setTimeout(() => location.reload(), 800); // Reload to fetch fresh REFUNDED status
    } else {
      btn.disabled = false;
      btn.textContent = "✕ Cancel";
      showToast(data.error || "Failed to cancel");
    }
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "✕ Cancel";
    showToast("Error: " + e.message);
  }
}
