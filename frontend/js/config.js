// ================= AROHAM FRONTEND CONFIG =================
// Supabase anon key is safe for frontend. Razorpay key comes from backend.
const SUPABASE_URL = "https://lzzdfsphevmzbkkoskxb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_hXI5tCwU5jA3BQtdLxuXoQ_L69CcRaZ";
const API_BASE = "http://localhost:5001/api";   // backend URL
// ==========================================================

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const IS_PAGES = window.location.pathname.includes("/pages/");
const ROOT = IS_PAGES ? "../" : "";

// Authenticated fetch helper → sends Supabase JWT to backend
async function api(path, options = {}) {
  const { data } = await db.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...options.headers,
    },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || (body.errors || []).join(", ") || "Request failed");
  return body;
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function getCart() { return JSON.parse(localStorage.getItem("aroham_cart") || "[]"); }

function saveCart(cart) {
  localStorage.setItem("aroham_cart", JSON.stringify(cart));
  updateCartBadge();
}

async function updateCartBadge() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  try {
    const { data } = await db.auth.getSession();
    if (data.session) {
      const cart = await api("/cart?temp=false");
      el.textContent = cart.reduce((n, i) => n + i.qty, 0);
      return;
    }
  } catch (e) {
    console.error("Failed to fetch database cart for badge", e);
  }
  el.textContent = getCart().reduce((n, i) => n + i.qty, 0);
}

function formatINR(paise) { return "₹" + (paise / 100).toLocaleString("en-IN"); }

document.addEventListener("DOMContentLoaded", updateCartBadge);
