// RBH Studios — minimal interactions
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  // Back-to-top visibility
  const toTop = $('#toTop');
  const onScroll = () => toTop.classList.toggle('show', scrollY > 700);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile menu
  const burger = $('#burger'), menu = $('#mobileMenu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // Magnetic buttons
  if (matchMedia('(pointer:fine)').matches) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.1}px,${(e.clientY - r.top - r.height / 2) * 0.16}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  // Cursor aura + card tilt (fine pointers only, no motion when reduced motion is set)
  const fine = matchMedia('(pointer:fine)').matches;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (fine && !calm) {
    const aura = $('#aura');
    let ax = innerWidth / 2, ay = 220, tx = ax, ty = ay, shown = false;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; aura.classList.add('on'); }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { shown = false; aura.classList.remove('on'); });
    (function loop() {
      ax += (tx - ax) * 0.12; ay += (ty - ay) * 0.12;
      aura.style.translate = `${ax}px ${ay}px`;
      requestAnimationFrame(loop);
    })();
    // Aura swells over anything interactive
    $$('a, button, .creed__item, .facts li, input, textarea').forEach(el => {
      el.addEventListener('pointerenter', () => aura.classList.add('big'));
      el.addEventListener('pointerleave', () => aura.classList.remove('big'));
    });

    // 3D tilt on the principle cards
    $$('.creed__item').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Hero headline: split into letters so each one can bounce on hover
  function splitChars(el) {
    [...el.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        if (/^\s*$/.test(node.textContent) && /\n/.test(node.textContent)) { node.remove(); return; }
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          [...part].forEach(ch => {
            const s = document.createElement('span');
            s.className = 'ch'; s.textContent = ch;
            frag.appendChild(s);
          });
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) { splitChars(node); }
    });
  }
  if (!calm) $$('.mast__title > span').forEach(splitChars);

  // Contact form (opens the visitor's mail app addressed to us)
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, note = $('#formNote');
    if (!f.checkValidity()) { note.textContent = 'Please add your name, a valid email and a few lines.'; note.style.color = '#d98a8a'; return; }
    const d = new FormData(f);
    location.href = `mailto:hello@rbhstudios.com?subject=${encodeURIComponent('RBH Studios — ' + d.get('name'))}&body=${encodeURIComponent(d.get('message') + '\n\n— ' + d.get('name') + ' (' + d.get('email') + ')')}`;
    note.textContent = 'Your mail app should open now. We reply to everything. Thank you for writing.';
    note.style.color = '';
    f.reset();
  });
})();
