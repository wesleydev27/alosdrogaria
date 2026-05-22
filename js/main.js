// ============== Theme toggle ==============
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const storedTheme = localStorage.getItem('alos-theme');
// Auto: 6h–18h light, else dark — unless the user has explicitly chosen
function autoTheme() {
  const h = new Date().getHours();
  return (h >= 6 && h < 18) ? 'light' : 'dark';
}
const initialTheme = storedTheme || autoTheme();
root.setAttribute('data-theme', initialTheme);

function setTheme(t, manual = true) {
  root.setAttribute('data-theme', t);
  if (manual) localStorage.setItem('alos-theme', t);
  updateClock();
}
themeBtn.addEventListener('click', () => {
  const cur = root.getAttribute('data-theme');
  setTheme(cur === 'dark' ? 'light' : 'dark', true);
});
// Auto-switch every 5 min IF the user hasn't manually chosen
setInterval(() => {
  if (!localStorage.getItem('alos-theme')) {
    setTheme(autoTheme(), false);
  }
}, 5 * 60 * 1000);

// ============== Hero parallax on mouse ==============
const heroVis = document.querySelector('.hero-visual');
if (heroVis && window.matchMedia('(hover: hover)').matches) {
  const frame = heroVis.querySelector('.hero-frame');
  const badge = heroVis.querySelector('.hero-badge');
  const quote = heroVis.querySelector('.hero-quote');
  heroVis.addEventListener('mousemove', (e) => {
    const r = heroVis.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    frame.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
    badge.style.transform = `translate(${x * 18}px, ${y * 18}px)`;
    quote.style.transform = `translate(${x * 22}px, ${y * 22}px)`;
  });
  heroVis.addEventListener('mouseleave', () => {
    frame.style.transform = '';
    badge.style.transform = '';
    quote.style.transform = '';
  });
}

// ============== Mobile nav burger ==============
const burger = document.getElementById('nav-burger');
const navLinks = document.querySelector('.nav-links');
let scrim = document.createElement('div');
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
burger.addEventListener('click', () => {
  if (burger.classList.contains('open')) closeMenu();
  else openMenu();
});
scrim.addEventListener('click', closeMenu);
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// ============== Back-to-top FAB ==============
const fabTop = document.getElementById('fab-top');
fabTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
const onScrollFab = () => {
  if (window.scrollY > window.innerHeight * 0.6) fabTop.classList.add('visible');
  else fabTop.classList.remove('visible');
};
window.addEventListener('scroll', onScrollFab, { passive: true });
onScrollFab();

// ============== NAV scrolled state ==============
const nav = document.getElementById('nav');
const onScroll = () => {
  if (window.scrollY > 24) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ============== Reveal on scroll (bidirectional) ==============
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in');
    else e.target.classList.remove('in');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ============== Live clock + open/closed ==============
function getHoursForDay(d) {
  if (d === 0) return [6, 20];      // domingo
  return [6, 22];                    // seg-sáb
}
function fmt(n) { return String(n).padStart(2, '0'); }
function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  document.getElementById('clock').textContent = fmt(h) + ':' + fmt(m) + ':' + fmt(s);
  const dpClock = document.getElementById('dp-clock');
  if (dpClock) dpClock.textContent = fmt(h) + ':' + fmt(m);

  // hero time tag (real day/night by hour, independent of theme)
  const isDayTime = h >= 6 && h < 18;
  const tag = document.getElementById('ht-label');
  if (tag) tag.textContent = (isDayTime ? 'Dia' : 'Noite') + ' · ' + fmt(h) + ':' + fmt(m);

  const day = now.getDay();
  const [open, close] = getHoursForDay(day);
  const isOpen = h >= open && h < close;
  const statusEl = document.getElementById('hero-status');
  const statusText = document.getElementById('status-text');
  const liveBadge = document.getElementById('live-badge');
  const liveText = document.getElementById('live-text');

  if (isOpen) {
    statusEl.classList.remove('closed');
    statusText.textContent = 'Aberta agora · até ' + fmt(close) + 'h';
    liveBadge.classList.remove('closed');
    liveText.textContent = 'Aberta agora · até ' + fmt(close) + 'h';
  } else {
    statusEl.classList.add('closed');
    let nextDay = (h < open) ? day : (day + 1) % 7;
    const dayNames = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
    statusText.textContent = 'Fechada agora · abre ' + (h < open ? 'hoje' : nextDay === (day+1)%7 ? 'amanhã' : dayNames[nextDay]) + ' às 06h';
    liveBadge.classList.add('closed');
    liveText.textContent = 'Fechada · abre às 06h';
  }

  // highlight today's row
  const rows = document.querySelectorAll('.day-row');
  rows.forEach(r => {
    const rd = parseInt(r.dataset.day);
    r.classList.toggle('today', rd === day);
  });
}
updateClock();
setInterval(updateClock, 1000);

// ============== Marquee duplicate for seamless loop ==============
const marquee = document.getElementById('marquee');
marquee.innerHTML = marquee.innerHTML + marquee.innerHTML;

// ============== Lottie delivery animation ==============
const lottieContainer = document.getElementById('delivery-lottie');
if (lottieContainer && typeof lottie !== 'undefined') {
  lottie.loadAnimation({
    container: lottieContainer,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'assets/Delivery.json'
  });
}
