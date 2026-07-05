// services/orderService.js
// "3. ORDER PROCESSING": order (PENDING) → order items → reserve stock → payment record
const supabase = require("../config/supabase");

async function createPendingOrder(userId, products, address) {
  const amount = products.reduce((s, p) => s + p.subtotal, 0);

  // 1. Order record (status: PENDING) → ORDERS TABLE
  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({ user_id: userId, amount, status: "PENDING", address })
    .select()
    .single();
  if (oErr) throw new Error("Order creation failed: " + oErr.message);

  // 2. Order items → ORDER ITEMS TABLE
  const rows = products.map((p) => ({
    order_id: order.id, product_id: p.id, name: p.name,
    price: p.price, qty: p.qty, emoji: p.emoji,
  }));
  const { error: iErr } = await supabase.from("order_items").insert(rows);
  if (iErr) throw new Error("Order items failed: " + iErr.message);

  // 3. Reserve stock → INVENTORY (products.stock / reserved)
  for (const p of products) {
    const { error } = await supabase.rpc("reserve_stock", {
      p_product_id: p.id, p_qty: p.qty,
    });
    if (error) throw new Error(`Stock reserve failed for ${p.name}: ${error.message}`);
  }

  // 4. Payment record (status: INITIATED) → PAYMENT TABLE
  const { data: payment, error: pErr } = await supabase
    .from("payments")
    .insert({ order_id: order.id, user_id: userId, amount, status: "INITIATED" })
    .select()
    .single();
  if (pErr) throw new Error("Payment record failed: " + pErr.message);

  return { order, payment, amount };
}

async function getUserOrders(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), payments(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { createPendingOrder, getUserOrders };
