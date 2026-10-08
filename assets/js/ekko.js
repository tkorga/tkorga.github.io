/* Ekko: a small scripted site assistant. No network calls, no AI model.
   It matches the visitor's words against the facts below and replies from them. */
(() => {
  'use strict';

  const root = document.querySelector('[data-ekko]');
  if (!root) return;

  const EMAIL = 'korgat@whitman.edu';
  const log = root.querySelector('[data-ekko-log]');
  const form = root.querySelector('[data-ekko-form]');
  const input = root.querySelector('[data-ekko-input]');
  const chips = root.querySelector('[data-ekko-chips]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* A reply is a list of parts: plain strings, or { href, text } links. */
  const mail = (text = 'korgat@whitman.edu', subject = 'Hello from your portfolio', body = '') =>
    ({ href: `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${body ? '&body=' + encodeURIComponent(body) : ''}`, text });

  const INTENTS = [
    {
      id: 'greeting',
      weight: 1,
      keys: [/\b(hi|hello|hey|yo|howdy|sup)\b/, /good (morning|afternoon|evening)/],
      reply: () => ["Hi! I'm Ekko, Tigistu's agent on this site. Ask me about their projects, experience, skills or how to reach them."],
    },
    {
      id: 'identity',
      keys: [/who are you/, /what are you/, /\bekko\b/, /are you (an? )?(ai|bot|robot|real|human|chatgpt|llm)/, /how do you work/],
      reply: () => ["I'm Ekko, a little robot who greets visitors for Tigistu. I'm a simple scripted assistant, not a language model, so I only know what's on this site. For anything else I'll point you to Tigistu directly."],
    },
    {
      id: 'availability',
      keys: [/intern/, /\bhire\b|hiring|\bjob\b|opportunit|available|availability|open to|recruit|looking for|\bwork with\b|full.?time|part.?time|\bstart\b/, /research (position|role|opportunit|assistant)/, /salary|\bpay\b|compensation|\brate\b|relocat|visa|sponsor|start date|when can/],
      reply: () => [
        'Tigistu is open to software engineering internships and research opportunities. Start dates, location and pay are for Tigistu to discuss, so the best step is an email: ',
        mail(undefined, 'Internship / research opportunity'), '.',
      ],
    },
    {
      id: 'research',
      keys: [/research/, /wirfs/, /user stud/, /\bhci\b|human.computer/, /\baudio\b|archive/],
      reply: () => ['As an undergraduate research assistant in the Wirfs-Brock Lab at Whitman (Dec 2024 to Jun 2025), Tigistu ran user studies with 91 participants on how people organize and use personal audio archives. They helped design the survey and interview protocols, and analyzed 82 hours of audio with Python and data visualization.'],
    },
    {
      id: 'aemiro',
      keys: [/aemiro/, /vector/, /personali[sz]ed search/, /\bmongo/],
      reply: () => ['Aemiro is a team-built full-stack app (Node.js, MongoDB, JavaScript, Python, Dec 2025 to May 2026) that connects an AI backend to the interface. Tigistu designed the data pipeline that stores and retrieves vectors, so search results can be fast and personalized. ', { href: '#projects', text: 'See it in Work' }, '.'],
    },
    {
      id: 'malloc',
      keys: [/malloc/, /memalloc/, /\bheap\b/, /allocator/, /calloc|realloc/],
      reply: () => ['memalloc is Tigistu\'s own malloc, calloc, realloc and free in C. It manages the heap through sbrk with a header in front of every block, reuses freed blocks, and builds as a shared library you can load with LD_PRELOAD. ', { href: '#projects', text: 'See it in Work' }, '.'],
    },
    {
      id: 'billo',
      keys: [/billo/, /nonogram/, /stripe/, /puzzle/, /picross/],
      reply: () => ['BILLO is a team-built nonogram game (Flask, React, Stripe API, Feb to May 2025) with real-time payments for in-game purchases. There is a ', { href: 'work/billo/', text: 'case study with a playable mini puzzle' }, '.'],
    },
    {
      id: 'shell',
      keys: [/\blsh\b/, /shell/, /fork|exec/, /unix/],
      reply: () => ['lsh is a small Unix shell in C: a read, parse, execute loop that runs programs with fork, execvp and waitpid. The built-ins (cd, help, exit) live in a table of function pointers, so adding one takes a line.'],
    },
    {
      id: 'archive',
      keys: [/b.?tree/, /assembler/, /nasa|neows/, /cache lab|cache/, /bomb|attack lab|exploit|gdb/, /shogi/],
      reply: () => ['The archive in ', { href: '#projects', text: 'Work' }, ' covers a generic B-tree in C++, a K&S assembler in Python, a NASA near-Earth-object data project, a cache locality lab, reverse-engineering and exploit labs, and a test-first Animal Shogi engine in Java.'],
    },
    {
      id: 'projects',
      weight: 1,
      keys: [/project/, /\bwork\b/, /built|build|made|portfolio|show me|demo/],
      reply: () => ['Four featured projects: Aemiro (AI-backed search app), memalloc (a malloc in C), BILLO (a nonogram game with payments) and lsh (a Unix shell). Ask me about any of them by name, or ', { href: '#projects', text: 'jump to Work' }, '.'],
    },
    {
      id: 'experience',
      keys: [/experience/, /\bwork(ed)? (at|for)\b/, /resume|r.sum.|\bcv\b/, /background/, /roles?\b/, /codepath/, /\braw\b/, /communications/],
      reply: () => ['Roles so far: Student Intern in Whitman\'s Communications & Technology Office (2025), Undergraduate Research Assistant in the Wirfs-Brock Lab (Dec 2024 to Jun 2025), CodePath TIP102 interview prep (Feb to May 2025), and Software Engineering Intern at The R.A.W. Platform in Houston (summer 2024). Details are in ', { href: '#experience', text: 'Path' }, '. For a résumé, ask Tigistu by email.'],
    },
    {
      id: 'skills',
      keys: [/skill/, /stack/, /language/, /\bpython\b|\bjava\b|\bjavascript\b|\bc\+\+|\bc\b|\bsql\b/, /react|node|flask/, /tools?\b|tech/, /good at|know how/],
      reply: () => ['Languages: Python, JavaScript, C, C++, Java, SQL. Web: React, Node.js, Flask, REST APIs. Data: pandas, NumPy, scikit-learn, MongoDB, PostgreSQL. Systems: x86-64, GDB, processes, virtual memory and caches. See ', { href: '#skills', text: 'Skills' }, '.'],
    },
    {
      id: 'education',
      keys: [/school|college|universit|whitman/, /degree|major|study|student/, /graduat|class of|2027/, /course|class(es)?\b/],
      reply: () => ['Tigistu is finishing a B.A. in Computer Science at Whitman College (expected May 2027). Coursework includes data structures and algorithms, algorithm design, computer systems, software design, applied AI/ML, human-computer interaction and theory of computation.'],
    },
    {
      id: 'about',
      weight: 1,
      keys: [/about/, /tigistu/, /tell me/, /introduc/, /who (is|\'s)/],
      reply: () => ['Tigistu Korga is a computer science student at Whitman College in Walla Walla, WA. They build at both ends of the stack: memory allocators and shells in C, and full-stack AI-powered apps with React, Node.js and Python. ', { href: '#about', text: 'Read more in About' }, '.'],
    },
    {
      id: 'contact',
      keys: [/contact/, /email|e-mail|mail\b/, /reach|get in touch|talk to|message/, /github/, /linkedin/, /phone|call/],
      reply: () => ['Email is quickest: ', mail(), '. Also on ', { href: 'https://github.com/tkorga', text: 'GitHub' }, ' and ', { href: 'https://www.linkedin.com/in/tigistu', text: 'LinkedIn' }, '.'],
    },
    {
      id: 'location',
      keys: [/where/, /location|based|live|city|walla/, /time ?zone|\btime\b/],
      reply: () => ['Tigistu is based in Walla Walla, Washington (Pacific Time).'],
    },
    {
      id: 'thanks',
      keys: [/\bthanks?\b|thank you|\bty\b|appreciate/, /\bbye\b|goodbye|see you|cheers/],
      reply: () => ['Anytime! If you want to reach Tigistu, the email is ', mail(), '.'],
    },
  ];

  const fallback = question => [
    "I don't know that one. I only know what's on this site. Try projects, experience, skills or contact. Or send your question straight to Tigistu: ",
    mail('email this question', 'Question from your portfolio', question),
    '.',
  ];

  const answer = question => {
    const q = question.toLowerCase().replace(/[^\w\s+.'-]/g, ' ');
    let best = null;
    let bestScore = 0;
    for (const intent of INTENTS) {
      const score = intent.keys.reduce((n, re) => n + (re.test(q) ? 1 : 0), 0) * (intent.weight || 2);
      if (score > bestScore) { best = intent; bestScore = score; }
    }
    return best ? best.reply() : fallback(question);
  };

  /* ---------- Rendering (user text is only ever set via textContent) ---------- */
  const addMessage = (who, parts) => {
    const li = document.createElement('li');
    li.className = 'msg msg-' + who;
    const bubble = document.createElement('p');
    parts.forEach(part => {
      if (typeof part === 'string') {
        bubble.appendChild(document.createTextNode(part));
      } else {
        const a = document.createElement('a');
        a.href = part.href;
        a.textContent = part.text;
        if (/^https?:/.test(part.href)) { a.target = '_blank'; a.rel = 'noopener'; }
        bubble.appendChild(a);
      }
    });
    li.appendChild(bubble);
    log.appendChild(li);
    log.scrollTo({ top: log.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
    return li;
  };

  const ask = question => {
    const text = question.trim().slice(0, 300);
    if (!text) return;
    addMessage('you', [text]);
    const typing = addMessage('ekko', ['…']);
    typing.classList.add('is-typing');
    setTimeout(() => {
      typing.remove();
      addMessage('ekko', answer(text));
      document.dispatchEvent(new CustomEvent('ekko:reply'));
    }, reduced ? 0 : 550);
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    ask(input.value);
    input.value = '';
    input.focus();
  });

  chips.addEventListener('click', e => {
    const b = e.target.closest('button[data-q]');
    if (b) ask(b.dataset.q);
  });

  addMessage('ekko', ["Hi, I'm Ekko, Tigistu's agent for this site. Ask me about their work, experience or availability, or tap a question below."]);
})();
