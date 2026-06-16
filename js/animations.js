// ============================================================
// ACADEMIA JOTA RUBIO — Animations JS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll reveal con IntersectionObserver ────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback: mostrar todo
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ── Contadores animados para stats ───────────────────────
  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    const isFloat = !Number.isInteger(target);

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = isFloat ? (target * eased).toFixed(1) : Math.floor(target * eased);
      el.textContent = value + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  // ── Parallax suave en hero mockup ────────────────────────
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && window.matchMedia('(min-width: 901px)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      heroVisual.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // ── Smooth circuit pulse: añade nodos pulsantes al SVG ───
  const circuitSvgs = document.querySelectorAll('.circuit-svg');
  circuitSvgs.forEach(svg => {
    const nodes = svg.querySelectorAll('.circuit-node');
    nodes.forEach((node, i) => {
      node.style.animationDelay = `${i * 0.4}s`;
    });
  });

  // ── Typing effect en el hero ─────────────────────────────
  const typingEl = document.getElementById('heroTyping');
  if (typingEl) {
    const phrases = [
      'técnicos se vuelven leyenda',
      'expertos comparten su saber',
      'reparaciones se vuelven magia',
      'diagnósticos se resuelven en segundos',
      'comunidades se vuelven familia'
    ];
    let phraseIdx = 0, charIdx = 0, isDeleting = false;

    function typeLoop() {
      const current = phrases[phraseIdx];
      if (isDeleting) {
        typingEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(typeLoop, 600);
          return;
        }
        setTimeout(typeLoop, 30);
      } else {
        typingEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          isDeleting = true;
          setTimeout(typeLoop, 2200);
          return;
        }
        setTimeout(typeLoop, 60);
      }
    }
    setTimeout(typeLoop, 800);
  }
});
