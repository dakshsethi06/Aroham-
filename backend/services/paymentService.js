// services/paymentService.js
// "4. PAYMENT" + "5. ORDER CONFIRMATION": verify signature, update statuses, stock
const crypto = require("crypto");
const supabase = require("../config/supabase");

function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body).digest("hex");
  return expected === razorpay_signature;
}

function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody).digest("hex");
  return expected === signature;
}

// SUCCESS path: payment SUCCESS → order CONFIRMED → reserved stock becomes sold
async function confirmOrder(orderId, paymentDetails) {
  await supabase.from("payments")
    .update({ status: "SUCCESS", ...paymentDetails, paid_at: new Date().toISOString() })
    .eq("order_id", orderId);
  await supabase.from("orders").update({ status: "CONFIRMED" }).eq("id", orderId);

  const { data: items } = await supabase.from("order_items")
    .select("product_id, qty").eq("order_id", orderId);
  for (const it of items || [])
    await supabase.rpc("commit_stock", { p_product_id: it.product_id, p_qty: it.qty });
}

// FAILURE path: payment FAILED → order PAYMENT_FAILED → release reserved stock
async function failOrder(orderId, reason) {
  await supabase.from("payments")
    .update({ status: "FAILED", failure_reason: reason || "Payment failed" })
    .eq("order_id", orderId);
  await supabase.from("orders").update({ status: "PAYMENT_FAILED" }).eq("id", orderId);

  const { data: items } = await supabase.from("order_items")
    .select("product_id, qty").eq("order_id", orderId);
  for (const it of items || [])
    await supabase.rpc("release_stock", { p_product_id: it.product_id, p_qty: it.qty });
}

module.exports = { verifyPaymentSignature, verifyWebhookSignature, confirmOrder, failOrder };
