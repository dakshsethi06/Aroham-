// ---------- Products (fetched from backend /api/products) ----------

const DEMO_PRODUCTS = [
  { id: 1, name: "5 Mukhi Rudraksha", description: "Nepali bead for peace & health", price: 49900, stock: 50, emoji: "📿" },
  { id: 2, name: "Shree Yantra", description: "Brass, energised for prosperity", price: 89900, stock: 30, emoji: "🔱" },
  { id: 3, name: "Natural Pearl (Moti)", description: "Certified, for Moon strength", price: 259900, stock: 15, emoji: "🫧" },
  { id: 4, name: "Yellow Sapphire", description: "Pukhraj for Jupiter blessings", price: 799900, stock: 10, emoji: "💛" },
  { id: 5, name: "Pooja Thali Set", description: "Complete brass thali, 7 items", price: 129900, stock: 40, emoji: "🪔" },
  { id: 6, name: "Gemstone Bracelet", description: "7-chakra healing bracelet", price: 39900, stock: 60, emoji: "🧿" },
];

const BADGES = ["Bestseller", "Energised", "Certified", "New", "Popular", "Handmade"];
const HUES = [36, 265, 200, 48, 16, 320];   // per-product tile hue

async function fetchProducts() {
  try {
    const data = await api("/products");
    return data.length ? data : DEMO_PRODUCTS;
  } catch {
    return DEMO_PRODUCTS; // backend not running yet → demo mode
  }
}

function stars(id) {
  const rating = 4 + ((id * 7) % 10) / 10;          // stable pseudo-rating 4.0–4.9
  const count = 120 + ((id * 37) % 380);
  return `<div class="rating">★★★★★<small>${rating.toFixed(1)} (${count})</small></div>`;
}

function productCard(p, idx) {
  const out = p.stock !== undefined && p.stock <= 0;
  const hue = HUES[idx % HUES.length];
  return `
    <div class="product-card">
      <div class="product-tile" style="--h:${hue}">
        <span class="badge-tag">${BADGES[idx % BADGES.length]}</span>
        ${p.emoji || "🕉️"}
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p class="product-desc">${p.description || ""}</p>
        ${stars(p.id)}
        <div class="product-row">
          <span class="price">${formatINR(p.price)} <small>incl. tax</small></span>
          ${out
            ? `<button class="add-btn" disabled>Out of stock</button>`
            : `<button class="add-btn" onclick='addToCart(${JSON.stringify(p)})'>Add to Cart</button>`}
        </div>
      </div>
    </div>`;
}

function addToCart(p) {
  const cart = getCart();
  const found = cart.find((i) => i.id === p.id);
  if (found) found.qty += 1;
  else cart.push({ id: p.id, name: p.name, price: p.price, emoji: p.emoji, qty: 1, description: p.description });
  saveCart(cart);
  showToast(p.name + " added to cart 🛒");
}

async function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  const products = await fetchProducts();
  grid.innerHTML = products.map(productCard).join("");
}

document.addEventListener("DOMContentLoaded", renderProducts);
