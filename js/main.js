// ── NAV HAMBURGER ──
(function() {
  const btn = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  function close() {
    links.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !links.classList.contains('open');
    links.classList.toggle('open');
    btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', opening);
  });

  links.querySelectorAll('a').forEach(a => {
    if (!a.parentElement.classList.contains('nav-dropdown')) {
      a.addEventListener('click', close);
    }
  });

  links.querySelectorAll('.nav-dropdown > a').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        e.stopPropagation();
        a.closest('.nav-dropdown').classList.toggle('expanded');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !links.contains(e.target)) close();
  });
})();

// ── NAV SCROLL ──
(function() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  if (nav.classList.contains('nav-light')) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }
})();

// ── FADE UP ──
(function() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
})();

// ── FAQ ──
(function() {
  document.querySelectorAll('.faq-pregunta').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const resp = item.querySelector('.faq-respuesta');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-respuesta').style.maxHeight = '0';
      });
      if (!isOpen) { item.classList.add('open'); resp.style.maxHeight = resp.scrollHeight + 'px'; }
    });
  });
})();

// ── EVENTOS DINÁMICOS ──
(function() {
  const homeList   = document.getElementById('eventos-home');
  const agendaList = document.getElementById('eventos-agenda');
  if (!homeList && !agendaList) return;

  function el(tag, content, cls) {
    const node = document.createElement(tag);
    if (content) node.textContent = content;
    if (cls) node.className = cls;
    return node;
  }

  function safeUrl(url) {
    try {
      const u = new URL(url, location.origin);
      return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : '/agenda';
    } catch { return '/agenda'; }
  }

  fetch('/eventos.json')
    .then(r => r.json())
    .then(eventos => {
      if (homeList) {
        homeList.innerHTML = '';
        eventos.slice(0, 4).forEach(e => {
          const linea2 = [e.hora, e.marca].filter(Boolean).join(' · ');
          const linea3 = [e.espacio, e.lugar].filter(Boolean).join(' · ');

          const wrap  = document.createElement('a');
          wrap.className = 'evento';
          wrap.href = safeUrl(e.url);

          const fecha = el('div', null, 'evento-fecha');
          fecha.appendChild(el('div', e.dia, 'evento-dia'));
          fecha.appendChild(el('div', e.mes, 'evento-mes'));

          const info = el('div', null, 'evento-info');
          info.appendChild(el('h3', e.titulo));
          if (linea2) info.appendChild(el('p', linea2));
          if (linea3) {
            const p = el('p', linea3);
            p.style.cssText = 'font-size:13px;opacity:0.7';
            info.appendChild(p);
          }

          const btn = el('span', 'Más info →', 'evento-btn');

          wrap.appendChild(fecha);
          wrap.appendChild(info);
          wrap.appendChild(btn);
          homeList.appendChild(wrap);
        });
      }

      if (agendaList) {
        agendaList.innerHTML = '';
        eventos.forEach(e => {
          const linea2 = [e.hora, e.marca].filter(Boolean).join(' · ');
          const linea3 = [e.espacio, e.lugar].filter(Boolean).join(' · ');

          const outer = el('div');
          outer.className = 'agenda-card';
          outer.style.cssText = 'display:grid;grid-template-columns:72px 1fr;gap:0;border-radius:16px;overflow:hidden;background:var(--arena-oscura)';

          const dateCol = el('div');
          dateCol.className = 'agenda-date-col';
          dateCol.style.cssText = 'background:var(--tierra-noche);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 10px';
          const diaSpan = el('span', e.dia);
          diaSpan.style.cssText = 'font-size:26px;font-weight:800;color:var(--ambar);line-height:1';
          const mesSpan = el('span', e.mes);
          mesSpan.style.cssText = 'font-size:9px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--texto-sutil);margin-top:3px';
          dateCol.appendChild(diaSpan);
          dateCol.appendChild(mesSpan);

          const body = el('div');
          body.className = 'agenda-body';
          body.style.cssText = 'padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px';
          const inner = el('div');
          const h3 = el('h3', e.titulo);
          h3.style.cssText = 'font-size:15px;color:var(--tierra-noche);margin-bottom:2px;font-weight:600';
          inner.appendChild(h3);
          if (linea2) {
            const p2 = el('p', linea2);
            p2.className = 'agenda-meta';
            p2.style.cssText = 'font-size:12px;color:var(--texto-secundario);font-weight:400;margin-bottom:1px';
            inner.appendChild(p2);
          }
          if (linea3) {
            const p3 = el('p', linea3);
            p3.className = 'agenda-meta';
            p3.style.cssText = 'font-size:11px;color:var(--texto-secundario);opacity:0.7;font-weight:400';
            inner.appendChild(p3);
          }

          const a = el('a', 'Ver →');
          a.href = safeUrl(e.url);
          a.style.cssText = 'font-size:11px;font-weight:600;color:var(--verde-oliva);border:1.5px solid var(--verde-oliva);padding:5px 12px;border-radius:100px;white-space:nowrap;text-decoration:none;flex-shrink:0';

          body.appendChild(inner);
          body.appendChild(a);
          outer.appendChild(dateCol);
          outer.appendChild(body);
          agendaList.appendChild(outer);
        });
      }
    });
})();

// ── AÑO DINÁMICO ──
document.querySelectorAll('.ano-actual').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// ── CARRUSEL TESTIMONIOS ──
(function() {
  const track = document.getElementById('carousel');
  if (!track) return;
  const dotsWrap = document.getElementById('carousel-dots');
  const orig = Array.from(track.children);
  const total = orig.length;
  let current = 0, isTransitioning = false, autoplay;

  orig.forEach(s => track.insertBefore(s.cloneNode(true), track.firstChild));
  orig.forEach(s => track.appendChild(s.cloneNode(true)));

  const sw = () => track.parentElement.offsetWidth;

  function setPos(idx, animate) {
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none';
    track.style.transform = `translateX(-${(idx + total) * sw()}px)`;
  }

  setPos(current, false);

  track.addEventListener('transitionend', () => {
    if (current >= total) { current -= total; setPos(current, false); }
    else if (current < 0) { current += total; setPos(current, false); }
    updateDots(); isTransitioning = false;
  });

  function updateDots() {
    document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(i, resetAP = true) {
    if (isTransitioning) return; isTransitioning = true;
    current = i; setPos(current, true);
    if (resetAP) { clearInterval(autoplay); autoplay = setInterval(() => goTo(current + 1, false), 5000); }
  }

  if (dotsWrap) {
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  const prev = document.getElementById('carousel-prev');
  const next = document.getElementById('carousel-next');
  if (prev) prev.addEventListener('click', () => goTo(current - 1));
  if (next) next.addEventListener('click', () => goTo(current + 1));

  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = sx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) goTo(d > 0 ? current + 1 : current - 1);
  });

  window.addEventListener('resize', () => setPos(current, false), { passive: true });
  autoplay = setInterval(() => goTo(current + 1, false), 5000);
})();
