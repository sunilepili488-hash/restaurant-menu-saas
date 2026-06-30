# AuraMenu — 8-Change Implementation

## Change 1: UpiPaymentSheet (new component)
- [x] Create UpiPaymentSheet.jsx — full UPI payment sheet with tip, rating, UPI grid, deep-link
- [x] Update CartPage.jsx — wire Pay Now button to open UpiPaymentSheet

## Change 2: Manual Payment Sheet with UPI
- [x] Rewrite PaymentSheet.jsx — amount input + UPI selector integration

## Change 3: Live indicator dot in MenuHeader
- [x] Update MenuHeader.jsx — add green blinking dot (animated + static branches)

## Change 4: Delivery Help Number in admin
- [x] Update BrandingSection.jsx — add delivery_help_phone field

## Change 5: Delivery Help Number in customer order history (regular orders)
- [x] Update CustomerMenu.jsx — show delivery_help_phone in regular order cards

## Change 6: Delivery Boy No. on DeliveryOrderCard
- [x] Update OrderReceiver.jsx — add editable delivery_boy_phone field

## Change 7: Delivery Boy No. in customer order history
- [x] Update CustomerMenu.jsx — show delivery_boy_phone in home delivery cards

## Change 8: Banner timer friendly message
- [x] Update BannerCarousel.jsx — add messages below countdown

## Final Steps
- [x] Create SQL migration file
- [x] Build and fix errors — BUILD PASSED
- [ ] Package final ZIP
