/* ============================================
   AutoDetailing Pro — script.js
   ============================================ */

/* ── Hero rotating slogans (smooth fade) ─── */
(function () {
  const el = document.querySelector('.rot-text');
  if (!el) return;

  const slogans = [
    'Mașina ta contează pentru noi',
    'Perfecțiunea e în detalii',
    'Nu doar curăță. Transformă.',
    'Unde pasiunea întâlnește precizia',
    'Prima impresie se vede în lac',
    'Redăm strălucirea din prima zi',
    'Tratăm fiecare mașină ca pe a noastră',
  ];

  let idx = 0;

  setInterval(() => {
    /* 1. Fade out */
    el.classList.add('leaving');

    setTimeout(() => {
      /* 2. Schimbă textul fără tranziție */
      idx = (idx + 1) % slogans.length;
      el.textContent = slogans[idx];
      el.classList.remove('leaving');
      el.classList.add('entering');

      /* 3. Un frame mai târziu — fade in */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.remove('entering');
        });
      });
    }, 560);
  }, 3800);
})();

/* ── Navbar: scroll + hamburger ──────────── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navMobile.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ── Active nav link ─────────────────────── */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Scroll fade-up animations ───────────── */
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => obs.observe(el));
}

/* ── Before/After Sliders ────────────────── */
document.querySelectorAll('[data-ba]').forEach(card => {
  const after = card.querySelector('.ba-after');
  const divider = card.querySelector('.ba-divider');
  const handle = card.querySelector('.ba-handle');
  let dragging = false;

  function setPosition(pct) {
    pct = Math.max(2, Math.min(98, pct));
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    divider.style.left = pct + '%';
    if (handle) handle.style.left = pct + '%';
  }

  function getPercent(e) {
    const rect = card.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return ((clientX - rect.left) / rect.width) * 100;
  }

  card.addEventListener('mousedown', e => { dragging = true; setPosition(getPercent(e)); e.preventDefault(); });
  card.addEventListener('touchstart', e => { dragging = true; setPosition(getPercent(e)); }, { passive: true });
  window.addEventListener('mousemove', e => { if (dragging) setPosition(getPercent(e)); });
  window.addEventListener('touchmove', e => { if (dragging) setPosition(getPercent(e)); }, { passive: true });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('touchend', () => dragging = false);
});

/* ── Testimonials Slider ─────────────────── */
(function () {
  const track = document.getElementById('testTrack');
  const dotsContainer = document.getElementById('testDots');
  if (!track) return;

  const cards = track.querySelectorAll('.test-card');
  let current = 0;

  function getVisible() {
    return window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 1 : 3;
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = Math.ceil(cards.length / getVisible());
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      if (i === current) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(idx) {
    const visible = getVisible();
    const max = Math.max(0, cards.length - visible);
    current = Math.max(0, Math.min(idx, Math.ceil(cards.length / visible) - 1));
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * cardW * visible}px)`;
    buildDots();
  }

  window.moveSlider = function (dir) { goTo(current + dir); };

  window.addEventListener('resize', () => { current = 0; goTo(0); });
  buildDots();

  /* Touch swipe */
  let startX = 0;
  track.parentElement.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.parentElement.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) moveSlider(diff > 0 ? 1 : -1);
  }, { passive: true });
})();

/* ── Countdown Timers ────────────────────── */
(function () {
  function getEndDate(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(23, 59, 59, 0);
    return d;
  }

  const countdowns = [
    { id: 'cd1', end: getEndDate(7) },
    { id: 'cd2', end: getEndDate(14) },
  ];

  function update() {
    const now = Date.now();
    countdowns.forEach(({ id, end }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const diff = end.getTime() - now;
      if (diff <= 0) {
        ['d','h','m','s'].forEach(u => {
          const span = el.querySelector(`[data-unit="${u}"]`);
          if (span) span.textContent = '00';
        });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      [['d', d], ['h', h], ['m', m], ['s', s]].forEach(([u, v]) => {
        const span = el.querySelector(`[data-unit="${u}"]`);
        if (span) span.textContent = String(v).padStart(2, '0');
      });
    });
  }

  update();
  setInterval(update, 1000);
})();

/* ── Lightbox ────────────────────────────── */
window.openLightbox = function (el) {
  const img = el.querySelector('img');
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  if (!lb || !img) return;
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function () {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

/* ── Contact Form ────────────────────────── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = 'var(--red-light)';
        field.addEventListener('input', () => field.style.borderColor = '', { once: true });
      }
    });

    if (!valid) {
      form.querySelector('[required]:invalid, [required]:placeholder-shown')?.focus();
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    const original = btn.textContent;
    btn.textContent = '⏳ Se trimite...';
    btn.disabled = true;

    /* Simuleaza trimiterea — integreaza cu backend-ul sau Formspree / EmailJS */
    setTimeout(() => {
      form.reset();
      btn.textContent = original;
      btn.disabled = false;
      const success = document.getElementById('formSuccess');
      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 6000);
      }
    }, 1200);
  });
}

/* ── Int / Ext package tab switch ───────── */
window.switchTab = function (type) {
  ['int', 'ext'].forEach(t => {
    const tab   = document.getElementById('tab-' + t);
    const panel = document.getElementById('panel-' + t);
    if (!tab || !panel) return;
    const active = t === type;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active);
    panel.classList.toggle('hidden', !active);
  });
};

/* ── Smooth scroll for anchor links ─────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

/* ── FAQ Accordion ───────────────────────── */
window.toggleFaqItem = function (btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const isOpen = item.classList.contains('open');
  /* Close all others */
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-a').classList.remove('open');
    el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    answer.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
};

/* ── Chatbot Widget ───────────────────────── */
(function () {
  const html = `
    <button class="chat-bubble-btn" id="chatBtn" aria-label="Asistent virtual" onclick="toggleChat()">
      <svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
      <span class="chat-notif" id="chatNotif"></span>
    </button>
    <div class="chat-window" id="chatWindow" role="dialog" aria-label="Asistent virtual SAX PRO">
      <div class="chat-header">
        <div class="chat-avatar">🤖</div>
        <div class="chat-header-info">
          <strong>SAX PRO Assistant</strong>
          <span>● Online acum</span>
        </div>
        <button class="chat-close" onclick="toggleChat()" aria-label="Închide">✕</button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-chips" id="chatChips"></div>
      <div class="chat-input-row">
        <input class="chat-input" id="chatInput" type="text" placeholder="Scrie o întrebare..." autocomplete="off" />
        <button class="chat-send" onclick="sendChatMessage()" aria-label="Trimite">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  document.getElementById('chatInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChatMessage();
  });

  const responses = [
    { keys: ['pret','preț','cost','cât costă','cat costa','tarif'],
      answer: 'Prețurile noastre pornesc de la <strong>150 RON</strong> (exterior basic), <strong>250 RON</strong> (interior complet), <strong>350 RON</strong> (pachet complet). Pachetul Premium este <strong>550 RON</strong>, iar ceramic coating pornește de la <strong>800 RON</strong>.' },
    { keys: ['ceramic','ceramică','ceramica','coating','acoperire'],
      answer: 'Acoperirea <strong>ceramică</strong> oferă protecție de <strong>2–5 ani</strong> față de UV, chimicale și zgărieturi fine. Procesul durează 1–2 zile. Preț: de la <strong>800 RON</strong>, include pregătire completă a lacului.' },
    { keys: ['polish','lustruire','lustru','zgârieturi','zgarieturi','defecte lac'],
      answer: '<strong>Polishul profesional</strong> elimină zgârieturile superficiale, oxidarea și defectele din lac. Redă strălucirea originală. Durată: 3–5 ore. Preț: de la <strong>400 RON</strong>.' },
    { keys: ['ppf','folie','paint protection film'],
      answer: '<strong>PPF</strong> este o folie transparentă auto-vindecătoare care protejează caroseria de pietricele, zgârieturi și insecte. Durabilitate <strong>5–10 ani</strong> cu garanție. Contactează-ne pentru o ofertă personalizată.' },
    { keys: ['interior','tapițerie','tapiterie','scaune','habitaclu','miros'],
      answer: 'Detailingul <strong>interior exclusiv</strong> include: aspirare profundă, curățare tapițerie/piele, borduri, dezinfecție, tratament anti-miros și geamuri interior. Durată: 2–4 ore. Preț: <strong>450 RON</strong>.' },
    { keys: ['exterior','caroserie','lac','vopsea','spălare','spalare'],
      answer: 'Detailingul <strong>exterior exclusiv</strong> include: spălare profesională, decontaminare, polish, protecție lac și jante. Durată: 2–4 ore. Preț: <strong>400 RON</strong>.' },
    { keys: ['programare','rezervare','rezerv','programez','book'],
      answer: 'Poți face programare <strong>online</strong> pe pagina <a href="contact.html" style="color:var(--red-light)">Contact</a>, prin <strong>telefon</strong> sau pe <strong>WhatsApp</strong>. Confirmăm în maxim 2 ore!' },
    { keys: ['locatie','locație','adresa','adresă','unde','harta','maps'],
      answer: 'Ne găsești în <strong>Cluj-Napoca</strong>. Verifică pagina <a href="contact.html" style="color:var(--red-light)">Contact</a> pentru adresa exactă și harta interactivă.' },
    { keys: ['orar','program','ore','luni','sambata','sâmbătă','weekend','duminica'],
      answer: 'Program: <strong>Luni–Vineri: 08:00–18:00</strong>, <strong>Sâmbătă: 09:00–16:00</strong>. Duminica suntem închiși. Pentru urgențe, contactează-ne pe WhatsApp.' },
    { keys: ['cât durează','cat dureaza','durată','durata','cât timp'],
      answer: 'Durata: exterior 2–4 ore, interior 2–4 ore, complet 4–8 ore, ceramic coating 1–2 zile, PPF 1–3 zile. Poți lăsa mașina dimineața și o ridici seara!' },
    { keys: ['garanție','garantie'],
      answer: 'Oferim <strong>garanție scrisă</strong>: 6 luni pentru polish, 12–60 luni pentru ceramic coating, 5–10 ani pentru PPF. Nemulțumit? Remediem gratuit în <strong>7 zile</strong>.' },
    { keys: ['mai multe masini','mai multe mașini','flotă','flota','firma','reducere','discount','grup','duo','familie'],
      answer: 'Reduceri pentru mai multe mașini: 2 mașini <strong>-10%</strong>, 3–4 mașini <strong>-15%</strong>, 5–9 mașini <strong>-20%</strong>, 10+ mașini <strong>-25%+</strong>. Ideal pentru firme și familii!' },
    { keys: ['pachet','pachete','basic','premium','elite'],
      answer: '<strong>Basic 350 RON</strong> — spălare + aspirare + ceară | <strong>Standard 450 RON</strong> — + polish ușor | <strong>Premium 550 RON</strong> — + polish complet + ceramic spray | <strong>Elite 750 RON</strong> — pachet complet profesional.' },
    { keys: ['salut','buna','bună','hello','hei','hey'],
      answer: 'Salut! 👋 Sunt asistentul virtual <strong>SAX PRO Detailing</strong>. Te pot ajuta cu prețuri, servicii, programări sau orice altă întrebare. Cu ce te pot ajuta?' },
    { keys: ['multumesc','mulțumesc','mersi','thanks'],
      answer: 'Cu plăcere! 😊 Dacă mai ai întrebări, sunt aici. O zi frumoasă!' },
  ];

  const defaultAnswer = 'Încearcă să mă întrebi despre <strong>prețuri</strong>, <strong>servicii</strong>, <strong>programări</strong>, <strong>durată</strong> sau <strong>garanții</strong>. Sau sună-ne direct pentru detalii!';
  const chips = ['💰 Prețuri', '🚗 Servicii', '📅 Programare', '⏱ Durată', '✨ Ceramic'];

  function normalize(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function getResponse(text) {
    const t = normalize(text);
    for (const r of responses) {
      for (const k of r.keys) { if (t.includes(normalize(k))) return r.answer; }
    }
    return defaultAnswer;
  }

  function addMsg(text, isUser) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (isUser ? 'user' : 'bot');
    div.innerHTML = isUser
      ? `<div class="chat-msg-bubble">${text}</div>`
      : `<div class="chat-msg-avatar">🤖</div><div class="chat-msg-bubble">${text}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot'; div.id = 'chatTyping';
    div.innerHTML = `<div class="chat-msg-avatar">🤖</div><div class="chat-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() { const t = document.getElementById('chatTyping'); if (t) t.remove(); }

  function buildChips() {
    const c = document.getElementById('chatChips'); if (!c) return;
    c.innerHTML = '';
    chips.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'chat-chip'; btn.textContent = label;
      btn.addEventListener('click', () => {
        addMsg(label, true); c.innerHTML = '';
        showTyping();
        setTimeout(() => { removeTyping(); addMsg(getResponse(label), false); }, 900);
      });
      c.appendChild(btn);
    });
  }

  window.toggleChat = function () {
    const win = document.getElementById('chatWindow');
    const notif = document.getElementById('chatNotif');
    const msgs = document.getElementById('chatMessages');
    const isOpen = win.classList.toggle('open');
    if (isOpen) {
      if (notif) notif.style.display = 'none';
      if (!msgs.children.length) {
        setTimeout(() => {
          addMsg('Salut! 👋 Sunt <strong>Alex</strong>, asistentul virtual SAX PRO. Cu ce te pot ajuta astăzi?', false);
          buildChips();
        }, 400);
      }
      setTimeout(() => document.getElementById('chatInput').focus(), 300);
    }
  };

  window.sendChatMessage = function () {
    const input = document.getElementById('chatInput');
    const text = input.value.trim(); if (!text) return;
    input.value = '';
    document.getElementById('chatChips').innerHTML = '';
    addMsg(text, true); showTyping();
    setTimeout(() => { removeTyping(); addMsg(getResponse(text), false); }, 900 + Math.random() * 400);
  };

  setTimeout(() => {
    const notif = document.getElementById('chatNotif');
    const win = document.getElementById('chatWindow');
    if (notif && !win.classList.contains('open')) notif.style.display = 'block';
  }, 4000);
})();

/* ── Animate stat numbers ────────────────── */
(function () {
  const statNums = document.querySelectorAll('.stat-number');
  if (!statNums.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const el = e.target;
      const text = el.textContent.trim();
      const num = parseFloat(text.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) return;
      const suffix = text.replace(/[0-9.]/g, '');
      let start = 0;
      const dur = 1600;
      const step = 16;
      const inc = num / (dur / step);
      const timer = setInterval(() => {
        start += inc;
        if (start >= num) { start = num; clearInterval(timer); }
        el.textContent = (Number.isInteger(num) ? Math.floor(start) : start.toFixed(1)) + suffix;
      }, step);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => obs.observe(el));
})();
