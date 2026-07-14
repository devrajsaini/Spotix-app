'use strict';
/* ============================================================
   SPOTTIX – script.js  (complete interactive version)
============================================================ */

/* ── Existing site logic ── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navItems = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id],footer[id]');
const revealEls = document.querySelectorAll('.reveal');

window.addEventListener('scroll', onScroll, { passive: true });
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveNav();
  revealOnScroll();
}
hamburger.addEventListener('click', () => {
  const o = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', o);
});
navItems.forEach(l => l.addEventListener('click', () => { hamburger.classList.remove('open'); navLinks.classList.remove('open'); }));
document.addEventListener('click', e => { if (!navbar.contains(e.target)) { hamburger.classList.remove('open'); navLinks.classList.remove('open'); } });
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const id = this.getAttribute('href'); if (id === '#') return;
    const t = document.querySelector(id); if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 6, behavior: 'smooth' });
  });
});
function updateActiveNav() {
  const y = window.scrollY + navbar.offsetHeight + 40; let cur = '';
  sections.forEach(s => { if (y >= s.offsetTop) cur = s.id; });
  navItems.forEach(l => l.classList.toggle('active', l.getAttribute('href').slice(1) === cur));
}
document.querySelectorAll('.problem-grid,.testi-grid,.steps-row').forEach(g => {
  g.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${i * 75}ms`; });
});
function revealOnScroll() {
  const vh = window.innerHeight;
  revealEls.forEach(el => { if (el.getBoundingClientRect().top < vh - 48) el.classList.add('visible'); });
}
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});
function animCount(el) { const t = parseInt(el.dataset.target, 10); if (isNaN(t)) return; const d = 2000, t0 = performance.now(); (function tick(now) { const p = Math.min((now - t0) / d, 1); el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * t).toLocaleString('en-IN'); if (p < 1) requestAnimationFrame(tick); else el.textContent = t.toLocaleString('en-IN'); })(t0); }
const cobs = new IntersectionObserver(en => { en.forEach(e => { if (e.isIntersecting) { animCount(e.target); cobs.unobserve(e.target); } }); }, { threshold: .5 });
document.querySelectorAll('[data-target]').forEach(el => cobs.observe(el));
revealOnScroll(); updateActiveNav();

/* ================================================================
   CAROUSEL — Premium 3-up center-focus, autoplay, infinite loop
================================================================ */
(function () {
  'use strict';

  const TOTAL    = 5;
  const GAP      = 28;   // must match CSS gap on .ss-track
  const AUTO_MS  = 4000;

  let current   = 0;   // 0-based index of the active card
  let autoTimer = null;
  let dragging  = false;
  let dragStartX = 0;
  let animating = false;

  const track    = document.getElementById('ssTrack');
  const viewport = document.getElementById('ssViewport');
  const prevBtn  = document.getElementById('ssPrev');
  const nextBtn  = document.getElementById('ssNext');
  const dotBtns  = document.querySelectorAll('#ssDots .ss-dot-btn');
  const cards    = track ? Array.from(track.querySelectorAll('.ss-card')) : [];

  if (!track || cards.length === 0) return;

  /* ── Measure card width from the DOM ── */
  function cardW() {
    return cards[0].getBoundingClientRect().width || 270;
  }

  /* ── Compute how many cards are fully visible in the viewport ── */
  function visibleCount() {
    const vw = viewport ? viewport.getBoundingClientRect().width : window.innerWidth;
    const cw = cardW() + GAP;
    return Math.max(1, Math.round(vw / cw));
  }

  /* ── Offset so the active card is centered ── */
  function offsetForIndex(idx) {
    const vw  = viewport ? viewport.getBoundingClientRect().width : window.innerWidth;
    const cw  = cardW();
    // Position of left edge of card[idx]
    const cardLeft = idx * (cw + GAP);
    // Center it
    return cardLeft - (vw / 2) + (cw / 2);
  }

  /* ── Apply active styles to cards ── */
  function applyStyles(idx) {
    cards.forEach((c, i) => {
      c.classList.toggle('ss-active', i === idx);
    });
    dotBtns.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  /* ── Slide to index ── */
  function goTo(idx, animate) {
    if (animating && animate !== false) return;
    // Clamp with infinite wrap
    current = ((idx % TOTAL) + TOTAL) % TOTAL;
    animating = true;

    const offset = offsetForIndex(current);
    track.style.transition = (animate === false)
      ? 'none'
      : 'transform .50s cubic-bezier(.4, 0, .2, 1)';
    track.style.transform  = `translateX(-${Math.max(0, offset)}px)`;

    applyStyles(current);

    setTimeout(() => { animating = false; }, 520);
  }

  /* ── Auto-play ── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1, true), AUTO_MS);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  /* ── Arrow clicks ── */
  prevBtn?.addEventListener('click', () => { goTo(current - 1, true); startAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1, true); startAuto(); });

  /* ── Dot clicks ── */
  dotBtns.forEach((d, i) => {
    d.addEventListener('click', () => { goTo(i, true); startAuto(); });
  });

  /* ── Card clicks → open modal ── */
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (Math.abs(dragStartX - (window._ssLastX || dragStartX)) > 6) return; // was a drag
      openModal(card.dataset.screen || 'home');
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card.dataset.screen || 'home'); }
    });
  });

  /* ── Mouse drag ── */
  track.addEventListener('mousedown', e => {
    dragging  = true;
    dragStartX = e.clientX;
    window._ssLastX = e.clientX;
    stopAuto();
    track.style.transition = 'none';
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    window._ssLastX = e.clientX;
  });
  window.addEventListener('mouseup', e => {
    if (!dragging) return;
    dragging = false;
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1), true);
    else goTo(current, true); // snap back
    startAuto();
  });

  /* ── Touch swipe ── */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1), true);
    startAuto();
  }, { passive: true });

  /* ── Pause on hover ── */
  const section = document.getElementById('screenshots');
  section?.addEventListener('mouseenter', stopAuto);
  section?.addEventListener('mouseleave', startAuto);

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { goTo(current + 1, true); startAuto(); }
    if (e.key === 'ArrowLeft')  { goTo(current - 1, true); startAuto(); }
  });

  /* ── Recalculate on resize ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current, false), 150);
  });

  /* ── Init ── */
  // Wait one frame for layout to settle
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      goTo(0, false);
      startAuto();
    });
  });

})();

/* ================================================================
   MODAL SYSTEM
================================================================ */
const overlay = document.getElementById('spxModalOverlay');
const modalClose = document.getElementById('spxModalClose');
const spxScreen = document.getElementById('spxScreen');
const spxBnav = document.getElementById('spxBnav');
let leafletMap = null;
let currentScreen = 'home';

function openModal(screen) {
  currentScreen = screen;
  overlay.classList.add('spx-open');
  document.body.style.overflow = 'hidden';
  renderScreen(screen);
  setActiveBnav(screen);
  if (screen === 'map') setTimeout(initLeafletMap, 120);
}
function closeModal() {
  overlay.classList.remove('spx-open');
  document.body.style.overflow = '';
  if (leafletMap) { leafletMap.remove(); leafletMap = null; }
}

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Card click → modal is handled inside the carousel IIFE above

// Bottom nav
spxBnav.querySelectorAll('.spx-bni').forEach(btn => {
  btn.addEventListener('click', () => {
    const sc = btn.dataset.screen;
    if (!sc) return;
    currentScreen = sc; renderScreen(sc); setActiveBnav(sc);
    if (sc === 'map') setTimeout(initLeafletMap, 120);
    else if (leafletMap) { leafletMap.remove(); leafletMap = null; }
  });
});

function setActiveBnav(screen) {
  spxBnav.querySelectorAll('.spx-bni').forEach(b => { b.classList.toggle('spx-active', b.dataset.screen === screen); });
}

/* ================================================================
   SCREEN RENDERERS
================================================================ */
function renderScreen(screen) {
  if (screen === 'map') { spxScreen.innerHTML = renderMap(); return; }
  if (screen === 'report') { spxScreen.innerHTML = renderReport(); bindReport(); return; }
  if (screen === 'myreports') { spxScreen.innerHTML = renderMyReports(); bindMyReports(); return; }
  if (screen === 'ranks') { spxScreen.innerHTML = renderRanks(); bindRanks(); return; }
  if (screen === 'account') { spxScreen.innerHTML = renderAccount(); bindAccount(); return; }
  spxScreen.innerHTML = renderHome(); bindHome();
}

/* ── HOME ── */
function renderHome() {
  return `<div class="spx-scr">
    <div class="spx-scr-body">
      <div style="padding:14px 14px 0">
        <div style="font-size:.7rem;color:var(--t2);margin-bottom:4px">📍 Bengaluru, Karnataka</div>
        <div style="font-size:1rem;font-weight:800;color:var(--t1);margin-bottom:12px">Good morning, Suraj 👋</div>
        <div class="spx-home-banner">
          <div class="spx-home-banner-text"><p>Together for</p><p>a clean Bengaluru</p></div>
          <div class="spx-home-banner-ico">♻️</div>
        </div>
        <div class="spx-home-action-grid">
          <div class="spx-home-action" onclick="switchTo('report')"><div class="spx-home-action-ico">📷</div><div><div class="spx-home-action-name">Report</div><div class="spx-home-action-sub">Spot an issue</div></div></div>
          <div class="spx-home-action" onclick="switchTo('map')"><div class="spx-home-action-ico">🗺️</div><div><div class="spx-home-action-name">Map</div><div class="spx-home-action-sub">View all spots</div></div></div>
          <div class="spx-home-action" onclick="switchTo('myreports')"><div class="spx-home-action-ico">📋</div><div><div class="spx-home-action-name">My Reports</div><div class="spx-home-action-sub">Track progress</div></div></div>
          <div class="spx-home-action" onclick="switchTo('ranks')"><div class="spx-home-action-ico">🏆</div><div><div class="spx-home-action-name">Ranks</div><div class="spx-home-action-sub">Leaderboard</div></div></div>
        </div>
        <div class="spx-home-rec-title">Recent Reports <span class="spx-home-rec-all" onclick="switchTo('myreports')">View All</span></div>
        ${getAllReports().slice(0, 3).map(r => `
          <div class="spx-home-rec-item">
            <div class="spx-home-rec-thumb" style="background:${r.color || '#1a2a1a'}"></div>
            <div class="spx-home-rec-info"><div class="spx-home-rec-name">${r.title}</div><div class="spx-home-rec-loc">📍 ${r.loc}</div></div>
            <span class="spx-home-rec-badge ${statusClass(r.status)}">${r.status}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}
function bindHome() {
  spxScreen.querySelectorAll('[onclick]').forEach(el => { const fn = el.getAttribute('onclick'); el.removeAttribute('onclick'); el.addEventListener('click', () => eval(fn)); });
}

/* ── MAP ── */
function renderMap() {
  return `<div id="spxMapContainer" style="width:100%;height:100%;min-height:520px"></div>`;
}
function initLeafletMap() {
  if (leafletMap) return;
  const el = document.getElementById('spxMapContainer'); if (!el) return;
  leafletMap = L.map('spxMapContainer', { zoomControl: true, attributionControl: false }).setView([12.9716, 77.5946], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(leafletMap);
  const issues = [
    { lat: 12.9716, lng: 77.5946, title: 'Garbage on MG Road', loc: 'MG Road, Bengaluru', status: 'In Progress', cat: 'Garbage' },
    { lat: 12.9279, lng: 77.6271, title: 'Pothole on HSR Layout', loc: 'HSR Layout, Bengaluru', status: 'Pending', cat: 'Road Damage' },
    { lat: 12.9850, lng: 77.5533, title: 'Broken Streetlight', loc: 'Indiranagar, Bengaluru', status: 'Resolved', cat: 'Street Light' },
    { lat: 12.9539, lng: 77.4960, title: 'Water Leakage', loc: 'Rajajinagar, Bengaluru', status: 'In Progress', cat: 'Water Issue' },
    { lat: 12.9200, lng: 77.6239, title: 'Overflowing Dustbin', loc: 'Koramangala, Bengaluru', status: 'Resolved', cat: 'Garbage' },
    { lat: 13.0100, lng: 77.5800, title: 'Sewage Overflow', loc: 'Hebbal, Bengaluru', status: 'Pending', cat: 'Sewage' },
    { lat: 12.9400, lng: 77.6100, title: 'Public Property Damage', loc: 'BTM Layout, Bengaluru', status: 'In Progress', cat: 'Public Property' },
  ];
  const colors = { 'Resolved': '#22c55e', 'In Progress': '#fbbf24', 'Pending': '#818cf8' };
  issues.forEach(iss => {
    const col = colors[iss.status] || '#22c55e';
    const icon = L.divIcon({ className: '', html: `<div style="width:16px;height:16px;background:${col};border-radius:50%;border:3px solid white;box-shadow:0 0 8px ${col}55;position:relative"><div style="position:absolute;inset:-5px;border-radius:50%;border:2px solid ${col};animation:mpulse 1.8s ease-out infinite;opacity:.5"></div></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
    const marker = L.marker([iss.lat, iss.lng], { icon });
    marker.addTo(leafletMap).bindPopup(`<div class="spx-popup"><div class="spx-popup-title">${iss.title}</div><div class="spx-popup-loc">📍 ${iss.loc}</div><span class="spx-popup-status" style="background:${col}22;color:${col}">${iss.status}</span><br><button class="spx-popup-btn" onclick="switchTo('report')">+ Report Similar</button></div>`, { maxWidth: 220, className: '' });
  });
}

/* ── REPORT ── */
let selectedCat = null;
let reportStep = 1;
function renderReport() {
  return `<div class="spx-scr">
    <div class="spx-scr-head">
      <span class="spx-scr-title">📷 Report a Spot</span>
      <span style="font-size:.7rem;color:var(--t2)">Step <span id="spxStepNum">1</span>/2</span>
    </div>
    <div class="spx-scr-body" id="spxReportBody">
      ${reportStep === 1 ? renderReportStep1() : renderReportStep2()}
    </div>
  </div>`;
}
function renderReportStep1() {
  const cats = [
    { icon: '🗑️', label: 'Garbage', cls: 'c-g' }, { icon: '💧', label: 'Sewage', cls: 'c-o' },
    { icon: '🔧', label: 'Road Damage', cls: 'c-r' }, { icon: '💡', label: 'Street Light', cls: 'c-p' },
    { icon: '🌊', label: 'Water Issue', cls: 'c-y' }, { icon: '🏛️', label: 'Public Property', cls: 'c-b' }
  ];
  return `<div>
    <p style="font-size:.8rem;color:var(--t2);margin-bottom:12px">Pick a category for the issue</p>
    <div class="spx-cats-grid">${cats.map(c => `
      <button class="spx-cat-btn ${c.cls}${selectedCat === c.label ? ' spx-cat-sel' : ''}" data-cat="${c.label}">
        <span class="spx-cat-ico">${c.icon}</span>
        <span class="spx-cat-lbl">${c.label}</span>
      </button>`).join('')}
    </div>
    <button class="spx-btn-primary" id="spxContinueBtn" ${!selectedCat ? 'disabled' : ''}>Continue →</button>
  </div>`;
}
function renderReportStep2() {
  return `<div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <button class="spx-back-btn" id="spxBackBtn">← Back</button>
      <span style="font-size:.75rem;font-weight:600;color:var(--g)">${selectedCat}</span>
    </div>
    <label class="spx-step2-label">📷 Add Photo</label>
    <div class="spx-upload-area" id="spxUploadArea">
      <input type="file" accept="image/*" id="spxFileInput" aria-label="Upload photo">
      <div class="spx-upload-ico">📷</div>
      <div class="spx-upload-txt">Tap to upload a photo</div>
      <img class="spx-upload-preview" id="spxUploadPreview" alt="Preview">
    </div>
    <label class="spx-step2-label">📍 Location</label>
    <input class="spx-input" id="spxLocInput" placeholder="e.g. Koramangala, Bengaluru" value="">
    <label class="spx-step2-label">📝 Description</label>
    <textarea class="spx-input spx-textarea" id="spxDescInput" placeholder="Describe the issue..."></textarea>
    <button class="spx-btn-primary" id="spxSubmitBtn">🚀 Submit Report</button>
  </div>`;
}
function bindReport() {
  reportStep = 1; selectedCat = null;
  const body = document.getElementById('spxReportBody');
  function rebind() {
    body.querySelectorAll('.spx-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCat = btn.dataset.cat;
        body.querySelectorAll('.spx-cat-btn').forEach(b => b.classList.remove('spx-cat-sel'));
        btn.classList.add('spx-cat-sel');
        const continueBtn = body.querySelector('#spxContinueBtn');
        if (continueBtn) continueBtn.disabled = false;
      });
    });
    body.querySelector('#spxContinueBtn')?.addEventListener('click', () => {
      if (!selectedCat) return;
      reportStep = 2; body.innerHTML = renderReportStep2(); bindStep2();
      document.getElementById('spxStepNum').textContent = '2';
    });
  }
  rebind();
  function bindStep2() {
    document.getElementById('spxBackBtn')?.addEventListener('click', () => { reportStep = 1; body.innerHTML = renderReportStep1(); rebind(); document.getElementById('spxStepNum').textContent = '1'; });
    document.getElementById('spxFileInput')?.addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => { const img = document.getElementById('spxUploadPreview'); if (img) { img.src = ev.target.result; img.style.display = 'block'; } };
      reader.readAsDataURL(file);
    });
    document.getElementById('spxSubmitBtn')?.addEventListener('click', () => {
      const loc = document.getElementById('spxLocInput')?.value || 'Bengaluru';
      const desc = document.getElementById('spxDescInput')?.value || '';
      if (!loc.trim()) { alert('Please enter a location.'); return; }
      const report = { id: Date.now(), title: `${selectedCat} Issue`, loc: loc.trim() || 'Bengaluru', desc, status: 'Pending', date: new Date().toLocaleDateString('en-IN'), cat: selectedCat, color: catColor(selectedCat) };
      const saved = JSON.parse(localStorage.getItem('spx_reports') || '[]');
      saved.unshift(report); localStorage.setItem('spx_reports', JSON.stringify(saved));
      body.innerHTML = `<div class="spx-success">
        <div class="spx-success-check">✅</div>
        <div class="spx-success-title">Report Submitted!</div>
        <div class="spx-success-sub">Your ${selectedCat} issue has been reported.<br>Authorities will review it soon.</div>
        <div class="spx-success-pts">+10 Points Earned 🎉</div>
        <button class="spx-btn-primary" style="margin-top:8px" onclick="switchTo('myreports')">View My Reports</button>
      </div>`;
      body.querySelector('button')?.addEventListener('click', () => switchTo('myreports'));
      reportStep = 1; selectedCat = null;
    });
  }
}

/* ── MY REPORTS ── */
const sampleReports = [
  { id: 1, title: 'Garbage on roadside', loc: 'Koramangala, Bengaluru', status: 'Resolved', date: '12 Jun 2025', cat: 'Garbage', color: '#854d0e' },
  { id: 2, title: 'Overflowing dustbin', loc: 'HSR Layout, Bengaluru', status: 'In Progress', date: '10 Jun 2025', cat: 'Garbage', color: '#713f12' },
  { id: 3, title: 'Broken streetlight', loc: 'Indiranagar, Bengaluru', status: 'Resolved', date: '08 Jun 2025', cat: 'Street Light', color: '#1e3a5f' },
  { id: 4, title: 'Water leakage', loc: 'Jayanagar, Bengaluru', status: 'Pending', date: '05 Jun 2025', cat: 'Water Issue', color: '#1e40af' },
];
function getAllReports() {
  const saved = JSON.parse(localStorage.getItem('spx_reports') || '[]');
  return [...saved, ...sampleReports];
}
function statusClass(s) { return s === 'Resolved' ? 'badge-ok' : s === 'In Progress' ? 'badge-ip' : 'badge-pend'; }
function catColor(c) { const m = { 'Garbage': '#854d0e', 'Sewage': '#065f46', 'Road Damage': '#7c2d12', 'Street Light': '#1e3a5f', 'Water Issue': '#1e40af', 'Public Property': '#4c1d95' }; return m[c] || '#1a2a1a'; }
function renderMyReports() {
  const all = getAllReports();
  return `<div class="spx-scr" style="position:relative">
    <div class="spx-scr-head"><span class="spx-scr-title">📋 My Reports</span><span style="font-size:.75rem;color:var(--g)">${all.length} total</span></div>
    <div class="spx-scr-body" id="spxRepList">${all.map(r => `
      <div class="spx-report-card" data-id="${r.id}">
        <div class="spx-rc-top">
          <div class="spx-rc-title">${r.title}</div>
          <span class="spx-rc-badge ${statusClass(r.status)}">${r.status}</span>
        </div>
        <div class="spx-rc-loc">📍 ${r.loc}</div>
        <div class="spx-rc-time">${r.date}</div>
      </div>`).join('')}
    </div>
    <div class="spx-detail-overlay" id="spxDetailOverlay"></div>
  </div>`;
}
function bindMyReports() {
  const all = getAllReports();
  document.querySelectorAll('.spx-report-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      const r = all.find(x => x.id === id) || all[0];
      const ov = document.getElementById('spxDetailOverlay');
      ov.innerHTML = `<div class="spx-detail-head">
        <button class="spx-detail-back" id="spxDetailClose">←</button>
        <span class="spx-detail-head-title">${r.title}</span>
      </div>
      <div class="spx-detail-body">
        <div class="spx-detail-img" style="background:${r.color || '#1a2a1a'}">${r.cat === 'Garbage' ? '🗑️' : r.cat === 'Street Light' ? '💡' : r.cat === 'Water Issue' ? '💧' : '🔧'}</div>
        <div class="spx-detail-row"><span class="spx-detail-key">Category</span><span class="spx-detail-val">${r.cat}</span></div>
        <div class="spx-detail-row"><span class="spx-detail-key">Location</span><span class="spx-detail-val">${r.loc}</span></div>
        <div class="spx-detail-row"><span class="spx-detail-key">Status</span><span class="spx-detail-val" style="color:${r.status === 'Resolved' ? '#22c55e' : r.status === 'In Progress' ? '#fbbf24' : '#818cf8'}">${r.status}</span></div>
        <div class="spx-detail-row"><span class="spx-detail-key">Date Filed</span><span class="spx-detail-val">${r.date}</span></div>
        ${r.desc ? `<div class="spx-detail-row"><span class="spx-detail-key">Description</span><span class="spx-detail-val" style="text-align:right;max-width:60%">${r.desc}</span></div>` : ''}
      </div>`;
      setTimeout(() => ov.classList.add('spx-detail-open'), 10);
      document.getElementById('spxDetailClose')?.addEventListener('click', () => ov.classList.remove('spx-detail-open'));
    });
  });
}

/* ── RANKS ── */
const citizensData = [
  { rank: 1, init: 'SM', name: 'Suraj M.', pts: 404, spots: 8, col: 'linear-gradient(135deg,#22c55e,#16a34a)', isMe: true },
  { rank: 2, init: 'RK', name: 'Rahul Kumar', pts: 380, spots: 7, col: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { rank: 3, init: 'PA', name: 'Priya Anand', pts: 345, spots: 6, col: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { rank: 4, init: 'VA', name: 'Vivek Anand', pts: 344, spots: 6, col: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
  { rank: 5, init: 'SP', name: 'Sneha Prakash', pts: 332, spots: 5, col: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  { rank: 6, init: 'MN', name: 'Manoj Naik', pts: 320, spots: 5, col: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
];
const wardsData = [
  { rank: 1, init: 'K', name: 'Koramangala', pts: 2840, spots: 54, col: 'linear-gradient(135deg,#22c55e,#16a34a)' },
  { rank: 2, init: 'H', name: 'HSR Layout', pts: 2410, spots: 46, col: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { rank: 3, init: 'I', name: 'Indiranagar', pts: 2200, spots: 42, col: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { rank: 4, init: 'J', name: 'Jayanagar', pts: 2050, spots: 39, col: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
];
function renderRanksList(data) {
  const top = data[0];
  return `<div class="spx-rank-top">
    <div style="position:relative;width:fit-content;margin:0 auto">
      <div class="spx-rank-av" style="background:${top.col}">${top.init}</div>
      <div class="spx-rank-trophy">🥇</div>
    </div>
    <div class="spx-rank-name">${top.name}</div>
    <div class="spx-rank-pts-big">${top.pts} pts · ${top.spots} spots</div>
    ${top.isMe ? '<div style="font-size:.65rem;color:var(--g);margin-top:3px">That\'s you! 🎉</div>' : ''}
  </div>
  <div class="spx-rank-list-title">Rankings</div>
  ${data.slice(1).map(r => `
    <div class="spx-rank-row${r.isMe ? ' spx-my-rank' : ''}">
      <div class="spx-rank-num">${r.rank}</div>
      <div class="spx-rank-user-av" style="background:${r.col}">${r.init}</div>
      <div class="spx-rank-user-name">${r.name}${r.isMe ? ' <span style="color:var(--g);font-size:.6rem">(You)</span>' : ''}</div>
      <div class="spx-rank-user-pts">${r.pts} pts</div>
    </div>`).join('')}`;
}
function renderRanks() {
  return `<div class="spx-scr">
    <div class="spx-scr-head"><span class="spx-scr-title">🏆 Ranks</span></div>
    <div class="spx-scr-body">
      <div class="spx-tabs">
        <button class="spx-tab spx-tab-a" data-tab="citizens">Citizens</button>
        <button class="spx-tab" data-tab="wards">Wards</button>
      </div>
      <div class="spx-tab-content spx-tc-active" id="spxTabCitizens">${renderRanksList(citizensData)}</div>
      <div class="spx-tab-content" id="spxTabWards">${renderRanksList(wardsData)}</div>
    </div>
  </div>`;
}
function bindRanks() {
  document.querySelectorAll('.spx-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.spx-tab').forEach(t => t.classList.remove('spx-tab-a'));
      tab.classList.add('spx-tab-a');
      const id = tab.dataset.tab;
      document.querySelectorAll('.spx-tab-content').forEach(c => c.classList.remove('spx-tc-active'));
      document.getElementById(id === 'citizens' ? 'spxTabCitizens' : 'spxTabWards')?.classList.add('spx-tc-active');
    });
  });
}

/* ── ACCOUNT ── */
const notifSettings = JSON.parse(localStorage.getItem('spx_notif') || '{"push":true,"email":false}');
const privSettings = JSON.parse(localStorage.getItem('spx_priv') || '{"anon":true,"loc":true}');
function saveNotif() { localStorage.setItem('spx_notif', JSON.stringify(notifSettings)); }
function savePriv() { localStorage.setItem('spx_priv', JSON.stringify(privSettings)); }
function renderAccount() {
  return `<div class="spx-scr" style="position:relative">
    <div class="spx-scr-head"><span class="spx-scr-title">👤 Account</span></div>
    <div class="spx-scr-body">
      <div class="spx-profile-hero">
        <div class="spx-profile-top">
          <div class="spx-profile-av">SM</div>
          <div class="spx-profile-info">
            <div class="spx-profile-info-name">Suraj M.</div>
            <div class="spx-profile-info-email">suraj.m@spottix.in</div>
            <div class="spx-profile-pills">
              <span class="spx-profile-pill">⭐ 404 pts</span>
              <span class="spx-profile-pill">🔥 3d streak</span>
              <span class="spx-profile-pill">🏆 Rank #1</span>
            </div>
          </div>
        </div>
        <div class="spx-profile-stats">
          <div class="spx-pstat"><div class="spx-pstat-val">8</div><div class="spx-pstat-lbl">Reported</div></div>
          <div class="spx-pstat"><div class="spx-pstat-val">2</div><div class="spx-pstat-lbl">Resolved</div></div>
          <div class="spx-pstat"><div class="spx-pstat-val">#1</div><div class="spx-pstat-lbl">Rank</div></div>
        </div>
      </div>
      <div class="spx-setting-section-title">APP</div>
      <div class="spx-setting-row" id="spxLangRow">
        <div class="spx-setting-ico">🌐</div>
        <div class="spx-setting-info"><div class="spx-setting-title">Language</div><div class="spx-setting-sub">App display language</div></div>
        <div class="spx-setting-arr">›</div>
      </div>
      <div class="spx-setting-section-title">ACCOUNT</div>
      <div class="spx-setting-row" id="spxNotifRow">
        <div class="spx-setting-ico">🔔</div>
        <div class="spx-setting-info"><div class="spx-setting-title">Notifications</div><div class="spx-setting-sub">Push and email alerts</div></div>
        <div class="spx-setting-arr">›</div>
      </div>
      <div class="spx-setting-row" id="spxPrivRow">
        <div class="spx-setting-ico">🛡️</div>
        <div class="spx-setting-info"><div class="spx-setting-title">Privacy</div><div class="spx-setting-sub">Anonymous posting & data controls</div></div>
        <div class="spx-setting-arr">›</div>
      </div>
      <div class="spx-setting-section-title">SUPPORT</div>
      <div class="spx-setting-row" id="spxHelpRow">
        <div class="spx-setting-ico">❓</div>
        <div class="spx-setting-info"><div class="spx-setting-title">Help Centre</div><div class="spx-setting-sub">FAQs and how reporting works</div></div>
        <div class="spx-setting-arr">›</div>
      </div>
    </div>
    <!-- Settings panels injected here -->
    <div id="spxLangPanel" class="spx-settings-panel"></div>
    <div id="spxNotifPanel" class="spx-settings-panel"></div>
    <div id="spxPrivPanel" class="spx-settings-panel"></div>
    <div id="spxHelpPanel" class="spx-settings-panel"></div>
  </div>`;
}
function openPanel(panelId, content) {
  const panel = document.getElementById(panelId); if (!panel) return;
  panel.innerHTML = content; setTimeout(() => panel.classList.add('spx-panel-open'), 10);
  panel.querySelector('.spx-detail-back')?.addEventListener('click', () => panel.classList.remove('spx-panel-open'));
}
function bindAccount() {
  document.getElementById('spxLangRow')?.addEventListener('click', () => {
    const langs = [{ flag: '🇮🇳', name: 'English', sel: true }, { flag: '🇮🇳', name: 'Kannada' }, { flag: '🇮🇳', name: 'Hindi' }, { flag: '🇮🇳', name: 'Tamil' }, { flag: '🇮🇳', name: 'Telugu' }];
    openPanel('spxLangPanel', `<div class="spx-panel-head"><button class="spx-detail-back">←</button><span class="spx-panel-title">Language</span></div>
      <div class="spx-panel-body">${langs.map(l => `<div class="spx-lang-option${l.sel ? ' spx-lang-sel' : ''}" style="cursor:pointer"><span class="spx-lang-flag">${l.flag}</span><span class="spx-lang-name">${l.name}</span><span class="spx-lang-check">✓</span></div>`).join('')}</div>`);
    document.querySelectorAll('.spx-lang-option').forEach(o => { o.addEventListener('click', () => { document.querySelectorAll('.spx-lang-option').forEach(x => x.classList.remove('spx-lang-sel')); o.classList.add('spx-lang-sel'); }); });
  });
  document.getElementById('spxNotifRow')?.addEventListener('click', () => {
    openPanel('spxNotifPanel', `<div class="spx-panel-head"><button class="spx-detail-back">←</button><span class="spx-panel-title">Notifications</span></div>
      <div class="spx-panel-body">
        <div class="spx-setting-row"><div class="spx-setting-ico">📲</div><div class="spx-setting-info"><div class="spx-setting-title">Push Notifications</div><div class="spx-setting-sub">Report status updates</div></div><label class="spx-toggle"><input type="checkbox" id="spxPushTgl" ${notifSettings.push ? 'checked' : ''}><div class="spx-toggle-slider"></div></label></div>
        <div class="spx-setting-row"><div class="spx-setting-ico">✉️</div><div class="spx-setting-info"><div class="spx-setting-title">Email Alerts</div><div class="spx-setting-sub">Weekly digest of your reports</div></div><label class="spx-toggle"><input type="checkbox" id="spxEmailTgl" ${notifSettings.email ? 'checked' : ''}><div class="spx-toggle-slider"></div></label></div>
      </div>`);
    document.getElementById('spxPushTgl')?.addEventListener('change', e => { notifSettings.push = e.target.checked; saveNotif(); });
    document.getElementById('spxEmailTgl')?.addEventListener('change', e => { notifSettings.email = e.target.checked; saveNotif(); });
  });
  document.getElementById('spxPrivRow')?.addEventListener('click', () => {
    openPanel('spxPrivPanel', `<div class="spx-panel-head"><button class="spx-detail-back">←</button><span class="spx-panel-title">Privacy</span></div>
      <div class="spx-panel-body">
        <div class="spx-setting-row"><div class="spx-setting-ico">🕵️</div><div class="spx-setting-info"><div class="spx-setting-title">Anonymous Posting</div><div class="spx-setting-sub">Hide name on public reports</div></div><label class="spx-toggle"><input type="checkbox" id="spxAnonTgl" ${privSettings.anon ? 'checked' : ''}><div class="spx-toggle-slider"></div></label></div>
        <div class="spx-setting-row"><div class="spx-setting-ico">📍</div><div class="spx-setting-info"><div class="spx-setting-title">Location Access</div><div class="spx-setting-sub">Auto-detect report location</div></div><label class="spx-toggle"><input type="checkbox" id="spxLocTgl" ${privSettings.loc ? 'checked' : ''}><div class="spx-toggle-slider"></div></label></div>
      </div>`);
    document.getElementById('spxAnonTgl')?.addEventListener('change', e => { privSettings.anon = e.target.checked; savePriv(); });
    document.getElementById('spxLocTgl')?.addEventListener('change', e => { privSettings.loc = e.target.checked; savePriv(); });
  });
  document.getElementById('spxHelpRow')?.addEventListener('click', () => {
    openPanel('spxHelpPanel', `<div class="spx-panel-head"><button class="spx-detail-back">←</button><span class="spx-panel-title">Help Centre</span></div>
      <div class="spx-panel-body">
        ${[['How do I report?', 'Tap the + button, select a category, upload a photo, confirm location and submit.'], ['How is my report tracked?', 'Visit My Reports to see real-time status updates.'], ['When will my issue be resolved?', 'Most issues are resolved within 3–7 business days.'], ['How do I earn points?', 'Every verified report earns 10 points. Referrals earn 25 points.']].map(([q, a]) => `<div class="spx-setting-row" style="cursor:default;flex-direction:column;align-items:flex-start;gap:6px"><div style="font-size:.8rem;font-weight:700;color:var(--t1)">${q}</div><div style="font-size:.75rem;color:var(--t2);line-height:1.5">${a}</div></div>`).join('')}
      </div>`);
  });
}

/* ── Global helper to switch screen from inline onclick ── */
window.switchTo = function (screen) {
  currentScreen = screen; renderScreen(screen); setActiveBnav(screen);
  if (screen === 'map') setTimeout(initLeafletMap, 120);
  else if (leafletMap) { leafletMap.remove(); leafletMap = null; }
};

/* ── Update clock every minute ── */
function updateClock() { const t = document.getElementById('spxTime'); if (t) { const n = new Date(); t.textContent = `${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`; } }
setInterval(updateClock, 60000); updateClock();

/* ============================================================
   POWERFUL FEATURES – Interactive Cards
============================================================ */

(function initFeatureCards() {

  /* ── Stagger the reveal entrance ── */
  const cards = document.querySelectorAll('.feat-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${0.05 + i * 0.07}s`;
  });

  /* ── Remove delay once visible so hover is instant ── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => { e.target.style.transitionDelay = '0s'; }, 400);
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => revObs.observe(c));

  /* ── Wire each card to the correct modal screen ── */
  cards.forEach(card => {
    const feature = card.dataset.feature;

    function activate() {
      /* press animation */
      card.style.transform = 'translateY(-4px) scale(0.97)';
      setTimeout(() => { card.style.transform = ''; }, 150);

      if (feature === 'community') {
        openCommModal();
      } else {
        openModal(feature);
      }
    }

    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  /* ── Mobile swipe carousel ── */
  const row = document.getElementById('featsRow');
  const dotEls = document.querySelectorAll('#featsDots .feats-dot');
  const prevBtn = document.getElementById('featsPrev');
  const nextBtn = document.getElementById('featsNext');
  let featSlide = 0;
  let featDragX = 0;
  let featDragging = false;

  function isMobile() { return window.innerWidth < 769; }

  function featCardW() {
    const c = row?.querySelector('.feat-card');
    if (!c) return window.innerWidth - 48;
    const gap = parseFloat(window.getComputedStyle(row).gap) || 16;
    return c.getBoundingClientRect().width + gap;
  }
  function featCount() { return row?.querySelectorAll('.feat-card').length || 5; }

  function featGo(n) {
    if (!row || !isMobile()) return;
    const max = featCount() - 1;
    featSlide = Math.min(Math.max(((n % featCount()) + featCount()) % featCount(), 0), max);
    row.style.transform = `translateX(-${featSlide * featCardW()}px)`;
    row.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
    dotEls.forEach((d, i) => d.classList.toggle('active', i === featSlide));
  }

  prevBtn?.addEventListener('click', () => featGo(featSlide - 1));
  nextBtn?.addEventListener('click', () => featGo(featSlide + 1));
  dotEls.forEach((d, i) => d.addEventListener('click', () => featGo(i)));

  /* Touch swipe */
  row?.addEventListener('touchstart', e => { featDragX = e.touches[0].clientX; }, { passive: true });
  row?.addEventListener('touchend', e => {
    if (!isMobile()) return;
    const diff = featDragX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) featGo(featSlide + (diff > 0 ? 1 : -1));
  });

  /* Mouse drag */
  row?.addEventListener('mousedown', e => { featDragging = true; featDragX = e.clientX; });
  window.addEventListener('mouseup', e => {
    if (!featDragging) return;
    featDragging = false;
    if (!isMobile()) return;
    const diff = featDragX - e.clientX;
    if (Math.abs(diff) > 40) featGo(featSlide + (diff > 0 ? 1 : -1));
  });

  /* Reset on resize */
  window.addEventListener('resize', () => {
    if (!isMobile() && row) {
      row.style.transform = '';
      row.style.transition = '';
      featSlide = 0;
      dotEls.forEach((d, i) => d.classList.toggle('active', i === 0));
    } else if (isMobile() && row) {
      requestAnimationFrame(() => featGo(featSlide));
    }
  });

})();
/* ============================================================
   COMMUNITY MODAL
============================================================ */

const commOverlay = document.getElementById('commModalOverlay');
const commBody = document.getElementById('commModalBody');
const commClose = document.getElementById('commModalClose');

/* Cleanup events data */
const COMM_EVENTS = [
  { id: 'ev1', name: 'Koramangala Clean Drive', loc: '4th Block, Koramangala', date: 'Sat, 19 Jul 2025', time: '7:00 AM', count: 38, icon: '🌿' },
  { id: 'ev2', name: 'HSR Lake Cleanup', loc: 'HSR Layout, Bengaluru', date: 'Sun, 20 Jul 2025', time: '6:30 AM', count: 24, icon: '💧' },
  { id: 'ev3', name: 'Indiranagar Ward Drive', loc: 'Indiranagar 100ft Road', date: 'Sat, 26 Jul 2025', time: '8:00 AM', count: 51, icon: '🏙️' },
];

const VOLUNTEERS = [
  { init: 'RK', col: 'linear-gradient(135deg,#22c55e,#16a34a)', name: 'Rahul K.' },
  { init: 'AS', col: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', name: 'Ananya S.' },
  { init: 'PM', col: 'linear-gradient(135deg,#f59e0b,#d97706)', name: 'Priya M.' },
  { init: 'VK', col: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', name: 'Vivek K.' },
  { init: 'NR', col: 'linear-gradient(135deg,#ef4444,#dc2626)', name: 'Neha R.' },
  { init: 'ST', col: 'linear-gradient(135deg,#06b6d4,#0891b2)', name: 'Suresh T.' },
  { init: 'SM', col: 'linear-gradient(135deg,#22c55e,#059669)', name: 'Suraj M.' },
];

function getJoinedEvents() { return JSON.parse(localStorage.getItem('spx_joined_events') || '{}'); }
function saveJoinedEvents(obj) { localStorage.setItem('spx_joined_events', JSON.stringify(obj)); }

function renderCommModal() {
  const joined = getJoinedEvents();
  let totalMembers = 2048;
  Object.values(joined).forEach(j => { if (j) totalMembers++; });

  commBody.innerHTML = `
    <div class="comm-stats">
      <div class="comm-stat"><div class="comm-stat-val" id="commTotalCount">${totalMembers.toLocaleString('en-IN')}</div><div class="comm-stat-lbl">Active Members</div></div>
      <div class="comm-stat"><div class="comm-stat-val">47</div><div class="comm-stat-lbl">Drives This Month</div></div>
      <div class="comm-stat"><div class="comm-stat-val">12.4K</div><div class="comm-stat-lbl">Spots Cleaned</div></div>
    </div>

    <div class="comm-vols-title">Active Volunteers</div>
    <div class="comm-vols-row">
      ${VOLUNTEERS.map(v => `<div class="comm-vol-av" style="background:${v.col}" title="${v.name}">${v.init}</div>`).join('')}
      <div class="comm-vol-av" style="background:#2a2a2a;color:#94a3b8;font-size:.55rem">+1.9k</div>
    </div>

    <div class="comm-events-title">Nearby Cleanup Events</div>
    ${COMM_EVENTS.map(ev => {
    const isJoined = !!joined[ev.id];
    const displayCount = isJoined ? ev.count + 1 : ev.count;
    return `
      <div class="comm-event-card">
        <div class="comm-event-top">
          <div>
            <div class="comm-event-info-name">${ev.icon} ${ev.name}</div>
            <div class="comm-event-info-loc">📍 ${ev.loc}</div>
          </div>
        </div>
        <div class="comm-event-meta">
          <span class="comm-event-tag">📅 ${ev.date}</span>
          <span class="comm-event-tag">⏰ ${ev.time}</span>
        </div>
        <div class="comm-event-footer">
          <span class="comm-event-count" id="evCount-${ev.id}">👥 <span id="evNum-${ev.id}">${displayCount}</span> joining</span>
          <button
            class="comm-join-btn${isJoined ? ' joined' : ''}"
            id="joinBtn-${ev.id}"
            data-event="${ev.id}"
            data-base="${ev.count}"
            ${isJoined ? 'disabled' : ''}
          >${isJoined ? '✓ Joined' : 'Join Event'}</button>
        </div>
      </div>`;
  }).join('')}
  `;

  /* Bind join buttons */
  document.querySelectorAll('.comm-join-btn:not(.joined)').forEach(btn => {
    btn.addEventListener('click', () => {
      const evId = btn.dataset.event;
      const base = parseInt(btn.dataset.base, 10);
      const joined = getJoinedEvents();
      joined[evId] = true;
      saveJoinedEvents(joined);

      /* Update UI */
      btn.textContent = '✓ Joined';
      btn.classList.add('joined');
      btn.disabled = true;

      const numEl = document.getElementById(`evNum-${evId}`);
      if (numEl) numEl.textContent = base + 1;

      /* Bump total count */
      const tot = document.getElementById('commTotalCount');
      if (tot) tot.textContent = (parseInt(tot.textContent.replace(/,/g, ''), 10) + 1).toLocaleString('en-IN');
    });
  });
}

function openCommModal() {
  renderCommModal();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => commOverlay.classList.add('comm-open'));
  });
  document.body.style.overflow = 'hidden';
}

function closeCommModal() {
  commOverlay.classList.remove('comm-open');
  setTimeout(() => { document.body.style.overflow = ''; }, 320);
}

commClose?.addEventListener('click', closeCommModal);
commOverlay?.addEventListener('click', e => { if (e.target === commOverlay) closeCommModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && commOverlay?.classList.contains('comm-open')) closeCommModal();
});



/* ============================================================
   HOW IT WORKS – Interactive Steps
============================================================ */
(function initHowItWorks() {

  /* ── Step switching ── */
  const steps = document.querySelectorAll('.hiw-step');
  const panels = { report: 'hiwPanelReport', track: 'hiwPanelTrack', clean: 'hiwPanelClean' };

  function switchStep(name) {
    steps.forEach(s => s.classList.toggle('hiw-active', s.dataset.step === name));
    Object.entries(panels).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hiw-panel-active', key === name);
    });
    // Animate connector lines
    document.getElementById('hiwLine1')?.parentElement.classList.toggle('hiw-conn-done', name === 'track' || name === 'clean');
    document.getElementById('hiwLine2')?.parentElement.classList.toggle('hiw-conn-done', name === 'clean');
  }

  steps.forEach(s => s.addEventListener('click', () => switchStep(s.dataset.step)));

  /* ── Report Form ── */
  const form = document.getElementById('hiwReportForm');
  const photoInput = document.getElementById('hiwPhotoInput');
  const photoPreview = document.getElementById('hiwPhotoPreview');
  const uploadPH = document.getElementById('hiwUploadPlaceholder');
  const locationInput = document.getElementById('hiwLocation');
  const detectBtn = document.getElementById('hiwDetectBtn');
  const catInput = document.getElementById('hiwCategory');
  const descInput = document.getElementById('hiwDesc');
  const successDiv = document.getElementById('hiwReportSuccess');
  const reportIdDisp = document.getElementById('hiwReportIdDisplay');
  const trackNowBtn = document.getElementById('hiwTrackNowBtn');

  let photoDataURL = null;

  // Photo preview
  photoInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      photoDataURL = ev.target.result;
      photoPreview.src = photoDataURL;
      photoPreview.style.display = 'block';
      if (uploadPH) uploadPH.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  // Auto-detect location
  detectBtn?.addEventListener('click', () => {
    detectBtn.textContent = '⏳';
    detectBtn.disabled = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          locationInput.value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          detectBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg> Auto';
          detectBtn.disabled = false;
        },
        () => {
          locationInput.value = 'Bengaluru, Karnataka';
          detectBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg> Auto';
          detectBtn.disabled = false;
        }
      );
    } else {
      locationInput.value = 'Bengaluru, Karnataka';
      detectBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg> Auto';
      detectBtn.disabled = false;
    }
  });

  // Category selection
  document.querySelectorAll('.hiw-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.hiw-cat-btn').forEach(b => b.classList.remove('hiw-cat-active'));
      btn.classList.add('hiw-cat-active');
      if (catInput) catInput.value = btn.dataset.cat;
    });
  });

  // Form validation helpers
  function showErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
  function clearErr(id) { const el = document.getElementById(id); if (el) el.textContent = ''; }
  function setInputErr(el, has) { el?.classList.toggle('hiw-input-err', has); }

  // Generate unique report ID
  function genReportId() {
    const now = new Date();
    const rand = Math.floor(Math.random() * 900000 + 100000);
    return `SPX-${now.getFullYear()}-${rand}`;
  }

  // Form submission
  form?.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    clearErr('errPhoto'); clearErr('errLoc'); clearErr('errCat'); clearErr('errDesc');
    setInputErr(locationInput, false); setInputErr(descInput, false);

    if (!photoDataURL) { showErr('errPhoto', 'Please upload a photo of the issue.'); valid = false; }
    const loc = locationInput?.value.trim();
    if (!loc) { showErr('errLoc', 'Location is required.'); setInputErr(locationInput, true); valid = false; }
    const cat = catInput?.value;
    if (!cat) { showErr('errCat', 'Please select a category.'); valid = false; }
    const desc = descInput?.value.trim();
    if (!desc) { showErr('errDesc', 'Description is required.'); setInputErr(descInput, true); valid = false; }
    if (!valid) return;

    const id = genReportId();
    const report = {
      id, loc, cat, desc,
      photo: photoDataURL,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Submitted',
      statusIdx: 0,
    };

    // Save to localStorage
    const reports = JSON.parse(localStorage.getItem('hiw_reports') || '[]');
    reports.unshift(report);
    localStorage.setItem('hiw_reports', JSON.stringify(reports));
    // Also save to existing spx_reports for My Reports screen
    const spxReports = JSON.parse(localStorage.getItem('spx_reports') || '[]');
    spxReports.unshift({ id: Date.now(), title: `${cat} Issue`, loc, desc, status: 'Pending', date: report.date, cat, color: '#854d0e' });
    localStorage.setItem('spx_reports', JSON.stringify(spxReports));

    if (form) form.style.display = 'none';
    if (reportIdDisp) reportIdDisp.textContent = id;
    if (successDiv) successDiv.style.display = 'block';
  });

  // Track now button — pre-fill and switch to track tab
  trackNowBtn?.addEventListener('click', () => {
    const id = reportIdDisp?.textContent;
    const trackInput = document.getElementById('hiwTrackInput');
    if (trackInput && id) trackInput.value = id;
    switchStep('track');
    setTimeout(() => {
      document.getElementById('hiwTrackBtn')?.click();
    }, 100);
  });

  /* ── Track Panel ── */
  const STATUS_STAGES = ['Submitted', 'Under Review', 'Assigned', 'Cleaning in Progress', 'Completed'];

  document.getElementById('hiwTrackBtn')?.addEventListener('click', () => {
    const input = document.getElementById('hiwTrackInput');
    const errEl = document.getElementById('errTrack');
    const id = input?.value.trim();

    if (errEl) errEl.textContent = '';
    if (!id) { if (errEl) errEl.textContent = 'Please enter a Report ID.'; return; }

    const reports = JSON.parse(localStorage.getItem('hiw_reports') || '[]');
    const report = reports.find(r => r.id === id);

    if (!report) {
      // Demo report for testing
      if (id.startsWith('SPX-') || id.length > 5) {
        showDemoTrack(id);
      } else {
        if (errEl) errEl.textContent = 'Report not found. Check your Report ID.';
      }
      return;
    }
    renderTrackResult(report);
  });

  function showDemoTrack(id) {
    renderTrackResult({
      id,
      loc: 'Koramangala 4th Block, Bengaluru',
      cat: 'Garbage',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      statusIdx: 2,
      status: 'Assigned',
    });
  }

  function renderTrackResult(report) {
    const result = document.getElementById('hiwTrackResult');
    if (!result) return;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('trLoc', report.loc);
    set('trCat', report.cat);
    set('trDate', report.date);
    set('trId', report.id);

    // Build timeline
    const stepsWrap = document.getElementById('hiwTlSteps');
    const bar = document.getElementById('hiwTlBar');
    if (stepsWrap) {
      stepsWrap.innerHTML = STATUS_STAGES.map((s, i) => {
        const isDone = i < report.statusIdx;
        const isActive = i === report.statusIdx;
        const cls = isDone ? 'hiw-tls-done' : isActive ? 'hiw-tls-active' : '';
        return `<div class="hiw-tl-step ${cls}"><div class="hiw-tls-dot"></div>${s}</div>`;
      }).join('');
    }
    // Animate bar
    if (bar) {
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        setTimeout(() => {
          const pct = (report.statusIdx / (STATUS_STAGES.length - 1)) * 100;
          bar.style.width = pct + '%';
        }, 60);
      });
    }

    result.style.display = 'block';

    // If completed, also light up clean step
    if (report.statusIdx >= STATUS_STAGES.length - 1 || report.status === 'Completed') {
      setTimeout(() => {
        switchStep('clean');
        const cleanLoc = document.getElementById('cleanLoc');
        const cleanDate = document.getElementById('cleanDate');
        if (cleanLoc) cleanLoc.textContent = report.loc || 'Bengaluru';
        if (cleanDate) cleanDate.textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }, 1200);
    }
  }

  /* ── Share button ── */
  document.getElementById('hiwShareBtn')?.addEventListener('click', () => {
    const text = 'A civic issue in Bengaluru has been successfully cleaned by BBMP thanks to Spottix! 🌿 #Spottix #CleanBengaluru';
    if (navigator.share) {
      navigator.share({ title: 'Spottix – Area Cleaned!', text, url: window.location.href }).catch(() => { });
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        const btn = document.getElementById('hiwShareBtn');
        if (btn) { const orig = btn.innerHTML; btn.innerHTML = '✅ Copied!'; setTimeout(() => btn.innerHTML = orig, 2000); }
      });
    }
  });

})();

/* ============================================================
   BENGALURU LIVE MAP  — uses id="bengaluruMap"
============================================================ */
(function () {
  'use strict';

  // Ward mock resolver to map to properties in GeoJSON
  var WARD_ADDRESSES = {
    "Malleswaram": "Malleswaram, Bengaluru, 560003",
    "Yelahanka": "Yelahanka, Bengaluru, 560064",
    "Yelahanka Satellite Town": "Yelahanka Satellite Town, Bengaluru, 560064",
    "HSR Layout": "Bandepalya, HSR - Singasandra, Bengaluru, 560068",
    "Koramangala": "4th Block, Koramangala, Bengaluru, 560034",
    "Indiranagar": "100ft Road, Indiranagar, Bengaluru, 560038",
    "Domlur": "Domlur, Bengaluru, 560071",
    "Whitefield": "ITPL Main Road, Whitefield, Bengaluru, 560066",
    "Bellandur": "Bellandur, Bengaluru, 560103",
    "Hebbal": "Hebbal, Bengaluru, 560024",
    "Byrasandra": "Byrasandra, Bengaluru, 560011",
    "Jayanagar": "Jayanagar 4th Block, Bengaluru, 560041",
    "JP Nagar": "JP Nagar 6th Phase, Bengaluru, 560078",
    "Marathahalli": "Marathahalli Bridge, Bengaluru, 560037",
    "BTM Layout": "BTM 2nd Stage, Bengaluru, 560076",
    "Rajajinagar": "Rajajinagar, Bengaluru, 560010",
    "Electronic City": "Electronic City Phase 1, Bengaluru, 560100",
    "Vijayanagar": "Vijayanagar, Bengaluru, 560040",
    "Banashankari": "Banashankari 3rd Stage, Bengaluru, 560085",
    "Basavanagudi": "Basavanagudi, Bengaluru, 560004",
    "Shivajinagar": "Shivajinagar, Bengaluru, 560051",
    "Cox Town": "Cox Town, Bengaluru, 560005",
    "Frazer Town": "Frazer Town, Bengaluru, 560005",
    "Benson Town": "Benson Town, Bengaluru, 560046",
    "Ulsoor": "Ulsoor, Bengaluru, 560008",
    "Kammanahalli": "Kammanahalli, Bengaluru, 560084",
    "RT Nagar": "RT Nagar, Bengaluru, 560032",
    "Sadashivanagar": "Sadashivanagar, Bengaluru, 560080",
    "Yeshwanthpur": "Yeshwanthpur, Bengaluru, 560022",
    "Dasarahalli": "Dasarahalli, Bengaluru, 560057",
    "Kempegowda Ward": "Kempegowda Ward, Bengaluru, 560009",
    "Peenya": "Peenya Industrial Area, Bengaluru, 560058",
    "Nandini Layout": "Nandini Layout, Bengaluru, 560096",
    "Subramanya Nagar": "Subramanya Nagar, Bengaluru, 560021",
    "Kadu Malleshwara": "Kadu Malleshwara, Bengaluru, 560003",
    "Rajamahal Guttahalli": "Rajamahal Guttahalli, Bengaluru, 560003",
    "Aramane Nagara": "Aramane Nagara, Bengaluru, 560002",
    "Dattatreya Temple": "Dattatreya Temple Ward, Bengaluru, 560002",
    "Srirampura": "Srirampura, Bengaluru, 560021",
    "Kothigepalya": "Kothigepalya, Bengaluru, 560058",
    "Vidhata Soudha": "Vidhata Soudha Ward, Bengaluru, 560009"
  };

  function getWardData(wardName) {
    var WARD_DATA_MOCK = {
      "Malleswaram":         { wardNo: 10,  resolutionRate: 91, activeIssues: 11, resolvedIssues: 315 },
      "Yelahanka":           { wardNo: 5,   resolutionRate: 85, activeIssues: 16, resolvedIssues: 210 },
      "Yelahanka Satellite Town": { wardNo: 4, resolutionRate: 83, activeIssues: 18, resolvedIssues: 196 },
      "HSR Layout":          { wardNo: 151, resolutionRate: 92, activeIssues: 14, resolvedIssues: 342 },
      "Koramangala":         { wardNo: 150, resolutionRate: 76, activeIssues: 28, resolvedIssues: 295 },
      "Indiranagar":         { wardNo: 81,  resolutionRate: 88, activeIssues: 9,  resolvedIssues: 428 },
      "Domlur":              { wardNo: 83,  resolutionRate: 84, activeIssues: 16, resolvedIssues: 277 },
      "Whitefield":          { wardNo: 84,  resolutionRate: 52, activeIssues: 78, resolvedIssues: 194 },
      "Bellandur":           { wardNo: 152, resolutionRate: 48, activeIssues: 84, resolvedIssues: 156 },
      "Hebbal":              { wardNo: 22,  resolutionRate: 71, activeIssues: 32, resolvedIssues: 204 },
      "Byrasandra":          { wardNo: 196, resolutionRate: 79, activeIssues: 18, resolvedIssues: 189 },
      "Jayanagar":           { wardNo: 167, resolutionRate: 83, activeIssues: 21, resolvedIssues: 312 },
      "JP Nagar":            { wardNo: 177, resolutionRate: 67, activeIssues: 45, resolvedIssues: 187 },
      "Marathahalli":        { wardNo: 85,  resolutionRate: 55, activeIssues: 62, resolvedIssues: 174 },
      "BTM Layout":          { wardNo: 155, resolutionRate: 74, activeIssues: 33, resolvedIssues: 221 },
      "Rajajinagar":         { wardNo: 55,  resolutionRate: 89, activeIssues: 12, resolvedIssues: 298 },
      "Electronic City":     { wardNo: 193, resolutionRate: 44, activeIssues: 91, resolvedIssues: 134 },
      "Vijayanagar":         { wardNo: 49,  resolutionRate: 81, activeIssues: 19, resolvedIssues: 267 },
      "Banashankari":        { wardNo: 161, resolutionRate: 69, activeIssues: 38, resolvedIssues: 198 },
      "Basavanagudi":        { wardNo: 163, resolutionRate: 86, activeIssues: 15, resolvedIssues: 308 },
      "Shivajinagar":        { wardNo: 72,  resolutionRate: 78, activeIssues: 24, resolvedIssues: 245 },
      "Cox Town":            { wardNo: 77,  resolutionRate: 82, activeIssues: 17, resolvedIssues: 289 },
      "Frazer Town":         { wardNo: 78,  resolutionRate: 73, activeIssues: 29, resolvedIssues: 213 },
      "Benson Town":         { wardNo: 76,  resolutionRate: 90, activeIssues: 8,  resolvedIssues: 334 },
      "Ulsoor":              { wardNo: 80,  resolutionRate: 77, activeIssues: 26, resolvedIssues: 231 },
      "Kammanahalli":        { wardNo: 88,  resolutionRate: 62, activeIssues: 49, resolvedIssues: 178 },
      "RT Nagar":            { wardNo: 10,  resolutionRate: 75, activeIssues: 27, resolvedIssues: 222 },
      "Sadashivanagar":      { wardNo: 11,  resolutionRate: 94, activeIssues: 6,  resolvedIssues: 389 },
      "Yeshwanthpur":        { wardNo: 40,  resolutionRate: 68, activeIssues: 41, resolvedIssues: 196 },
      "Dasarahalli":         { wardNo: 35,  resolutionRate: 53, activeIssues: 66, resolvedIssues: 158 },
      "Kempegowda Ward":     { wardNo: 1,   resolutionRate: 72, activeIssues: 30, resolvedIssues: 215 },
      "Peenya":              { wardNo: 12,  resolutionRate: 61, activeIssues: 47, resolvedIssues: 172 },
      "Nandini Layout":      { wardNo: 14,  resolutionRate: 77, activeIssues: 23, resolvedIssues: 238 },
      "Subramanya Nagar":    { wardNo: 15,  resolutionRate: 80, activeIssues: 20, resolvedIssues: 260 },
      "Kadu Malleshwara":    { wardNo: 17,  resolutionRate: 88, activeIssues: 10, resolvedIssues: 310 },
      "Rajamahal Guttahalli":{ wardNo: 18,  resolutionRate: 82, activeIssues: 16, resolvedIssues: 278 },
      "Aramane Nagara":      { wardNo: 9,   resolutionRate: 74, activeIssues: 28, resolvedIssues: 225 },
      "Dattatreya Temple":   { wardNo: 20,  resolutionRate: 66, activeIssues: 42, resolvedIssues: 183 },
      "Srirampura":          { wardNo: 21,  resolutionRate: 58, activeIssues: 55, resolvedIssues: 162 },
      "Kothigepalya":        { wardNo: 23,  resolutionRate: 70, activeIssues: 35, resolvedIssues: 208 },
      "Vidhata Soudha":      { wardNo: 24,  resolutionRate: 85, activeIssues: 13, resolvedIssues: 295 }
    };
    
    var cleanName = wardName ? wardName.trim() : "";
    if (WARD_DATA_MOCK[cleanName]) return WARD_DATA_MOCK[cleanName];

    var hash = 0;
    for (var i = 0; i < cleanName.length; i++) {
      hash = (hash * 31 + cleanName.charCodeAt(i)) & 0xffff;
    }
    var rate = 45 + (hash % 50);
    return {
      wardNo: 100 + (hash % 100),
      resolutionRate: rate,
      activeIssues: 5 + (hash % 50),
      resolvedIssues: 50 + (hash % 200)
    };
  }

  function getWardAddress(wardName) {
    var cleanName = wardName ? wardName.trim() : "";
    if (WARD_ADDRESSES[cleanName]) return WARD_ADDRESSES[cleanName];
    return cleanName + ', Bengaluru';
  }

  function getColor(rate) {
    return rate >= 80 ? '#22c55e' : rate >= 60 ? '#f59e0b' : '#ef4444';
  }

  function showStats(name, w) {
    var def = document.getElementById('blrDefault');
    var stats = document.getElementById('blrStats');
    if (!def || !stats) return;
    def.style.display = 'none';
    stats.style.display = 'flex';

    var set = function(id, v) {
      var e = document.getElementById(id);
      if (e) e.textContent = v;
    };
    
    set('blrName', name + (w.wardNo ? ' (Ward ' + w.wardNo + ')' : ''));
    set('blrAddr', getWardAddress(name));
    set('blrPct', w.resolutionRate + '%');
    set('blrActive', w.activeIssues);
    set('blrResolved', w.resolvedIssues);

    var pctEl = document.getElementById('blrPct');
    if (pctEl) pctEl.style.color = getColor(w.resolutionRate);

    var bar = document.getElementById('blrBar');
    if (bar) {
      bar.style.background = getColor(w.resolutionRate);
      bar.style.width = '0%';
      setTimeout(function() {
        bar.style.width = w.resolutionRate + '%';
      }, 80);
    }

    var badge = document.getElementById('blrBadge');
    if (badge) {
      var t = w.resolutionRate >= 80 ? 'Green (Resolved)' : w.resolutionRate >= 60 ? 'Yellow (In Progress)' : 'Red (Needs Work)';
      var c = w.resolutionRate >= 80 ? 'bg' : w.resolutionRate >= 60 ? 'by' : 'br';
      badge.textContent = t;
      badge.className = 'blr-badge ' + c;
    }
  }

  function buildBengaluruMap() {
    if (typeof L === 'undefined') return;
    var el = document.getElementById('bengaluru-map');
    if (!el) return;

    if (window.spottixMap) {
      window.spottixMap.remove();
    }

    window.spottixMap = L.map('bengaluru-map', {
      center: [12.9716, 77.5946],
      zoom: 11,
      minZoom: 10,
      maxZoom: 16,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(window.spottixMap);

    setTimeout(function() {
      if (window.spottixMap) {
        window.spottixMap.invalidateSize();
      }
    }, 300);

    var geojsonLayer;
    var selectedLayer = null;

    function getFeatureName(f) {
      return f.properties.name || f.properties.wardName || f.properties.KGISWardName || "Ward";
    }

    function styleFeature(f) {
      return {
        fillColor: 'transparent',
        fillOpacity: 0,
        color: 'transparent',
        weight: 0,
        opacity: 0
      };
    }

    function onEachFeature(f, layer) {
      var name = getFeatureName(f);
      
      layer.on({
        click: function(e) {
          var lyr = e.target;
          selectedLayer = lyr;
          
          var data = getWardData(name);
          showStats(name, data);
        }
      });
      layer.bindTooltip(name, { sticky: true, className: 'blr-tt' });
    }

    fetch('./assets/bengaluru_wards.geojson')
      .then(function(res) {
        if (!res.ok) throw new Error("GeoJSON failed: " + res.status);
        return res.json();
      })
      .then(function(data) {
        geojsonLayer = L.geoJSON(data, {
          style: styleFeature,
          onEachFeature: onEachFeature
        }).addTo(window.spottixMap);

        geojsonLayer.eachLayer(function(layer) {
          var name = getFeatureName(layer.feature);
          if (name.toLowerCase().includes('hsr')) {
            selectedLayer = layer;
            var data = getWardData(name);
            showStats(name, data);
            window.spottixMap.panTo(layer.getBounds().getCenter());
          }
        });
      })
      .catch(function(err) {
        console.error(err);
        var errDiv = document.createElement('div');
        errDiv.style.cssText = 'position: absolute; top: 16px; left: 50%; transform: translateX(-50%); z-index: 1000; background: #dc2626; border: 1px solid #ef4444; color: white; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.5);';
        errDiv.textContent = '⚠️ Failed to load ward boundaries. Base map remains active.';
        el.appendChild(errDiv);
      });

    // Add report markers
    var reportIssues = [
      { lat: 12.945, lng: 77.62, title: 'Overflowing Garbage Pile', location: 'Koramangala 4th Block', status: 'Needs Work', reportedTime: '2 hours ago' },
      { lat: 12.978, lng: 77.645, title: 'Broken Streetlight', location: 'Indiranagar 100ft Road', status: 'In Progress', reportedTime: '1 day ago' },
      { lat: 12.915, lng: 77.64, title: 'Pothole on Main Road', location: 'HSR Layout Sector 3', status: 'Resolved', reportedTime: '3 days ago' },
      { lat: 12.98, lng: 77.745, title: 'Open Sewage Line', location: 'Whitefield Inner Circle', status: 'Needs Work', reportedTime: '5 hours ago' },
      { lat: 13.005, lng: 77.575, title: 'Water Leakage', location: 'Malleshwaram 15th Cross', status: 'In Progress', reportedTime: 'Yesterday' },
      { lat: 12.935, lng: 77.585, title: 'Garbage Dump near Park', location: 'Jayanagar 4th Block', status: 'Resolved', reportedTime: '2 days ago' },
      { lat: 13.005, lng: 77.70, title: 'Sewage Overflow', location: 'K R Puram', status: 'Needs Work', reportedTime: '4 hours ago' },
      { lat: 13.005, lng: 77.545, title: 'Damaged Footpath', location: 'Rajajinagar 3rd Stage', status: 'In Progress', reportedTime: '3 days ago' }
    ];

    var statusColors = {
      'Needs Work': '#ef4444',
      'In Progress': '#f59e0b',
      'Resolved': '#22c55e'
    };

    reportIssues.forEach(function(iss) {
      var color = statusColors[iss.status] || '#ef4444';
      var marker = L.circleMarker([iss.lat, iss.lng], {
        radius: 6,
        fillColor: color,
        fillOpacity: 0.9,
        color: '#ffffff',
        weight: 1.5
      });

      var popupContent = '<div class="spx-popup" style="padding: 2px;">' +
        '<div class="spx-popup-title" style="font-weight: 700; color: #f1f5f9; margin-bottom: 4px; font-size: 13px;">' + iss.title + '</div>' +
        '<div class="spx-popup-loc" style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">📍 ' + iss.location + '</div>' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 10px;">' +
          '<span class="spx-popup-status" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: ' + color + '22; color: ' + color + ';">' + iss.status + '</span>' +
          '<span style="font-size: 10px; color: #64748b;">' + iss.reportedTime + '</span>' +
        '</div>' +
        '<button class="spx-popup-btn" style="width: 100%; padding: 6px; border: 1px solid rgba(34,197,94,0.3); background: rgba(34,197,94,0.08); color: #22c55e; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">View Report</button>' +
      '</div>';

      marker.bindPopup(popupContent, { maxWidth: 220 });
      marker.addTo(window.spottixMap);
    });

    var back = document.getElementById('blrBack');
    if (back) {
      back.addEventListener('click', function() {
        document.getElementById('blrDefault').style.display = 'block';
        document.getElementById('blrStats').style.display = 'none';
        if (selectedLayer) {
          selectedLayer = null;
        }
        window.spottixMap.closePopup();
        window.spottixMap.setView([12.9716, 77.5946], 11);
      });
    }

    window.addEventListener('resize', function() {
      if (window.spottixMap) {
        window.spottixMap.invalidateSize();
      }
    });
  }

  function buildMiniMap() {
    if (typeof L === 'undefined') return;
    var el = document.getElementById('miniMap');
    if (!el || el._leaflet_id) return;

    var map = L.map('miniMap', {
      center: [12.9716, 77.5946],
      zoom: 10.5,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);



    [200, 500, 1000, 2000].forEach(function(ms) {
      setTimeout(function() {
        map.invalidateSize();
      }, ms);
    });
  }

  function boot() {
    buildBengaluruMap();
    buildMiniMap();
  }

  if (document.readyState !== 'loading') {
    boot();
    setTimeout(boot, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      boot();
      setTimeout(boot, 100);
    });
  }
  window.addEventListener('load', function() {
    boot();
    setTimeout(boot, 800);
  });

}());
