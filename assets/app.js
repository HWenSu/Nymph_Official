/**
 * Nymph Atelier - Shared Interactivity & Cart Management
 */

// Initialize Cart State from LocalStorage
const DEFAULT_CART = [
  {
    id: 'prod-1',
    name: '晨曦森林複方精油',
    enName: 'Forest Dawn Essential Oil',
    price: 1280,
    qty: 1,
    image: './assets/292de2cfde3ec55f7fb538f7c7ecd65cb585b8d8.png'
  },
  {
    id: 'prod-3',
    name: '白水晶原石療癒盒',
    enName: 'Pure Quartz Cleansing Ritual Box',
    price: 1450,
    qty: 1,
    image: './assets/prod_crystal_box.png'
  }
];

function getCart() {
  try {
    const saved = localStorage.getItem('nymph_cart');
    return saved ? JSON.parse(saved) : DEFAULT_CART;
  } catch (e) {
    return DEFAULT_CART;
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem('nymph_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
  updateCartBadges();
  renderCartDrawer();
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadges() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count-badge').forEach(badge => {
    badge.textContent = count;
    badge.classList.add('scale-125');
    setTimeout(() => badge.classList.remove('scale-125'), 200);
  });
  document.querySelectorAll('.cart-items-count').forEach(el => {
    el.textContent = count;
  });
}

// Toast Notifications
let toastTimer;
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none bg-[#435a44] text-[#ece9e3] px-5 py-3.5 rounded-[2px] shadow-2xl border border-[#d0cbb6]/40 flex items-center gap-3';
    toast.innerHTML = `
      <span class="text-[#d0cbb6] font-serif text-sm">✦</span>
      <span id="global-toast-msg" class="font-sans text-xs sm:text-sm tracking-wide"></span>
    `;
    document.body.appendChild(toast);
  }
  
  const msgEl = document.getElementById('global-toast-msg');
  if (msgEl) msgEl.textContent = message;

  if (toastTimer) clearTimeout(toastTimer);
  toast.classList.remove('translate-y-24', 'opacity-0');
  toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 2800);
}

// Add Item To Cart
function addToCart(name, price, image = './assets/prod_crystal_box.png', qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: 'prod-' + Date.now(),
      name,
      enName: '',
      price,
      qty,
      image
    });
  }
  saveCart(cart);
  showToast(`已加入購物車：${name} (NT$ ${price.toLocaleString()})`);
  openCartDrawer();
}

function updateCartQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      const idx = cart.indexOf(item);
      cart.splice(idx, 1);
    }
    saveCart(cart);
  }
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

// Mini-Cart Drawer
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    renderCartDrawer();
    drawer.classList.remove('translate-x-full', 'pointer-events-none');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100');
    document.body.classList.add('overflow-hidden');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('translate-x-full', 'pointer-events-none');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    backdrop.classList.remove('opacity-100');
    document.body.classList.remove('overflow-hidden');
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-drawer-subtotal') || document.getElementById('cart-subtotal');
  const shippingBar = document.getElementById('cart-shipping-bar');
  const shippingText = document.getElementById('cart-shipping-text');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-[#787e5e]">
        <span class="text-3xl font-serif">✦</span>
        <p class="mt-3 font-serif text-lg text-[#1c1c1a]">您的購物車目前是空的</p>
        <p class="text-xs text-[#78725c] mt-1">探索我們的植物香氛與礦石結晶，為日常注入療癒能量。</p>
        <a href="shop.html" onclick="closeCartDrawer()" class="inline-block mt-6 px-6 py-2.5 bg-[#435a44] text-[#ece9e3] text-xs font-sans tracking-wider uppercase rounded-[1px] hover:bg-[#324533] transition-colors">
          探索所有商品
        </a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = 'NT$ 0';
    if (shippingBar) shippingBar.style.width = '0%';
    if (shippingText) shippingText.textContent = '滿 NT$ 2,000 即享免運優惠';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    return `
      <div class="flex gap-4 py-4 border-b border-[#d0cbb6]/40 items-center">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-[2px] bg-[#eae7e0] border border-[#d0cbb6]/50">
        <div class="flex-1 min-w-0">
          <h5 class="font-serif text-sm text-[#1c1c1a] font-normal truncate">${item.name}</h5>
          <p class="font-sans text-xs text-[#787e5e] mt-0.5">NT$ ${item.price.toLocaleString()}</p>
          <div class="flex items-center gap-2 mt-2">
            <div class="flex items-center border border-[#d0cbb6]/70 rounded-[1px] bg-white">
              <button type="button" onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center text-[#1c1c1a] hover:bg-[#ece9e3] transition-colors text-xs">-</button>
              <span class="w-6 text-center text-xs font-sans">${item.qty}</span>
              <button type="button" onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center text-[#1c1c1a] hover:bg-[#ece9e3] transition-colors text-xs">+</button>
            </div>
            <button type="button" onclick="removeFromCart('${item.id}')" class="text-[11px] text-[#78725c] hover:text-red-700 transition-colors underline ml-2">移除</button>
          </div>
        </div>
        <div class="text-right">
          <p class="font-serif text-sm font-medium text-[#435a44]">NT$ ${itemTotal.toLocaleString()}</p>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `NT$ ${subtotal.toLocaleString()}`;

  // Shipping threshold progress bar ($2,000)
  const freeThreshold = 2000;
  const progress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  if (shippingBar) shippingBar.style.width = `${progress}%`;
  if (shippingText) {
    if (subtotal >= freeThreshold) {
      shippingText.innerHTML = `<span class="text-[#435a44] font-semibold">✦ 恭喜！您已享有免運優惠</span>`;
    } else {
      const diff = freeThreshold - subtotal;
      shippingText.innerHTML = `再消費 <span class="font-semibold text-[#1c1c1a]">NT$ ${diff.toLocaleString()}</span> 即享免運優惠`;
    }
  }

  // Refresh position-aware buttons inside cart drawer
  setTimeout(initPositionAwareButtons, 10);
}

// Global Drawer & Menu Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Update cart badge initially
  updateCartBadges();

  // Mobile menu drawer
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer') || document.getElementById('mobile-menu-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop') || document.getElementById('mobile-menu-backdrop') || document.getElementById('mobile-menu-overlay');
  const closeDrawerBtn = document.getElementById('close-drawer-btn') || document.getElementById('close-menu-btn') || document.getElementById('mobile-menu-close');

  function openMenu() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('translate-x-full', '-translate-x-full', 'pointer-events-none');
      if (drawerBackdrop) {
        drawerBackdrop.classList.remove('opacity-0', 'pointer-events-none');
        drawerBackdrop.classList.add('opacity-100');
      }
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeMenu() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('translate-x-full', 'pointer-events-none');
      if (drawerBackdrop) {
        drawerBackdrop.classList.add('opacity-0', 'pointer-events-none');
        drawerBackdrop.classList.remove('opacity-100');
      }
      document.body.classList.remove('overflow-hidden');
    }
  }

  menuBtn?.addEventListener('click', openMenu);
  closeDrawerBtn?.addEventListener('click', closeMenu);
  drawerBackdrop?.addEventListener('click', closeMenu);

  // Cart drawer triggers
  document.querySelectorAll('.cart-trigger-btn').forEach(btn => {
    btn.addEventListener('click', openCartDrawer);
  });
  
  const closeCartBtn = document.getElementById('cart-drawer-close') || document.getElementById('close-cart-btn');
  closeCartBtn?.addEventListener('click', closeCartDrawer);
  document.getElementById('cart-backdrop')?.addEventListener('click', closeCartDrawer);

  // Initialize Position-Aware Buttons on all pages
  initPositionAwareButtons();

  // Initialize Directionally-Aware Header on all pages
  initDirectionalHeader();
  setTimeout(initDirectionalHeader, 100);
});

// ==================== DIRECTIONALLY AWARE HEADER (ScrollTrigger) ====================
// Matches GreenSock demo: https://codepen.io/GreenSock/pen/qBawMGb
function initDirectionalHeader() {
  const header = document.getElementById('site-header') || document.querySelector('.site-header') || document.querySelector('header');
  if (!header) return;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Avoid creating duplicate ScrollTriggers if already initialized
  if (header._hasDirectionalTrigger) return;
  header._hasDirectionalTrigger = true;

  const showHeaderAnim = gsap.from(header, {
    yPercent: -100,
    paused: true,
    duration: 0.25,
    ease: 'power2.out'
  }).progress(1);

  ScrollTrigger.create({
    start: 'top top',
    end: 'max',
    onUpdate: (self) => {
      // Keep header visible if mobile drawer or cart drawer is currently open
      const mobileDrawer = document.getElementById('mobile-drawer') || document.getElementById('mobile-menu-drawer');
      let isDrawerOpen = false;
      if (mobileDrawer) {
        const isOffscreen = mobileDrawer.classList.contains('-translate-x-full') ||
                            mobileDrawer.classList.contains('translate-x-full') ||
                            mobileDrawer.classList.contains('pointer-events-none');
        isDrawerOpen = !isOffscreen;
      }

      const cartDrawer = document.getElementById('cart-drawer');
      const isCartOpen = cartDrawer ? !cartDrawer.classList.contains('translate-x-full') : false;

      if (isDrawerOpen || isCartOpen) {
        showHeaderAnim.play();
        return;
      }

      if (self.scroll() <= 10) {
        showHeaderAnim.play();
      } else {
        self.direction === -1 ? showHeaderAnim.play() : showHeaderAnim.reverse();
      }
    }
  });
}

// ==================== POSITION-AWARE BUTTONS (kjbrum effect) ====================
// Based on Kyle Brumm's demo: https://codepen.io/kjbrum/pen/wBBLXx
function isButtonElement(el) {
  // If explicitly tagged
  if (el.classList.contains('pos-aware-btn') || el.classList.contains('btn') || el.classList.contains('btn-pos-aware')) {
    return true;
  }

  // Never match category carousel cards, navigation links, or footer link lists
  if (el.classList.contains('cat-card') ||
      el.classList.contains('site-header-nav-link') ||
      el.classList.contains('drawer-nav-link') ||
      el.closest('footer ul') ||
      el.closest('#mobile-drawer nav') ||
      el.closest('.sub-list') ||
      el.getAttribute('onclick')?.includes('toggleSub')) {
    return false;
  }

  // All <button> elements (except excluded above) are buttons!
  if (el.tagName === 'BUTTON') return true;
  if (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'button')) return true;

  // For <a> links: match if styled like a button (has padding + bg/border)
  if (el.tagName === 'A') {
    const cls = el.className || '';
    const hasPadding = /\bp[xy]?-[2-9]|\bpx-\d+|\bpy-\d+/.test(cls);
    const hasBgOrBorder = /\b(bg-nymph-|bg-\[|border-nymph-|border-\[|btn)\b/.test(cls);
    if (hasPadding && hasBgOrBorder) return true;
  }

  return false;
}

function initPositionAwareButtons() {
  const elements = document.querySelectorAll('button, a, input[type="submit"], input[type="button"], .btn-pos-aware, .pos-aware-btn');

  elements.forEach(btn => {
    // Check if this element should be treated as an interactive button
    if (!isButtonElement(btn)) return;

    // Avoid double-initialization
    if (btn._hasPosAware) return;
    btn._hasPosAware = true;
    btn.classList.add('pos-aware-btn');

    // Preserve computed position for absolute/fixed elements
    const compPos = window.getComputedStyle(btn).position;
    if (compPos === 'absolute') {
      btn.classList.add('is-pos-absolute');
    } else if (compPos === 'fixed') {
      btn.classList.add('is-pos-fixed');
    }

    // Wrap bare text nodes in a relative span to keep text elevated above the ripple
    Array.from(btn.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
        const textSpan = document.createElement('span');
        textSpan.className = 'pos-aware-text';
        textSpan.style.position = 'relative';
        textSpan.style.zIndex = '2';
        textSpan.style.pointerEvents = 'none';
        textSpan.textContent = node.textContent;
        btn.replaceChild(textSpan, node);
      }
    });

    // Ensure non-ripple children have relative positioning and z-index 2
    Array.from(btn.children).forEach(child => {
      if (!child.classList.contains('pos-aware-ripple')) {
        const childPos = window.getComputedStyle(child).position;
        if (childPos === 'static') {
          child.style.position = 'relative';
        }
        child.style.zIndex = '2';
        child.style.pointerEvents = 'none';
      }
    });

    // Create or locate the ripple element
    let ripple = btn.querySelector(':scope > .pos-aware-ripple');
    if (!ripple) {
      ripple = document.createElement('span');
      ripple.className = 'pos-aware-ripple';
      ripple.setAttribute('aria-hidden', 'true');
      btn.insertBefore(ripple, btn.firstChild);
    }

    // Update position on mouseenter & mouseleave (Kyle Brumm pattern)
    function handleMouse(e) {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      // Diameter ensuring complete coverage even from the farthest corner
      const dia = Math.ceil(Math.hypot(rect.width, rect.height) * 2.25);
      btn.style.setProperty('--btn-ripple-dia', dia + 'px');

      ripple.style.left = relX + 'px';
      ripple.style.top = relY + 'px';
    }

    btn.addEventListener('mouseenter', handleMouse);
    btn.addEventListener('mouseleave', handleMouse);

    // Touch device support
    btn.addEventListener('touchend', () => {
      setTimeout(() => {
        btn.style.setProperty('--btn-ripple-dia', '0px');
      }, 400);
    }, { passive: true });
  });
}

// Global exposure
window.initPositionAwareButtons = initPositionAwareButtons;

// Automatically initialize newly added buttons (e.g. dynamic content/filtering)
if (typeof MutationObserver !== 'undefined') {
  let moTimer = null;
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length > 0) {
        clearTimeout(moTimer);
        moTimer = setTimeout(initPositionAwareButtons, 50);
        break;
      }
    }
  });
  if (document.body) {
    mo.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      mo.observe(document.body, { childList: true, subtree: true });
    });
  }
}

