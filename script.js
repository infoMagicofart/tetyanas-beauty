// Sample menu for the proposal. Prices to be confirmed with Tetyana.
const SERVICES = [
  { id: 'brow', cat: 'face', name: 'Eyebrow shaping', min: 20, price: 22 },
  { id: 'lip', cat: 'face', name: 'Upper lip', min: 10, price: 12 },
  { id: 'chin', cat: 'face', name: 'Chin', min: 10, price: 12 },
  { id: 'face', cat: 'face', name: 'Full face', min: 30, price: 45 },
  { id: 'under', cat: 'body', name: 'Underarms', min: 15, price: 20 },
  { id: 'half', cat: 'body', name: 'Half legs', min: 30, price: 40 },
  { id: 'legs', cat: 'body', name: 'Full legs', min: 45, price: 65 },
  { id: 'arms', cat: 'body', name: 'Full arms', min: 30, price: 40 },
  { id: 'bik', cat: 'bikini', name: 'Bikini line', min: 20, price: 35 },
  { id: 'bra', cat: 'bikini', name: 'Brazilian', min: 40, price: 60 },
  { id: 'holly', cat: 'bikini', name: 'Hollywood', min: 45, price: 65 },
  { id: 'back', cat: 'men', name: 'Back', min: 30, price: 50 },
  { id: 'chest', cat: 'men', name: 'Chest', min: 30, price: 45 },
  { id: 'mbrow', cat: 'men', name: 'Brow tidy', min: 15, price: 18 },
  { id: 'ritual', cat: 'body', name: 'Silk Skin Ritual', min: 90, price: 120, note: 'Full legs, bikini and underarms' },
];
const PHONE = '16478959209';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const byId = Object.fromEntries(SERVICES.map((s) => [s.id, s]));

/* ---------- mobile menu ---------- */
const burger = $('#burger');
const nav = $('#nav');
const setMenu = (open) => {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- services menu ---------- */
const list = $('#menu-list');
const CAT_IMG = {
  face: ['brows', 'Eyebrow shaping in the studio'],
  body: ['wax-strip', 'A waxing strip on a client\'s leg'],
  bikini: ['legs-knees', 'Smooth skin after waxing'],
  men: ['wax-salon', 'A waxing treatment in a salon'],
};
const swapImg = (img, src, alt) => {
  if (img.getAttribute('src') === src) return;
  img.classList.add('fading');
  setTimeout(() => { img.onload = () => img.classList.remove('fading'); img.src = src; img.alt = alt; }, 250);
};
function showCat(cat) {
  swapImg($('#menu-img'), `assets/stock/${CAT_IMG[cat][0]}.jpg`, CAT_IMG[cat][1]);
  $$('.tabs [role="tab"]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.cat === cat)));
  list.innerHTML = SERVICES.filter((s) => s.cat === cat).map((s) => `
    <li>
      <span class="n">${s.name}</span><span class="dots"></span>
      <span class="d">${s.min} min</span><span class="p">$${s.price}</span>
      ${s.note ? `<span class="add"><small>${s.note}</small></span>` : ''}
    </li>`).join('');
}
$$('.tabs [role="tab"]').forEach((t) => t.addEventListener('click', () => showCat(t.dataset.cat)));
showCat('face');

/* ---------- booking ---------- */
const form = $('#book-form');
const state = { services: new Set(), date: null, time: null };
const steps = $$('.step', form);
const prog = $$('.book-progress li', form);

$('#svc-grid').innerHTML = SERVICES.map((s) => `
  <label class="svc">
    <input type="checkbox" value="${s.id}">
    <span class="n">${s.name}</span><span class="p">$${s.price}</span>
    <span class="d">${s.note ? `${s.note} · ` : ''}${s.min} min</span>
  </label>`).join('');

const totals = () => [...state.services].reduce((a, id) => ({ min: a.min + byId[id].min, price: a.price + byId[id].price }), { min: 0, price: 0 });
const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);
const fmtDate = (d) => d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });

function updateSum() {
  const t = totals();
  const n = state.services.size;
  $('#sum1').innerHTML = n ? `<strong>${n} service${n > 1 ? 's' : ''}</strong> · ${fmtMin(t.min)} · <strong>$${t.price}</strong>` : 'Select at least one service';
  $('[data-step="1"] [data-next]').disabled = !n;
  $('#sum2').innerHTML = state.date && state.time ? `<strong>${fmtDate(state.date)}</strong> at <strong>${state.time}</strong>` : '';
  $('[data-step="2"] [data-next]').disabled = !(state.date && state.time);
}

$('#svc-grid').addEventListener('change', (e) => {
  const id = e.target.value;
  if (e.target.checked) state.services.add(id); else state.services.delete(id);
  updateSum();
});

// Two weeks of dates; Sundays closed. "Taken" slots are faked deterministically for the demo.
const SLOTS = ['10:00', '11:00', '12:00', '13:30', '14:30', '15:30', '17:00', '18:00', '19:00'];
const today = new Date(); today.setHours(0, 0, 0, 0);
const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i + 1); return d; });
const daysEl = $('#days');
let lastMonth = null;
daysEl.innerHTML = days.map((d, i) => {
  const m = d.toLocaleDateString('en-CA', { month: 'long' });
  const head = m !== lastMonth && i > 0 ? `<p class="month">${m}</p>` : '';
  lastMonth = m;
  const pre = i === 0 ? `<p class="month">${m}</p>` : '';
  return `${pre}${head}<button type="button" class="day" role="radio" aria-checked="false" data-i="${i}" ${d.getDay() === 0 ? 'disabled aria-label="Closed"' : ''}><small>${d.toLocaleDateString('en-CA', { weekday: 'short' })}</small><b>${d.getDate()}</b></button>`;
}).join('');

function renderTimes() {
  const seed = state.date.getDate();
  $('#times').innerHTML = SLOTS.map((t, i) => {
    const taken = (seed * 7 + i * 3) % 5 === 0 || (state.date.getDay() === 6 && i > 5);
    return `<button type="button" class="time" role="radio" aria-checked="${state.time === t}" data-t="${t}" ${taken ? 'disabled aria-label="' + t + ' booked"' : ''}>${t}</button>`;
  }).join('');
}
daysEl.addEventListener('click', (e) => {
  const b = e.target.closest('.day');
  if (!b || b.disabled) return;
  $$('.day', daysEl).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
  state.date = days[+b.dataset.i];
  state.time = null;
  renderTimes();
  updateSum();
});
$('#times').addEventListener('click', (e) => {
  const b = e.target.closest('.time');
  if (!b || b.disabled) return;
  $$('.time').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
  state.time = b.dataset.t;
  updateSum();
});

function go(n) {
  steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === n));
  prog.forEach((p, i) => p.classList.toggle('is-on', i < n));
  if (n === 3) {
    const t = totals();
    $('#recap').innerHTML = `<strong>${[...state.services].map((id) => byId[id].name).join(', ')}</strong><br>${fmtDate(state.date)} at ${state.time} · ${fmtMin(t.min)} · <strong>$${t.price}</strong>`;
  }
  const top = form.getBoundingClientRect().top + scrollY - 100;
  if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
}
form.addEventListener('click', (e) => {
  const cur = +$('.step.is-active', form).dataset.step;
  if (e.target.closest('[data-next]')) go(cur + 1);
  if (e.target.closest('[data-back]')) go(cur - 1);
});

// Preselect a service from "Book the ritual" style links
$$('[data-service]').forEach((a) => a.addEventListener('click', () => {
  const box = $(`#svc-grid input[value="${a.dataset.service}"]`);
  if (box && !box.checked) { box.checked = true; state.services.add(box.value); updateSum(); }
  go(1);
}));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const { name, phone, notes, first } = form.elements;
  const okName = name.value.trim().length > 1;
  const okPhone = phone.value.replace(/\D/g, '').length >= 10;
  name.setAttribute('aria-invalid', String(!okName));
  phone.setAttribute('aria-invalid', String(!okPhone));
  if (!okName || !okPhone) { $('#err').textContent = 'Please add your name and a 10-digit phone number.'; return; }
  $('#err').textContent = '';
  const t = totals();
  const svc = [...state.services].map((id) => byId[id].name).join(', ');
  const msg = `Hi Tetyana! I'd like to book:\n${svc}\n${fmtDate(state.date)} at ${state.time} (${fmtMin(t.min)}, $${t.price})\nName: ${name.value.trim()}\nPhone: ${phone.value.trim()}${first.checked ? '\nFirst visit' : ''}${notes.value.trim() ? `\nNotes: ${notes.value.trim()}` : ''}`;
  $('#done-text').innerHTML = `Thank you, ${name.value.trim().split(' ')[0]}. Your request for <strong>${fmtDate(state.date)} at ${state.time}</strong> is on its way.`;
  go(4);
  $('.done').focus();
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
});
$('#again').addEventListener('click', () => {
  form.reset();
  state.services.clear(); state.date = null; state.time = null;
  $$('.day').forEach((x) => x.setAttribute('aria-checked', 'false'));
  $('#times').innerHTML = '<p class="muted">Choose a date first</p>';
  updateSum();
  go(1);
});

/* ---------- studio gallery ---------- */
const GALLERY = [
  ['spa-bed', 'Treatment room', 'A treatment bed with fresh white linens'],
  ['candles', 'Candlelight', 'Candles glowing on white linen'],
  ['towels', 'Warm towels', 'Rolled white towels in a basket'],
  ['candles-bowls', 'Rituals', 'Candles and bowls of skincare products'],
  ['spatulas-cup', 'Single-use tools', 'A cup of fresh wooden spatulas'],
  ['spa-candles', 'Aftercare', 'Skincare essentials with candles'],
];
let gi = 0;
const thumbs = $('#gal-thumbs');
thumbs.innerHTML = GALLERY.map(([f, , alt], i) => `<button type="button" data-i="${i}" aria-label="Show photo ${i + 1}: ${alt}"><img src="assets/stock/${f}.jpg" alt="" loading="lazy"></button>`).join('');
function showGal(i) {
  gi = (i + GALLERY.length) % GALLERY.length;
  const [f, cap, alt] = GALLERY[gi];
  swapImg($('#gal-img'), `assets/stock/${f}.jpg`, alt);
  $('#gal-cap').textContent = cap;
  $('#gal-count').textContent = `${gi + 1} / ${GALLERY.length}`;
  $$('button', thumbs).forEach((b, j) => b.setAttribute('aria-current', String(j === gi)));
}
thumbs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showGal(+b.dataset.i); });
$('#gal-prev').addEventListener('click', () => showGal(gi - 1));
$('#gal-next').addEventListener('click', () => showGal(gi + 1));
showGal(0);

/* ---------- sticky button hides near the booking form ---------- */
const sticky = $('.sticky');
let nearBook = false;
const syncSticky = () => sticky.classList.toggle('hide', nearBook || scrollY < 600);
new IntersectionObserver(([en]) => { nearBook = en.isIntersecting; syncSticky(); }, { threshold: 0.05 }).observe($('#book'));
addEventListener('scroll', syncSticky, { passive: true });
syncSticky();
