// server.js — Aroham backend entry point
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

// Keep raw body for Razorpay webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); },
}));

// ---- Routes ----
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/addresses", require("./routes/addresses"));
app.use("/api/auth", require("./routes/auth"));


app.get("/api/health", (req, res) => res.json({ status: "ok", service: "aroham-backend" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🕉️  Aroham backend running on http://localhost:${PORT}`));
