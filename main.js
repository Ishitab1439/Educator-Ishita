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
      '<div class="ruler" aria-hidden="true"><i></i></div>' +
      // Pull cord: hangs from the header. Pull it down to switch the lights (day / night).
      '<div class="cord"><div class="cord-swing" id="cord-swing">' +
        '<span class="cord-line" aria-hidden="true"></span>' +
        '<button class="cord-handle" type="button" id="cord-handle" role="switch" aria-checked="false" aria-label="Night mode" title="Pull the cord to switch day and night"></button>' +
        '<span class="cord-tip" aria-hidden="true">Pull</span>' +
      '</div></div>';

    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var themeBtn = document.getElementById('theme-btn');
    var cordHandle = document.getElementById('cord-handle');
    var syncTheme = function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeBtn.textContent = dark ? 'Day mode' : 'Night mode';
      themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      cordHandle.setAttribute('aria-checked', dark ? 'true' : 'false');
    };
    var toggleTheme = function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      var html = document.documentElement;
      if (!reduceMotion) {            // brief colour fade, like the lights dimming
        html.classList.add('theme-fade');
        setTimeout(function () { html.classList.remove('theme-fade'); }, 450);
      }
      applyTheme(dark ? 'light' : 'dark', true);
      syncTheme();
    };
    syncTheme();
    themeBtn.addEventListener('click', toggleTheme);

    /* ---------- Pull cord physics ----------
       The cord is a spring: pulling stretches it, letting go makes it bounce back
       and sway. Past a threshold the lights switch, like a real light cord. */
    var swing = document.getElementById('cord-swing');
    var REST_LONG = 48, REST_SHORT = 10, PULL_AT = 26, MAX_PULL = 64;
    var rest = REST_LONG;
    var cs = { y: 0, vy: 0, a: 0, va: 0 };     // y: extra length (px), a: swing angle (deg)
    var cordDrag = null, cordRunning = false, cordLast = 0, skipClick = false;
    function cordUsed() { try { return localStorage.getItem('cordUsed') === '1'; } catch (e) { return false; } }
    function markCordUsed() {
      swing.classList.add('used');
      try { localStorage.setItem('cordUsed', '1'); } catch (e) { /* storage unavailable */ }
    }
    if (cordUsed()) { swing.classList.add('used'); }
    function cordPaint() {
      swing.style.setProperty('--len', (rest + cs.y).toFixed(1) + 'px');
      swing.style.transform = 'rotate(' + cs.a.toFixed(2) + 'deg)';
    }
    function cordStep(t) {
      var dt = Math.min(0.032, (t - cordLast) / 1000);
      cordLast = t;
      if (!cordDrag) {
        cs.vy += (-170 * cs.y - 7 * cs.vy) * dt;
        cs.y += cs.vy * dt;
        cs.va += (-90 * cs.a - 4.2 * cs.va) * dt;
        cs.a += cs.va * dt;
      }
      cordPaint();
      var still = !cordDrag && Math.abs(cs.y) < 0.05 && Math.abs(cs.vy) < 0.5 && Math.abs(cs.a) < 0.05 && Math.abs(cs.va) < 0.5;
      if (still) { cs.y = cs.vy = cs.a = cs.va = 0; cordPaint(); cordRunning = false; return; }
      requestAnimationFrame(cordStep);
    }
    function cordKick() {
      if (reduceMotion || cordRunning) { return; }
      cordRunning = true;
      cordLast = performance.now();
      requestAnimationFrame(cordStep);
    }
    cordPaint();

    cordHandle.addEventListener('click', function () {
      if (skipClick) { skipClick = false; return; }   // a drag already handled it
      markCordUsed();
      cs.vy = 380; cs.va = 30;                         // a quick tug
      toggleTheme();
      cordKick();
    });

    if (!reduceMotion) {
      cordHandle.addEventListener('pointerdown', function (e) {
        cordDrag = { x: e.clientX, y: e.clientY, moved: false, toggled: false };
        cordHandle.setPointerCapture(e.pointerId);
      });
      cordHandle.addEventListener('pointermove', function (e) {
        if (!cordDrag) { return; }
        var dx = e.clientX - cordDrag.x, dy = e.clientY - cordDrag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) { cordDrag.moved = true; }
        cs.y = dy > 0 ? MAX_PULL * (1 - Math.exp(-dy / 55)) : 0;   // gets harder to pull the further you go
        cs.a = Math.max(-14, Math.min(14, dx * 0.18));
        cs.vy = 0; cs.va = 0;
        if (!cordDrag.toggled && cs.y >= PULL_AT) {
          cordDrag.toggled = true;
          markCordUsed();
          toggleTheme();
        }
        cordKick();
      });
      var cordRelease = function () {
        if (!cordDrag) { return; }
        if (cordDrag.moved) { skipClick = true; }
        cordDrag = null;
        cordKick();
      };
      cordHandle.addEventListener('pointerup', cordRelease);
      cordHandle.addEventListener('pointercancel', cordRelease);

      // One gentle swing a moment after load, so people notice the cord is alive
      if (!cordUsed()) {
        setTimeout(function () { cs.va = 36; cordKick(); }, 900);
      }
      // The cord shortens to a stub once the page is scrolled, so it stays out of the way
      var scrolledCord = false;
      var cordScroll = function () {
        var s = window.scrollY > 60;
        if (s === scrolledCord) { return; }
        scrolledCord = s;
        var next = s ? REST_SHORT : REST_LONG;
        cs.y += rest - next;                           // keep the same visible length, then let the spring retract it
        rest = next;
        cordKick();
      };
      window.addEventListener('scroll', cordScroll, { passive: true });
      cordScroll();
    }

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

  /* ---------- Foil card: tilts toward the pointer and catches the light ---------- */
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canHover && !calm) {
    $all('.title-block').forEach(function (card) {
      card.classList.add('foil');
      var frame = null;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        if (frame) { cancelAnimationFrame(frame); }
        frame = requestAnimationFrame(function () {
          card.classList.add('active');
          card.style.setProperty('--rx', ((0.5 - py) * 9).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((px - 0.5) * 11).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          card.style.setProperty('--hue', Math.round(px * 220 + py * 90));
        });
      });
      card.addEventListener('pointerleave', function () {
        if (frame) { cancelAnimationFrame(frame); }
        card.classList.remove('active');
        ['--rx', '--ry', '--mx', '--my', '--hue'].forEach(function (p) { card.style.removeProperty(p); });
      });
    });
  }

  /* ---------- Reduced-motion check shared by the toys below ---------- */
  var calmToys = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sawdust, the squishy workshop buddy (home) ---------- */
  $all('[data-blob]').forEach(function (host) {
    var quips = [
      'Measure twice, cut once.',
      'I am 100% recycled sawdust.',
      'Sand it. Then sand it again.',
      'Ask me about the design cycle.',
      'Ouch! Okay, that one was fair.',
      'Every prototype is a good question.',
      'IGNITE is on 5 and 6 November.',
      'My favourite tool is the next iteration.'
    ];
    host.innerHTML =
      '<button type="button" class="blob-btn" aria-label="Poke Sawdust, the workshop buddy">' +
      '<svg class="blob-svg" viewBox="0 0 120 110" aria-hidden="true">' +
      '<path d="M60 6c27 0 51 17 52 46 1 29-21 52-52 52S8 83 8 54C8 25 33 6 60 6z" fill="#F0B90B" stroke="#1E3A34" stroke-width="3"/>' +
      '<path d="M26 34c6-10 16-16 28-17" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>' +
      '<g><circle cx="42" cy="54" r="10" fill="#fff" stroke="#1E3A34" stroke-width="2.5"/><circle class="pupil" cx="42" cy="54" r="4.5" fill="#1E3A34"/></g>' +
      '<g><circle cx="78" cy="54" r="10" fill="#fff" stroke="#1E3A34" stroke-width="2.5"/><circle class="pupil" cx="78" cy="54" r="4.5" fill="#1E3A34"/></g>' +
      '<path class="mouth" d="M48 78q12 9 24 0" fill="none" stroke="#1E3A34" stroke-width="3" stroke-linecap="round"/>' +
      '</svg></button>' +
      '<p class="blob-bubble" aria-live="polite">Hi, I am Sawdust. Poke me.</p>';
    var btn = host.querySelector('.blob-btn');
    var svg = host.querySelector('.blob-svg');
    var bubble = host.querySelector('.blob-bubble');
    var pupils = $all('.pupil', host);
    var mouth = host.querySelector('.mouth');
    var x = 0, v = 0, raf = 0, last = 0, qi = -1;

    function frame(t) {
      var dt = Math.min(.032, (t - last) / 1000 || .016); last = t;
      v += (-170 * x - 7 * v) * dt;             // spring: pulls back to rest, damping slows it
      x += v * dt;
      svg.style.transform = 'scale(' + (1 + x * .28).toFixed(3) + ',' + (1 - x * .28).toFixed(3) + ')';
      if (Math.abs(x) > .002 || Math.abs(v) > .02) { raf = requestAnimationFrame(frame); }
      else { raf = 0; svg.style.transform = ''; }
    }
    function squish() {
      x = calmToys ? 0 : .9; v = 0;
      if (!calmToys && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      var n; do { n = Math.floor(Math.random() * quips.length); } while (n === qi);
      qi = n; bubble.textContent = quips[n];
      mouth.setAttribute('d', 'M46 76q14 20 28 0');
      setTimeout(function () { mouth.setAttribute('d', 'M48 78q12 9 24 0'); }, 450);
    }
    btn.addEventListener('click', squish);

    var pend = 0, px = 0, py = 0;
    window.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      if (pend) { return; }
      pend = requestAnimationFrame(function () {
        pend = 0;
        var r = svg.getBoundingClientRect();
        var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height * .45);
        var d = Math.sqrt(dx * dx + dy * dy) || 1, m = Math.min(4.5, d / 40);
        pupils.forEach(function (p) { p.setAttribute('transform', 'translate(' + (dx / d * m).toFixed(2) + ' ' + (dy / d * m).toFixed(2) + ')'); });
      });
    }, { passive: true });
  });

  /* ---------- Journal book: opens, then turns its pages (home) ---------- */
  $all('[data-book]').forEach(function (book) {
    var leaves = $all('.leaf', book);
    var openBtn = book.querySelector('[data-book-next]');
    var backBtn = book.querySelector('[data-book-prev]');
    var turned = 0;
    function render() {
      leaves.forEach(function (l, i) {
        var done = i < turned;
        l.classList.toggle('turned', done);
        l.style.zIndex = done ? i + 1 : leaves.length - i;
      });
      book.setAttribute('data-state', turned);
      backBtn.disabled = turned === 0;
      openBtn.disabled = turned === leaves.length;
      openBtn.textContent = turned === 0 ? 'Open the book' : 'Turn the page';
    }
    openBtn.addEventListener('click', function () { if (turned < leaves.length) { turned++; render(); } });
    backBtn.addEventListener('click', function () { if (turned > 0) { turned--; render(); } });
    $all('.leaf', book).forEach(function (l, i) {
      l.addEventListener('click', function (e) {
        if (e.target.closest('a')) { return; }
        if (i === turned) { turned++; } else if (i === turned - 1) { turned--; } else { return; }
        render();
      });
    });
    render();
  });

  /* ---------- Crumple a rough day into a paper ball (journal) ---------- */
  $all('[data-crumple]').forEach(function (sec) {
    var stage = sec.querySelector('.crumple-stage');
    var area = sec.querySelector('textarea');
    var go = sec.querySelector('[data-crumple-go]');
    var bin = sec.querySelector('.bin');
    var count = sec.querySelector('.bin-count');
    var msg = sec.querySelector('.crumple-msg');
    var n = 0, busy = false;
    var lines = ['Gone. It already taught you something.', 'Into the bin. Keep the lesson, lose the weight.', 'Crumpled. Tomorrow is a fresh sheet.', 'Every great unit has a few of these behind it.'];

    function finish() {
      n++; count.textContent = n; busy = false; go.disabled = false;
      msg.textContent = lines[n % lines.length];
      bin.classList.remove('bounce'); void bin.offsetWidth; bin.classList.add('bounce');
    }
    go.addEventListener('click', function () {
      var text = area.value.trim();
      if (busy) { return; }
      if (!text) { msg.textContent = 'Write one thing that went wrong first, then crumple it.'; area.focus(); return; }
      busy = true; go.disabled = true; msg.textContent = '';
      var s = stage.getBoundingClientRect(), a = area.getBoundingClientRect(), b = bin.getBoundingClientRect();
      var paper = document.createElement('div');
      paper.className = 'paper';
      paper.setAttribute('aria-hidden', 'true');
      paper.innerHTML = '<span class="paper-text"></span>';
      paper.firstChild.textContent = text;
      paper.style.left = (a.left - s.left) + 'px'; paper.style.top = (a.top - s.top) + 'px';
      paper.style.width = a.width + 'px'; paper.style.height = a.height + 'px';
      stage.appendChild(paper);
      area.value = '';
      if (calmToys || !paper.animate) { paper.remove(); finish(); return; }
      var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
      var dy = (b.top + b.height * .35) - (a.top + a.height / 2);
      var anim = paper.animate([
        { transform: 'translate(0,0) scale(1) rotate(0deg)', borderRadius: '6px', offset: 0 },
        { transform: 'translate(0,-10px) scale(.2) rotate(200deg)', borderRadius: '50%', offset: .32, easing: 'cubic-bezier(.3,.7,.4,1)' },
        { transform: 'translate(' + (dx * .55) + 'px,' + (Math.min(dy, 0) - 110) + 'px) scale(.2) rotate(420deg)', borderRadius: '50%', offset: .66, easing: 'cubic-bezier(.5,0,.9,.6)' },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.2) rotate(640deg)', borderRadius: '50%', offset: 1 }
      ], { duration: 1150, fill: 'forwards' });
      paper.querySelector('.paper-text').animate([{ opacity: 1 }, { opacity: 0, offset: .22 }, { opacity: 0 }], { duration: 1150, fill: 'forwards' });
      anim.onfinish = function () { paper.remove(); finish(); };
    });
  });

  /* ---------- Claw machine: win it to reveal my email (contact) ---------- */
  $all('[data-claw]').forEach(function (root) {
    var box = root.querySelector('.claw-box');
    var dropBtn = root.querySelector('[data-claw-drop]');
    var status = root.querySelector('.claw-status');
    var win = root.querySelector('.claw-win');
    var nudge = root.querySelector('.claw-nudge');
    var src = document.querySelector('[data-copy]');
    var email = src ? src.getAttribute('data-copy') : 'you@example.com';
    var colours = ['#E4DCC8', '#9FC7BB', '#F2A58E', '#B9B2E0', '#D7E9E2'];
    var W = 0, H = 0, CAP = 38;
    var claw = document.createElement('div'); claw.className = 'claw-arm';
    claw.innerHTML = '<i class="cable"></i><i class="head"><b></b><b></b></i>';
    var prizes = [];
    var state = 'sweep', cx = 20, dir = 1, cable = 14, grabbed = null, last = 0, raf = 0, visible = true, goldIx = 0;
    var SPEED = 95, REST = 14;

    function layout() {
      W = box.clientWidth; H = box.clientHeight;
      prizes.forEach(function (p, i) { p.x = (i + .5) * (W / prizes.length); p.el.style.left = (p.x - CAP / 2) + 'px'; });
    }
    function reset() {
      $all('.prize', box).forEach(function (p) { p.remove(); });
      prizes = []; goldIx = Math.floor(Math.random() * 5);
      for (var i = 0; i < 5; i++) {
        var el = document.createElement('div');
        el.className = 'prize' + (i === goldIx ? ' gold' : '');
        el.style.background = i === goldIx ? '#F0B90B' : colours[i % colours.length];
        if (i === goldIx) { el.textContent = '@'; }
        box.appendChild(el); prizes.push({ el: el, x: 0, gold: i === goldIx });
      }
      box.appendChild(claw);
      layout();
      state = 'sweep'; cable = REST; grabbed = null; dropBtn.disabled = false;
    }
    function draw() {
      claw.style.transform = 'translateX(' + (cx - 20) + 'px)';
      claw.firstChild.style.height = cable + 'px';
      claw.lastChild.style.top = cable + 'px';
      if (grabbed) { grabbed.el.style.left = (cx - CAP / 2) + 'px'; grabbed.el.style.bottom = 'auto'; grabbed.el.style.top = (cable + 26) + 'px'; }
    }
    function floorReach() { return H - 34 - CAP - 26; }
    function step(t) {
      var dt = Math.min(.04, (t - last) / 1000 || .016); last = t;
      if (visible && !document.hidden) {
        if (state === 'sweep' && !calmToys) {
          cx += dir * SPEED * dt;
          if (cx > W - 24) { cx = W - 24; dir = -1; } else if (cx < 24) { cx = 24; dir = 1; }
        } else if (state === 'down') {
          cable += 230 * dt;
          if (cable >= floorReach()) { cable = floorReach(); grab(); }
        } else if (state === 'up') {
          cable -= 160 * dt;
          if (cable <= REST) { cable = REST; arrived(); }
        }
        draw();
      }
      raf = requestAnimationFrame(step);
    }
    function grab() {
      var best = null, bd = 999;
      prizes.forEach(function (p) { if (!p.taken) { var d = Math.abs(p.x - cx); if (d < bd) { bd = d; best = p; } } });
      if (best && bd < 20) {
        grabbed = best; best.el.style.left = ''; best.el.classList.add('held');
        status.textContent = best.gold ? 'You got it!' : 'Got something...';
      } else { status.textContent = 'Just air. Line it up and try again.'; }
      state = 'up';
    }
    function arrived() {
      if (grabbed && grabbed.gold) {
        state = 'won'; win.hidden = false; dropBtn.disabled = true;
        status.textContent = 'You are officially human.';
        grabbed.el.classList.add('opened'); grabbed.el.textContent = '';
        return;
      }
      if (grabbed) {
        status.textContent = 'An empty capsule. The gold one has an @ on it.';
        grabbed.el.remove(); grabbed.taken = true;
        grabbed = null;
      }
      state = 'sweep'; dropBtn.disabled = false;
    }
    dropBtn.addEventListener('click', function () {
      if (state !== 'sweep') { return; }
      state = 'down'; dropBtn.disabled = true; status.textContent = '';
    });
    if (nudge) {
      nudge.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || state !== 'sweep') { return; }
        cx = Math.max(24, Math.min(W - 24, cx + (b.getAttribute('data-dir') === 'l' ? -22 : 22)));
      });
      nudge.hidden = !calmToys;
    }
    var again = root.querySelector('[data-claw-again]');
    if (again) { again.addEventListener('click', function () { win.hidden = true; status.textContent = ''; reset(); }); }
    var cp = root.querySelector('[data-claw-copy]');
    if (cp) { cp.addEventListener('click', function () {
      var done = function () { toast('Copied: ' + email); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(email).then(done, function () { toast('Copy failed. Please copy it by hand.'); }); } else { toast('Copy is not available in this browser.'); }
    }); }
    var mail = root.querySelector('[data-claw-mail]');
    if (mail) { mail.href = 'mailto:' + email; mail.textContent = email; }

    if ('IntersectionObserver' in window) { new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(box); }
    window.addEventListener('resize', layout);
    reset(); cx = W / 2;
    draw();
    last = performance.now(); raf = requestAnimationFrame(step);
  });

  /* ---------- "Surprise me" (journal) ---------- */
  $all('[data-random]').forEach(function (b) {
    b.addEventListener('click', function () {
      var links = $all('[data-random-list] a').filter(function (a) { return !a.closest('[hidden]'); });
      if (links.length) { window.location.href = links[Math.floor(Math.random() * links.length)].href; }
    });
  });
})();
