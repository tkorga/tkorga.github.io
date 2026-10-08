/* Tigistu Korga — portfolio interactions. No dependencies. */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  const themeBtn = $('[data-theme-toggle]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches;
  const syncThemeBtn = () => {
    themeBtn.setAttribute('aria-pressed', String(isDark()));
    $$('meta[name="theme-color"]').forEach(m => m.setAttribute('content', isDark() ? '#0f0f0d' : '#f3f0e8'));
  };
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* storage unavailable */ }
    syncThemeBtn();
  });
  systemDark.addEventListener('change', syncThemeBtn);
  syncThemeBtn();

  /* ---------- Header: scrolled state ---------- */
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  const navToggle = $('[data-nav-toggle]');
  const navList = $('[data-nav-list]');
  const setNav = open => {
    navToggle.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('is-open', open);
  };
  navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
  navList.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navList.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
  });

  /* ---------- Active section in nav ---------- */
  const navLinks = $$('.nav-list a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => {
        if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Local clock (Pacific Time) ---------- */
  const clock = $('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- Year ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Copy email ---------- */
  const copyBtn = $('[data-copy]');
  if (copyBtn && navigator.clipboard) {
    const label = $('[data-copy-label]', copyBtn);
    const status = $('[data-copy-status]');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        label.textContent = 'Copied ✓';
        status.textContent = 'Email address copied to clipboard';
      } catch (e) {
        label.textContent = 'Press ⌘/Ctrl+C';
      }
      setTimeout(() => { label.textContent = 'Copy'; status.textContent = ''; }, 2200);
    });
  } else if (copyBtn) {
    copyBtn.hidden = true;
  }

  /* ---------- Hexdump ---------- */
  const dump = $('[data-hexdump]');
  if (dump) {
    const text = "Hi! I'm Tigistu\nI build things,\nbit by bit. :-)\n";
    const bytes = Array.from(new TextEncoder().encode(text));
    const hex = n => n.toString(16).padStart(2, '0');
    const printable = b => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.');
    const narrow = window.matchMedia('(max-width: 560px)');
    let timers = [];

    const render = () => {
      timers.forEach(clearTimeout);
      timers = [];
      const perRow = narrow.matches ? 8 : 16;
      const frag = document.createDocumentFragment();

      for (let off = 0; off < bytes.length; off += perRow) {
        const row = document.createElement('div');
        row.className = 'hx-row';

        const offset = document.createElement('span');
        offset.className = 'hx-off';
        offset.textContent = off.toString(16).padStart(8, '0') + ':';

        const hexCol = document.createElement('span');
        hexCol.className = 'hx-bytes';
        const asciiCol = document.createElement('span');
        asciiCol.className = 'hx-ascii';

        for (let i = off; i < off + perRow; i += 2) {
          const pair = document.createElement('span');
          pair.className = 'hx-pair';
          for (let j = i; j < i + 2; j++) {
            const b = document.createElement('span');
            if (j < bytes.length) {
              b.className = 'hx-b';
              b.dataset.i = j;
              b.textContent = hex(bytes[j]);
            } else {
              b.textContent = '  ';
            }
            pair.appendChild(b);
          }
          hexCol.appendChild(pair);
        }

        for (let j = off; j < Math.min(off + perRow, bytes.length); j++) {
          const c = document.createElement('span');
          c.className = 'hx-c';
          c.dataset.i = j;
          c.textContent = printable(bytes[j]);
          asciiCol.appendChild(c);
        }

        row.append(offset, hexCol, asciiCol);
        frag.appendChild(row);
      }

      dump.replaceChildren(frag);
      if (!reducedMotion) scramble();
    };

    // Each byte shows random hex for a moment, then settles on its real value.
    const scramble = () => {
      $$('.hx-b', dump).forEach(el => {
        const real = el.textContent;
        const i = Number(el.dataset.i);
        el.classList.add('is-scramble');
        let n = 0;
        const step = () => {
          if (n++ < 6) {
            el.textContent = hex(Math.floor(Math.random() * 256));
            timers.push(setTimeout(step, 45));
          } else {
            el.textContent = real;
            el.classList.remove('is-scramble');
          }
        };
        timers.push(setTimeout(step, 350 + i * 18));
      });
    };

    // Hovering a byte lights up its ASCII character, and vice versa.
    let lit = [];
    const light = i => {
      lit.forEach(el => el.classList.remove('is-on'));
      lit = i == null ? [] : $$(`[data-i="${i}"]`, dump);
      lit.forEach(el => el.classList.add('is-on'));
    };
    dump.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-i]');
      light(t ? t.dataset.i : null);
    });
    dump.addEventListener('pointerleave', () => light(null));

    narrow.addEventListener('change', render);
    render();
  }
})();
