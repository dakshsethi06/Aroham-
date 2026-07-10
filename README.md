# ꕥ Aroham — Full Stack (Frontend + Backend)

Follows the Order Management Architecture:
User Action → Cart/Validation → Order Creation (PENDING) → Order Items →
Reserve Stock → Payment Record (INITIATED) → Razorpay → Dual Verification
(redirect + webhook) → CONFIRMED / PAYMENT_FAILED → Order History.

## Structure
```
aroham-full/
├── backend/                    # Express.js API
│   ├── server.js               # Entry point
│   ├── package.json
│   ├── .env.example            # 🔑 copy to .env, add keys
│   ├── supabase-schema.sql     # Run once in Supabase SQL Editor
│   ├── config/                 # supabase.js, razorpay.js
│   ├── middleware/auth.js      # Verifies Supabase JWT
│   ├── routes/                 # products, cart, orders, payments
│   └── services/               # validation, order, payment services
│       └── shiprocket/         # Shiprocket fulfillment API module
└── frontend/                   # Static site (open with a local server)
    ├── index.html
    ├── css/  js/  pages/
```

## Setup
1. Supabase: run `backend/supabase-schema.sql` in SQL Editor.
   Enable Email auth (turn off "Confirm email" for testing).
2. Backend:
   cd backend && cp .env.example .env   (fill keys) && npm install && npm start
   **Shiprocket:** Ensure you add `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` to `.env`.
   → http://localhost:5000/api/health
3. Frontend: put SUPABASE_URL + anon key in frontend/js/config.js, then:
   cd frontend && npx serve .   → http://localhost:3000
4. Webhook (optional, "source of truth" path): expose backend via ngrok,
   add webhook in Razorpay dashboard → URL: <ngrok>/api/payments/webhook,
   events: payment.captured, payment.failed. Put secret in .env.

## Test payment
Card 4111 1111 1111 1111 (any expiry/CVV) or UPI success@razorpay.

## Flow mapping to the diagram
- POST /api/cart/validate  → Product Validation (stock/price check)
- POST /api/orders         → Order PENDING + items + reserve_stock() + payment INITIATED + Razorpay order
- POST /api/payments/verify→ Redirect path: HMAC signature check → CONFIRMED + commit_stock() + **Shiprocket dispatch**
- POST /api/payments/failed→ FAILED path: PAYMENT_FAILED + release_stock()
- POST /api/payments/webhook→ Webhook path (source of truth, idempotent)
- GET  /api/orders         → Order History (orders + items + payments + AWB tracking)
