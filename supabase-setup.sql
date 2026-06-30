-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: restaurant
-- ============================================================
create table if not exists public.restaurant (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  logo_url text,
  welcome_message text,
  splash_custom_code text,
  operating_hours text,
  currency_symbol text default '₹',
  admin_username text default 'admin',
  admin_password text default 'admin123',
  hide_user_icon boolean default false,
  order_routing_mode text default 'whatsapp' check (order_routing_mode in ('whatsapp','website')),
  whatsapp_numbers jsonb default '[]',
  website_endpoint text,
  table_qr_enabled boolean default false,
  payment_enabled boolean default false,
  upi_id text,
  upi_payee_name text,
  price_slider_min numeric default 0,
  price_slider_max numeric default 1500,
  dietary_tags jsonb default '["Veg","Non-Veg","Vegan","Jain","Gluten-Free"]',
  prep_time_filters jsonb default '["Under 5 min","Under 10 min","Under 15 min","Under 30 min"]',
  waiter_call_options jsonb default '[]',
  theme_primary_color text default '#C5A572',
  theme_bg_color text default '#1A1A1A',
  theme_mode text default 'dark' check (theme_mode in ('dark','light')),
  top_dishes jsonb default '[]',
  supabase_config jsonb default '{"url":"","anon_key":"","connected":false}',
  icon_settings jsonb,
  developer_password text default 'saas',
  feature_locks jsonb,
  hosting_url text,
  hosting_api_key text,
  hosting_connected boolean default false,
  custom_domain text,
  domain_dns_records text,
  domain_connected boolean default false,
  backend_mode text default 'supabase' check (backend_mode in ('supabase','custom')),
  hosting_config jsonb,
  domain_config jsonb
);

-- ============================================================
-- TABLE: category
-- ============================================================
create table if not exists public.category (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  sort_order numeric default 0,
  is_active boolean default true
);

-- ============================================================
-- TABLE: dish
-- ============================================================
create table if not exists public.dish (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  short_description text,
  long_description text,
  image_url text,
  regular_price numeric not null,
  sale_price numeric,
  category_id uuid references public.category(id) on delete set null,
  is_veg boolean default true,
  dietary_tags jsonb default '[]',
  prep_time_value numeric,
  prep_time_unit text default 'min' check (prep_time_unit in ('sec','min','hr')),
  like_count numeric default 0,
  ordered_today_count numeric default 0,
  ordered_today_date text,
  is_active boolean default true,
  sort_order numeric default 0,
  spice_level text default 'medium' check (spice_level in ('mild','medium','hot','extra_hot')),
  calories numeric
);

-- ============================================================
-- TABLE: banner
-- ============================================================
create table if not exists public.banner (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  subtitle text,
  image_url text,
  bg_color text default '#C5A572',
  text_color text default '#FFFFFF',
  sort_order numeric default 0,
  is_active boolean default true
);

-- ============================================================
-- TABLE: "order" (quoted because order is a reserved keyword)
-- ============================================================
create table if not exists public."order" (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  type text not null check (type in ('order','waiter_call')),
  table_number text,
  items jsonb default '[]',
  waiter_call_label text,
  total numeric,
  status text default 'pending' check (status in ('pending','confirmed','ready','completed','cancelled')),
  cancel_reason text
);

-- ============================================================
-- TABLE: review
-- ============================================================
create table if not exists public.review (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  dish_id uuid references public.dish(id) on delete cascade,
  reviewer_name text default 'Guest',
  content text not null,
  rating numeric default 5
);

-- ============================================================
-- TABLE: table_mapping
-- ============================================================
create table if not exists public.table_mapping (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  table_number text not null,
  qr_url text not null
);

-- ============================================================
-- Row Level Security (RLS) — allow anon read everywhere,
-- admin writes handled at app layer (simple password check)
-- ============================================================
alter table public.restaurant enable row level security;
alter table public.category enable row level security;
alter table public.dish enable row level security;
alter table public.banner enable row level security;
alter table public."order" enable row level security;
alter table public.review enable row level security;
alter table public.table_mapping enable row level security;

-- Allow anon to read all tables
create policy "anon read restaurant" on public.restaurant for select using (true);
create policy "anon read category" on public.category for select using (true);
create policy "anon read dish" on public.dish for select using (true);
create policy "anon read banner" on public.banner for select using (true);
create policy "anon read order" on public."order" for select using (true);
create policy "anon read review" on public.review for select using (true);
create policy "anon read table_mapping" on public.table_mapping for select using (true);

-- Allow anon to insert/update/delete (admin check is done in app layer)
create policy "anon write restaurant" on public.restaurant for all using (true) with check (true);
create policy "anon write category" on public.category for all using (true) with check (true);
create policy "anon write dish" on public.dish for all using (true) with check (true);
create policy "anon write banner" on public.banner for all using (true) with check (true);
create policy "anon write order" on public."order" for all using (true) with check (true);
create policy "anon write review" on public.review for all using (true) with check (true);
create policy "anon write table_mapping" on public.table_mapping for all using (true) with check (true);

-- ============================================================
-- SEED: Insert default restaurant row so the app has something to load
-- ============================================================
insert into public.restaurant (name, currency_symbol, admin_username, admin_password, theme_mode, theme_primary_color, theme_bg_color, order_routing_mode, dietary_tags, prep_time_filters, waiter_call_options, top_dishes, whatsapp_numbers, supabase_config)
values (
  'My Restaurant',
  '₹',
  'admin',
  'admin123',
  'dark',
  '#C5A572',
  '#1A1A1A',
  'whatsapp',
  '["Veg","Non-Veg","Vegan","Jain","Gluten-Free"]',
  '["Under 5 min","Under 10 min","Under 15 min","Under 30 min"]',
  '[{"label":"Waiter","icon":"👨‍🍳","toast_message":"Waiter is on the way!"}]',
  '[]',
  '[]',
  '{"url":"https://lwrmtyteuawfjgpgoaoi.supabase.co","anon_key":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cm10eXRldWF3ZmpncGdvYW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzUzOTAsImV4cCI6MjA5ODA1MTM5MH0.Ilj1FXQt3pM_zkHJ_BBxNQTAQZQGiQJC_me1HLvWA8w","connected":true}'
) on conflict do nothing;

-- ============================================================
-- Enable realtime for the order table
-- ============================================================
alter publication supabase_realtime add table public."order";
