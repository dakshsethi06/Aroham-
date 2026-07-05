// routes/products.js — public product listing (DB READ: PRODUCT & INVENTORY)
const router = require("express").Router();
const supabase = require("../config/supabase");

// GET /api/products
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, stock, emoji")
    .order("id");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
