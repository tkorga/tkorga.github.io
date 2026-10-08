/* Mini nonogram demo for the BILLO case study. No dependencies. */
(() => {
  'use strict';

  const root = document.querySelector('[data-nono]');
  if (!root) return;

  // A heart. 1 = filled in the solution.
  const SOLUTION = [
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ];
  const N = SOLUTION.length;
  const EMPTY = 0, FILLED = 1, MARKED = 2;
  const STATE_LABEL = ['empty', 'filled', 'marked empty'];

  const board = root.querySelector('[data-nono-board]');
  const status = root.querySelector('[data-nono-status]');
  const reset = root.querySelector('[data-nono-reset]');
  let state = SOLUTION.map(row => row.map(() => EMPTY));

  // Lengths of consecutive runs of 1s in a line, e.g. [1,1,0,1] -> [2,1]
  const runs = line => {
    const out = [];
    let n = 0;
    line.forEach(v => { if (v) n++; else if (n) { out.push(n); n = 0; } });
    if (n) out.push(n);
    return out.length ? out : [0];
  };
  const rowClues = SOLUTION.map(runs);
  const colClues = SOLUTION[0].map((_, c) => runs(SOLUTION.map(row => row[c])));

  const cells = [];
  const clue = (cls, nums, label) => {
    const el = document.createElement('span');
    el.className = 'clue ' + cls;
    el.innerHTML = nums.map(n => `<b>${n}</b>`).join('');
    el.setAttribute('aria-label', label + ': ' + nums.join(', '));
    return el;
  };

  const frag = document.createDocumentFragment();
  frag.appendChild(Object.assign(document.createElement('span'), { className: 'clue corner', ariaHidden: 'true' }));
  colClues.forEach((c, i) => frag.appendChild(clue('col', c, `Column ${i + 1}`)));

  for (let r = 0; r < N; r++) {
    frag.appendChild(clue('row', rowClues[r], `Row ${r + 1}`));
    for (let c = 0; c < N; c++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cell';
      b.dataset.r = r;
      b.dataset.c = c;
      cells.push(b);
      frag.appendChild(b);
    }
  }
  board.replaceChildren(frag);

  const paint = (b) => {
    const s = state[b.dataset.r][b.dataset.c];
    b.dataset.s = s;
    b.setAttribute('aria-label', `Row ${+b.dataset.r + 1}, column ${+b.dataset.c + 1}, ${STATE_LABEL[s]}`);
  };

  const solved = () => SOLUTION.every((row, r) => row.every((v, c) => (state[r][c] === FILLED) === (v === 1)));

  const update = () => {
    cells.forEach(paint);
    const done = solved();
    root.classList.toggle('is-solved', done);
    if (done) status.textContent = 'Solved! That is a heart.';
    else status.textContent = 'Fill in the picture using the clues.';
    cells.forEach(b => { b.disabled = false; });
  };

  board.addEventListener('click', e => {
    const b = e.target.closest('.cell');
    if (!b) return;
    const { r, c } = b.dataset;
    state[r][c] = (state[r][c] + 1) % 3;
    update();
  });

  reset.addEventListener('click', () => {
    state = SOLUTION.map(row => row.map(() => EMPTY));
    update();
  });

  update();
})();
