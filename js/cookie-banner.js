/**
 * Cookie Consent Banner · ramperis.com
 * Versión GTM · dataLayer events · Sin carga directa de GA4
 * LSSI + RGPD + AEPD 2023
 *
 * PREREQUISITO: El snippet de GTM debe estar ya en el <head> de todas las páginas.
 *
 * INTEGRACIÓN:
 * 1. Sube a /public/js/cookie-banner.js
 * 2. Añade antes de </body> en TODAS las páginas:
 *    <script src="/js/cookie-banner.js"></script>
 * 3. En GTM: crea un trigger sobre el evento 'cookies_accepted'
 *    y condiciona tus tags de GA4 a ese trigger.
 * 4. Añade en el footer:
 *    <a href="#" onclick="CookieConsent.manage();return false;">Gestionar cookies</a>
 */

(function () {
  'use strict';

  const KEY = 'rp_consent_v1';
  const C = {
    dark:   '#2E2010',
    border: '#3D2A14',
    amber:  '#B87A3A',
    olive:  '#424029',
    sand:   '#F5F0E4',
    muted:  '#A09070',
    text:   '#C8BAA0',
  };

  // ─── dataLayer helpers ────────────────────────────────────────────────────

  function pushAccepted() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'cookies_accepted',
      'analytics_consent': true
    });
  }

  function pushRejected() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'cookies_rejected',
      'analytics_consent': false
    });
  }

  // ─── Consent helpers ──────────────────────────────────────────────────────

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  }

  function saveConsent(analytics) {
    const c = { analytics, ts: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
    return c;
  }

  function applyConsent(c) {
    if (!c) return;
    if (c.analytics) {
      pushAccepted();
    } else {
      pushRejected();
    }
  }

  // ─── CSS ──────────────────────────────────────────────────────────────────

  const css = `
    #rp-cb {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      width: min(320px, calc(100vw - 3rem));
      background: ${C.dark};
      border: 1px solid ${C.border};
      border-radius: 10px;
      padding: 1.1rem 1.25rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.45);
      font-family: 'Nunito', system-ui, sans-serif;
      animation: rp-in .35s cubic-bezier(.22,1,.36,1) both;
    }
    @keyframes rp-in {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:none; }
    }
    @keyframes rp-out {
      from { opacity:1; transform:none; }
      to   { opacity:0; transform:translateY(8px); }
    }
    #rp-cb.hiding { animation: rp-out .22s ease-in forwards; pointer-events:none; }

    #rp-head {
      display: flex; align-items: center; gap: .5rem;
      margin-bottom: .6rem;
    }
    #rp-head .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${C.amber}; flex-shrink: 0;
    }
    #rp-head span {
      font-size: .7rem; font-weight: 700;
      letter-spacing: .1em; text-transform: uppercase;
      color: ${C.amber};
    }

    #rp-cb p {
      font-size: .79rem; line-height: 1.6;
      color: ${C.text}; margin: 0 0 1rem;
    }
    #rp-cb p a {
      color: ${C.muted}; text-decoration: underline;
      text-underline-offset: 2px;
    }
    #rp-cb p a:hover { color: ${C.sand}; }

    #rp-btns { display: flex; gap: .5rem; margin-bottom: .45rem; }

    #rp-cb button {
      cursor: pointer; border: none; border-radius: 6px;
      font-family: inherit; font-weight: 700; transition: opacity .15s;
    }
    #rp-cb button:hover { opacity: .82; }

    #rp-btn-accept {
      background: ${C.olive}; color: ${C.sand};
      font-size: .77rem; padding: .46rem 0; flex: 1;
    }
    #rp-btn-reject {
      background: transparent; color: ${C.muted};
      border: 1px solid ${C.border} !important;
      font-size: .77rem; padding: .46rem 0; flex: 1;
    }
    #rp-btn-reject:hover { color: ${C.sand}; }
    #rp-btn-manage {
      display: block; width: 100%;
      background: transparent; color: #5A4A35;
      font-size: .7rem; padding: .15rem 0;
      text-decoration: underline; text-underline-offset: 2px;
      border: none !important; text-align: center;
    }
    #rp-btn-manage:hover { color: ${C.muted}; }

    #rp-prefs { display: none; }
    #rp-cb.expanded #rp-main  { display: none; }
    #rp-cb.expanded #rp-prefs { display: block; }

    #rp-prefs h3 {
      font-size: .78rem; font-weight: 700;
      color: ${C.sand}; margin: 0 0 .75rem;
    }
    .rp-cat {
      display: flex; justify-content: space-between;
      align-items: center; padding: .55rem 0;
      border-bottom: 1px solid ${C.border};
    }
    .rp-cat:last-of-type { border-bottom: none; margin-bottom: .75rem; }
    .rp-cat strong { display: block; font-size: .76rem; color: ${C.sand}; font-weight: 600; }
    .rp-cat span   { font-size: .68rem; color: ${C.muted}; }

    .rp-sw { position:relative; width:32px; height:17px; flex-shrink:0; margin-left:.75rem; }
    .rp-sw input { opacity:0; width:0; height:0; }
    .rp-sw-t {
      position:absolute; inset:0; background:#4A3820;
      border-radius:17px; cursor:pointer; transition:background .2s;
    }
    .rp-sw-t::before {
      content:''; position:absolute;
      width:11px; height:11px; left:3px; top:3px;
      background:${C.muted}; border-radius:50%;
      transition:transform .2s, background .2s;
    }
    .rp-sw input:checked + .rp-sw-t { background:${C.olive}; }
    .rp-sw input:checked + .rp-sw-t::before { transform:translateX(15px); background:${C.sand}; }
    .rp-sw input:disabled + .rp-sw-t { background:${C.amber}; opacity:.65; cursor:not-allowed; }
    .rp-sw input:disabled + .rp-sw-t::before { transform:translateX(15px); background:${C.sand}; }

    #rp-btn-save {
      width: 100%; background: ${C.olive}; color: ${C.sand};
      font-size: .77rem; padding: .46rem 0;
    }

    @media (max-height: 500px) {
      #rp-cb { bottom: .75rem; right: .75rem; }
    }
  `;

  // ─── HTML ─────────────────────────────────────────────────────────────────

  const html = `
    <div id="rp-cb" role="dialog" aria-label="Preferencias de cookies" style="display:none">

      <div id="rp-main">
        <div id="rp-head">
          <span class="dot"></span>
          <span>Cookies</span>
        </div>
        <p>
          Usamos cookies propias y de terceros para analizar el tráfico y mejorar tu experiencia.
          Consulta nuestra <a href="/cookies" target="_blank">política de cookies</a>
          y <a href="/privacidad" target="_blank">privacidad</a>.
        </p>
        <div id="rp-btns">
          <button id="rp-btn-accept">Aceptar</button>
          <button id="rp-btn-reject">Rechazar</button>
        </div>
        <button id="rp-btn-manage">Personalizar</button>
      </div>

      <div id="rp-prefs">
        <h3>Elige qué aceptas</h3>
        <div class="rp-cat">
          <div>
            <strong>Técnicas</strong>
            <span>Siempre activas</span>
          </div>
          <label class="rp-sw" aria-label="Siempre activas">
            <input type="checkbox" checked disabled>
            <span class="rp-sw-t"></span>
          </label>
        </div>
        <div class="rp-cat">
          <div>
            <strong>Análisis</strong>
            <span>Google Analytics + Vercel</span>
          </div>
          <label class="rp-sw" aria-label="Activar análisis">
            <input type="checkbox" id="rp-sw-a">
            <span class="rp-sw-t"></span>
          </label>
        </div>
        <button id="rp-btn-save">Guardar preferencias</button>
      </div>

    </div>
  `;

  // ─── UI ───────────────────────────────────────────────────────────────────

  function dismiss() {
    const el = document.getElementById('rp-cb');
    if (!el) return;
    el.classList.add('hiding');
    setTimeout(() => { el.style.display = 'none'; el.classList.remove('hiding', 'expanded'); }, 220);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap);

    // Si ya hay consentimiento guardado, aplicarlo sin mostrar banner
    const existing = getConsent();
    if (existing !== null) {
      applyConsent(existing);
      return;
    }

    // Primera visita — mostrar banner
    document.getElementById('rp-cb').style.display = 'block';

    document.getElementById('rp-btn-accept').addEventListener('click', () => {
      applyConsent(saveConsent(true));
      dismiss();
    });

    document.getElementById('rp-btn-reject').addEventListener('click', () => {
      applyConsent(saveConsent(false));
      dismiss();
    });

    document.getElementById('rp-btn-manage').addEventListener('click', () => {
      document.getElementById('rp-cb').classList.add('expanded');
    });

    document.getElementById('rp-btn-save').addEventListener('click', () => {
      const a = document.getElementById('rp-sw-a').checked;
      applyConsent(saveConsent(a));
      dismiss();
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') dismiss(); });
  }

  // ─── API pública ──────────────────────────────────────────────────────────

  window.CookieConsent = {
    manage: function () {
      const el = document.getElementById('rp-cb');
      if (!el) return;
      const c = getConsent();
      const sw = document.getElementById('rp-sw-a');
      if (sw && c) sw.checked = !!c.analytics;
      el.style.display = 'block';
      el.classList.add('expanded');
    },
    hasAnalytics: () => {
      const c = getConsent();
      return c ? !!c.analytics : false;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
