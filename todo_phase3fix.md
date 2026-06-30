# AuraMenu Phase 3 — Bug Fix & Feature Patch

## Fix 1: Home Delivery Orders Not Showing in Customer Order History
- [x] Update HomeDeliveryFlow.jsx — add customer_session_id + delivery_time_minutes to orderData
- [x] Update CustomerMenu.jsx — add 3-hour filter, render delivery order history cards with OTP/time/contact

## Fix 2: Timer Bug — Waiter Edits Time but Old Value Starts as Timer
- [x] Update CustomerMenu.jsx — add liveOrderData polling effect, pass to BannerCarousel
- [x] Update BannerCarousel.jsx — accept liveOrderData, recompute estimatedReady from Supabase data, show "waiting" state before confirm

## Fix 3: Payment Icon Separate from Order Card Payment
- [x] Rewrite PaymentSheet.jsx — standalone clean payment sheet
- [x] Update CustomerMenu.jsx — wire Payment icon to PaymentSheet (not CartPage)
- [x] Update CartPage.jsx — remove manual amount input block, remove manualAmount state

## Final Steps
- [x] Build and fix errors
- [x] Package final ZIP
