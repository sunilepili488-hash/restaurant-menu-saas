let db = null;
let allOrders = [];
let knownOrderIds = new Set();
let firstLoad = true;
let soundEnabled = true;
let activeTab = 'confirmation';
let searchQuery = '';
const currency = '₹';

const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  chevDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  checkCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  bell: '🔔',
  clockAmber: '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
};

document.addEventListener('DOMContentLoaded', init);

function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  if (!STAFF_CONFIG.SUPABASE_URL || !STAFF_CONFIG.SUPABASE_ANON_KEY) {
    alert('Please configure Supabase URL and Anon Key in config.js');
    return;
  }
  if (sessionStorage.getItem('staff_authed') === 'true') {
    connectAndShowDashboard();
  } else {
    showPinScreen();
  }
}

function showPinScreen() {
  document.getElementById('pin-screen').classList.add('active');
  document.getElementById('dashboard').classList.remove('active');
  const pinInput = document.getElementById('pin-input');
  const pinBtn = document.getElementById('pin-submit');
  const pinErr = document.getElementById('pin-error');
  function tryLogin() {
    const pin = pinInput.value.trim();
    if (!pin) { pinErr.textContent = 'Please enter PIN'; return; }
    if (pin === STAFF_CONFIG.STAFF_PIN) {
      sessionStorage.setItem('staff_authed', 'true');
      pinErr.textContent = '';
      connectAndShowDashboard();
    } else {
      pinErr.textContent = 'Invalid PIN — try again';
      pinInput.value = '';
      pinInput.focus();
    }
  }
  pinBtn.addEventListener('click', tryLogin);
  pinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
  pinInput.focus();
}

function connectAndShowDashboard() {
  document.getElementById('pin-screen').classList.remove('active');
  document.getElementById('dashboard').classList.add('active');
  db = window.supabase.createClient(STAFF_CONFIG.SUPABASE_URL, STAFF_CONFIG.SUPABASE_ANON_KEY);
  setupDashboardControls();
  fetchOrders();
  subscribeToRealtime();
  setInterval(fetchOrders, 7000);
}

function setupDashboardControls() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderOrders();
    });
  });
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderOrders();
  });
  document.getElementById('sound-toggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-on-icon').classList.toggle('hidden', !soundEnabled);
    document.getElementById('sound-off-icon').classList.toggle('hidden', soundEnabled);
    showToast(soundEnabled ? 'Sound ON 🔊' : 'Sound OFF 🔇');
  });
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('staff_authed');
    location.reload();
  });
}

function subscribeToRealtime() {
  db.channel('staff-live-orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order' }, (payload) => {
      if (payload.eventType === 'INSERT') { playAlert(); vibratePhone(); flashScreen(); }
      fetchOrders();
    })
    .subscribe();
}

async function fetchOrders() {
  if (!db) return;
  try {
    const { data, error } = await db.from('order').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    if (!firstLoad) {
      const newOrders = data.filter(o => !knownOrderIds.has(o.id));
      if (newOrders.length > 0) { playAlert(); vibratePhone(); flashScreen(); }
    }
    knownOrderIds = new Set(data.map(o => o.id));
    firstLoad = false;
    allOrders = data;
    updateStats();
    renderOrders();
  } catch (err) { console.error('[Staff] Fetch error:', err); }
}

async function updateOrderStatus(id, status, cancelReason, prepMins) {
  if (!db) return;
  try {
    const payload = { status, updated_at: new Date().toISOString() };
    if (cancelReason) payload.cancel_reason = cancelReason;
    if (status === 'confirmed') {
      payload.confirmed_at = new Date().toISOString();
      payload.timer_started_at = new Date().toISOString();
      if (prepMins !== undefined && prepMins !== null) payload.prep_time_override = prepMins;
    }
    if (status === 'completed' && !cancelReason) payload.delivered_at = new Date().toISOString();
    const { error } = await db.from('order').update(payload).eq('id', id);
    if (error) throw error;
    showToast('Order updated ✅');
    fetchOrders();
  } catch (err) { console.error('[Staff] Update error:', err); showToast('Update failed ❌'); }
}

async function updatePrepTime(id, minutes, isConfirmed) {
  if (!db) return;
  try {
    const payload = { prep_time_override: minutes, updated_at: new Date().toISOString() };
    if (isConfirmed) payload.timer_started_at = new Date().toISOString();
    await db.from('order').update(payload).eq('id', id);
    fetchOrders();
  } catch (err) { console.error('[Staff] Prep time error:', err); }
}

async function updateDeliveryTime(id, minutes) {
  if (!db) return;
  try {
    await db.from('order').update({ delivery_time_minutes: minutes, updated_at: new Date().toISOString() }).eq('id', id);
    fetchOrders();
  } catch (err) { console.error('[Staff] Delivery time error:', err); }
}

async function updateDeliveryBoyPhone(id, phone) {
  if (!db) return;
  try {
    await db.from('order').update({ delivery_boy_phone: phone, updated_at: new Date().toISOString() }).eq('id', id);
    fetchOrders();
  } catch (err) { console.error('[Staff] Delivery boy phone error:', err); }
}

async function deleteOrder(id) {
  if (!db) return;
  try {
    await db.from('order').delete().eq('id', id);
    showToast('Order deleted');
    fetchOrders();
  } catch (err) { console.error('[Staff] Delete error:', err); showToast('Delete failed ❌'); }
}

async function resolveWaiterCall(id) { await updateOrderStatus(id, 'completed'); }

function playAlert() {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
      osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.3);
    });
  } catch (e) {}
}

function vibratePhone() { if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]); }

function flashScreen() {
  const flash = document.createElement('div');
  flash.className = 'flash-overlay';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 900);
}

function showToast(msg) {
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  el.classList.remove('hidden'); el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.classList.add('hidden'), 300); }, 2000);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  return hrs + 'h ' + (mins % 60) + 'm ago';
}

function shortId(id) { return String(id || '').slice(0, 5); }

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getFilteredLists() {
  return {
    pending: allOrders.filter(o => o.type === 'order' && o.status === 'pending' && !o.is_home_delivery),
    confirmed: allOrders.filter(o => o.type === 'order' && o.status === 'confirmed' && !o.is_home_delivery),
    ready: allOrders.filter(o => o.type === 'order' && o.status === 'ready' && !o.is_home_delivery),
    delivery: allOrders.filter(o => o.is_home_delivery && o.type === 'order' && !['completed','cancelled'].includes(o.status)),
    waiterCalls: allOrders.filter(o => o.type === 'waiter_call' && o.status === 'pending'),
  };
}

function updateStats() {
  const { pending, confirmed, ready, delivery, waiterCalls } = getFilteredLists();
  document.getElementById('stat-pending').textContent = pending.length;
  document.getElementById('stat-confirmed').textContent = confirmed.length;
  document.getElementById('stat-ready').textContent = ready.length;
  document.getElementById('stat-delivery').textContent = delivery.length;
  document.getElementById('stat-calls').textContent = waiterCalls.length;
  document.getElementById('badge-confirmation').textContent = pending.length;
  document.getElementById('badge-processing').textContent = confirmed.length + ready.length;
  document.getElementById('badge-delivery').textContent = delivery.length;
  document.getElementById('badge-waiter').textContent = waiterCalls.length;
}

function matchesSearch(order) {
  if (!searchQuery) return true;
  if (String(order.table_number || '').toLowerCase().includes(searchQuery)) return true;
  if ((order.items || []).some(item => (item.name || '').toLowerCase().includes(searchQuery))) return true;
  if ((order.waiter_call_label || '').toLowerCase().includes(searchQuery)) return true;
  return false;
}

function renderOrders() {
  const container = document.getElementById('order-list');
  const { pending, confirmed, ready, delivery, waiterCalls } = getFilteredLists();
  let html = '';
  switch (activeTab) {
    case 'confirmation': {
      const list = pending.filter(matchesSearch);
      html = list.length === 0 ? emptyState('😌', 'No pending orders — waiting...') : list.map(o => renderOrderCard(o, 'pending')).join('');
      break;
    }
    case 'processing': {
      const cList = confirmed.filter(matchesSearch);
      const rList = ready.filter(matchesSearch);
      html = (cList.length === 0 && rList.length === 0) ? emptyState('✅', 'No orders being processed') : cList.map(o => renderOrderCard(o, 'confirmed')).join('') + rList.map(o => renderOrderCard(o, 'ready')).join('');
      break;
    }
    case 'delivery': {
      const dList = delivery.filter(matchesSearch);
      html = dList.length === 0 ? emptyState('🚚', 'No home delivery orders') : dList.map(o => renderDeliveryCard(o)).join('');
      break;
    }
    case 'waiter': {
      const wList = waiterCalls.filter(matchesSearch);
      html = wList.length === 0 ? emptyState('🛎️', 'No active waiter calls') : wList.map(o => renderWaiterCard(o)).join('');
      break;
    }
  }
  container.innerHTML = html;
  attachCardEvents();
}

function emptyState(emoji, text) {
  return '<div class="empty-state"><span class="empty-state-emoji">' + emoji + '</span><p class="empty-state-text">' + escHtml(text) + '</p></div>';
}

function renderOrderCard(order, statusClass) {
  const items = order.items || [];
  const avgPrep = items.length > 0 ? Math.ceil(items.reduce((s, i) => s + (i.prep_time || 15), 0) / items.length) : 15;
  const prepVal = order.prep_time_override || avgPrep;
  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';
  const isReady = order.status === 'ready';
  let actionsHtml = '';
  if (isPending) actionsHtml = '<button class="action-btn confirm" data-action="confirm" data-id="' + order.id + '" title="Confirm">' + ICONS.check + '</button><button class="action-btn cancel" data-action="start-cancel" data-id="' + order.id + '" title="Cancel">' + ICONS.x + '</button>';
  else if (isConfirmed) actionsHtml = '<button class="action-btn ready" data-action="ready" data-id="' + order.id + '" title="Mark Ready">' + ICONS.checkCheck + '</button>';
  else if (isReady) actionsHtml = '<button class="action-btn delete" data-action="delete" data-id="' + order.id + '" title="Delete">' + ICONS.trash + '</button>';

  return '<div class="order-card" data-order-id="' + order.id + '">' +
    '<div class="order-card-header"><div style="display:flex;align-items:center;gap:6px;"><span class="order-table">Table ' + escHtml(order.table_number || 'N/A') + '</span><span class="status-badge ' + statusClass + '">' + statusClass + '</span></div><div class="order-meta"><span class="order-id">#' + shortId(order.id) + '</span><span class="order-time">' + ICONS.clock + ' ' + timeAgo(order.created_at) + '</span></div></div>' +
    '<button class="order-toggle" data-toggle="' + order.id + '">' + ICONS.eye + ' See Order ' + ICONS.chevDown + '</button>' +
    '<div class="order-items" id="items-' + order.id + '">' +
      items.map(item => '<div class="order-item-row"><span class="order-item-name">' + item.qty + '× ' + escHtml(item.name || '') + '</span><span class="order-item-price">' + currency + (item.price * item.qty).toLocaleString() + '</span></div>').join('') +
      (order.total > 0 ? '<div class="order-subtotal"><span>Subtotal</span><span>' + currency + order.total.toLocaleString() + '</span></div>' : '') +
      (order.special_instructions ? '<p class="order-instructions">📝 ' + escHtml(order.special_instructions) + '</p>' : '') +
    '</div>' +
    '<div class="prep-time-row">' + ICONS.clockAmber + '<input class="prep-time-input" type="text" inputmode="numeric" value="' + prepVal + '" data-prep-id="' + order.id + '" data-prep-confirmed="' + isConfirmed + '"><span class="prep-time-unit">min</span></div>' +
    '<div class="cancel-row hidden" id="cancel-' + order.id + '"><input class="cancel-input" type="text" placeholder="Reason (optional)" id="cancel-reason-' + order.id + '"><button class="cancel-confirm-btn" data-action="do-cancel" data-id="' + order.id + '">Cancel Order</button><button class="cancel-back-btn" data-action="cancel-back" data-id="' + order.id + '">Back</button></div>' +
    '<div class="order-actions" id="actions-' + order.id + '">' + actionsHtml + '</div>' +
  '</div>';
}

function renderDeliveryCard(order) {
  const items = order.items || [];
  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';
  const isReady = order.status === 'ready';
  const paymentMethod = order.payment_method || 'cod';
  const addr = order.delivery_address || {};
  const deliveryOtp = order.delivery_otp || '—';
  const deliveryTime = order.delivery_time_minutes || 30;
  const deliveryBoyPhone = order.delivery_boy_phone || '';
  let actionsHtml = '';
  if (isPending) actionsHtml = '<button class="action-btn confirm" data-action="confirm" data-id="' + order.id + '">' + ICONS.check + '</button><button class="action-btn cancel" data-action="start-cancel" data-id="' + order.id + '">' + ICONS.x + '</button>';
  else if (isConfirmed) actionsHtml = '<button class="action-btn ready" data-action="ready" data-id="' + order.id + '">' + ICONS.checkCheck + '</button>';
  else if (isReady) actionsHtml = '<button class="action-btn complete" data-action="complete" data-id="' + order.id + '">' + ICONS.truck + '</button>';
  const addressParts = [addr.flat, addr.street, addr.city, addr.pincode].filter(Boolean).join(', ');

  return '<div class="order-card delivery-card" data-order-id="' + order.id + '">' +
    '<div class="order-card-header"><div class="delivery-header">' + ICONS.truck + '<span class="delivery-title">Home Delivery</span><span class="otp-badge">OTP: ' + escHtml(String(deliveryOtp)) + '</span></div><div class="order-meta"><span class="order-id">#' + shortId(order.id) + '</span><span class="order-time">' + ICONS.clock + ' ' + timeAgo(order.created_at) + '</span></div></div>' +
    '<div class="customer-info"><div class="customer-name">' + escHtml(order.delivery_name || 'N/A') + (order.delivery_phone ? '<a href="tel:' + order.delivery_phone + '" class="customer-phone">' + ICONS.phone + ' ' + escHtml(order.delivery_phone) + '</a>' : '') + '</div>' + (addressParts ? '<div class="customer-address">' + ICONS.mapPin + ' <span>' + escHtml(addressParts) + '</span></div>' : '') + '</div>' +
    '<div style="display:flex;align-items:center;gap:8px;"><span class="payment-badge ' + (paymentMethod === 'upi' ? 'upi' : 'cod') + '">' + (paymentMethod === 'upi' ? 'UPI Paid' : 'COD') + '</span>' + (order.total > 0 ? '<span class="delivery-total">' + currency + order.total.toLocaleString() + '</span>' : '') + '</div>' +
    '<div class="delivery-time-row">' + ICONS.truck + '<span class="delivery-time-label">Delivery:</span><input class="prep-time-input" type="text" inputmode="numeric" value="' + deliveryTime + '" data-delivery-id="' + order.id + '"><span class="prep-time-unit">min</span></div>' +
    '<div class="delivery-boy-row">' + ICONS.phone + '<span class="delivery-boy-label">Delivery Boy:</span><input class="delivery-boy-input" type="tel" value="' + escHtml(deliveryBoyPhone) + '" placeholder="Phone no." data-dboy-id="' + order.id + '"></div>' +
    '<button class="order-toggle" data-toggle="' + order.id + '">' + ICONS.eye + ' See Items ' + ICONS.chevDown + '</button>' +
    '<div class="order-items" id="items-' + order.id + '">' + items.map(item => '<div class="order-item-row"><span class="order-item-name">' + item.qty + '× ' + escHtml(item.name || '') + '</span><span class="order-item-price">' + currency + (item.price * item.qty).toLocaleString() + '</span></div>').join('') + (order.special_instructions ? '<p class="order-instructions">📝 ' + escHtml(order.special_instructions) + '</p>' : '') + '</div>' +
    '<div class="cancel-row hidden" id="cancel-' + order.id + '"><input class="cancel-input" type="text" placeholder="Reason (optional)" id="cancel-reason-' + order.id + '"><button class="cancel-confirm-btn" data-action="do-cancel" data-id="' + order.id + '">Cancel</button><button class="cancel-back-btn" data-action="cancel-back" data-id="' + order.id + '">Back</button></div>' +
    '<div class="order-actions" id="actions-' + order.id + '">' + actionsHtml + '</div>' +
  '</div>';
}

function renderWaiterCard(order) {
  const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  const isOld = mins >= 5;
  return '<div class="waiter-card ' + (isOld ? 'old' : '') + '" data-order-id="' + order.id + '">' +
    '<div class="waiter-icon-wrap">' + ICONS.bell + '</div>' +
    '<div class="waiter-info"><p class="waiter-label">' + escHtml(order.waiter_call_label || 'Waiter Call') + '</p><p class="waiter-meta">' + (order.table_number ? 'Table ' + escHtml(order.table_number) : 'No table') + ' · ' + timeAgo(order.created_at) + '</p></div>' +
    '<button class="resolve-btn" data-action="resolve" data-id="' + order.id + '">' + ICONS.check + ' Resolve</button>' +
  '</div>';
}

function attachCardEvents() {
  const container = document.getElementById('order-list');
  container.removeEventListener('click', handleCardClick);
  container.addEventListener('click', handleCardClick);
  container.querySelectorAll('.prep-time-input[data-prep-id]').forEach(input => {
    input.addEventListener('blur', () => { updatePrepTime(input.dataset.prepId, parseInt(input.value) || 15, input.dataset.prepConfirmed === 'true'); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
  });
  container.querySelectorAll('.prep-time-input[data-delivery-id]').forEach(input => {
    input.addEventListener('blur', () => { updateDeliveryTime(input.dataset.deliveryId, parseInt(input.value) || 30); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
  });
  container.querySelectorAll('.delivery-boy-input[data-dboy-id]').forEach(input => {
    input.addEventListener('blur', () => { updateDeliveryBoyPhone(input.dataset.dboyId, input.value.trim()); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
  });
}

function handleCardClick(e) {
  const btn = e.target.closest('[data-action]');
  const toggle = e.target.closest('[data-toggle]');
  if (toggle) {
    const itemsEl = document.getElementById('items-' + toggle.dataset.toggle);
    if (itemsEl) { itemsEl.classList.toggle('open'); toggle.classList.toggle('open'); }
    return;
  }
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  switch (action) {
    case 'confirm': {
      const card = btn.closest('.order-card');
      const prepInput = card ? card.querySelector('.prep-time-input') : null;
      updateOrderStatus(id, 'confirmed', undefined, prepInput ? (parseInt(prepInput.value) || 15) : 15);
      break;
    }
    case 'ready': updateOrderStatus(id, 'ready'); break;
    case 'complete': updateOrderStatus(id, 'completed'); break;
    case 'delete': deleteOrder(id); break;
    case 'resolve': resolveWaiterCall(id); break;
    case 'start-cancel': {
      const cr = document.getElementById('cancel-' + id);
      const ar = document.getElementById('actions-' + id);
      if (cr) cr.classList.remove('hidden');
      if (ar) ar.classList.add('hidden');
      break;
    }
    case 'do-cancel': {
      const ri = document.getElementById('cancel-reason-' + id);
      updateOrderStatus(id, 'cancelled', ri ? ri.value.trim() || undefined : undefined);
      break;
    }
    case 'cancel-back': {
      const cr = document.getElementById('cancel-' + id);
      const ar = document.getElementById('actions-' + id);
      if (cr) cr.classList.add('hidden');
      if (ar) ar.classList.remove('hidden');
      break;
    }
  }
}

setInterval(() => { if (document.getElementById('dashboard').classList.contains('active')) renderOrders(); }, 30000);
