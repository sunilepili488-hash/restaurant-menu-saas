ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS closed_message TEXT DEFAULT 'Restaurant is currently closed. Please visit us again soon!';
