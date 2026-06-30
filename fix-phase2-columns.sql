-- AuraMenu Phase 2: Add missing columns to the "order" table
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- These columns are required by the Phase 2 Order Receiver & Cart features.

-- 1. Special Instructions column (text, nullable)
-- Used by CartPage when a customer adds special instructions to their order
ALTER TABLE "order"
ADD COLUMN IF NOT EXISTS special_instructions text DEFAULT null;

-- 2. Estimated Prep Minutes column (integer, nullable)
-- Used by OrderReceiver dashboard when staff sets a prep time estimate
ALTER TABLE "order"
ADD COLUMN IF NOT EXISTS estimated_prep_minutes integer DEFAULT null;

-- Verify columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'order'
  AND column_name IN ('special_instructions', 'estimated_prep_minutes');
