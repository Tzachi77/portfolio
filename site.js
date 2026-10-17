/* always start a new page at the top (unless the link targets a section, like #work) */
(function () {
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  function toTop() {
    if (location.hash && document.getElementById(location.hash.slice(1))) return;
    window.scrollTo(0, 0);
    // the portfolio may be shown inside a scrolling frame: bring its top into view too
    try { document.documentElement.scrollIntoView({ block: 'start' }); } catch (e) {}
  }
  toTop();
  addEventListener('DOMContentLoaded', toTop);
  addEventListener('load', toTop);
  addEventListener('pageshow', function (e) { if (e.persisted) toTop(); });
})();

(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function css(name) { return getComputedStyle(doc).getPropertyValue(name).trim(); }

  /* ---------- highlighter sweep on the hero promise ---------- */
  var em = document.querySelector('.intro h1 em');
  if (em) requestAnimationFrame(function () { requestAnimationFrame(function () { em.classList.add('on'); }); });

  /* ---------- scroll reveal ---------- */
  var targets = document.querySelectorAll('.case, .stat, .reel, .about .sec-head, .principles li, section > .sec-head, section > figure, section > .grid2, section > .outcomes, section > .tbl-scroll, .pager, .ba');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    targets.forEach(function (t, i) {
      var r = t.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // already visible on load: no flash
      t.classList.add('rv');
      if (t.matches('.principles li')) t.style.transitionDelay = (Array.prototype.indexOf.call(t.parentNode.children, t) * 90) + 'ms';
      io.observe(t);
    });
  }

  /* ---------- case cards: quiet auto-playing loops ---------- */
  (function () {
    var vids = document.querySelectorAll('.case video.loop'); if (!vids.length) return;
    if (reduce || !('IntersectionObserver' in window)) return;   /* poster image only */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { threshold: .35 });
    vids.forEach(function (v) { io.observe(v); });
  })();

  /* ---------- before / after toggles (any grid of two figures captioned Before. / After.) ---------- */
  document.querySelectorAll('.grid2').forEach(function (g, n) {
    var figs = g.querySelectorAll(':scope > figure');
    if (figs.length !== 2) return;
    var c0 = figs[0].querySelector('figcaption b'), c1 = figs[1].querySelector('figcaption b');
    if (!c0 || !c1 || !/^before/i.test(c0.textContent) || !/^after/i.test(c1.textContent)) return;
    var i0 = figs[0].querySelector('img'), i1 = figs[1].querySelector('img');
    var cap0 = figs[0].querySelector('figcaption'), cap1 = figs[1].querySelector('figcaption');
    var box = document.createElement('figure'); box.className = 'ba';
    box.innerHTML = '<div class="ba-bar"><div class="ba-switch" role="group" aria-label="Compare before and after"><span class="pill"></span>' +
      '<button type="button" aria-pressed="false">Before</button><button type="button" aria-pressed="true">After</button></div>' +
      '<span class="ba-hint">Tap to compare, or press B / A</span></div><div class="stage"></div><div class="caps"></div>';
    var stage = box.querySelector('.stage'), caps = box.querySelector('.caps');
    i0.classList.add('off'); stage.appendChild(i0); stage.appendChild(i1);
    caps.appendChild(cap0); caps.appendChild(cap1); cap1.classList.add('on');
    g.replaceWith(box);
    var btns = box.querySelectorAll('button'), pill = box.querySelector('.pill');
    function set(after) {
      i0.classList.toggle('off', after); i1.classList.toggle('off', !after);
      cap0.classList.toggle('on', !after); cap1.classList.toggle('on', after);
      btns[0].setAttribute('aria-pressed', !after); btns[1].setAttribute('aria-pressed', after);
      var b = btns[after ? 1 : 0];
      pill.style.width = b.offsetWidth + 'px'; pill.style.transform = 'translateX(' + (b.offsetLeft - 3) + 'px)';
      box.dataset.after = after ? '1' : '0';
    }
    btns[0].addEventListener('click', function () { set(false); });
    btns[1].addEventListener('click', function () { set(true); });
    stage.addEventListener('click', function () { set(box.dataset.after !== '1'); });
    stage.style.cursor = 'pointer';
    box.addEventListener('keydown', function (e) { if (e.key === 'b' || e.key === 'B') set(false); if (e.key === 'a' || e.key === 'A') set(true); });
    requestAnimationFrame(function () { set(true); });
    window.addEventListener('resize', function () { set(box.dataset.after === '1'); });
  });

  /* ---------- case pages: progress bar + 01–05 tracker ---------- */
  var secs = Array.prototype.slice.call(document.querySelectorAll('section[aria-labelledby]')).filter(function (s) { return s.querySelector('.sec-head .label'); });
  if (secs.length >= 4 && document.querySelector('.hero')) {
    var bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
    var nav = document.createElement('nav'); nav.className = 'steps'; nav.setAttribute('aria-label', 'Case study sections');
    var now = document.createElement('div'); now.className = 'stepnow'; now.setAttribute('aria-hidden', 'true');
    var links = secs.map(function (s) {
      var t = s.querySelector('.sec-head .label').textContent.split('·');
      var a = document.createElement('a'); a.href = '#' + s.getAttribute('aria-labelledby');
      a.innerHTML = '<span class="d"></span><span class="t">' + t[0].trim() + ' ' + (t[1] || '').trim() + '</span>';
      a.addEventListener('click', function (e) { e.preventDefault(); s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
      nav.appendChild(a); a._label = t[0].trim() + ' · ' + (t[1] || '').trim(); return a;
    });
    document.body.appendChild(nav); document.body.appendChild(now);
    var ticking = false;
    function upd() {
      ticking = false;
      var h = doc.scrollHeight - innerHeight, y = scrollY;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
      var cur = -1;
      secs.forEach(function (s, i) { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === cur); a.classList.toggle('done', i < cur); });
      var show = cur >= 0 && document.querySelector('.pager').getBoundingClientRect().top > innerHeight * 0.6;
      nav.classList.toggle('show', show); now.classList.toggle('show', show);
      if (cur >= 0) now.textContent = links[cur]._label;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  }

  /* ---------- hero: complexity → clarity ---------- */
  var cv = document.getElementById('clarity');
  if (cv) clarity(cv);

  function clarity(cv) {
    var ctx = cv.getContext('2d'), W, H, dpr, dots = [], pointer = { x: -1e4, y: -1e4, on: false };
    var COLS = 9, heights = [5, 8, 6, 11, 7, 13, 9, 6, 10], hi = 5; // the "insight" column
    var N = heights.reduce(function (a, b) { return a + b; }, 0);
    var col = {};
    function colors() { col.ink = css('--ink'); col.ink2 = css('--ink-2'); col.rule = css('--rule'); col.mark = css('--mark'); col.violet = css('--violet'); }
    function size() {
      var r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }
    function layout() {
      var padX = W * 0.12, base = H * 0.8, gap = (W - padX * 2) / COLS, step = Math.min(gap * 0.62, (H * 0.62) / 13);
      var k = 0;
      for (var c = 0; c < COLS; c++) for (var j = 0; j < heights[c]; j++) {
        var d = dots[k] || (dots[k] = { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, ph: Math.random() * 6.28 });
        d.tx = padX + gap * c + gap / 2; d.ty = base - j * step; d.c = c; d.r = Math.max(2.2, step * 0.3); k++;
      }
      col.base = base; col.padX = padX;
    }
    var t0 = performance.now(), settle = 0;
    function frame(t) {
      var el = (t - t0) / 1000;
      settle = Math.min(1, Math.max(0, (el - 0.6) / 1.8)); // chaos for a beat, then order
      ctx.clearRect(0, 0, W, H);
      // baseline + axis ticks fade in as it settles
      ctx.globalAlpha = settle; ctx.strokeStyle = col.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(col.padX, col.base + 10); ctx.lineTo(W - col.padX, col.base + 10); ctx.stroke();
      ctx.globalAlpha = 1;
      var calm = 0;
      dots.forEach(function (d) {
        var k = 0.012 + 0.05 * settle;
        var ax = (d.tx - d.x) * k, ay = (d.ty - d.y) * k;
        // drift while chaotic
        ax += Math.cos(el * 1.3 + d.ph) * 0.35 * (1 - settle); ay += Math.sin(el * 1.1 + d.ph) * 0.35 * (1 - settle);
        if (pointer.on) {
          var dx = d.x - pointer.x, dy = d.y - pointer.y, dist2 = dx * dx + dy * dy, R = Math.min(W, H) * 0.2;
          if (dist2 < R * R) { var f = (1 - Math.sqrt(dist2) / R) * 2.4; var dd = Math.sqrt(dist2) || 1; ax += dx / dd * f; ay += dy / dd * f; }
        }
        d.vx = (d.vx + ax) * 0.86; d.vy = (d.vy + ay) * 0.86; d.x += d.vx; d.y += d.vy;
        var off = Math.abs(d.x - d.tx) + Math.abs(d.y - d.ty); calm += off;
        var near = Math.max(0, 1 - off / 40);
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832);
        if (d.c === hi && near > 0.5 && settle > 0.9) ctx.fillStyle = col.violet;
        else ctx.fillStyle = near > 0.6 ? col.ink : col.ink2;
        ctx.globalAlpha = 0.35 + 0.65 * near; ctx.fill(); ctx.globalAlpha = 1;
      });
      // the answer label appears when the data is calm
      var order = Math.max(0, 1 - calm / (N * 12));
      if (settle > 0.95 && order > 0.6) {
        var hd = dots.filter(function (d) { return d.c === hi; }), top = hd[hd.length - 1];
        ctx.globalAlpha = (order - 0.6) / 0.4;
        ctx.fillStyle = col.ink; ctx.font = '500 12px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('the insight', top.tx, top.ty - top.r * 2 - 10);
        ctx.globalAlpha = 1;
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    var raf;
    function pos(e) { var r = cv.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true; }
    cv.addEventListener('pointermove', pos);
    cv.addEventListener('pointerdown', pos);
    cv.addEventListener('pointerleave', function () { pointer.on = false; });
    cv.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') pointer.on = false; });
    colors(); size();
    addEventListener('resize', size);
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', colors); } catch (e) {}
    if (reduce) { t0 = -1e5; dots.forEach(function (d) { d.x = d.tx; d.y = d.ty; }); frame(performance.now()); }
    else {
      // pause when off-screen
      var vis = true;
      new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !vis) raf = requestAnimationFrame(frame); if (!v) cancelAnimationFrame(raf); vis = v; }).observe(cv);
      raf = requestAnimationFrame(frame);
    }
  }
})();

/* ================= layer 2: hover & special moments ================= */
(function () {
  var reduce = false, fine = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; fine = matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}

  /* headline: words rise in, then the highlighter sweeps */
  var h1 = document.querySelector('.intro h1');
  if (h1 && !reduce) {
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.textContent = t; w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) split(n);
      });
    })(h1);
    h1.querySelectorAll('.w>span').forEach(function (s, k) { s.style.transitionDelay = (k * 55) + 'ms'; });
    var em = h1.querySelector('em');
    if (em) { em.classList.remove('on'); em.style.transitionDelay = (h1.querySelectorAll('.w').length * 55 + 250) + 'ms'; }
    requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add('up'); if (em) em.classList.add('on'); }); });
  }

  /* screenshots: click to zoom (lightbox) */
  var imgs = document.querySelectorAll('section figure .frame img');
  if (imgs.length) {
    var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image preview');
    lb.innerHTML = '<div class="lb-bar"><span>Click image to zoom · Esc to close</span><button type="button">Close</button></div><div class="lb-in"><img alt=""></div>';
    document.body.appendChild(lb);
    var big = lb.querySelector('img'), last;
    function open(src, alt, from) { last = from; big.src = src; big.alt = alt || ''; big.classList.remove('z'); lb.classList.add('open'); lb.querySelector('button').focus(); document.documentElement.style.overflow = 'hidden'; }
    function close() { lb.classList.remove('open'); document.documentElement.style.overflow = ''; if (last) last.focus(); }
    imgs.forEach(function (im) {
      im.classList.add('zoomable'); im.tabIndex = 0; im.setAttribute('role', 'button'); im.setAttribute('aria-label', 'Enlarge: ' + (im.alt || 'image'));
      im.addEventListener('click', function () { open(im.currentSrc || im.src, im.alt, im); });
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(im.currentSrc || im.src, im.alt, im); } });
    });
    big.addEventListener('click', function (e) { e.stopPropagation(); big.classList.toggle('z'); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'BUTTON') close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  if (reduce || !fine) return;

  /* magnetic buttons */
  document.querySelectorAll('.btn').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .25) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });

  /* custom cursor with contextual labels */
  var cur = document.createElement('div'); cur.className = 'cur'; cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<div class="ring"><span></span></div><div class="dot"></div>';
  document.body.appendChild(cur); document.documentElement.classList.add('has-cur');
  var ring = cur.querySelector('.ring'), dot = cur.querySelector('.dot'), lbl = ring.querySelector('span');
  var mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; cur.classList.remove('hide'); }, { passive: true });
  document.addEventListener('mouseleave', function () { cur.classList.add('hide'); });
  (function loop() { rx += (mx - rx) * .2; ry += (my - ry) * .2; dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)'; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); })();
  function label(t) { if (t) { lbl.textContent = t; cur.classList.add('big'); cur.classList.remove('link'); } else cur.classList.remove('big'); }
  document.addEventListener('mouseover', function (e) {
    var el = e.target;
    if (el.closest('.lb')) { label(''); cur.classList.add('link'); return; }
    if (el.closest('.case')) return label('View case');
    if (el.closest('.ba .stage')) return label('Compare');
    if (el.closest('.hs')) { label(''); cur.classList.add('link'); return; }
    if (el.closest('.zoomable')) return label('Zoom');
    if (el.closest('#clarity')) return label('Stir');
    if (el.closest('.pit')) return label(document.querySelector('.pit.grab') ? 'Throw' : 'Drag');
    if (el.closest('#reel')) return label('Showreel');
    if (el.closest('video')) return label('Live');
    label('');
    cur.classList.toggle('link', !!el.closest('a, button'));
  });
})();

/* resume: expertise chips fall with real physics (Matter.js), drag and throw them */
(function () {
  var ul = document.querySelector('.skills'); if (!ul) return;
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce) return;
  var sc = document.createElement('script'); sc.src = 'matter.min.js';
  sc.onload = function () { try { build(); } catch (e) { console.error(e); } };
  document.head.appendChild(sc);

  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function build() {
    var M = window.Matter; if (!M) return;
    var labels = Array.prototype.map.call(ul.querySelectorAll('li'), function (li) { return li.textContent; });
    var wrap = document.createElement('div');
    var box = document.createElement('div'); box.className = 'pit'; box.setAttribute('aria-hidden', 'true');
    var hint = document.createElement('div'); hint.className = 'pit-bar';
    hint.innerHTML = '<span>Drag, throw, stack them</span><button type="button" class="skills-replay">↻ Drop again</button>';
    ul.before(wrap); wrap.appendChild(box); wrap.appendChild(hint); wrap.appendChild(ul);
    ul.classList.add('sr-only');
    var styles = ['p-ink', 'p-mark', 'p-violet', 'p-lilac', 'p-sheet', 'p-mark', 'p-ink'];
    var dots = [{ t: '✦', c: 'p-violet' }, { t: '◎', c: 'p-mark' }, { t: '↗', c: 'p-ink' }];
    var els = [];
    labels.forEach(function (l, i) { var d = document.createElement('div'); d.className = 'pill ' + styles[i % styles.length]; d.textContent = l; box.appendChild(d); els.push({ el: d, round: false }); });
    dots.forEach(function (o) { var d = document.createElement('div'); d.className = 'pill dot ' + o.c; d.textContent = o.t; box.appendChild(d); els.push({ el: d, round: true }); });

    var E = M.Engine, B = M.Bodies, C = M.Composite, R = M.Runner, Body = M.Body;
    var engine = E.create({ gravity: { y: 1.1 } }), runner = R.create(), W, H, walls = [], started = false;
    function measure() { W = box.clientWidth; H = box.clientHeight; }
    function setWalls() {
      C.remove(engine.world, walls); var t = 200;
      var wh = H + 2400, wy = H + 200 - wh / 2;
      walls = [B.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }), B.rectangle(-t / 2, wy, t, wh, { isStatic: true }), B.rectangle(W + t / 2, wy, t, wh, { isStatic: true })];
      C.add(engine.world, walls);
    }
    function drop() {
      measure(); setWalls();
      els.forEach(function (o, i) {
        if (o.body) C.remove(engine.world, o.body);
        var w = o.el.offsetWidth, h = o.el.offsetHeight;
        var x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, w / 2 + Math.random() * (W - w)));
        var y = -h - i * 70 - Math.random() * 40;
        o.body = o.round ? B.circle(x, y, w / 2, { restitution: .55, friction: .3, density: .002 })
                         : B.rectangle(x, y, w, h, { chamfer: { radius: h / 2 - 1 }, restitution: .45, friction: .35, frictionAir: .012, density: .0016 });
        Body.setAngle(o.body, (Math.random() - .5) * 0.9);
        Body.setAngularVelocity(o.body, (Math.random() - .5) * 0.06);
        o.w = w; o.h = h; C.add(engine.world, o.body);
      });
    }
    // pointer drag (own handling so page scroll still works on touch)
    var mouse = M.Mouse.create(box), mc = M.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: .18, damping: .12, render: { visible: false } } });
    try { mouse.element.removeEventListener('mousewheel', mouse.mousewheel); mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel); mouse.element.removeEventListener('wheel', mouse.mousewheel); } catch (e) {}
    C.add(engine.world, mc);
    M.Events.on(mc, 'startdrag', function () { box.classList.add('grab'); });
    M.Events.on(mc, 'enddrag', function () { box.classList.remove('grab'); });
    // keep the dragged pill inside the pit
    M.Events.on(engine, 'afterUpdate', function () {
      els.forEach(function (o) {
        var b = o.body; if (!b) return;
        var p = b.position, nx = Math.max(o.h / 2, Math.min(W - o.h / 2, p.x)), ny = Math.min(H - o.h / 2, p.y);
        if (nx !== p.x || ny !== p.y) { Body.setPosition(b, { x: nx, y: ny }); }
        o.el.style.transform = 'translate(' + (b.position.x - o.w / 2) + 'px,' + (b.position.y - o.h / 2) + 'px) rotate(' + b.angle + 'rad)';
      });
    });
    function start() { if (started) return; started = true; drop(); R.run(runner, engine); }
    hint.querySelector('button').addEventListener('click', function () { if (!started) return start(); drop(); });
    addEventListener('resize', function () { if (!started) return; var ow = W; measure(); setWalls(); if (Math.abs(ow - W) > 40) drop(); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { start(); io.disconnect(); } }, { threshold: .35 });
      io.observe(box);
    } else start();
    // pause physics off-screen
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (!started) return; runner.enabled = es[0].isIntersecting; }).observe(box);
  }
})();

/* diagrams: stagger children as they reveal */
(function () {
  document.querySelectorAll('.dg').forEach(function (d) {
    var kids = d.querySelectorAll('.node, .link, .brief > div, .lane, .tl-pt');
    kids.forEach(function (k, i) {
      if (k.classList.contains('lane')) { k.querySelectorAll('.sm-card').forEach(function (c, j) { c.style.transitionDelay = (i * 120 + j * 70) + 'ms'; }); }
      else k.style.transitionDelay = (i * 90) + 'ms';
    });
  });
})();

/* showreel: play when visible, pause when not; full-screen button */
(function () {
  var v = document.getElementById('reel'); if (!v) return;
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (!reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }, { threshold: .35 }).observe(v);
  } else { v.controls = true; }
  var b = document.querySelector('.reel-btn');
  b.addEventListener('click', function () {
    v.controls = true; v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {});
    var fs = v.requestFullscreen || v.webkitRequestFullscreen || v.webkitEnterFullscreen;
    if (fs) { try { fs.call(v); } catch (e) {} }
  });
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement) v.controls = false; });
  /* chapters */
  var chips = document.querySelectorAll('.reel-chap button'), bar = document.querySelector('.reel-prog i');
  var segStart = [0, 2.1, 5.4, 7.7, 10.8, 13.7, 15.8, 17.9, 20.6, 22.7, 24.8, 27.5, 29.6, 31.9];
  var segChip  = [0, 1, 2, 3, 3, 4, 5, 3, 6, 7, 3, 7, 3, 6];
  chips.forEach(function (c) { c.addEventListener('click', function () {
    v.currentTime = +c.getAttribute('data-t'); var p = v.play(); if (p && p.catch) p.catch(function () {}); }); });
  var cur = -2;
  v.addEventListener('timeupdate', function () {
    var t = v.currentTime, k = 0; for (var i = 0; i < segStart.length; i++) if (t >= segStart[i]) k = i;
    var ci = segChip[k]; if (ci !== cur) { cur = ci; chips.forEach(function (c, n) { c.classList.toggle('on', n === ci); }); }
    if (bar && v.duration) bar.style.width = (t / v.duration * 100) + '%';
  });
})();

/* impact numbers: count up when the band scrolls into view */
(function () {
  var band = document.querySelector('.stats'); if (!band) return;
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce || !('IntersectionObserver' in window)) return;
  var els = band.querySelectorAll('[data-count]');
  els.forEach(function (e) { e.textContent = '0'; });
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return; io.disconnect(); band.classList.add('counting');
    els.forEach(function (e, k) {
      var to = +e.getAttribute('data-count'), t0 = null, dur = 1300 + k * 150;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), v = 1 - Math.pow(1 - p, 3); e.textContent = Math.round(to * v); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }, { threshold: .4 });
  io.observe(band);
})();

/* hotspots: tap to toggle, keep notes inside the frame, hint in caption */
(function () {
  document.querySelectorAll('.hs-wrap').forEach(function (fr) {
    var cap = fr.closest('figure') && fr.closest('figure').querySelector('figcaption');
    if (cap && !cap.querySelector('.hs-hint')) { var h = document.createElement('span'); h.className = 'hs-hint'; h.textContent = ' Hover or tap the numbered dots for notes.'; cap.appendChild(h); }
    var spots = fr.querySelectorAll('.hs');
    spots.forEach(function (s) {
      var x = parseFloat(s.style.getPropertyValue('--x')), y = parseFloat(s.style.getPropertyValue('--y'));
      if (y < 22) s.classList.add('low'); if (x > 72) s.classList.add('r'); if (x < 22) s.classList.add('l');
      var b = s.querySelector('button');
      b.addEventListener('click', function (e) {
        e.stopPropagation(); var open = !s.classList.contains('open');
        spots.forEach(function (o) { o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
        if (open) { s.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
      });
    });
    document.addEventListener('click', function (e) { if (!fr.contains(e.target)) spots.forEach(function (o) { o.classList.remove('open'); }); });
  });
})();

/* PDF download inside the Claude viewer (plain links are blocked there); elsewhere the normal link works */
(function () {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  window.claude.use('downloads').then(function (dl) {
    if (!dl) return;
    document.querySelectorAll('a[href$=".pdf"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        fetch(a.getAttribute('href')).then(function (r) { return r.blob(); }).then(function (blob) {
          return dl.save({ filename: a.getAttribute('download') || 'Nitzan-Levy-Resume.pdf', data: blob });
        }).catch(function () {});
      });
    });
  }).catch(function () {});
})();
