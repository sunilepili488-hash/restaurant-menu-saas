-- ============================================================
-- FIX: Add missing columns to Supabase tables
-- These columns are expected by the AuraMenu app but were
-- missing from the pre-existing database schema.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLE: restaurant  (30 missing columns)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS currency_symbol text DEFAULT '₹';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS order_routing_mode text DEFAULT 'whatsapp' CHECK (order_routing_mode IN ('whatsapp','website'));
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS whatsapp_numbers jsonb DEFAULT '[]';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS website_endpoint text;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS table_qr_enabled boolean DEFAULT false;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS payment_enabled boolean DEFAULT false;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS upi_id text;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS upi_payee_name text;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS price_slider_min numeric DEFAULT 0;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS price_slider_max numeric DEFAULT 1500;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS dietary_tags jsonb DEFAULT '["Veg","Non-Veg","Vegan","Jain","Gluten-Free"]';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS prep_time_filters jsonb DEFAULT '["Under 5 min","Under 10 min","Under 15 min","Under 30 min"]';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS waiter_call_options jsonb DEFAULT '[]';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS theme_primary_color text DEFAULT '#C5A572';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS theme_bg_color text DEFAULT '#1A1A1A';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS theme_mode text DEFAULT 'dark' CHECK (theme_mode IN ('dark','light'));
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS top_dishes jsonb DEFAULT '[]';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS supabase_config jsonb DEFAULT '{"url":"","anon_key":"","connected":false}';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS icon_settings jsonb;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS developer_password text DEFAULT 'saas';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS feature_locks jsonb;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS hosting_url text;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS hosting_api_key text;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS hosting_connected boolean DEFAULT false;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS custom_domain text;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS domain_dns_records text;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS domain_connected boolean DEFAULT false;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS backend_mode text DEFAULT 'supabase' CHECK (backend_mode IN ('supabase','custom'));
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS hosting_config jsonb;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS domain_config jsonb;

-- ────────────────────────────────────────────────────────────
-- TABLE: dish  (2 missing columns)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.dish ADD COLUMN IF NOT EXISTS dietary_tags jsonb DEFAULT '[]';
ALTER TABLE public.dish ADD COLUMN IF NOT EXISTS ordered_today_date text;

-- ────────────────────────────────────────────────────────────
-- TABLE: "order"  (add missing columns if any, also add notes if not present)
-- ────────────────────────────────────────────────────────────
-- The "order" table already has a "notes" column that wasn't in our schema,
-- but the app might use it, so we leave it. No missing columns needed.

-- ============================================================
-- DONE! After running this, the app's Create Dish and Save
-- buttons should work correctly.
-- ============================================================
