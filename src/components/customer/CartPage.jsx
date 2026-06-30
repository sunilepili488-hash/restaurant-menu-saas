import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Bookmark, ShoppingBag, Trash2, CreditCard, MessageSquare, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { getTodayStr } from '@/lib/formatUtils';
import { entities } from '@/api/entities';
import HomeDeliveryFlow from './HomeDeliveryFlow';
import UpiPaymentSheet from './UpiPaymentSheet';

export default function CartPage({ open, onClose, dishes = [], restaurant, onPay, defaultTab = 'orders', onOrderPlaced }) {
  const store = useMenuStore();
  const curr = restaurant?.currency_symbol || '₹';
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);
  const [previewOrderId, setPreviewOrderId] = useState(null);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [upiPayOpen, setUpiPayOpen] = useState(false);

  const favDishes = dishes.filter(d => store.favorites.includes(d.id));
  const cartItems = store.cart;

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.dish?.sale_price || item.dish?.regular_price || 0;
    return sum + price * item.quantity;
  }, 0);

  const lockedOrders = store.lockedOrders || [];

  const lockedOrdersTotal = lockedOrders.reduce((sum, lo) => sum + (lo.total || 0), 0);

  const handleDeleteLockedOrder = async (groupId) => {
    menuStore.removeLockedOrder(groupId);
    try { await entities.Order.delete(groupId); } catch {}
  };

  const placeOrder = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      const tableNum = store.tableNumber;
      const orderItems = cartItems.map(i => ({
        name: i.dish.name,
        qty: i.quantity,
        price: i.dish.sale_price || i.dish.regular_price,
      }));

      let orderRecord;
      try {
        orderRecord = await entities.Order.create({
          type: 'order',
          table_number: tableNum,
          items: orderItems,
          total: subtotal,
          status: 'pending',
          special_instructions: specialInstructions || null,
        });
      } catch (colErr) {
        if (colErr?.message?.includes('special_instructions') || colErr?.code === '42703') {
          console.warn('special_instructions column missing, retrying without it');
          orderRecord = await entities.Order.create({
            type: 'order',
            table_number: tableNum,
            items: orderItems,
            total: subtotal,
            status: 'pending',
          });
        } else {
          throw colErr;
        }
      }

      const groupId = orderRecord.id || Date.now().toString();
      const avgPrepMin = cartItems.reduce((sum, item) => {
        let mins = item.dish?.prep_time_value || 15;
        if (item.dish?.prep_time_unit === 'sec') mins = mins / 60;
        if (item.dish?.prep_time_unit === 'hr') mins = mins * 60;
        return sum + mins;
      }, 0) / Math.max(cartItems.length, 1);
      const bufferMin = Math.ceil(avgPrepMin) + 5;
      const estimatedReady = new Date(Date.now() + bufferMin * 60000).toISOString();

      menuStore.addLockedOrder({
        groupId,
        items: cartItems.map(i => ({ ...i })),
        total: subtotal,
        specialInstructions,
        estimatedReady,
        status: 'locked',
        paymentMethod: null,
        createdAt: new Date().toISOString(),
        placedAt: new Date().toISOString(),
      });

      menuStore.clearCart();
      setSpecialInstructions('');

      const today = getTodayStr();
      cartItems.forEach(item => {
        const baseCount = item.dish?.ordered_today_date === today ? (item.dish?.ordered_today_count || 0) : 0;
        entities.Dish.update(item.dish_id, {
          ordered_today_count: baseCount + item.quantity,
          ordered_today_date: today,
        });
      });

      onOrderPlaced?.();
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setPlacing(false);
    }
  };

  // Prepare cart items for HomeDeliveryFlow
  const deliveryCartItems = cartItems.map(i => ({
    name: i.dish?.name,
    qty: i.quantity,
    price: i.dish?.sale_price || i.dish?.regular_price || 0,
  }));

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[61] bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold">Your Selection</h2>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                </div>

                <Tabs defaultValue={defaultTab}>
                  <TabsList className="w-full bg-secondary mb-4">
                    <TabsTrigger value="favorites" className="flex-1 gap-1.5">
                      <Bookmark className="w-3.5 h-3.5" /> Favorites ({favDishes.length})
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex-1 gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" /> Orders ({cartItems.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="favorites">
                    <div className="space-y-2">
                      {favDishes.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-8">No favorites yet</p>
                      )}
                      <AnimatePresence>
                        {favDishes.map(dish => (
                          <motion.div
                            key={dish.id}
                            layout={false}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={{ left: 0, right: 0.6 }}
                            onDragEnd={(e, info) => {
                              if (info.offset.x > 120) {
                                menuStore.toggleFavorite(dish.id);
                              }
                            }}
                            exit={{ x: 300, opacity: 0, transition: { duration: 0.25 } }}
                            className="glass rounded-xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
                          >
                            {dish.image_url && (
                              <img src={dish.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-sm font-semibold truncate">{dish.name}</p>
                              <p className="text-xs text-primary">{curr}{(dish.sale_price || dish.regular_price).toLocaleString()}</p>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => menuStore.moveToCart(dish)}
                              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {favDishes.length > 0 && (
                        <p className="text-center text-[11px] text-muted-foreground/60 pt-2">
                          Swipe a dish right to remove it from favourites.
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="orders">
                    <div className="space-y-2">
                      {cartItems.length === 0 && lockedOrders.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-8">Your cart is empty</p>
                      )}
                      {cartItems.map(item => (
                        <div key={item.dish_id} className="glass rounded-xl p-3 flex items-center gap-3">
                          {item.dish?.image_url && (
                            <img src={item.dish.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-semibold truncate">{item.dish?.name}</p>
                            <p className="text-xs text-primary">
                              {curr}{((item.dish?.sale_price || item.dish?.regular_price || 0) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => menuStore.updateQuantity(item.dish_id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full glass flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => menuStore.updateQuantity(item.dish_id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full glass flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => menuStore.removeFromCart(item.dish_id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      ))}

                      {/* Locked orders section */}
                      {lockedOrders.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Locked Orders</p>
                          {lockedOrders.map((lo, idx) => (
                            <div key={lo.groupId || idx} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-amber-600">Order #{idx + 1}</span>
                                <div className="flex gap-2 items-center">
                                  <Lock className="w-4 h-4 text-primary" />
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setPreviewOrderId(lo.groupId)}
                                    className="w-8 h-8 glass rounded-full flex items-center justify-center"
                                  >
                                    <Eye className="w-4 h-4 text-foreground/70" />
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteLockedOrder(lo.groupId)}
                                    className="w-8 h-8 glass rounded-full flex items-center justify-center"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </motion.button>
                                </div>
                              </div>
                              {lo.items?.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex justify-between text-xs py-0.5">
                                  <span>{item.dish?.name || item.name} × {item.quantity}</span>
                                  <span className="text-muted-foreground">{curr}{((item.dish?.sale_price || item.dish?.regular_price || item.price || 0) * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                              {lo.items?.length > 3 && (
                                <p className="text-xs text-muted-foreground">+{lo.items.length - 3} more items</p>
                              )}
                              <div className="flex justify-between text-xs font-semibold mt-1 pt-1 border-t border-border/50">
                                <span>Total</span>
                                <span>{curr}{lo.total.toLocaleString()}</span>
                              </div>
                              {lo.status === 'ready' && (
                                <Button
                                  size="sm"
                                  className="w-full mt-2 bg-green-600 text-white gap-1"
                                  onClick={() => menuStore.removeLockedOrder(lo.groupId)}
                                >
                                  ✅ Confirm & Dismiss
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Special Instructions + Place Order + Payment */}
                    {cartItems.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            Special Instructions
                          </label>
                          <textarea
                            value={specialInstructions}
                            onChange={e => setSpecialInstructions(e.target.value)}
                            placeholder="Any special requests? (e.g., less spicy, no onions...)"
                            className="w-full bg-secondary border border-border/50 rounded-xl p-3 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                            maxLength={300}
                          />
                        </div>

                        <div className="flex justify-between items-baseline">
                          <span className="text-sm text-muted-foreground tracking-wide">Subtotal</span>
                          <span className="font-heading text-2xl font-bold text-primary tracking-wider tabular-nums">
                            {curr}{subtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={placeOrder}
                            disabled={placing}
                            className="flex-1 bg-primary text-primary-foreground gap-2"
                          >
                            <ShoppingBag className="w-4 h-4" /> {placing ? 'Placing...' : 'Place Order'}
                          </Button>
                        </div>

                        {/* Home Delivery Button — always visible */}
                        {restaurant?.home_delivery_enabled && (
                          <button
                            onClick={() => setDeliveryOpen(true)}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-all mt-3"
                          >
                            <span className="text-2xl">🚚</span>
                            <div className="text-left flex-1">
                              <p className="text-sm font-semibold text-primary">Want Home Delivery?</p>
                              <p className="text-xs text-muted-foreground">Tap here to order to your address</p>
                            </div>
                            <span className="text-primary text-lg">→</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Payment section */}
                    {lockedOrders.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm text-muted-foreground">Pay for {lockedOrders.length} locked order(s)</span>
                          <span className="font-heading text-2xl font-bold text-primary tracking-wider tabular-nums">
                            {curr}{lockedOrdersTotal.toLocaleString()}
                          </span>
                        </div>
                        <Button
                          onClick={() => setUpiPayOpen(true)}
                          className="w-full bg-primary text-primary-foreground gap-2"
                        >
                          <CreditCard className="w-4 h-4" /> {curr}{lockedOrdersTotal.toLocaleString()} — Pay Now
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Locked Order Preview Modal */}
                <AnimatePresence>
                  {previewOrderId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                    >
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewOrderId(null)} />
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative glass rounded-3xl p-6 w-full max-w-sm max-h-[70vh] overflow-y-auto space-y-3"
                      >
                        {(() => {
                          const lo = lockedOrders.find(o => o.groupId === previewOrderId);
                          if (!lo) return null;
                          return (
                            <>
                              <h3 className="font-display text-lg font-semibold">Order Details</h3>
                              {lo.items?.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span>{item.dish?.name || item.name} × {item.quantity}</span>
                                  <span className="text-muted-foreground">{curr}{((item.dish?.sale_price || item.dish?.regular_price || item.price || 0) * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                              {lo.specialInstructions && (
                                <p className="text-xs text-muted-foreground italic">📝 {lo.specialInstructions}</p>
                              )}
                              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
                                <span>Total</span>
                                <span>{curr}{lo.total.toLocaleString()}</span>
                              </div>
                              <Button variant="outline" className="w-full" onClick={() => setPreviewOrderId(null)}>Close</Button>
                            </>
                          );
                        })()}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Home Delivery Flow — rendered outside the cart sheet */}
      <HomeDeliveryFlow
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        cartItems={deliveryCartItems}
        total={subtotal}
        restaurant={restaurant}
      />

      {/* UPI Payment Sheet — Pay Now for locked orders */}
      <UpiPaymentSheet
        open={upiPayOpen}
        onClose={() => setUpiPayOpen(false)}
        amount={lockedOrdersTotal}
        restaurant={restaurant}
        showTipAndRating={true}
        onPaymentDone={() => {
          menuStore.lockedOrders.forEach(lo => menuStore.removeLockedOrder(lo.groupId));
        }}
      />
    </>
  );
}
