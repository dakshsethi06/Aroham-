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
  return `
    <div class="order-card">
      <div class="order-head">
        <div>
          <strong>Order #${String(o.id).slice(0, 8)}</strong>
          <span class="order-date">${date}</span>
        </div>
        <span class="status status-${statusClass}">${o.status.replace("_", " ")}</span>
      </div>
      <ul class="order-items">${items}</ul>
      <div class="order-foot">
        <span class="pay-id">Payment: ${pay.razorpay_payment_id || pay.status || "—"}</span>
        <strong>${formatINR(o.amount)}</strong>
      </div>
    </div>`;
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
