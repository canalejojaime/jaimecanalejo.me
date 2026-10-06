(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lang = function () { return root.lang === 'es' ? 'es' : 'en'; };

  /* ---------- Language toggle ---------- */
  var langListeners = [];
  document.getElementById('lang').addEventListener('click', function () {
    root.lang = lang() === 'es' ? 'en' : 'es';
    try { localStorage.setItem('lang', root.lang); } catch (e) {}
    langListeners.forEach(function (fn) { fn(); });
  });

  /* ---------- Footer year + Málaga clock ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
  var clock = document.getElementById('clock');
  function tick() {
    try {
      var t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date());
      clock.textContent = 'AGP ' + t;
    } catch (e) { clock.textContent = 'AGP'; }
  }
  tick(); setInterval(tick, 15000);

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Active section: nav + rail ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var navLinks = document.querySelectorAll('.bar-nav a, .rail a');
  var current = 0;
  function setActive(id) {
    navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
    document.body.classList.toggle('on-light', id === 'contact');
  }
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          current = slides.indexOf(e.target);
          setActive(e.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    slides.forEach(function (s) { so.observe(s); });
  }

  /* ---------- Keyboard slide navigation ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
    var dir = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') dir = 1;
    if (e.key === 'ArrowUp' || e.key === 'PageUp') dir = -1;
    if (!dir) return;
    var next = slides[Math.max(0, Math.min(slides.length - 1, current + dir))];
    // Let tall slides scroll naturally until their edge is reached
    var r = slides[current].getBoundingClientRect();
    if (dir === 1 && r.bottom > window.innerHeight + 4) return;
    if (dir === -1 && r.top < -4) return;
    e.preventDefault();
    next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Hero flow field ---------- */
  var canvas = document.getElementById('flow');
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1, lines = [], t = 0, running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = W < 700 ? 16 : 28;
    lines = [];
    for (var i = 0; i < n; i++) {
      lines.push({
        y: H * (0.18 + 0.7 * (i / n)),
        amp: 18 + Math.random() * 46,
        freq: 0.0025 + Math.random() * 0.003,
        speed: 0.25 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        hot: i % 7 === 3
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      ctx.beginPath();
      for (var x = -10; x <= W + 10; x += 12) {
        var y = L.y
          + Math.sin(x * L.freq + t * L.speed + L.phase) * L.amp
          + Math.sin(x * L.freq * 2.3 - t * 0.6 + i) * (L.amp * 0.35);
        if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = L.hot ? 'rgba(200,241,53,0.55)' : 'rgba(237,236,228,0.07)';
      ctx.lineWidth = L.hot ? 1.4 : 1;
      ctx.stroke();
    }
  }

  function loop() {
    if (!running) return;
    t += 0.012;
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  if (reduceMotion) { draw(); }
  else {
    // Pause the animation when the hero is off-screen
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; loop(); }
      if (!vis) running = false;
    }).observe(canvas);
    loop();
  }

})();
