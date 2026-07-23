ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS icon_lock_password text DEFAULT 'con#5';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS scroll_animation_style text DEFAULT 'fade-up';
ALTER TABLE public.restaurant ADD COLUMN IF NOT EXISTS splash_book_animation boolean DEFAULT false;