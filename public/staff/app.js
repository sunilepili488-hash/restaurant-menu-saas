// ═══════════════════════════════════════════════════
// AuraMenu Staff App v2 — Premium Edition
// ═══════════════════════════════════════════════════

let db = null;
let allOrders = [];
let knownOrderIds = new Set();
let firstLoad = true;
let soundEnabled = true;
let activeTab = 'confirmation';
let searchQuery = '';
let currentSound = localStorage.getItem('staff_sound') || 'bell';
let lastDataHash = '';
const currency = '₹';

// ═══ SVG Icons ═══
const ICONS = {
  table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
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
  timerAmber: '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
};

// ═══════════════════════════════════════════════════
// 4 NOTIFICATION SOUNDS (Web Audio API)
// ═══════════════════════════════════════════════════
function playCurrentSound() {
  if (!soundEnabled) return;
  try {
    const fn = { bell: playBellSound, chime: playChimeSound, alert: playAlertSound, melody: playMelodySound };
    (fn[currentSound] || fn.bell)();
  } catch(e) {}
}

function playBellSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const now = ctx.currentTime;
  [0, 0.45].forEach(delay => {
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const vol = 0.5 - i * 0.1;
      gain.gain.setValueAtTime(vol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.7);
      osc.start(now + delay);
      osc.stop(now + delay + 0.7);
    });
  });
}

function playChimeSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const now = ctx.currentTime;
  [0, 0.25, 0.5].forEach((delay, i) => {
    const freq = [600, 800, 1000][i];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.45, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
    osc.start(now + delay);
    osc.stop(now + delay + 0.5);
  });
}

function playAlertSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const now = ctx.currentTime;
  [0, 0.18, 0.36].forEach(delay => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.5, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);
    osc.start(now + delay);
    osc.stop(now + delay + 0.14);
  });
}

function playMelodySound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const delay = i * 0.13;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.45, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);
    osc.start(now + delay);
    osc.stop(now + delay + 0.45);
  });
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);

function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  if (!STAFF_CONFIG.SUPABASE_URL || !STAFF_CONFIG.SUPABASE_ANON_KEY) { alert('Configure Supabase in config.js'); return; }
  if (sessionStorage.getItem('staff_authed') === 'true') connectAndShowDashboard();
  else showPinScreen();
}

// ═══════════════════════════════════════════════════
// PIN SCREEN
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
// CONNECT & DASHBOARD
// ═══════════════════════════════════════════════════
function connectAndShowDashboard() {
  document.getElementById('pin-screen').classList.remove('active');
  document.getElementById('dashboard').classList.add('active');
  db = window.supabase.createClient(STAFF_CONFIG.SUPABASE_URL, STAFF_CONFIG.SUPABASE_ANON_KEY);

  // Request notification permission for background alerts
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  setupDashboardControls();
  setupSoundMenu();
  fetchOrders();
  subscribeToRealtime();
  setInterval(fetchOrders, 7000);
  // Update time labels every 30 sec (without full re-render)
  setInterval(updateTimeLabels, 30000);
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

function setupSoundMenu() {
  const menu = document.getElementById('sound-menu');
  const btn = document.getElementById('sound-select-btn');
  const testBtn = document.getElementById('test-sound-btn');

  // Toggle menu
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });

  // Sound selection
  menu.querySelectorAll('.sound-option').forEach(opt => {
    if (opt.dataset.sound === currentSound) opt.classList.add('active');
    else opt.classList.remove('active');
    opt.addEventListener('click', () => {
      currentSound = opt.dataset.sound;
      localStorage.setItem('staff_sound', currentSound);
      menu.querySelectorAll('.sound-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      showToast('Sound: ' + opt.textContent.trim());
      playCurrentSound();
    });
  });

  // Test button
  testBtn.addEventListener('click', () => playCurrentSound());
}

// ═══════════════════════════════════════════════════
// REALTIME
// ═══════════════════════════════════════════════════
function subscribeToRealtime() {
  db.channel('staff-live-orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order' }, (payload) => {
      if (payload.eventType === 'INSERT') { notifyNewOrder(payload.new); }
      fetchOrders();
    })
    .subscribe();
}

function notifyNewOrder(order) {
  playCurrentSound();
  vibratePhone();
  showSystemNotification(order);
}

// ═══════════════════════════════════════════════════
// SYSTEM NOTIFICATIONS (Background)
// ═══════════════════════════════════════════════════
function showSystemNotification(order) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const title = order.type === 'waiter_call' ? '🛎️ Waiter Call!' : '🍽️ New Order!';
    const body = order.type === 'waiter_call'
      ? (order.waiter_call_label || 'Waiter needed') + (order.table_number ? ' — Table ' + order.table_number : '')
      : 'Table ' + (order.table_number || 'N/A') + ' — ' + currency + (order.total || 0);
    new Notification(title, { body: body, icon: '🍽️', tag: 'staff-order-' + order.id, requireInteraction: true });
  } catch(e) {}
}

function vibratePhone() { if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]); }

// ═══════════════════════════════════════════════════
// FETCH ORDERS (Smart — no blink)
// ═══════════════════════════════════════════════════
async function fetchOrders() {
  if (!db) return;
  try {
    const { data, error } = await db.from('order').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;

    // Hash check — skip re-render if nothing changed
    const hash = data.map(o => o.id + ':' + o.status + ':' + (o.updated_at || '')).join('|');
    if (hash === lastDataHash) return;
    lastDataHash = hash;

    // New order detection (not first load)
    if (!firstLoad) {
      const newOrders = data.filter(o => !knownOrderIds.has(o.id));
      if (newOrders.length > 0) {
        playCurrentSound();
        vibratePhone();
        newOrders.forEach(o => showSystemNotification(o));
      }
    }

    knownOrderIds = new Set(data.map(o => o.id));
    firstLoad = false;
    allOrders = data;
    updateStats();
    renderOrders();
  } catch (err) { console.error('[Staff] Fetch error:', err); }
}

// ═══════════════════════════════════════════════════
// ORDER STATUS UPDATES
// ═══════════════════════════════════════════════════
async function updateOrderStatus(id, status, cancelReason, prepMins) {
  if (!db) return;
  try {
    const payload = { status, updated_at: new Date().toISOString() };
    if (cancelReason) payload.cancel_reason = cancelReason;
    if (status === 'confirmed') {
      payload.confirmed_at = new Date().toISOString();
      payload.timer_started_at = new Date().toISOString();
      if (prepMins != null) payload.prep_time_override = prepMins;
    }
    if (status === 'completed' && !cancelReason) payload.delivered_at = new Date().toISOString();
    const { error } = await db.from('order').update(payload).eq('id', id);
    if (error) throw error;
    showToast('Order updated ✅');
    lastDataHash = ''; // Force refresh
    fetchOrders();
  } catch (err) { showToast('Update failed ❌'); }
}

async function updatePrepTime(id, minutes, isConfirmed) {
  if (!db) return;
  const payload = { prep_time_override: minutes, updated_at: new Date().toISOString() };
  if (isConfirmed) payload.timer_started_at = new Date().toISOString();
  await db.from('order').update(payload).eq('id', id).catch(() => {});
}

async function updateDeliveryTime(id, minutes) {
  if (!db) return;
  await db.from('order').update({ delivery_time_minutes: minutes, updated_at: new Date().toISOString() }).eq('id', id).catch(() => {});
}

async function updateDeliveryBoyPhone(id, phone) {
  if (!db) return;
  await db.from('order').update({ delivery_boy_phone: phone, updated_at: new Date().toISOString() }).eq('id', id).catch(() => {});
}

async function deleteOrder(id) {
  if (!db) return;
  try {
    await db.from('order').delete().eq('id', id);
    showToast('Order deleted');
    lastDataHash = '';
    fetchOrders();
  } catch (err) { showToast('Delete failed ❌'); }
}

async function resolveWaiterCall(id) { await updateOrderStatus(id, 'completed'); }

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════
function showToast(msg) {
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  el.classList.remove('hidden'); el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.classList.add('hidden'), 300); }, 2000);
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
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
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// Update ONLY time labels without re-rendering cards
function updateTimeLabels() {
  document.querySelectorAll('[data-created-at]').forEach(el => {
    el.textContent = timeAgo(el.dataset.createdAt);
  });
}

// ═══════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
// RENDER ORDERS
// ═══════════════════════════════════════════════════
function renderOrders() {
  const container = document.getElementById('order-list');
  const { pending, confirmed, ready, delivery, waiterCalls } = getFilteredLists();
  let html = '';
  switch (activeTab) {
    case 'confirmation': {
      const list = pending.filter(matchesSearch);
      html = list.length === 0 ? emptyState('😌', 'No pending orders') : list.map(o => renderOrderCard(o, 'pending')).join('');
      break;
    }
    case 'processing': {
      const c = confirmed.filter(matchesSearch), r = ready.filter(matchesSearch);
      html = (c.length === 0 && r.length === 0) ? emptyState('✅', 'No orders in progress') : c.map(o => renderOrderCard(o, 'confirmed')).join('') + r.map(o => renderOrderCard(o, 'ready')).join('');
      break;
    }
    case 'delivery': {
      const d = delivery.filter(matchesSearch);
      html = d.length === 0 ? emptyState('🚚', 'No deliveries') : d.map(o => renderDeliveryCard(o)).join('');
      break;
    }
    case 'waiter': {
      const w = waiterCalls.filter(matchesSearch);
      html = w.length === 0 ? emptyState('🛎️', 'No waiter calls') : w.map(o => renderWaiterCard(o)).join('');
      break;
    }
  }
  container.innerHTML = html;
  attachCardEvents();
}

function emptyState(emoji, text) {
  return '<div class="empty-state"><span class="empty-state-emoji">' + emoji + '</span><p class="empty-state-text">' + escHtml(text) + '</p></div>';
}

// ═══════════════════════════════════════════════════
// PREMIUM ORDER CARD
// ═══════════════════════════════════════════════════
function renderOrderCard(order, statusClass) {
  const items = order.items || [];
  const avgPrep = items.length > 0 ? Math.ceil(items.reduce((s, i) => s + (i.prep_time || 15), 0) / items.length) : 15;
  const prepVal = order.prep_time_override || avgPrep;
  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';
  const isReady = order.status === 'ready';

  let actions = '';
  if (isPending) actions = '<button class="action-btn confirm" data-action="confirm" data-id="' + order.id + '">' + ICONS.check + '</button><button class="action-btn cancel" data-action="start-cancel" data-id="' + order.id + '">' + ICONS.x + '</button>';
  else if (isConfirmed) actions = '<button class="action-btn ready" data-action="ready" data-id="' + order.id + '">' + ICONS.checkCheck + '</button>';
  else if (isReady) actions = '<button class="action-btn delete" data-action="delete" data-id="' + order.id + '">' + ICONS.trash + '</button>';

  return '<div class="order-card" data-order-id="' + order.id + '">' +
    '<div class="card-header">' +
      '<div class="card-header-left">' +
        '<span class="table-badge">' + ICONS.table + ' Table ' + escHtml(order.table_number || 'N/A') + '</span>' +
        '<span class="status-pill ' + statusClass + '">' + statusClass + '</span>' +
      '</div>' +
      '<div class="card-meta">' +
        '<span class="card-id">#' + shortId(order.id) + '</span>' +
        '<span class="card-time" data-created-at="' + order.created_at + '">' + timeAgo(order.created_at) + '</span>' +
      '</div>' +
    '</div>' +

    '<button class="card-toggle" data-toggle="' + order.id + '">' + ICONS.eye + ' View Items ' + ICONS.chevDown + '</button>' +

    '<div class="card-items" id="items-' + order.id + '">' +
      items.map(function(item) {
        return '<div class="item-row">' +
          '<div class="item-left">' +
            '<span class="item-qty">' + item.qty + '</span>' +
            '<span class="item-name">' + escHtml(item.name || '') + '</span>' +
          '</div>' +
          '<span class="item-price">' + currency + (item.price * item.qty).toLocaleString() + '</span>' +
        '</div>';
      }).join('') +
      (order.special_instructions ? '<div class="special-box"><p>📝 ' + escHtml(order.special_instructions) + '</p></div>' : '') +
      (order.total > 0 ? '<div class="subtotal-row"><span class="subtotal-label">Subtotal</span><span class="subtotal-value">' + currency + order.total.toLocaleString() + '</span></div>' : '') +
    '</div>' +

    '<div class="card-footer">' +
      '<div class="prep-row">' + ICONS.timerAmber + '<input class="prep-input" type="text" inputmode="numeric" value="' + prepVal + '" data-prep-id="' + order.id + '" data-prep-confirmed="' + isConfirmed + '"><span class="prep-unit">min</span></div>' +
      '<div class="card-actions">' + actions + '</div>' +
    '</div>' +

    '<div class="cancel-row hidden" id="cancel-' + order.id + '">' +
      '<input class="cancel-input" type="text" placeholder="Reason (optional)" id="cancel-reason-' + order.id + '">' +
      '<button class="cancel-confirm-btn" data-action="do-cancel" data-id="' + order.id + '">Cancel</button>' +
      '<button class="cancel-back-btn" data-action="cancel-back" data-id="' + order.id + '">Back</button>' +
    '</div>' +
  '</div>';
}

// ═══════════════════════════════════════════════════
// DELIVERY CARD
// ═══════════════════════════════════════════════════
function renderDeliveryCard(order) {
  const items = order.items || [];
  const isPending = order.status === 'pending', isConfirmed = order.status === 'confirmed', isReady = order.status === 'ready';
  const pay = order.payment_method || 'cod';
  const addr = order.delivery_address || {};
  const otp = order.delivery_otp || '—';
  const dTime = order.delivery_time_minutes || 30;
  const dPhone = order.delivery_boy_phone || '';
  const addrStr = [addr.flat, addr.street, addr.city, addr.pincode].filter(Boolean).join(', ');

  let actions = '';
  if (isPending) actions = '<button class="action-btn confirm" data-action="confirm" data-id="' + order.id + '">' + ICONS.check + '</button><button class="action-btn cancel" data-action="start-cancel" data-id="' + order.id + '">' + ICONS.x + '</button>';
  else if (isConfirmed) actions = '<button class="action-btn ready" data-action="ready" data-id="' + order.id + '">' + ICONS.checkCheck + '</button>';
  else if (isReady) actions = '<button class="action-btn complete" data-action="complete" data-id="' + order.id + '">' + ICONS.truck + '</button>';

  return '<div class="order-card" data-order-id="' + order.id + '">' +
    '<div class="card-header">' +
      '<div class="card-header-left">' +
        '<div class="delivery-header-row">' + ICONS.truck + '<span class="delivery-title">Home Delivery</span><span class="otp-badge">OTP: ' + escHtml(String(otp)) + '</span></div>' +
      '</div>' +
      '<div class="card-meta"><span class="card-id">#' + shortId(order.id) + '</span><span class="card-time" data-created-at="' + order.created_at + '">' + timeAgo(order.created_at) + '</span></div>' +
    '</div>' +

    '<div class="delivery-info">' +
      '<div class="customer-row">' +
        '<div class="customer-name">' + escHtml(order.delivery_name || 'N/A') + (order.delivery_phone ? ' <a href="tel:' + order.delivery_phone + '" class="customer-phone">' + ICONS.phone + ' ' + escHtml(order.delivery_phone) + '</a>' : '') + '</div>' +
        (addrStr ? '<div class="customer-address">' + ICONS.mapPin + '<span>' + escHtml(addrStr) + '</span></div>' : '') +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span class="payment-badge ' + (pay === 'upi' ? 'upi' : 'cod') + '">' + (pay === 'upi' ? 'UPI Paid' : 'COD') + '</span>' +
        (order.total > 0 ? '<span class="delivery-total">' + currency + order.total.toLocaleString() + '</span>' : '') +
      '</div>' +
    '</div>' +

    '<div class="field-row" style="padding-top:4px">' + ICONS.truck + '<span class="field-label">Delivery:</span><input class="field-input" type="text" inputmode="numeric" value="' + dTime + '" data-delivery-id="' + order.id + '" style="width:50px"><span class="prep-unit">min</span></div>' +
    '<div class="field-row" style="padding-bottom:4px">' + ICONS.phone + '<span class="field-label">Rider:</span><input class="field-input" type="tel" value="' + escHtml(dPhone) + '" placeholder="Phone" data-dboy-id="' + order.id + '"></div>' +

    '<button class="card-toggle" data-toggle="' + order.id + '">' + ICONS.eye + ' View Items ' + ICONS.chevDown + '</button>' +

    '<div class="card-items" id="items-' + order.id + '">' +
      items.map(function(item) {
        return '<div class="item-row"><div class="item-left"><span class="item-qty">' + item.qty + '</span><span class="item-name">' + escHtml(item.name || '') + '</span></div><span class="item-price">' + currency + (item.price * item.qty).toLocaleString() + '</span></div>';
      }).join('') +
      (order.special_instructions ? '<div class="special-box"><p>📝 ' + escHtml(order.special_instructions) + '</p></div>' : '') +
    '</div>' +

    '<div class="card-footer"><div></div><div class="card-actions">' + actions + '</div></div>' +

    '<div class="cancel-row hidden" id="cancel-' + order.id + '"><input class="cancel-input" type="text" placeholder="Reason" id="cancel-reason-' + order.id + '"><button class="cancel-confirm-btn" data-action="do-cancel" data-id="' + order.id + '">Cancel</button><button class="cancel-back-btn" data-action="cancel-back" data-id="' + order.id + '">Back</button></div>' +
  '</div>';
}

// ═══════════════════════════════════════════════════
// WAITER CARD
// ═══════════════════════════════════════════════════
function renderWaiterCard(order) {
  const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  return '<div class="waiter-card ' + (mins >= 5 ? 'old' : '') + '" data-order-id="' + order.id + '">' +
    '<div class="waiter-icon-wrap">' + ICONS.bell + '</div>' +
    '<div class="waiter-info"><p class="waiter-label">' + escHtml(order.waiter_call_label || 'Waiter Call') + '</p><p class="waiter-meta">' + (order.table_number ? 'Table ' + escHtml(order.table_number) : 'No table') + ' · <span data-created-at="' + order.created_at + '">' + timeAgo(order.created_at) + '</span></p></div>' +
    '<button class="resolve-btn" data-action="resolve" data-id="' + order.id + '">' + ICONS.check + ' Resolve</button>' +
  '</div>';
}

// ═══════════════════════════════════════════════════
// EVENT DELEGATION
// ═══════════════════════════════════════════════════
function attachCardEvents() {
  const container = document.getElementById('order-list');
  container.removeEventListener('click', handleCardClick);
  container.addEventListener('click', handleCardClick);

  container.querySelectorAll('.prep-input[data-prep-id]').forEach(function(input) {
    input.addEventListener('blur', function() { updatePrepTime(input.dataset.prepId, parseInt(input.value) || 15, input.dataset.prepConfirmed === 'true'); });
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') input.blur(); });
  });
  container.querySelectorAll('.field-input[data-delivery-id]').forEach(function(input) {
    input.addEventListener('blur', function() { updateDeliveryTime(input.dataset.deliveryId, parseInt(input.value) || 30); });
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') input.blur(); });
  });
  container.querySelectorAll('.field-input[data-dboy-id]').forEach(function(input) {
    input.addEventListener('blur', function() { updateDeliveryBoyPhone(input.dataset.dboyId, input.value.trim()); });
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') input.blur(); });
  });
}

function handleCardClick(e) {
  const btn = e.target.closest('[data-action]');
  const toggle = e.target.closest('[data-toggle]');

  if (toggle) {
    const el = document.getElementById('items-' + toggle.dataset.toggle);
    if (el) { el.classList.toggle('open'); toggle.classList.toggle('open'); }
    return;
  }
  if (!btn) return;
  var id = btn.dataset.id;
  switch (btn.dataset.action) {
    case 'confirm':
      var card = btn.closest('.order-card');
      var pi = card ? card.querySelector('.prep-input') : null;
      updateOrderStatus(id, 'confirmed', undefined, pi ? (parseInt(pi.value) || 15) : 15);
      break;
    case 'ready': updateOrderStatus(id, 'ready'); break;
    case 'complete': updateOrderStatus(id, 'completed'); break;
    case 'delete': deleteOrder(id); break;
    case 'resolve': resolveWaiterCall(id); break;
    case 'start-cancel':
      var cr = document.getElementById('cancel-' + id);
      var ft = btn.closest('.order-card').querySelector('.card-footer');
      if (cr) cr.classList.remove('hidden');
      if (ft) ft.classList.add('hidden');
      break;
    case 'do-cancel':
      var ri = document.getElementById('cancel-reason-' + id);
      updateOrderStatus(id, 'cancelled', ri ? ri.value.trim() || undefined : undefined);
      break;
    case 'cancel-back':
      var cr2 = document.getElementById('cancel-' + id);
      var ft2 = btn.closest('.order-card').querySelector('.card-footer');
      if (cr2) cr2.classList.add('hidden');
      if (ft2) ft2.classList.remove('hidden');
      break;
  }
}
