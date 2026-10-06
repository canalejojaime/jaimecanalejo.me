(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Language toggle ---------- */
  document.getElementById('lang').addEventListener('click', function () {
    root.lang = root.lang === 'es' ? 'en' : 'es';
    try { localStorage.setItem('lang', root.lang); } catch (e) {}
  });

  /* ---------- Overlay menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');
  var menuLinks = menu.querySelectorAll('a');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLinks.forEach(function (a) { a.tabIndex = open ? 0 : -1; });
    if (open) menuLinks[0].focus();
  }
  setMenu(false);
  menuBtn.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  menuLinks.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Fade-up + divider draw ---------- */
  var animated = document.querySelectorAll('.fade, .divider');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    animated.forEach(function (el) { io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Stat counters ---------- */
  var counters = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, to = Number(el.dataset.to), t0 = performance.now(), dur = 1400;
        (function step(now) {
          var k = clamp((now - t0) / dur, 0, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = '0'; co.observe(c); });
  }

  /* ---------- Services accordion ---------- */
  var accItems = document.querySelectorAll('#acc li');
  accItems.forEach(function (li) {
    li.querySelector('button').addEventListener('click', function () {
      var wasOpen = li.classList.contains('open');
      accItems.forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        li.classList.add('open');
        li.querySelector('button').setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Pinned reel: marquee slides, cards drop in tilted ---------- */
  var reel = document.getElementById('reel');
  var track = document.getElementById('reelTrack');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.reel-card'));
  var tilts = [-7, 6, -4, 8];

  function renderReel() {
    var r = reel.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp(-r.top / (r.height - vh), 0, 1);
    var travel = track.scrollWidth - window.innerWidth * 0.5;
    track.style.transform = 'translate3d(' + (window.innerWidth * 0.15 - p * travel) + 'px,-50%,0)';
    cards.forEach(function (card, i) {
      var t = clamp((p + 0.12 - i * 0.22) / 0.2, 0, 1);
      var e = 1 - Math.pow(1 - t, 3);
      var y = (1 - e) * vh * 1.1;
      var rot = tilts[i] + (1 - e) * 22;
      card.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    });
  }

  if (reduceMotion) {
    cards.forEach(function (card, i) { card.style.transform = 'rotate(' + tilts[i] + 'deg)'; });
  } else {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { renderReel(); ticking = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    renderReel();
  }

  /* ---------- Cartoon leans toward the cursor ---------- */
  var toon = document.getElementById('toon');
  if (toon && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      toon.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 4).toFixed(2) + 'deg)';
    }, { passive: true });
  }

  /* ---------- CTA button follows the cursor a little ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.cta-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var b = btn.getBoundingClientRect();
        var x = (e.clientX - b.left - b.width / 2) * 0.35;
        var y = (e.clientY - b.top - b.height / 2) * 0.35;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(1.1)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }
})();
