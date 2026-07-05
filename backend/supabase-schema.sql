-- Aroham schema (run in Supabase SQL Editor). Matches the order-management architecture.
-- Prices/amounts in PAISE (₹499 = 49900).

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price bigint not null,
  stock int not null default 100,
  reserved int not null default 0,
  emoji text default '🕉️'
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount bigint not null,
  status text default 'PENDING',        -- PENDING | CONFIRMED | PAYMENT_FAILED
  address jsonb,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id uuid references orders on delete cascade,
  product_id bigint references products,
  name text, price bigint, qty int, emoji text
);

create table if not exists payments (
  id bigint generated always as identity primary key,
  order_id uuid references orders on delete cascade,
  user_id uuid references auth.users,
  amount bigint,
  status text default 'INITIATED',      -- INITIATED | SUCCESS | FAILED
  razorpay_order_id text,
  razorpay_payment_id text,
  method text, failure_reason text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Stock functions (reserve on order, commit on success, release on failure)
create or replace function reserve_stock(p_product_id bigint, p_qty int)
returns void language plpgsql as $$
begin
  update products set stock = stock - p_qty, reserved = reserved + p_qty
  where id = p_product_id and stock >= p_qty;
  if not found then raise exception 'Insufficient stock'; end if;
end $$;

create or replace function commit_stock(p_product_id bigint, p_qty int)
returns void language plpgsql as $$
begin
  update products set reserved = greatest(reserved - p_qty, 0) where id = p_product_id;
end $$;

create or replace function release_stock(p_product_id bigint, p_qty int)
returns void language plpgsql as $$
begin
  update products set stock = stock + p_qty, reserved = greatest(reserved - p_qty, 0)
  where id = p_product_id;
end $$;

-- RLS: backend uses service role (bypasses RLS); lock tables from anon access
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
create policy "Public read products" on products for select using (true);

-- Sample products
insert into products (name, description, price, stock, emoji) values
('5 Mukhi Rudraksha', 'Nepali bead for peace & health', 49900, 50, '📿'),
('Shree Yantra', 'Brass, energised for prosperity', 89900, 30, '🔱'),
('Natural Pearl (Moti)', 'Certified, for Moon strength', 259900, 15, '🫧'),
('Yellow Sapphire', 'Pukhraj for Jupiter blessings', 799900, 10, '💛'),
('Pooja Thali Set', 'Complete brass thali, 7 items', 129900, 40, '🪔'),
('Gemstone Bracelet', '7-chakra healing bracelet', 39900, 60, '🧿');
