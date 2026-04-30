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
  const homeList  = document.getElementById('eventos-home');
  const agendaList = document.getElementById('eventos-agenda');
  if (!homeList && !agendaList) return;

  fetch('/eventos.json')
    .then(r => r.json())
    .then(eventos => {
      if (homeList) {
        homeList.innerHTML = eventos.map(e => `
          <div class="evento">
            <div class="evento-fecha">
              <div class="evento-dia">${e.dia}</div>
              <div class="evento-mes">${e.mes}</div>
            </div>
            <div class="evento-info">
              <h3>${e.titulo}</h3>
              <p>${e.info}</p>
            </div>
            <a href="${e.url}" class="evento-btn">Más info →</a>
          </div>`).join('');
      }
      if (agendaList) {
        agendaList.innerHTML = eventos.map(e => `
          <div style="display:grid;grid-template-columns:100px 1fr;gap:0;border-radius:20px;overflow:hidden;background:var(--arena-oscura)">
            <div style="background:var(--tierra-noche);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 16px">
              <span style="font-size:36px;font-weight:800;color:var(--ambar);line-height:1">${e.dia}</span>
              <span style="font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--texto-sutil);margin-top:4px">${e.mes}</span>
            </div>
            <div style="padding:24px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px">
              <div>
                <h3 style="font-size:18px;color:var(--tierra-noche);margin-bottom:6px">${e.titulo}</h3>
                <p style="font-size:14px;color:var(--texto-secundario);font-weight:400">${e.info}</p>
              </div>
              <a href="${e.wa}" target="_blank" rel="noopener" style="font-size:12px;font-weight:600;color:var(--verde-oliva);border:1.5px solid var(--verde-oliva);padding:7px 16px;border-radius:100px;white-space:nowrap;text-decoration:none">Reservar →</a>
            </div>
          </div>`).join('');
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
