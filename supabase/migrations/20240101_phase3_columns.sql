-- Phase 3 migrations: Fix missing order columns + Home Delivery feature columns

-- Issue 5 Fix: Missing columns that crash Order Receiver
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS prep_time_override INTEGER;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP WITH TIME ZONE;

-- Issue 2/6 existing fix columns (already in fix-phase2-columns.sql, include for safety)
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS special_instructions text DEFAULT null;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS estimated_prep_minutes integer DEFAULT null;

-- Home Delivery Feature (Issue 7) — new columns on "order" table
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS is_home_delivery BOOLEAN DEFAULT FALSE;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS delivery_otp VARCHAR(4);
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS delivery_address JSONB;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS delivery_phone VARCHAR(20);
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS delivery_name VARCHAR(100);
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cod';

-- Home Delivery settings on restaurant table
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS home_delivery_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS delivery_time_minutes INTEGER DEFAULT 30;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS minimum_order_amount NUMERIC DEFAULT 0;
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 0;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'order' AND column_name IN (
  'confirmed_at','prep_time_override','timer_started_at',
  'is_home_delivery','delivery_otp','delivery_address',
  'delivery_phone','delivery_name','delivered_at','payment_method'
);
