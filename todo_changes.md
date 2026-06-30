# AuraMenu — 8 Changes Implementation Plan

## Change 1: UPI Grid Layout + Logos + Message Banner + Bug Fix
- [ ] Fix `payeName` → `payeeName` bug in PaymentSheet.jsx
- [ ] Add UPI logo URLs to UPI_APPS array in both files
- [ ] Change grid from `grid-cols-4` to `grid-cols-2`
- [ ] Add `<img>` with onError fallback in card
- [ ] Add bottom message banner with AnimatePresence
- [ ] Apply same changes to UpiPaymentSheet.jsx

## Change 2: Tip Options — Replace % with ₹ + No Tip
- [ ] Replace tipPercent state with selectedTip state
- [ ] Change TIP_OPTIONS to [10, 30, 50, 100]
- [ ] Add "No Tip" button
- [ ] Update tipAmount calculation

## Change 3: Live Likes & Comments — 7s Auto-Refresh
- [ ] Add refetchInterval: 7000 + refetchIntervalInBackground to dishes query
- [ ] Add reviews realtime subscription
- [ ] Verify existing realtime channel includes dishes

## Change 4: Order History — 7s Auto-Refresh
- [ ] Add refetchInterval: 7000 + refetchIntervalInBackground to order-history query
- [ ] Add orders realtime subscription (already exists, verify)

## Change 5: Restaurant Name Lock with Password
- [ ] Add nameLocked state + password dialog
- [ ] Add Lock/Unlock icons from lucide-react
- [ ] Disable input when locked, show lock icon
- [ ] Password = `#9#s`, re-lock after save

## Change 6: Banner Timer — Hide When Order Ready
- [ ] Filter activeTimers to exclude ready orders in BannerCarousel.jsx
- [ ] Also filter in CustomerMenu.jsx (liveOrderData check)

## Change 7: Icon Colors — Bell Yellow, CreditCard Green
- [ ] Change CreditCard icon container to bg-green-500 text-white
- [ ] Change Bell icon container to bg-yellow-400 text-white

## Change 8: Open/Closed Toggle
- [ ] Create SQL migration file
- [ ] Update Restaurant.json entity
- [ ] Add toggle UI to BrandingSection.jsx
- [ ] Add closed gate screen to CustomerMenu.jsx

## Final: Build Verification
- [ ] Run `npm run build` to verify no compilation errors
