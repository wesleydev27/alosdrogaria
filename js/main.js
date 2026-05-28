// ─── Relógio e status da loja ───────────────────────────────────────────────

function fmt(n) { return String(n).padStart(2, '0'); }

function horariosDoDia(d) {
  return d === 0 ? [6, 20] : [6, 22]; // domingo fecha mais cedo
}

function updateClock() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const day = now.getDay();
  const [abre, fecha] = horariosDoDia(day);
  const aberta = h >= abre && h < fecha;

  // Relógios na página
  document.getElementById('clock').textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
  const dpClock = document.getElementById('dp-clock');
  if (dpClock) dpClock.textContent = `${fmt(h)}:${fmt(m)}`;

  // Tag dia / noite no hero
  const tag = document.getElementById('ht-label');
  if (tag) tag.textContent = `${h >= 6 && h < 18 ? 'Dia' : 'Noite'} · ${fmt(h)}:${fmt(m)}`;

  // Badge e texto de status
  const statusEl   = document.getElementById('hero-status');
  const statusText = document.getElementById('status-text');
  const liveBadge  = document.getElementById('live-badge');
  const liveText   = document.getElementById('live-text');

  if (aberta) {
    statusEl.classList.remove('closed');
    liveBadge.classList.remove('closed');
    statusText.textContent = `Aberta agora · até ${fmt(fecha)}h`;
    liveText.textContent   = `Aberta agora · até ${fmt(fecha)}h`;
  } else {
    statusEl.classList.add('closed');
    liveBadge.classList.add('closed');
    const nextDay = h < abre ? day : (day + 1) % 7;
    const dias    = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
    const quando  = h < abre ? 'hoje' : nextDay === (day + 1) % 7 ? 'amanhã' : dias[nextDay];
    statusText.textContent = `Fechada agora · abre ${quando} às 06h`;
    liveText.textContent   = 'Fechada · abre às 06h';
  }

  // Destaca o dia atual na tabela de horários
  document.querySelectorAll('.day-row').forEach(r => {
    r.classList.toggle('today', parseInt(r.dataset.day) === day);
  });
}

updateClock();
setInterval(updateClock, 1000);


// ─── Tema claro / escuro ─────────────────────────────────────────────────────

(function () {
  const root      = document.documentElement;
  const themeBtn  = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'alos-theme';

  // Entre 6h e 18h é dia; fora disso, noite
  function autoTheme() {
    const h = new Date().getHours();
    return h >= 6 && h < 18 ? 'light' : 'dark';
  }

  function setTheme(t, manual = true) {
    root.setAttribute('data-theme', t);
    if (manual) localStorage.setItem(STORAGE_KEY, t);
    updateClock(); // atualiza badge dia/noite
  }

  // Aplica tema salvo ou automático
  setTheme(localStorage.getItem(STORAGE_KEY) || autoTheme(), false);

  // Botão de alternância
  themeBtn.addEventListener('click', () => {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // Reavalia a cada 5 min se o usuário não escolheu manualmente
  setInterval(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setTheme(autoTheme(), false);
  }, 5 * 60 * 1000);
})();


// ─── Parallax do hero com o mouse (só em dispositivos com hover) ─────────────

(function () {
  const heroVis = document.querySelector('.hero-visual');
  if (!heroVis || !window.matchMedia('(hover: hover)').matches) return;

  const frame = heroVis.querySelector('.hero-frame');
  const badge = heroVis.querySelector('.hero-badge');
  const quote = heroVis.querySelector('.hero-quote');

  heroVis.addEventListener('mousemove', (e) => {
    const r = heroVis.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    frame.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
    badge.style.transform = `translate(${x * 18}px,  ${y * 18}px)`;
    quote.style.transform = `translate(${x * 22}px,  ${y * 22}px)`;
  });

  heroVis.addEventListener('mouseleave', () => {
    frame.style.transform = '';
    badge.style.transform = '';
    quote.style.transform = '';
  });
})();


// ─── Menu mobile ─────────────────────────────────────────────────────────────

(function () {
  const burger   = document.getElementById('nav-burger');
  const navLinks = document.querySelector('.nav-links');
  const scrim    = document.createElement('div');
  scrim.className = 'nav-scrim';
  document.body.appendChild(scrim);

  function closeMenu() {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
    scrim.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    burger.classList.add('open');
    navLinks.classList.add('open');
    scrim.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  burger.addEventListener('click', () => burger.classList.contains('open') ? closeMenu() : openMenu());
  scrim.addEventListener('click', closeMenu);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
})();


// ─── Botão voltar ao topo ────────────────────────────────────────────────────

(function () {
  const fab = document.getElementById('fab-top');
  fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  function update() {
    fab.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


// ─── Navbar: fundo ao rolar + ocultar ao descer ──────────────────────────────

(function () {
  const nav = document.getElementById('nav');
  let lastY = 0, timer = null;

  function update() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 24);

    if (y > 120) {
      if (y > lastY) {
        // Descendo — pequeno delay antes de ocultar
        clearTimeout(timer);
        timer = setTimeout(() => nav.classList.add('nav--hidden'), 300);
      } else {
        // Subindo — aparece imediatamente
        clearTimeout(timer);
        nav.classList.remove('nav--hidden');
      }
    } else {
      clearTimeout(timer);
      nav.classList.remove('nav--hidden');
    }

    lastY = y;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


// ─── Revelar elementos ao entrar na tela ────────────────────────────────────

const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
}, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));


// ─── Marquee infinito ────────────────────────────────────────────────────────

const marquee = document.getElementById('marquee');
marquee.innerHTML += marquee.innerHTML;


// ─── Animação Lottie (entrega) ───────────────────────────────────────────────

(function () {
  const el = document.getElementById('delivery-lottie');
  if (!el || typeof lottie === 'undefined') return;
  lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, path: 'assets/Delivery.json' });
})();


// ─── Contadores animados ─────────────────────────────────────────────────────

(function () {
  function countUp(el) {
    const target   = +el.dataset.count;
    const suffix   = el.dataset.suffix   || '';
    const prefix   = el.dataset.prefix   || '';
    const pad      = +el.dataset.pad     || 0;
    const sep      = el.dataset.thousands || '';
    const duration = 1400;
    const start    = performance.now();

    function format(n) {
      let str = Math.round(n).toString();
      if (pad) str = str.padStart(pad, '0');
      if (sep) str = str.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      return prefix + str + suffix;
    }

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = format((1 - Math.pow(1 - p, 3)) * target); // ease-out cúbico
      if (p < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const els = document.querySelectorAll('.num[data-count]');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.3 });

  // Aguarda a animação de entrada do bloco para a contagem ficar visível
  const stats = document.querySelector('.hero-stats');
  const start = () => els.forEach(el => io.observe(el));
  stats ? stats.addEventListener('animationend', start, { once: true }) : start();
})();


// ─── Máquina de escrever no título do hero ───────────────────────────────────

(function () {
  const accentEl = document.getElementById('tw-accent');
  const restEl   = document.getElementById('tw-rest');
  if (!accentEl || !restEl) return;

  const frases = [
    { accent: 'receita',      rest: ' há gerações.'      },
    { accent: 'porta',        rest: ' com tele-entrega.' },
    { accent: 'farmacêutico', rest: ' no balcão.'        },
    { accent: 'saúde',        rest: ' de bairro.'        },
    { accent: 'cuidado',      rest: ' pelo nome.'        },
  ];

  const DIGITAR  = 130;  // ms por caractere ao escrever
  const APAGAR   = 45;   // ms por caractere ao apagar
  const PAUSA    = 4800; // ms com a frase completa visível
  const INTERVALO = 500; // ms entre apagar e começar a próxima
  const INICIO   = 900;  // ms antes de começar a primeira frase

  let idx = 0;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function escrever(el, texto, vel) {
    for (let i = 0; i <= texto.length; i++) {
      el.textContent = texto.slice(0, i);
      await sleep(vel + (Math.random() * 14 - 7));
    }
  }

  async function apagar(el, vel) {
    const texto = el.textContent;
    for (let i = texto.length; i >= 0; i--) {
      el.textContent = texto.slice(0, i);
      await sleep(vel + (Math.random() * 10 - 5));
    }
  }

  async function loop() {
    await sleep(INICIO);
    while (true) {
      const { accent, rest } = frases[idx];
      await escrever(accentEl, accent, DIGITAR);
      await escrever(restEl, rest, DIGITAR);
      await sleep(PAUSA);
      await apagar(restEl, APAGAR);
      await apagar(accentEl, APAGAR);
      await sleep(INTERVALO);
      idx = (idx + 1) % frases.length;
    }
  }

  loop();
})();


// ─── Crossfade das fotos dos farmacêuticos ───────────────────────────────────

(function () {
  const frame     = document.getElementById('portrait-frame');
  const slides    = frame ? frame.querySelectorAll('.portrait-slide') : [];
  const shine     = frame ? frame.querySelector('.portrait-shine') : null;
  const caption   = document.getElementById('portrait-caption');
  const capSlides = caption ? Array.from(caption.querySelectorAll('.pc-slide')) : [];
  if (slides.length < 2) return;

  // Garante estado inicial: só o primeiro caption visível
  capSlides.forEach((s, i) => { s.style.display = i === 0 ? 'flex' : 'none'; });

  let current     = 0;
  let lastSwitchY = window.scrollY;
  const MIN_SCROLL = 120; // px mínimos para trocar ao rolar

  function dispararBrilho() {
    if (!shine) return;
    shine.classList.remove('shine-play');
    void shine.offsetWidth; // força reflow para reiniciar a transição
    shine.classList.add('shine-play');
    shine.addEventListener('transitionend', () => shine.classList.remove('shine-play'), { once: true });
  }

  function trocarFoto() {
    slides[current].classList.remove('active');
    if (capSlides.length) capSlides[current].style.display = 'none';
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
    if (capSlides.length) capSlides[current].style.display = 'flex';
    dispararBrilho();
    lastSwitchY = window.scrollY;
  }

  // Troca automática a cada 10s
  setInterval(trocarFoto, 10000);

  // Troca ao rolar mais de MIN_SCROLL desde a última troca
  window.addEventListener('scroll', () => {
    if (Math.abs(window.scrollY - lastSwitchY) >= MIN_SCROLL) trocarFoto();
  }, { passive: true });
})();
