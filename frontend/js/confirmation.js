// ---------- Order Confirmation loader script ----------

function showInvoiceToast() {
  showToast("Invoice downloaded successfully! 📄");
}

async function loadConfirmationDetails() {
  const params = new URLSearchParams(window.location.search);
  let orderId = params.get("orderId");
  console.log("[Confirmation] Extracted orderId from URL:", orderId);

  const user = await requireLogin();
  if (!user) return;

  try {
    const orders = await api("/orders");
    let order;
    
    if (orderId) {
      order = orders.find(o => String(o.id) === String(orderId) || String(o.id).slice(0, 8) === String(orderId));
    } else if (orders.length > 0) {
      console.log("[Confirmation] No orderId in URL, falling back to latest order:", orders[0].id);
      order = orders[0];
      orderId = order.id;
    }

    if (!order) {
      showToast("No orders found. Redirecting...");
      setTimeout(() => { window.location.href = "../index.html"; }, 2500);
      return;
    }

    // Populate order header
    document.getElementById("conf-order-number").textContent = `ARH-2026-${String(order.id).slice(0, 6).toUpperCase()}`;
    
    const createdDate = new Date(order.created_at || Date.now());
    document.getElementById("conf-order-date").textContent = createdDate.toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    // Calc delivery date (5 days from creation)
    const estDate = new Date(createdDate);
    estDate.setDate(estDate.getDate() + 5);
    const formattedEst = estDate.toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    const formattedTimelineEst = estDate.toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });
    
    document.getElementById("conf-order-est").textContent = formattedEst;
    document.getElementById("conf-timeline-est").textContent = formattedTimelineEst;

    // Total
    document.getElementById("conf-order-total").textContent = formatINR(order.amount);

    // Shipping Address
    let addrText = "Not Specified";
    if (order.address) {
      const addr = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
      addrText = `${addr.name} | ${addr.phone} — ${addr.address}, ${addr.city} - ${addr.pincode}`;
    }
    document.getElementById("conf-shipping-address").textContent = addrText;

    // Items list
    const itemsWrap = document.getElementById("conf-items-list");
    if (itemsWrap && order.order_items) {
      itemsWrap.innerHTML = order.order_items.map(i => `
        <div style="display: flex; gap: 16px; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px; align-items: center; text-align: left;">
          <div style="width: 60px; height: 60px; border-radius: 8px; background: var(--ivory); display: flex; align-items: center; justify-content: center; font-size: 2rem; border: 1px solid var(--line); flex-shrink: 0;">
            ${i.emoji || "🕉️"}
          </div>
          <div style="flex: 1;">
            <span style="background: #FDF2DB; color: var(--marigold-deep); font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Temple Energized</span>
            <h4 style="font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 600; color: var(--night); margin: 2px 0 0 0;">${i.name}</h4>
            <span style="font-size: 0.8rem; color: var(--muted);">Qty: ${i.qty}</span>
          </div>
          <strong style="color: var(--maroon); font-size: 1.1rem; font-weight: 700;">${formatINR(i.price * i.qty)}</strong>
        </div>
      `).join("");
    }

    // Recommendations list
    const recsWrap = document.getElementById("conf-recommendations-grid");
    if (recsWrap) {
      const recs = [
        { id: 201, name: "Panchdhatu Kuber Yantra", price: 319900, emoji: "⚜️", desc: "Opens financial channels" },
        { id: 202, name: "Amethyst Crystal Cluster", price: 219900, emoji: "💜", desc: "Spiritual protection & clarity" },
        { id: 203, name: "Brass Ganesha Idol", price: 159900, emoji: "🕉️", desc: "Removes obstacles & brings luck" },
        { id: 204, name: "7 Chakra Bracelet", price: 109900, emoji: "📿", desc: "Balances energy centres" }
      ];
      recsWrap.innerHTML = recs.map(r => `
        <div style="background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 18px; text-align: center; transition: transform 0.2s;">
          <div style="font-size: 2.4rem; margin-bottom: 12px; background: var(--ivory); padding: 14px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px;">${r.emoji}</div>
          <h4 style="font-family: 'Fraunces', serif; font-size: 0.95rem; color: var(--night); margin-bottom: 4px; font-weight: 600;">${r.name}</h4>
          <p style="color: var(--muted); font-size: 0.76rem; margin-bottom: 12px; line-height: 1.3;">${r.desc}</p>
          <strong style="color: var(--maroon); font-size: 1rem; display: block; margin-bottom: 10px;">${formatINR(r.price)}</strong>
        </div>
      `).join("");
    }

  } catch (e) {
    console.error("[Confirmation] Failed to load order details:", e);
    showToast("Could not load order details: " + e.message);
  }
}

document.addEventListener("DOMContentLoaded", loadConfirmationDetails);
