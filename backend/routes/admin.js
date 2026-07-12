// routes/admin.js — Admin-only endpoints (whitelist from ADMIN_EMAILS env)
const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const supabase = require("../config/supabase");

function requireAdmin(req, res, next) {
  const allowed = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  if (!allowed.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ error: "Not authorized" });
  }
  next();
}

// GET /api/admin/orders — all orders with user email, payment status, shiprocket fields
router.get("/orders", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrich each order with user email from Supabase Auth
    const enriched = await Promise.all(data.map(async (order) => {
      let email = "unknown";
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
        if (userData?.user) email = userData.user.email;
      } catch (_) { /* ignore */ }
      return { ...order, user_email: email };
    }));

    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/check — lets frontend know if current user is admin
router.get("/check", requireAuth, requireAdmin, (req, res) => {
  res.json({ isAdmin: true });
});

const razorpay = require("../config/razorpay");

// POST /api/admin/cancel — cancel an order in Shiprocket + refund Razorpay + update Supabase
router.post("/cancel", requireAuth, requireAdmin, async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "orderId required" });

  try {
    const { data: order } = await supabase.from("orders").select("shipment_id, payments(*)").eq("id", orderId).single();

    // 1. Cancel on Shiprocket if a shipment exists
    if (order?.shipment_id && process.env.SHIPROCKET_EMAIL) {
      const { ShiprocketService } = require("../services/shiprocket");
      const shiprocket = new ShiprocketService(process.env.SHIPROCKET_EMAIL, process.env.SHIPROCKET_PASSWORD);
      await shiprocket.initialize();
      await shiprocket.cancelOrder([String(order.shipment_id)]);
    }

    // 2. Refund Razorpay Payment
    const payment = order?.payments?.[0];
    if (payment && payment.razorpay_payment_id && (payment.status === "SUCCESS" || payment.status === "PAID")) {
      try {
        await razorpay.payments.refund(payment.razorpay_payment_id, {
          "speed": "normal",
          "notes": { "reason": "Order cancelled by admin" }
        });
        await supabase.from("payments").update({ status: "REFUNDED" }).eq("id", payment.id);
      } catch (refundErr) {
        console.error("Razorpay refund failed:", refundErr);
        return res.status(500).json({ error: "Shiprocket cancelled, but Razorpay refund failed: " + refundErr.message });
      }
    }

    // 3. Update order status in Supabase
    await supabase.from("orders").update({ status: "CANCELLED" }).eq("id", orderId);

    res.json({ success: true, message: "Order cancelled and refunded" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/generate-label — manually trigger Shiprocket label creation
router.post("/generate-label", requireAuth, requireAdmin, async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "orderId required" });

  try {
    const { data: order } = await supabase.from("orders").select("*, users(*)").eq("id", orderId).single();
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.shipment_id) return res.status(400).json({ error: "Label already generated" });

    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);

    if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
      const { ShiprocketService } = require("../services/shiprocket");
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
          selling_price: i.price / 100
        }))
      };

      const result = await shiprocket.processFulfillment(orderData);
      
      if (result.success) {
        await supabase.from("orders").update({
          shipment_id: result.shipmentId,
          awb_code: result.awbData?.response?.data?.awb_code || null,
          label_url: result.labelUrl
        }).eq("id", orderId);
        res.json({ success: true, label_url: result.labelUrl });
      } else {
        res.status(500).json({ error: "Shiprocket API Error: " + (result.error.message || JSON.stringify(result.error)) });
      }
    } else {
      res.status(500).json({ error: "Shiprocket credentials missing in environment" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
