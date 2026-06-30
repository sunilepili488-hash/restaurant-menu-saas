-- Add delivery_help_phone to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS delivery_help_phone text DEFAULT '';

-- Add delivery_boy_phone to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_boy_phone text DEFAULT '';
