// services/paymentService.js
// "4. PAYMENT" + "5. ORDER CONFIRMATION": verify signature, update statuses, stock
const crypto = require("crypto");
const supabase = require("../config/supabase");
const { ShiprocketService } = require("./shiprocket");

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

// SUCCESS path: payment SUCCESS → order CONFIRMED → reserved stock becomes sold → Shiprocket Integration
async function confirmOrder(orderId, paymentDetails) {
  // 1. Update payments table
  await supabase.from("payments")
    .update({ status: "SUCCESS", ...paymentDetails, paid_at: new Date().toISOString() })
    .eq("order_id", orderId);

  // 2. Fetch full order & items for Shiprocket
  const { data: order } = await supabase.from("orders").select("*, users(*)").eq("id", orderId).single();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);

  // 3. Commit stock
  for (const it of items || []) {
    await supabase.rpc("commit_stock", { p_product_id: it.product_id, p_qty: it.qty });
  }

  // 4. Trigger Shiprocket (if credentials exist)
  if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD && order && items) {
    try {
      const shiprocket = new ShiprocketService(process.env.SHIPROCKET_EMAIL, process.env.SHIPROCKET_PASSWORD);
      await shiprocket.initialize();

      const user = order.users || {};
      const addr = order.address || {};
      
      const orderData = {
        order_id: order.id,
        customer_name: addr.name || user.full_name || "Customer",
        address: addr.address || "No address provided",
        city: addr.city || "Unknown",
        pincode: addr.pincode || "000000",
        state: addr.state || addr.city || "Unknown", 
        phone: addr.phone || user.phone || "0000000000",
        email: addr.email || user.email || "noemail@example.com",
        sub_total: order.amount / 100, // paise to INR
        items: items.map(i => ({
          name: i.name,
          sku: `SKU-${i.product_id}`,
          units: i.qty,
          selling_price: i.price / 100 // paise to INR
        }))
      };

      const result = await shiprocket.processFulfillment(orderData);
      
      // 5. Update order with shipping details
      if (result.success) {
        await supabase.from("orders").update({
          status: "CONFIRMED",
          shipment_id: result.shipmentId,
          awb_code: result.awbData?.response?.data?.awb_code || null,
          label_url: result.labelUrl
        }).eq("id", orderId);
      } else {
        console.error("[Shiprocket] Fulfillment failed:", result.error);
        await supabase.from("orders").update({ status: "CONFIRMED" }).eq("id", orderId);
      }
    } catch (err) {
      console.error("[Shiprocket] Integration error:", err.message);
      await supabase.from("orders").update({ status: "CONFIRMED" }).eq("id", orderId);
    }
  } else {
    // If no shiprocket env vars, just confirm order normally
    await supabase.from("orders").update({ status: "CONFIRMED" }).eq("id", orderId);
  }
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
