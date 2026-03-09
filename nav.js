// CHRIST University Lavasa — Shared Navigation JavaScript
// Loaded dynamically after navbar injection — DO NOT wrap in DOMContentLoaded

// ── NAV READY GUARD — prevents dropdown flash on page load ──
// Adds .nav-ready to #mainNav after page settles, enabling hover CSS
(function () {
  function markNavReady() {
    var nav = document.getElementById('mainNav');
    if (nav) nav.classList.add('nav-ready');
  }
  // Use requestAnimationFrame + setTimeout to wait for full paint
  requestAnimationFrame(function () {
    setTimeout(markNavReady, 300);
  });
})();


// ── CAMPUS SWITCHER ──
(function () {
  var switcher = document.getElementById('campusSwitcher');
  var btn      = document.getElementById('campusSwitcherBtn');
  var drop     = document.getElementById('campusDrop');
  var closeBtn = document.getElementById('campusDropClose');
  if (!switcher || !btn || !drop) return;

  function openDrop() {
    switcher.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () {
      var rect = drop.getBoundingClientRect();
      if (rect.right > window.innerWidth - 12) {
        drop.style.left = Math.max(0, -(rect.right - (window.innerWidth - 12))) + 'px';
      } else {
        drop.style.left = '0';
      }
    });
  }
  function closeDrop() {
    switcher.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function (e) { e.stopPropagation(); switcher.classList.contains('open') ? closeDrop() : openDrop(); });
  if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeDrop(); });
  document.addEventListener('click', function (e) { if (!switcher.contains(e.target)) closeDrop(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrop(); });
  switcher.addEventListener('mouseenter', function () { if (window.innerWidth >= 992) openDrop(); });
  switcher.addEventListener('mouseleave', function () { if (window.innerWidth >= 992) closeDrop(); });
})();


// ── HOVER DROPDOWNS (desktop) ──
(function () {
  if (window.innerWidth < 992) return;

  // Shared timer — so entering any item cancels the previous item's hide
  var globalHideTimer = null;
  var activeDropInstance = null;

  document.querySelectorAll('#mainNav .mega-dropdown, #mainNav .nav-item.dropdown').forEach(function (item) {
    var toggleEl = item.querySelector('[data-bs-toggle="dropdown"]');
    if (!toggleEl) return;

    var bsDrop = null;
    try { bsDrop = bootstrap.Dropdown.getOrCreateInstance(toggleEl); } catch (e) {}

    item.addEventListener('mouseenter', function () {
      if (window.innerWidth < 992) return;
      // Cancel any pending hide from previous item — instant switch
      clearTimeout(globalHideTimer);
      // Hide previous if different
      if (activeDropInstance && activeDropInstance !== bsDrop) {
        activeDropInstance.hide();
      }
      activeDropInstance = bsDrop;
      if (bsDrop) bsDrop.show();
      if (toggleEl) toggleEl.blur();
    });
    item.addEventListener('mouseleave', function () {
      if (window.innerWidth < 992) return;
      globalHideTimer = setTimeout(function () {
        if (bsDrop) bsDrop.hide();
        if (activeDropInstance === bsDrop) activeDropInstance = null;
      }, 80);
    });
  });
})();


// ── DROPDOWN SMART CLAMP ──
document.querySelectorAll('#mainNav .mega-dropdown').forEach(function (item) {
  item.addEventListener('shown.bs.dropdown', function () {
    var menu = this.querySelector('.dropdown-menu');
    if (!menu) return;
    menu.style.left = '0';
    menu.style.right = 'auto';
    var rect = menu.getBoundingClientRect();
    var vw = window.innerWidth;
    if (rect.right > vw - 12) menu.style.left = Math.round(-(rect.right - (vw - 12))) + 'px';
    if (rect.left < 12)       menu.style.left = Math.round(12 - rect.left) + 'px';
  });
  item.addEventListener('hidden.bs.dropdown', function () {
    var menu = this.querySelector('.dropdown-menu');
    if (menu) { menu.style.left = ''; menu.style.right = ''; }
  });
});


// ── MOBILE DRAWER ──
(function () {
  var btn      = document.getElementById('mobMenuBtn');
  var drawer   = document.getElementById('mobDrawer');
  var overlay  = document.getElementById('mobOverlay');
  var closeBtn = document.getElementById('mobDrawerClose');
  if (!btn || !drawer) return;

  function openDrawer()  { drawer.classList.add('open'); if(overlay) overlay.classList.add('open'); btn.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { drawer.classList.remove('open'); if(overlay) overlay.classList.remove('open'); btn.classList.remove('open'); document.body.style.overflow = ''; }

  btn.addEventListener('click', function () { drawer.classList.contains('open') ? closeDrawer() : openDrawer(); });
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay)  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  drawer.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  drawer.querySelectorAll('.mob-nav-btn[data-mob-acc]').forEach(function (accBtn) {
    accBtn.addEventListener('click', function () {
      var key  = this.dataset.mobAcc;
      var sub  = document.getElementById('mob-acc-' + key);
      var isOpen = this.classList.contains('open');
      drawer.querySelectorAll('.mob-nav-btn').forEach(function (b) { b.classList.remove('open'); });
      drawer.querySelectorAll('.mob-sub').forEach(function (s) { s.classList.remove('open'); });
      if (!isOpen && sub) { this.classList.add('open'); sub.classList.add('open'); }
    });
  });
})();


// ── SCROLL TOP ──
// Uses MutationObserver to detect when the button is injected by footer fetch
(function () {
  function bindScrollTop(btn) {
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 500);
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // Trigger once in case page is already scrolled
    btn.classList.toggle('show', window.scrollY > 500);
  }

  var existing = document.getElementById('scrollTop');
  if (existing) {
    bindScrollTop(existing);
  } else {
    // Watch for footer to be injected into DOM
    var observer = new MutationObserver(function (mutations, obs) {
      var btn = document.getElementById('scrollTop');
      if (btn) {
        obs.disconnect();
        bindScrollTop(btn);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
