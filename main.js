/* ==========================================================
   Portfolio script. Shared by every page.

   EASY EDITS
   - Your name:            change NAME below.
   - Menu items:           change the NAV list below (one line per page).
   - Footer text:          change FOOTER_NOTE below.
   Everything else on the site is plain HTML in each page.
   ========================================================== */
(function () {
  'use strict';

  var NAME = '[Your name]';                       // EDIT: your name
  var FOOTER_NOTE = 'Student work is shown with consent. IB, MYP and ManageBac are trademarks of their respective owners and are used here only to describe my work.';
  var NAV = [                                      // EDIT: [page id, label, file]
    ['about', 'About', 'about.html'],
    ['teaching', 'Teaching', 'teaching.html'],
    ['student-work', 'Student work', 'student-work.html'],
    ['design-skills', 'Design skills', 'design-skills.html'],
    ['leadership', 'Leadership', 'leadership.html'],
    ['journal', 'Journal', 'journal.html'],
    ['contact', 'Contact', 'contact.html']
  ];

  var body = document.body;
  var root = body.getAttribute('data-root') || '';
  var page = body.getAttribute('data-page') || '';

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Theme (day / night) ---------- */
  function savedTheme() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function applyTheme(t, save) {
    document.documentElement.setAttribute('data-theme', t);
    if (save) { try { localStorage.setItem('theme', t); } catch (e) { /* storage unavailable */ } }
  }
  var theme = savedTheme() || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(theme, false);

  /* ---------- Toast ---------- */
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  /* ---------- Header and footer ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    var links = NAV.map(function (n) {
      return '<a href="' + root + n[2] + '"' + (n[0] === page ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
    }).join('');
    header.innerHTML =
      '<div class="wrap bar">' +
        '<a class="brand" href="' + root + 'index.html">' + NAME + '</a>' +
        '<nav class="nav" id="main-nav" aria-label="Main">' + links + '</nav>' +
        '<button class="icon-btn" type="button" id="theme-btn" aria-pressed="false"></button>' +
        '<button class="icon-btn menu-btn" type="button" id="menu-btn" aria-expanded="false" aria-controls="main-nav">Menu</button>' +
      '</div>' +
      '<div class="ruler" aria-hidden="true"><i></i></div>';

    var themeBtn = document.getElementById('theme-btn');
    var syncTheme = function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeBtn.textContent = dark ? 'Day mode' : 'Night mode';
      themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    };
    syncTheme();
    themeBtn.addEventListener('click', function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(dark ? 'light' : 'dark', true);
      syncTheme();
    });

    var menuBtn = document.getElementById('menu-btn');
    var nav = document.getElementById('main-nav');
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Tape-measure progress bar: fills as you scroll down the page
    var fill = header.querySelector('.ruler i');
    var ticking = false;
    var updateRuler = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      fill.style.width = pct + '%';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateRuler); }
    }, { passive: true });
    updateRuler();
  }

  var footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    var flinks = NAV.map(function (n) { return '<a href="' + root + n[2] + '">' + n[1] + '</a>'; }).join('') +
      '<a href="' + root + 'ignite.html">IGNITE</a>';
    footer.innerHTML =
      '<div class="wrap">' +
        '<div><p>' + FOOTER_NOTE + '</p><p>&copy; ' + NAME + '</p></div>' +
        '<nav aria-label="Footer">' + flinks + '</nav>' +
      '</div>';
  }

  /* ---------- Tabs (home: "What brings you here?") ---------- */
  $all('[data-tabs]').forEach(function (box) {
    var btns = $all('[data-tab]', box);
    var panels = $all('[data-panel]', box);
    function show(id) {
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tab') === id ? 'true' : 'false'); });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== id; });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-tab')); }); });
    if (btns.length) { show(btns[0].getAttribute('data-tab')); }
  });

  /* ---------- Design-cycle wheel (home) ---------- */
  var cycle = document.querySelector('[data-cycle]');
  if (cycle) {
    var items = $all('[data-cycle-data] li').map(function (li) {
      return { letter: li.getAttribute('data-letter'), name: li.getAttribute('data-name'), href: li.getAttribute('data-href'), linkText: li.getAttribute('data-link-text'), text: li.textContent.trim() };
    });
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'Design cycle with four stages');
    var CX = 150, CY = 150, R = 140, r = 62, gap = 0.035, n = items.length;
    function pt(rad, a) { return [CX + rad * Math.cos(a), CY + rad * Math.sin(a)]; }
    var segs = [];
    var panel = document.querySelector('[data-cycle-panel]');

    function activate(i) {
      segs.forEach(function (s, k) { s.classList.toggle('active', k === i); s.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      var it = items[i];
      panel.innerHTML = '<span class="chip">Stage ' + it.letter + '</span><h3></h3><p></p><a class="btn solid" href=""></a>';
      panel.querySelector('h3').textContent = it.name;
      panel.querySelector('p').textContent = it.text;
      var a = panel.querySelector('a');
      a.setAttribute('href', it.href);
      a.textContent = it.linkText;
    }

    items.forEach(function (it, i) {
      var a0 = -Math.PI / 2 + i * 2 * Math.PI / n + gap;
      var a1 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n - gap;
      var p0 = pt(R, a0), p1 = pt(R, a1), p2 = pt(r, a1), p3 = pt(r, a0);
      var g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', 'seg');
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute('aria-label', it.name);
      g.setAttribute('aria-pressed', 'false');
      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M' + p0 + ' A' + R + ',' + R + ' 0 0 1 ' + p1 + ' L' + p2 + ' A' + r + ',' + r + ' 0 0 0 ' + p3 + ' Z');
      var mid = (a0 + a1) / 2, tp = pt((R + r) / 2, mid);
      var label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', tp[0]); label.setAttribute('y', tp[1] + 10);
      label.setAttribute('text-anchor', 'middle');
      label.textContent = it.letter;
      g.appendChild(path); g.appendChild(label);
      g.addEventListener('click', function () { activate(i); });
      g.addEventListener('mouseenter', function () { activate(i); });
      g.addEventListener('focus', function () { activate(i); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); segs[(i + 1) % n].focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); segs[(i - 1 + n) % n].focus(); }
      });
      svg.appendChild(g);
      segs.push(g);
    });
    var c1 = document.createElementNS(svgNS, 'text');
    c1.setAttribute('class', 'centre'); c1.setAttribute('x', CX); c1.setAttribute('y', CY - 2); c1.textContent = 'Design';
    var c2 = document.createElementNS(svgNS, 'text');
    c2.setAttribute('class', 'centre'); c2.setAttribute('x', CX); c2.setAttribute('y', CY + 16); c2.textContent = 'cycle';
    svg.appendChild(c1); svg.appendChild(c2);
    cycle.appendChild(svg);
    activate(0);
  }

  /* ---------- Countdown (IGNITE) ---------- */
  $all('[data-countdown]').forEach(function (el) {
    var target = new Date(el.getAttribute('data-countdown')).getTime();
    var now = Date.now();
    var num = el.querySelector('.cd-num');
    var label = el.querySelector('.cd-label');
    if (isNaN(target)) { return; }
    if (now < target) {
      var d = Math.ceil((target - now) / 864e5);
      num.textContent = d;
      label.textContent = d === 1 ? 'day to go' : 'days to go';
    } else if (now < target + 2 * 864e5) {
      num.textContent = 'Now';
      label.textContent = 'IGNITE is on';
    } else {
      num.textContent = 'Held';
      label.textContent = 'IGNITE 2026-27 took place';
    }
  });

  /* ---------- Filter and search (teaching, student work, journal) ---------- */
  $all('[data-filterable]').forEach(function (box) {
    var chips = $all('[data-filter]', box);
    var cards = $all('[data-cat]', box);
    var search = box.querySelector('[data-search]');
    var empty = box.querySelector('.empty');
    var count = box.querySelector('[data-count]');
    var f = 'all', q = '';
    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var cats = (c.getAttribute('data-cat') || '').split(' ');
        var okF = f === 'all' || cats.indexOf(f) > -1;
        var okQ = !q || c.textContent.toLowerCase().indexOf(q) > -1;
        c.hidden = !(okF && okQ);
        if (!c.hidden) { shown++; }
      });
      if (empty) { empty.hidden = shown > 0; }
      if (count) { count.textContent = shown; }
    }
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        f = b.getAttribute('data-filter');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        apply();
      });
    });
    if (search) { search.addEventListener('input', function () { q = search.value.trim().toLowerCase(); apply(); }); }
    apply();
  });

  /* ---------- Lightbox (student work) ---------- */
  var dlg = document.getElementById('lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var idx = 0;
    var visible = function () { return $all('.work').filter(function (w) { return !w.hidden; }); };
    var openAt = function (i) {
      var list = visible();
      if (!list.length) { return; }
      idx = (i + list.length) % list.length;
      var t = list[idx];
      dlg.querySelector('.lb-title').textContent = t.querySelector('h3').textContent;
      dlg.querySelector('.lb-meta').textContent = t.querySelector('.meta').textContent;
      var more = t.querySelector('.work-more');
      dlg.querySelector('.lb-more').innerHTML = more ? more.innerHTML : '';
      var media = dlg.querySelector('.lb-media');
      media.innerHTML = '';
      var src = t.querySelector('.work-open .ph, .work-open img');
      if (src) { media.appendChild(src.cloneNode(true)); }
      dlg.querySelector('.lb-count').textContent = (idx + 1) + ' of ' + list.length;
      if (!dlg.open) { dlg.showModal(); }
    };
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.work-open') : null;
      if (b) { openAt(visible().indexOf(b.closest('.work'))); }
    });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { openAt(idx - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { openAt(idx + 1); });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { dlg.close(); } });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { openAt(idx + 1); }
      if (e.key === 'ArrowLeft') { openAt(idx - 1); }
    });
  }

  /* ---------- Idea-to-object slider (design skills) ---------- */
  $all('[data-stages]').forEach(function (box) {
    var range = box.querySelector('input[type=range]');
    var layers = $all('.layer', box);
    var caps = $all('[data-stage-cap]', box);
    var btns = $all('[data-stage-btn]', box);
    function render(v) {
      v = +v;
      var o = [Math.max(0, 1 - v / 50), v <= 50 ? v / 50 : (100 - v) / 50, Math.max(0, (v - 50) / 50)];
      layers.forEach(function (l, i) { l.style.opacity = o[i]; });
      var s = v < 25 ? 0 : (v < 75 ? 1 : 2);
      caps.forEach(function (c, i) { c.hidden = i !== s; });
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === s ? 'true' : 'false'); });
    }
    range.addEventListener('input', function () { render(range.value); });
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { range.value = [0, 50, 100][i]; render(range.value); });
    });
    render(range.value);
  });

  /* ---------- Copy to clipboard (contact) ---------- */
  $all('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var done = function () { toast('Copied: ' + text); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { toast('Copy failed. Please copy it by hand.'); });
      } else { toast('Copy is not available in this browser.'); }
    });
  });

  /* ---------- "Surprise me" (journal) ---------- */
  $all('[data-random]').forEach(function (b) {
    b.addEventListener('click', function () {
      var links = $all('[data-random-list] a').filter(function (a) { return !a.closest('[hidden]'); });
      if (links.length) { window.location.href = links[Math.floor(Math.random() * links.length)].href; }
    });
  });
})();
