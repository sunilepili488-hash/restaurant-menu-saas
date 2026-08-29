// ═══════════════════════════════════════════════════
// AuraMenu Staff App v2.2
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
let isDeliveryMode = false;
const currency = '₹';

// ═══ Icons ═══
const ICONS = {
  table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  checkCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  bell: '🔔',
  timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
};

// ═══════════════════════════════════════════════════
// 4 SOUNDS (Louder)
// ═══════════════════════════════════════════════════
function playCurrentSound() {
  if (!soundEnabled) return;
  try { ({bell:playBellSound,chime:playChimeSound,alert:playAlertSound,melody:playMelodySound}[currentSound]||playBellSound)(); } catch(e){}
}

function playBellSound() {
  var ctx = new (window.AudioContext||window.webkitAudioContext)(), now = ctx.currentTime;
  [0,0.45].forEach(function(d){[523,659,784].forEach(function(f,i){var o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0.5-i*0.1,now+d);g.gain.exponentialRampToValueAtTime(0.001,now+d+0.7);o.start(now+d);o.stop(now+d+0.7);});});
}
function playChimeSound() {
  var ctx = new (window.AudioContext||window.webkitAudioContext)(), now = ctx.currentTime;
  [0,0.25,0.5].forEach(function(d,i){var f=[600,800,1000][i],o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0.45,now+d);g.gain.exponentialRampToValueAtTime(0.001,now+d+0.5);o.start(now+d);o.stop(now+d+0.5);});
}
function playAlertSound() {
  var ctx = new (window.AudioContext||window.webkitAudioContext)(), now = ctx.currentTime;
  [0,0.18,0.36].forEach(function(d){var o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=1000;o.type='square';g.gain.setValueAtTime(0.5,now+d);g.gain.exponentialRampToValueAtTime(0.001,now+d+0.14);o.start(now+d);o.stop(now+d+0.14);});
}
function playMelodySound() {
  var ctx = new (window.AudioContext||window.webkitAudioContext)(), now = ctx.currentTime;
  [523,659,784,1047].forEach(function(f,i){var d=i*0.13,o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0.45,now+d);g.gain.exponentialRampToValueAtTime(0.001,now+d+0.45);o.start(now+d);o.stop(now+d+0.45);});
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(function(){});
  if (!STAFF_CONFIG.SUPABASE_URL) { alert('Configure Supabase in config.js'); return; }
  if (sessionStorage.getItem('staff_authed') === 'true') connectAndShowDashboard();
  else showPinScreen();
}

function showPinScreen() {
  document.getElementById('pin-screen').classList.add('active');
  document.getElementById('dashboard').classList.remove('active');
  var pinInput = document.getElementById('pin-input');
  var pinBtn = document.getElementById('pin-submit');
  var pinErr = document.getElementById('pin-error');
  function tryLogin() {
    var pin = pinInput.value.trim();
    if (!pin) { pinErr.textContent = 'Please enter PIN'; return; }
    if (pin === STAFF_CONFIG.STAFF_PIN) {
      sessionStorage.setItem('staff_authed', 'true');
      pinErr.textContent = '';
      connectAndShowDashboard();
    } else { pinErr.textContent = 'Invalid PIN'; pinInput.value = ''; pinInput.focus(); }
  }
  pinBtn.addEventListener('click', tryLogin);
  pinInput.addEventListener('keydown', function(e){ if(e.key==='Enter') tryLogin(); });
  pinInput.focus();
}

function connectAndShowDashboard() {
  document.getElementById('pin-screen').classList.remove('active');
  document.getElementById('dashboard').classList.add('active');
  db = window.supabase.createClient(STAFF_CONFIG.SUPABASE_URL, STAFF_CONFIG.SUPABASE_ANON_KEY);
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  setupDashboardControls();
  setupSoundMenu();
  fetchOrders();
  subscribeToRealtime();
  setInterval(fetchOrders, 7000);
  setInterval(updateTimeLabels, 30000);
}

function setupDashboardControls() {
  document.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      activeTab = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      isDeliveryMode = false;
      renderOrders();
    });
  });
  document.getElementById('search-input').addEventListener('input', function(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    // "hd" = show delivery orders
    if (searchQuery === 'hd') {
      isDeliveryMode = true;
    } else {
      isDeliveryMode = false;
    }
    renderOrders();
  });
  document.getElementById('sound-toggle').addEventListener('click', function() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-on-icon').classList.toggle('hidden', !soundEnabled);
    document.getElementById('sound-off-icon').classList.toggle('hidden', soundEnabled);
    showToast(soundEnabled ? 'Sound ON 🔊' : 'Sound OFF 🔇');
  });
  document.getElementById('logout-btn').addEventListener('click', function() {
    sessionStorage.removeItem('staff_authed'); location.reload();
  });
}

function setupSoundMenu() {
  var menu = document.getElementById('sound-menu');
  var btn = document.getElementById('sound-select-btn');
  var testBtn = document.getElementById('test-sound-btn');
  btn.addEventListener('click', function(){ menu.classList.toggle('hidden'); });
  document.addEventListener('click', function(e){ if(!menu.contains(e.target) && e.target!==btn && !btn.contains(e.target)) menu.classList.add('hidden'); });
  menu.querySelectorAll('.sound-option').forEach(function(opt) {
    if (opt.dataset.sound === currentSound) opt.classList.add('active');
    else opt.classList.remove('active');
    opt.addEventListener('click', function() {
      currentSound = opt.dataset.sound;
      localStorage.setItem('staff_sound', currentSound);
      menu.querySelectorAll('.sound-option').forEach(function(o){ o.classList.remove('active'); });
      opt.classList.add('active');
      showToast('Sound: ' + opt.textContent.trim());
      playCurrentSound();
    });
  });
  testBtn.addEventListener('click', function(){ playCurrentSound(); });
}

// ═══════════════════════════════════════════════════
// REALTIME + NOTIFICATIONS
// ═══════════════════════════════════════════════════
function subscribeToRealtime() {
  db.channel('staff-live-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'order' }, function(payload) {
    if (payload.eventType === 'INSERT') notifyNewOrder(payload.new);
    fetchOrders();
  }).subscribe();
}

function notifyNewOrder(order) {
  playCurrentSound(); vibratePhone(); showSystemNotification(order);
}

function showSystemNotification(order) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    var title = order.type === 'waiter_call' ? '🛎️ Waiter Call!' : '🍽️ New Order!';
    var body = order.type === 'waiter_call'
      ? (order.waiter_call_label || 'Waiter needed') + (order.table_number ? ' — Table ' + order.table_number : '')
      : 'Table ' + (order.table_number || 'N/A') + ' — ' + currency + (order.total || 0);
    new Notification(title, { body: body, tag: 'staff-' + order.id, requireInteraction: true });
  } catch(e){}
}

function vibratePhone() { if (navigator.vibrate) navigator.vibrate([200,100,200,100,200]); }

// ═══════════════════════════════════════════════════
// FETCH (Smart — no blink)
// ═══════════════════════════════════════════════════
async function fetchOrders() {
  if (!db) return;
  try {
    var r = await db.from('order').select('*').order('created_at', { ascending: false }).limit(200);
    if (r.error) throw r.error;
    var data = r.data;
    var hash = data.map(function(o){ return o.id+':'+o.status+':'+(o.updated_at||''); }).join('|');
    if (hash === lastDataHash) return;
    lastDataHash = hash;
    if (!firstLoad) {
      var newOrders = data.filter(function(o){ return !knownOrderIds.has(o.id); });
      if (newOrders.length > 0) { playCurrentSound(); vibratePhone(); newOrders.forEach(showSystemNotification); }
    }
    knownOrderIds = new Set(data.map(function(o){ return o.id; }));
    firstLoad = false;
    allOrders = data;
    updateStats();
    renderOrders();
  } catch(err) { console.error('[Staff]', err); }
}

// ═══════════════════════════════════════════════════
// STATUS UPDATES
// ═══════════════════════════════════════════════════
async function updateOrderStatus(id, status, cancelReason, prepMins) {
  if (!db) return;
  try {
    var p = { status: status, updated_at: new Date().toISOString() };
    if (cancelReason) p.cancel_reason = cancelReason;
    if (status === 'confirmed') { p.confirmed_at = new Date().toISOString(); p.timer_started_at = new Date().toISOString(); if (prepMins != null) p.prep_time_override = prepMins; }
    if (status === 'completed' && !cancelReason) p.delivered_at = new Date().toISOString();
    var r = await db.from('order').update(p).eq('id', id);
    if (r.error) throw r.error;
    showToast('Updated ✅');
    lastDataHash = ''; fetchOrders();
  } catch(e) { showToast('Failed ❌'); }
}
async function updatePrepTime(id, mins, confirmed) { if(!db)return; var p={prep_time_override:mins,updated_at:new Date().toISOString()}; if(confirmed)p.timer_started_at=new Date().toISOString(); await db.from('order').update(p).eq('id',id).catch(function(){}); }
async function updateDeliveryTime(id, mins) { if(!db)return; await db.from('order').update({delivery_time_minutes:mins,updated_at:new Date().toISOString()}).eq('id',id).catch(function(){}); }
async function updateDeliveryBoyPhone(id, phone) { if(!db)return; await db.from('order').update({delivery_boy_phone:phone,updated_at:new Date().toISOString()}).eq('id',id).catch(function(){}); }
async function deleteOrder(id) { if(!db)return; try{await db.from('order').delete().eq('id',id);showToast('Deleted');lastDataHash='';fetchOrders();}catch(e){showToast('Failed ❌');} }
async function resolveWaiterCall(id) { await updateOrderStatus(id, 'completed'); }

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function showToast(msg) { var el=document.getElementById('toast');document.getElementById('toast-msg').textContent=msg;el.classList.remove('hidden');el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('show');setTimeout(function(){el.classList.add('hidden');},300);},2000); }
function timeAgo(d) { var m=Math.floor((Date.now()-new Date(d).getTime())/60000); if(m<1)return'just now'; if(m<60)return m+'m ago'; var h=Math.floor(m/60); return h+'h '+(m%60)+'m ago'; }
function escHtml(s) { var d=document.createElement('div');d.textContent=s;return d.innerHTML; }
function updateTimeLabels() { document.querySelectorAll('[data-created-at]').forEach(function(el){el.textContent=timeAgo(el.dataset.createdAt);}); }

// ═══════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════
function getFilteredLists() {
  return {
    pending: allOrders.filter(function(o){ return o.type==='order'&&o.status==='pending'&&!o.is_home_delivery; }),
    confirmed: allOrders.filter(function(o){ return o.type==='order'&&o.status==='confirmed'&&!o.is_home_delivery; }),
    ready: allOrders.filter(function(o){ return o.type==='order'&&o.status==='ready'&&!o.is_home_delivery; }),
    delivery: allOrders.filter(function(o){ return o.is_home_delivery&&o.type==='order'&&!['completed','cancelled'].includes(o.status); }),
    waiterCalls: allOrders.filter(function(o){ return o.type==='waiter_call'&&o.status==='pending'; }),
  };
}

function updateStats() {
  var l = getFilteredLists();
  document.getElementById('stat-pending').textContent = l.pending.length;
  document.getElementById('stat-confirmed').textContent = l.confirmed.length;
  document.getElementById('stat-ready').textContent = l.ready.length;
  document.getElementById('stat-delivery').textContent = l.delivery.length;
  document.getElementById('stat-calls').textContent = l.waiterCalls.length;
  document.getElementById('badge-confirmation').textContent = l.pending.length;
  document.getElementById('badge-processing').textContent = l.confirmed.length + l.ready.length;
  document.getElementById('badge-waiter').textContent = l.waiterCalls.length;
}

function matchesSearch(order) {
  if (!searchQuery || searchQuery === 'hd') return true;
  var q = searchQuery;
  if (String(order.table_number||'').toLowerCase().includes(q)) return true;
  if ((order.items||[]).some(function(i){return(i.name||'').toLowerCase().includes(q);})) return true;
  if ((order.waiter_call_label||'').toLowerCase().includes(q)) return true;
  return false;
}

// ═══════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════
function renderOrders() {
  var container = document.getElementById('order-list');
  var l = getFilteredLists();
  var html = '';

  // Delivery mode (search "hd")
  if (isDeliveryMode) {
    var dList = l.delivery;
    html = '<div class="delivery-mode-banner">🚚 Home Delivery Orders (search "hd")</div>';
    if (dList.length === 0) { html += emptyState('🚚','No deliveries'); }
    else { html += dList.map(function(o){return renderDeliveryCard(o);}).join(''); }
    container.innerHTML = html;
    attachCardEvents();
    return;
  }

  switch (activeTab) {
    case 'confirmation':
      var pList = l.pending.filter(matchesSearch);
      html = pList.length===0 ? emptyState('😌','No pending orders') : pList.map(function(o){return renderOrderCard(o,'pending');}).join('');
      break;
    case 'processing':
      var c=l.confirmed.filter(matchesSearch), r=l.ready.filter(matchesSearch);
      html = (c.length===0&&r.length===0) ? emptyState('✅','No orders in progress') : c.map(function(o){return renderOrderCard(o,'confirmed');}).join('') + r.map(function(o){return renderOrderCard(o,'ready');}).join('');
      break;
    case 'waiter':
      var w=l.waiterCalls.filter(matchesSearch);
      html = w.length===0 ? emptyState('🛎️','No waiter calls') : w.map(function(o){return renderWaiterCard(o);}).join('');
      break;
  }
  container.innerHTML = html;
  attachCardEvents();
}

function emptyState(e,t) { return '<div class="empty-state"><span class="empty-state-emoji">'+e+'</span><p class="empty-state-text">'+escHtml(t)+'</p></div>'; }

// ═══════════════════════════════════════════════════
// ORDER CARD — minimal: accent bar tells status, items always visible
// ═══════════════════════════════════════════════════
function renderOrderCard(order, statusClass) {
  var items = order.items || [];
  var avgPrep = items.length > 0 ? Math.ceil(items.reduce(function(s,i){return s+(i.prep_time||15);},0)/items.length) : 15;
  var prepVal = order.prep_time_override || avgPrep;
  var isPending = order.status==='pending', isConfirmed = order.status==='confirmed', isReady = order.status==='ready';

  var actions = '';
  if (isPending) actions = '<button class="action-btn confirm" data-action="confirm" data-id="'+order.id+'">'+ICONS.check+'</button><button class="action-btn cancel" data-action="start-cancel" data-id="'+order.id+'">'+ICONS.x+'</button>';
  else if (isConfirmed) actions = '<button class="action-btn ready" data-action="ready" data-id="'+order.id+'">'+ICONS.checkCheck+'</button>';
  else if (isReady) actions = '<button class="action-btn delete" data-action="delete" data-id="'+order.id+'">'+ICONS.trash+'</button>';

  var itemsHtml = items.map(function(item) {
    return '<div class="item-row">' +
      '<span class="item-main"><span class="item-name">' + escHtml(item.name||'') + '</span><span class="item-qty">×' + item.qty + '</span></span>' +
      '<span class="item-price">' + currency + (item.price * item.qty).toLocaleString() + '</span>' +
    '</div>';
  }).join('');

  return '<div class="order-card status-'+statusClass+'" data-order-id="'+order.id+'">' +
    '<div class="card-header">' +
      '<div class="card-header-left">' +
        '<span class="card-table">'+ICONS.table+' Table '+escHtml(order.table_number||'N/A')+'</span>' +
        '<span class="card-status status-'+statusClass+'">'+statusClass+'</span>' +
      '</div>' +
      '<span class="card-time" data-created-at="'+order.created_at+'">'+timeAgo(order.created_at)+'</span>' +
    '</div>' +

    '<div class="card-items">' +
      itemsHtml +
    '</div>' +

    (order.special_instructions ? '<div class="special-box"><p>📝 '+escHtml(order.special_instructions)+'</p></div>' : '') +
    (order.total > 0 ? '<div class="subtotal-row"><span class="subtotal-label">Total</span><span class="subtotal-value">'+currency+order.total.toLocaleString()+'</span></div>' : '') +

    '<div class="card-footer">' +
      '<div class="prep-row">'+ICONS.timer+'<input class="prep-input" type="text" inputmode="numeric" value="'+prepVal+'" data-prep-id="'+order.id+'" data-prep-confirmed="'+isConfirmed+'"><span class="prep-unit">min</span></div>' +
      '<div class="card-actions">'+actions+'</div>' +
    '</div>' +

    '<div class="cancel-row hidden" id="cancel-'+order.id+'">' +
      '<input class="cancel-input" type="text" placeholder="Reason" id="cancel-reason-'+order.id+'">' +
      '<button class="cancel-confirm-btn" data-action="do-cancel" data-id="'+order.id+'">Cancel</button>' +
      '<button class="cancel-back-btn" data-action="cancel-back" data-id="'+order.id+'">Back</button>' +
    '</div>' +
  '</div>';
}

// ═══════════════════════════════════════════════════
// DELIVERY CARD
// ═══════════════════════════════════════════════════
function renderDeliveryCard(order) {
  var items = order.items || [];
  var isPending=order.status==='pending', isConfirmed=order.status==='confirmed', isReady=order.status==='ready';
  var pay=order.payment_method||'cod', addr=order.delivery_address||{};
  var otp=order.delivery_otp||'—', dTime=order.delivery_time_minutes||30, dPhone=order.delivery_boy_phone||'';
  var addrStr = [addr.flat,addr.street,addr.city,addr.pincode].filter(Boolean).join(', ');

  var actions = '';
  if (isPending) actions = '<button class="action-btn confirm" data-action="confirm" data-id="'+order.id+'">'+ICONS.check+'</button><button class="action-btn cancel" data-action="start-cancel" data-id="'+order.id+'">'+ICONS.x+'</button>';
  else if (isConfirmed) actions = '<button class="action-btn ready" data-action="ready" data-id="'+order.id+'">'+ICONS.checkCheck+'</button>';
  else if (isReady) actions = '<button class="action-btn complete" data-action="complete" data-id="'+order.id+'">'+ICONS.truck+'</button>';

  var itemsHtml = items.map(function(item){
    return '<div class="item-row">' +
      '<span class="item-main"><span class="item-name">'+escHtml(item.name||'')+'</span><span class="item-qty">×'+item.qty+'</span></span>' +
      '<span class="item-price">'+currency+(item.price*item.qty).toLocaleString()+'</span>' +
    '</div>';
  }).join('');

  return '<div class="order-card status-delivery" data-order-id="'+order.id+'">' +
    '<div class="card-header">' +
      '<div class="delivery-header-row">'+ICONS.truck+'<span class="delivery-title">Home Delivery</span><span class="otp-badge">OTP '+escHtml(String(otp))+'</span></div>' +
      '<span class="card-time" data-created-at="'+order.created_at+'">'+timeAgo(order.created_at)+'</span>' +
    '</div>' +
    '<div class="delivery-info">' +
      '<div class="customer-row">' +
        '<div class="customer-name">'+escHtml(order.delivery_name||'N/A')+(order.delivery_phone?' <a href="tel:'+order.delivery_phone+'" class="customer-phone">'+ICONS.phone+' '+escHtml(order.delivery_phone)+'</a>':'')+'</div>' +
        (addrStr?'<div class="customer-address">'+ICONS.mapPin+'<span>'+escHtml(addrStr)+'</span></div>':'') +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span class="payment-badge '+(pay==='upi'?'upi':'cod')+'">'+(pay==='upi'?'UPI Paid':'COD')+'</span>' +
        (order.total>0?'<span class="delivery-total">'+currency+order.total.toLocaleString()+'</span>':'') +
      '</div>' +
    '</div>' +

    '<div class="card-items">'+itemsHtml+'</div>' +
    (order.special_instructions?'<div class="special-box"><p>📝 '+escHtml(order.special_instructions)+'</p></div>':'') +

    '<div class="delivery-fields">' +
      '<div class="field-row">'+ICONS.truck+'<span class="field-label">Delivery</span><input class="field-input" type="text" inputmode="numeric" value="'+dTime+'" data-delivery-id="'+order.id+'" style="max-width:56px"><span class="prep-unit">min</span></div>' +
      '<div class="field-row">'+ICONS.phone+'<span class="field-label">Rider</span><input class="field-input" type="tel" value="'+escHtml(dPhone)+'" placeholder="Phone number" data-dboy-id="'+order.id+'"></div>' +
    '</div>' +

    '<div class="card-footer"><div></div><div class="card-actions">'+actions+'</div></div>' +
    '<div class="cancel-row hidden" id="cancel-'+order.id+'"><input class="cancel-input" type="text" placeholder="Reason" id="cancel-reason-'+order.id+'"><button class="cancel-confirm-btn" data-action="do-cancel" data-id="'+order.id+'">Cancel</button><button class="cancel-back-btn" data-action="cancel-back" data-id="'+order.id+'">Back</button></div>' +
  '</div>';
}

// ═══════════════════════════════════════════════════
// WAITER CARD
// ═══════════════════════════════════════════════════
function renderWaiterCard(order) {
  var mins = Math.floor((Date.now()-new Date(order.created_at).getTime())/60000);
  return '<div class="waiter-card '+(mins>=5?'old':'')+'" data-order-id="'+order.id+'">' +
    '<div class="waiter-icon-wrap">'+ICONS.bell+'</div>' +
    '<div class="waiter-info"><p class="waiter-label">'+escHtml(order.waiter_call_label||'Waiter Call')+'</p><p class="waiter-meta">'+(order.table_number?'Table '+escHtml(order.table_number):'No table')+' · <span data-created-at="'+order.created_at+'">'+timeAgo(order.created_at)+'</span></p></div>' +
    '<button class="resolve-btn" data-action="resolve" data-id="'+order.id+'">'+ICONS.check+' Resolve</button>' +
  '</div>';
}

// ═══════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════
function attachCardEvents() {
  var c = document.getElementById('order-list');
  c.removeEventListener('click', handleCardClick);
  c.addEventListener('click', handleCardClick);
  c.querySelectorAll('.prep-input[data-prep-id]').forEach(function(i){
    i.addEventListener('blur',function(){updatePrepTime(i.dataset.prepId,parseInt(i.value)||15,i.dataset.prepConfirmed==='true');});
    i.addEventListener('keydown',function(e){if(e.key==='Enter')i.blur();});
  });
  c.querySelectorAll('.field-input[data-delivery-id]').forEach(function(i){
    i.addEventListener('blur',function(){updateDeliveryTime(i.dataset.deliveryId,parseInt(i.value)||30);});
    i.addEventListener('keydown',function(e){if(e.key==='Enter')i.blur();});
  });
  c.querySelectorAll('.field-input[data-dboy-id]').forEach(function(i){
    i.addEventListener('blur',function(){updateDeliveryBoyPhone(i.dataset.dboyId,i.value.trim());});
    i.addEventListener('keydown',function(e){if(e.key==='Enter')i.blur();});
  });
}

function handleCardClick(e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;
  var id = btn.dataset.id;
  switch (btn.dataset.action) {
    case 'confirm':
      var card=btn.closest('.order-card'), pi=card?card.querySelector('.prep-input'):null;
      updateOrderStatus(id,'confirmed',undefined,pi?(parseInt(pi.value)||15):15); break;
    case 'ready': updateOrderStatus(id,'ready'); break;
    case 'complete': updateOrderStatus(id,'completed'); break;
    case 'delete': deleteOrder(id); break;
    case 'resolve': resolveWaiterCall(id); break;
    case 'start-cancel':
      var cr=document.getElementById('cancel-'+id), ft=btn.closest('.order-card').querySelector('.card-footer');
      if(cr)cr.classList.remove('hidden'); if(ft)ft.classList.add('hidden'); break;
    case 'do-cancel':
      var ri=document.getElementById('cancel-reason-'+id);
      updateOrderStatus(id,'cancelled',ri?ri.value.trim()||undefined:undefined); break;
    case 'cancel-back':
      var cr2=document.getElementById('cancel-'+id), ft2=btn.closest('.order-card').querySelector('.card-footer');
      if(cr2)cr2.classList.add('hidden'); if(ft2)ft2.classList.remove('hidden'); break;
  }
}
