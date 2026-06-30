# AuraMenu Phase 3 — Fix & Feature Build

## Setup
- [x] Unzip project and review all files
- [x] Create SQL migration file
- [x] Install npm dependencies

## Bug Fixes
- [x] Issue 1: Image upload error handling + toast in DishesSection.jsx
- [x] Issue 2: DishCard UI — 3 icons, ThumbsUp, Favorite overlay; BottomActionBar — Bag + Favorite + Payment + Bell
- [x] Issue 3: Branding save — null guard on restaurant.id
- [x] Issue 4: Theme apply — null guard, disabled state, Check/Loader2 icons
- [x] Issue 5: Resolved by SQL migration (no code change)

## Payment Modal Redesign
- [x] Issue 6A: DishCardGrid.jsx — modern slide-up payment modal with 2x2 UPI grid
- [x] Issue 6B: PaymentSheet.jsx — update UPI apps to 2x2 grid with real logos

## Home Delivery Feature
- [x] Issue 7A: Create HomeDeliveryFlow.jsx
- [x] Issue 7B: Create HomeDeliverySection.jsx (admin)
- [x] Issue 7C: Update CartPage.jsx — add Home Delivery button + flow
- [x] Issue 7D: Update OrderReceiver.jsx — Home Delivery tab + DeliveryOrderCard
- [x] Issue 7E: Update AdminSidebar.jsx — add Home Delivery nav item
- [x] Issue 7F: Update AdminDashboard.jsx — add HomeDeliverySection rendering
- [x] Issue 7G: Update CustomerMenu.jsx — pass onPaymentClick to BottomActionBar

## Phase 3 Patch Changes

### Change 1: Home Delivery Orders Tab Filtering
- [x] Filter home delivery orders out of Confirmation/Ready tabs
- [x] Add shortId() helper to DeliveryOrderCard

### Change 2: Inline Editable Time Box (Remove Edit Timer Icon)
- [x] Remove showPrepInput/prepInput states and Timer icon button
- [x] Add inline editable time box with prepTime state and avgPrepMin

### Change 3: Timer Logic — Waiter Confirms → Timer Starts
- [x] updateOrderStatus accepts prepMins param
- [x] Confirm button passes prepMins; sets timer_started_at and prep_time_override

### Change 4: Fix ready_at Column Error
- [x] Remove ready_at field from updateOrderStatus

### Change 5: Delivery Time Shown to Customer
- [x] Add handleSetDeliveryTime in OrderReceiver
- [x] Add inline editable delivery time box in DeliveryOrderCard
- [x] Add Supabase Realtime subscription in HomeDeliveryFlow for live updates
- [x] Add disclaimer text in HomeDeliveryFlow

### Change 6: Customer Order History
- [x] Update MenuHeader.jsx — History icon, isOwnerMode, onHistoryClick
- [x] Update CustomerMenu.jsx — historyOpen, customer_session_id, order history panel

### Change 7: Admin Panel — Pass & Icon Access
- [x] Update SearchOverlay.jsx — add "cr" shortcut detection, icon unlock dialog
- [x] Create PassSection.jsx — password manager, icon access control, revoke sessions
- [x] Update AdminSidebar.jsx — add Pass nav item with KeyRound icon
- [x] Update AdminDashboard.jsx — add PassSection import and case

## Final Steps
- [x] Build and fix errors
- [x] Package final ZIP
