(function () {
  'use strict';

  /* ─── Estilos ─────────────────────────────────────────────────────────── */
  var CSS = [
    /* Card wrapper — the whole card is an <a> */
    '.amazon-box{display:block;position:relative;background:#fff;',
    'border:1px solid #e0ddd5;border-radius:16px;overflow:hidden;',
    'margin:36px 0;text-decoration:none!important;',
    'font-family:"Inter",sans-serif;transition:box-shadow .2s;}',
    '.amazon-box:hover{box-shadow:0 4px 20px rgba(0,0,0,.10);}',

    /* Orange top stripe */
    '.amazon-box::before{content:"";display:block;height:5px;',
    'background:#FF9900;border-radius:16px 16px 0 0;}',

    /* Inner layout */
    '.amazon-box-inner{display:flex;gap:18px;padding:18px;align-items:flex-start;}',

    /* Image */
    '.amazon-box-img{width:110px;min-width:110px;height:110px;',
    'display:flex;align-items:center;justify-content:center;',
    'border:1px solid #f0ede5;border-radius:10px;overflow:hidden;',
    'background:#fafafa;box-sizing:border-box;padding:6px;}',
    '.amazon-box-img img{width:100%;height:100%;object-fit:contain;display:block;}',

    /* Body */
    '.amazon-box-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;}',

    /* Badge: Amazon logo + label */
    '.amazon-box-badge{display:flex;align-items:center;gap:6px;',
    'font-size:11px;font-weight:600;color:#555;letter-spacing:.02em;}',
    '.amazon-box-badge svg{flex-shrink:0;}',

    /* Title */
    '.amazon-box-title{font-size:15px;font-weight:700;',
    'color:#1a1008;line-height:1.4;margin:0;}',

    /* Footer */
    '.amazon-box-footer{display:flex;align-items:center;gap:12px;margin-top:auto;flex-wrap:wrap;}',
    '.amazon-box-price{font-size:20px;font-weight:800;color:#1a1008;line-height:1;}',
    '.amazon-box-price-sub{font-size:12px;font-weight:400;color:#a09070;margin-left:4px;}',
    '.amazon-box-btn{display:inline-flex;align-items:center;gap:6px;background:#FF9900;',
    'color:#111!important;font-size:12px;font-weight:700;',
    'padding:8px 16px;border-radius:100px;text-decoration:none!important;',
    'transition:filter .2s;white-space:nowrap;}',
    '.amazon-box-btn:hover{filter:brightness(.92);}',
    '.amazon-box-btn svg{width:12px;height:12px;flex-shrink:0;}',

    /* Skeleton */
    '@keyframes amz-skel{',
    '0%{background-position:200% 0}',
    '100%{background-position:-200% 0}}',

    '.amz-skel{border-radius:6px;',
    'background:linear-gradient(90deg,#f0ede5 25%,#e8e4d8 50%,#f0ede5 75%);',
    'background-size:200% 100%;animation:amz-skel 1.4s ease-in-out infinite;}',

    '.amazon-box.loading .amazon-box-img{border:1px solid #f0ede5;}',
    '.amazon-box.loading .amazon-box-img.amz-skel{padding:0;}',
    '.amazon-box-skel-badge{height:12px;width:120px;}',
    '.amazon-box-skel-title{height:14px;width:90%;margin-bottom:4px;}',
    '.amazon-box-skel-title2{height:14px;width:65%;}',
    '.amazon-box-skel-price{height:20px;width:60px;}',
    '.amazon-box-skel-btn{height:32px;width:110px;border-radius:20px;}',

    /* Error */
    '.amazon-box-error{padding:16px 20px;font-size:13px;color:#9a8a6a;',
    'display:flex;align-items:center;gap:8px;}',
    '.amazon-box-error a{color:var(--ambar,#c8780a);font-weight:600;',
    'text-decoration:underline;}',

    /* Disclaimer (written manually in HTML, not injected by JS) */
    '.amazon-disclaimer{font-size:11px;color:var(--texto-sutil,#9a8a6a);',
    'margin:-24px 0 36px;line-height:1.5;}',

    /* Responsive */
    '@media(max-width:480px){',
    '.amazon-box-inner{flex-direction:column;}',
    '.amazon-box-img{width:100%;min-width:0;height:140px;}',
    '}',
  ].join('');

  /* Amazon logo SVG (wordmark, orange arrow only) */
  var AMAZON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="16" viewBox="0 0 603 182" aria-label="Amazon">' +
    '<path fill="#232F3E" d="M187 140c-41 28-100 43-151 43C16 183 0 134 0 92c0-55 51-104 123-104 47 0 88 22 112 58l-11 9C204 30 174 14 136 14 79 14 34 55 34 110c0 54 48 95 108 95 34 0 66-10 90-26l-45-39zM380 134c-13 14-34 22-57 22-30 0-55-18-55-50 0-50 56-58 112-58v-6c0-22-6-36-32-36-20 0-38 10-46 26l-14-8c12-22 36-36 63-36 38 0 55 20 55 56v90h-26zm0-70c-44 0-86 8-86 38 0 20 14 32 34 32 18 0 36-10 52-24zM465 154h-26V36h26v18c12-14 30-22 50-22 32 0 54 20 54 56v66h-26V92c0-24-12-38-36-38-18 0-34 10-42 26zM603 154h-26V36h26z"/>' +
    '<path fill="#FF9900" d="M338 168c-68 28-162 14-218-36l10-12c52 46 142 60 206 34z"/>' +
    '<path fill="#FF9900" d="M360 150l-20-14c14-10 10-30-6-30-8 0-16 4-20 10l-10-12c8-10 20-16 34-16 26 0 40 20 30 44 4-2 8-4 12-2l10 10c-12 6-24 8-30 10z"/>' +
    '</svg>';

  function injectStyles() {
    if (document.getElementById('amz-box-css')) return;
    var s = document.createElement('style');
    s.id = 'amz-box-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── Render states ───────────────────────────────────────────────────── */
  function renderLoading(anchor) {
    anchor.className = 'amazon-box loading';
    anchor.innerHTML =
      '<div class="amazon-box-inner">' +
        '<div class="amazon-box-img amz-skel"></div>' +
        '<div class="amazon-box-body">' +
          '<div class="amz-skel amazon-box-skel-badge"></div>' +
          '<div class="amz-skel amazon-box-skel-title" style="margin-top:8px"></div>' +
          '<div class="amz-skel amazon-box-skel-title2"></div>' +
          '<div class="amazon-box-footer">' +
            '<div class="amz-skel amazon-box-skel-price"></div>' +
            '<div class="amz-skel amazon-box-skel-btn"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderProduct(anchor, d) {
    anchor.className = 'amazon-box';
    anchor.href = esc(d.url);
    anchor.target = '_blank';
    anchor.rel = 'sponsored noopener noreferrer nofollow';

    var img = d.image
      ? '<img src="' + esc(d.image) + '" alt="' + esc(d.title) + '" loading="lazy">'
      : '';
    var price = d.price
      ? '<span class="amazon-box-price">' + esc(d.price) + '</span>'
      : '';

    anchor.innerHTML =
      '<div class="amazon-box-inner">' +
        '<div class="amazon-box-img">' + img + '</div>' +
        '<div class="amazon-box-body">' +
          '<div class="amazon-box-badge">' +
            AMAZON_SVG +
            '<span>· Recomendado</span>' +
          '</div>' +
          '<p class="amazon-box-title">' + esc(d.title) + '</p>' +
          '<div class="amazon-box-footer">' +
            price +
            '<span class="amazon-box-btn">Ver en Amazon →</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderError(anchor, asin) {
    anchor.className = 'amazon-box';
    anchor.removeAttribute('href');
    anchor.innerHTML =
      '<div class="amazon-box-error">' +
        '<span>Producto no disponible. </span>' +
        '<a href="https://www.amazon.es/dp/' + esc(asin) + '" ' +
          'target="_blank" rel="sponsored noopener noreferrer nofollow">' +
          'Ver en Amazon →</a>' +
      '</div>';
  }

  /* ─── Init each box ───────────────────────────────────────────────────── */
  function initBox(el) {
    var asin = el.dataset.asin;
    if (!asin) return;

    /* Replace the div with an <a> so the whole card is clickable */
    var anchor = document.createElement('a');
    el.parentNode.replaceChild(anchor, el);

    renderLoading(anchor);

    fetch('/api/amazon-product?asin=' + encodeURIComponent(asin))
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (data.error || !data.title) {
          renderError(anchor, asin);
          return;
        }
        renderProduct(anchor, data);
      })
      .catch(function () {
        renderError(anchor, asin);
      });
  }

  /* ─── Init ────────────────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    document.querySelectorAll('.amazon-product[data-asin]').forEach(initBox);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/*
  USO EN UN POST:
  ─────────────────────────────────────────────────────────────────────────
  1. Añadir en <head> del post (antes de </head>):
       <script src="/js/amazon-box.js" defer></script>

  2. Colocar el bloque donde quieras dentro de .post-content:
       <div class="amazon-product" data-asin="B0XXXXXXXXXX"></div>
       <p class="amazon-disclaimer">* Enlace de afiliado. Si compras a través
       de este enlace recibo una pequeña comisión sin coste adicional para ti.</p>

  El ASIN debe ser exactamente 10 caracteres alfanuméricos en mayúsculas.
  ─────────────────────────────────────────────────────────────────────────
*/
