// ---------- Products (fetched from backend /api/products) ----------
const DEMO_PRODUCTS = [
  { id: 1, name: "5 Mukhi Rudraksha", description: "Nepali bead for peace & health", price: 49900, stock: 50, emoji: "📿" },
  { id: 2, name: "Shree Yantra", description: "Brass, energised for prosperity", price: 89900, stock: 30, emoji: "🔱" },
  { id: 3, name: "Natural Pearl (Moti)", description: "Certified, for Moon strength", price: 259900, stock: 15, emoji: "🫧" },
  { id: 4, name: "Yellow Sapphire", description: "Pukhraj for Jupiter blessings", price: 799900, stock: 10, emoji: "💛" },
  { id: 5, name: "Pooja Thali Set", description: "Complete brass thali, 7 items", price: 129900, stock: 40, emoji: "🪔" },
  { id: 6, name: "Gemstone Bracelet", description: "7-chakra healing bracelet", price: 39900, stock: 60, emoji: "🧿" }
];
const BADGES = ["Bestseller", "Energised", "Certified", "New", "Popular", "Handmade"];
const HUES = [36, 265, 200, 48, 16, 320];

async function fetchProducts() {
  try {
    const data = await api("/products");
    return data.length ? data : DEMO_PRODUCTS;
  } catch { return DEMO_PRODUCTS; }
}
function stars(id) {
  const rating = 4 + ((id * 7) % 10) / 10;
  const count = 120 + ((id * 37) % 380);
  return `<div class="rating-stars" style="color:var(--marigold); font-size:0.85rem; display:flex; align-items:center; gap:4px; margin: 4px 0 8px 0;">★★★★★ <span style="color:var(--muted); font-size:0.75rem;">${rating.toFixed(1)} (${count})</span></div>`;
}
function productCard(p, idx) {
  const out = p.stock !== undefined && p.stock <= 0;
  const hue = HUES[idx % HUES.length];
  const strikePrice = formatINR(Math.floor(p.price * 1.3));
  return `
    <div class="product-card" style="position: relative;">
      <div class="product-tile" style="--h:${hue}; position: relative; overflow: hidden;">
        <span class="badge-tag">${BADGES[idx % BADGES.length]}</span>
        <button class="wishlist-overlay-btn" onclick="showToast('Added to Wishlist! ❤️')" style="position: absolute; right: 12px; top: 12px; border: none; background: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.06); z-index: 5;">❤️</button>
        <span style="font-size: 4rem;">${p.emoji || "🕉️"}</span>
        
        ${out ? '' : `
          <div class="quick-add-bar" onclick='addToCart(${JSON.stringify(p)})' style="position: absolute; bottom: 0; left: 0; right: 0; background: var(--maroon); color: #fff; text-align: center; padding: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transform: translateY(100%); transition: transform 0.2s ease; z-index: 6;">
            🛒 Quick Add to Cart
          </div>
        `}
      </div>
      <div class="product-body" style="text-align: left; padding: 18px 14px;">
        <h3 style="font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 600; color: var(--night); margin-bottom: 4px;">${p.name}</h3>
        <p class="product-desc" style="color: var(--muted); font-size: 0.85rem; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.description || "Consecrated Vedic Product"}</p>
        ${stars(p.id)}
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="price" style="font-size: 1.15rem; font-weight: 700; color: var(--maroon);">${formatINR(p.price)}</span>
          <span style="font-size: 0.88rem; color: var(--muted); text-decoration: line-through;">${strikePrice}</span>
        </div>
      </div>
    </div>`;
}
async function addToCart(p) {
  const user = await getUser();
  if (user) {
    try {
      await api("/cart", { method: "POST", body: JSON.stringify({ productId: p.id, qty: 1 }) });
      showToast(p.name + " added to cart 🛒");
      const cart = await api("/cart");
      saveCart(cart);
    } catch (e) { showToast(e.message); }
  } else {
    const cart = getCart();
    const found = cart.find((i) => i.id === p.id);
    if (found) found.qty += 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, emoji: p.emoji, qty: 1, description: p.description });
    saveCart(cart);
    showToast(p.name + " added to cart 🛒");
  }
}
async function buyNow(p) {
  const user = await requireLogin();
  if (!user) return;
  try {
    showToast("Starting quick checkout...");
    await api("/cart/buy-now", { method: "POST", body: JSON.stringify({ productId: p.id, qty: 1 }) });
    window.location.href = ROOT + "pages/cart.html?checkout=buy_now";
  } catch (e) { showToast(e.message); }
}
async function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  const products = await fetchProducts();
  grid.innerHTML = products.map(productCard).join("");
}
document.addEventListener("DOMContentLoaded", renderProducts);
