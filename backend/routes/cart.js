// routes/cart.js — "1. USER ACTION": add/update cart with product validation
// Cart itself lives in the browser (localStorage); this endpoint validates it
// against live stock & prices before checkout, per the architecture.
const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const { validateItems } = require("../services/validationService");

// POST /api/cart/validate   body: { items: [{ id, qty }] }
router.post("/validate", requireAuth, async (req, res) => {
  try {
    const result = await validateItems(req.body.items);
    if (!result.valid) return res.status(400).json({ errors: result.errors });
    const total = result.products.reduce((s, p) => s + p.subtotal, 0);
    res.json({ valid: true, products: result.products, total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
