/* The little guy in the About section: eyes follow the pointer, click to make him jump and talk. */
(() => {
  'use strict';

  const root = document.querySelector('[data-guy]');
  if (!root) return;

  const btn = root.querySelector('.guy');
  const bubble = root.querySelector('[data-guy-bubble]');
  const pupils = root.querySelector('.guy-pupils');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lines = [
    "Hi! I'm Ekko, Tigistu's agent.",
    'Ask me about malloc. I have opinions.',
    'Tigistu is open to internships & research!',
    'This whole site is hand-written HTML.',
    'Ask me something in the chat!',
    'I run on 0 frameworks and 1 antenna.',
  ];
  let i = 0;

  const say = text => {
    bubble.classList.remove('is-in');
    // restart the pop animation
    void bubble.offsetWidth;
    bubble.textContent = text;
    bubble.classList.add('is-in');
  };

  btn.addEventListener('click', () => {
    i = (i + 1) % lines.length;
    say(lines[i]);
    btn.classList.remove('is-jumping');
    void btn.offsetWidth;
    btn.classList.add('is-jumping');
  });
  btn.addEventListener('animationend', e => {
    if (e.animationName === 'guy-jump') btn.classList.remove('is-jumping');
  });

  // Jump when Ekko answers in the chat
  document.addEventListener('ekko:reply', () => {
    btn.classList.remove('is-jumping');
    void btn.offsetWidth;
    btn.classList.add('is-jumping');
  });

  // Eyes follow the pointer (skipped for reduced motion)
  if (!reduced && pupils) {
    let frame = 0;
    let px = 0, py = 0;
    const MAX = 3.2;
    const look = () => {
      frame = 0;
      const r = btn.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height * 0.32);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 220);
      pupils.style.transform = `translate(${(dx / d) * MAX * k}px, ${(dy / d) * MAX * k}px)`;
    };
    window.addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY;
      if (!frame) frame = requestAnimationFrame(look);
    }, { passive: true });
  }
})();
