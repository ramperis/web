(function () {
  'use strict';

  /* ─── Estilos ─────────────────────────────────────────────────────────── */
  var CSS = [
    '.amazon-box{background:var(--arena-oscura,#ede8d0);border-radius:16px;',
    'border-left:3px solid var(--ambar,#c8780a);overflow:hidden;margin:36px 0;',
    'font-family:"Inter",sans-serif;}',

    '.amazon-box-inner{display:flex;gap:20px;padding:20px;align-items:flex-start;}',

    '.amazon-box-img-wrap{width:120px;min-width:120px;background:#fff;',
    'border-radius:10px;display:flex;align-items:center;justify-content:center;',
    'overflow:hidden;padding:8px;box-sizing:border-box;}',

    '.amazon-box-img-wrap img{width:100%;height:104px;object-fit:contain;display:block;}',

    '.amazon-box-body{flex:1;min-width:0;}',

    '.amazon-box-label{font-size:10px;font-weight:700;letter-spacing:.1em;',
    'text-transform:uppercase;color:var(--ambar,#c8780a);margin:0 0 6px;}',

    '.amazon-box-title{font-size:14px;font-weight:700;',
    'color:var(--texto-principal,#1a1008);line-height:1.45;margin:0 0 8px;}',

    '.amazon-box-price{font-size:20px;font-weight:800;',
    'color:var(--texto-principal,#1a1008);margin:0 0 12px;}',

    '.amazon-box-btn{display:inline-block;background:var(--ambar,#c8780a);',
    'color:#fff!important;font-size:13px;font-weight:700;padding:9px 18px;',
    'border-radius:10px;text-decoration:none!important;transition:opacity .2s;}',
    '.amazon-box-btn:hover{opacity:.85;}',

    '.amazon-box-disclaimer{font-size:10px;color:var(--texto-sutil,#9a8a6a);margin:8px 0 0;}',

    /* Skeleton */
    '.amazon-box-skel{border-radius:6px;',
    'background:linear-gradient(90deg,rgba(42,28,8,.07) 25%,rgba(42,28,8,.14) 50%,rgba(42,28,8,.07) 75%);',
    'background-size:200% 100%;animation:amz-pulse 1.4s ease-in-out infinite;}',
    '@keyframes amz-pulse{0%{background-position:200% 0}100%{background-position:-200% 0}}',

    '.amazon-box-skel.amazon-box-img-wrap{height:120px;}',
    '.amazon-box-skel-title{height:14px;width:90%;margin-bottom:8px;}',
    '.amazon-box-skel-price{height:20px;width:40%;margin-bottom:12px;}',
    '.amazon-box-skel-btn{height:36px;width:130px;border-radius:10px;}',

    /* Responsive */
    '@media(max-width:480px){',
    '.amazon-box-inner{flex-direction:column;}',
    '.amazon-box-img-wrap{width:100%;min-width:0;height:160px;}',
    '.amazon-box-img-wrap img{height:144px;}',
    '}',
  ].join('');

  function injectStyles() {
    if (document.getElementById('amz-box-css')) return;
    var s = document.createElement('style');
    s.id = 'amz-box-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── Render ──────────────────────────────────────────────────────────── */
  function renderSkeleton(el) {
    el.innerHTML =
      '<div class="amazon-box-inner">' +
        '<div class="amazon-box-img-wrap amazon-box-skel"></div>' +
        '<div class="amazon-box-body">' +
          '<div class="amazon-box-skel amazon-box-skel-title"></div>' +
          '<div class="amazon-box-skel amazon-box-skel-price"></div>' +
          '<div class="amazon-box-skel amazon-box-skel-btn"></div>' +
        '</div>' +
      '</div>';
  }

  function renderProduct(el, d) {
    var img = d.image
      ? '<div class="amazon-box-img-wrap"><img src="' + esc(d.image) + '" alt="' + esc(d.title) + '" loading="lazy"></div>'
      : '';
    var price = d.price
      ? '<p class="amazon-box-price">' + esc(d.price) + '</p>'
      : '';
    el.innerHTML =
      '<div class="amazon-box-inner">' +
        img +
        '<div class="amazon-box-body">' +
          '<p class="amazon-box-label">Mencionado en este artículo</p>' +
          '<h4 class="amazon-box-title">' + esc(d.title) + '</h4>' +
          price +
          '<a href="' + esc(d.url) + '" class="amazon-box-btn" ' +
            'target="_blank" rel="sponsored noopener noreferrer nofollow">Ver en Amazon →</a>' +
          '<p class="amazon-box-disclaimer">Enlace de afiliado · sin coste adicional para ti</p>' +
        '</div>' +
      '</div>';
  }

  /* ─── Fetch ───────────────────────────────────────────────────────────── */
  function initBox(el) {
    var asin = el.dataset.asin;
    if (!asin) return;

    renderSkeleton(el);

    fetch('/api/amazon-product?asin=' + encodeURIComponent(asin))
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (data.error || !data.title) { el.style.display = 'none'; return; }
        renderProduct(el, data);
      })
      .catch(function () {
        el.style.display = 'none';
      });
  }

  /* ─── Init ────────────────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    document.querySelectorAll('.amazon-box[data-asin]').forEach(initBox);
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
       <script src="/js/amazon-boxes.js" defer></script>

  2. Colocar el bloque donde quieras dentro de .post-content:
       <div class="amazon-box" data-asin="B0XXXXXXXXXX"></div>

  El ASIN debe ser exactamente 10 caracteres alfanuméricos en mayúsculas.
  ─────────────────────────────────────────────────────────────────────────
*/
