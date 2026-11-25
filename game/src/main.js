// Warung Rush — main.js
// Bootstrap, rendering and input for the warung. The canvas shows the
// kitchen: the order board on top, the plate in the middle, and the
// ingredient counter at the bottom. Click a customer, then click the
// ingredients in the dish's order, then serve the finished plate.

import { INGREDIENTS, INGREDIENT_BY_ID, DISH_BY_ID } from './recipes.js';
import {
  CANVAS_W,
  CANVAS_H,
  roundRect,
  drawText,
  drawWarung,
  drawCounter,
  drawIngredientChip,
  drawPlate,
  drawCustomer,
  drawPatienceBar,
  drawStar,
} from './draw.js';
import { customerMood } from './orders.js';
import {
  PHASES,
  newGameState,
  startDay,
  selectCustomer,
  addIngredient,
  servePlate,
  tickGame,
  nextDay,
  starsForDay,
  selectedCustomer,
  expectedIngredient,
} from './game.js';
import { toggleMute, isMuted, playClick } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = newGameState();
let hotspots = [];
let frozen = false;

const ING_X0 = 14;
const ING_W = 92;
const ING_GAP = 3;
const ING_Y = 448;
const ING_H = 132;

// Deterministic screenshot states (?shot=start|play|mid|serve).
function setupShot(mode) {
  frozen = true;
  if (mode === 'start') {
    state.phase = PHASES.TITLE;
    return;
  }
  state.phase = PHASES.PLAYING;
  state.day = 1;
  state.coins = 45000;
  state.hearts = 3;
  state.dayTimeLeft = 68;
  state.message = '';
  if (mode === 'play') {
    state.customers = [
      fakeCustomer(1, 'nasgor', 34, 46),
      fakeCustomer(2, 'sate', 22, 46),
    ];
    state.selectedId = 1;
    state.plate = ['nasi'];
  } else if (mode === 'mid') {
    state.customers = [fakeCustomer(1, 'migor', 30, 46)];
    state.selectedId = 1;
    state.plate = ['mie', 'telur'];
  } else if (mode === 'serve') {
    state.customers = [fakeCustomer(1, 'nasgor', 38, 46)];
    state.selectedId = 1;
    state.plate = ['nasi', 'telur', 'kecap'];
    state.plateReady = true;
    state.message = 'Nasi Goreng siap! Antar sekarang!';
    state.messageUntil = Number.POSITIVE_INFINITY;
  }
}

function fakeCustomer(id, dishId, patience, patienceMax) {
  const looks = [
    { skin: '#f2c89b', shirt: '#3498db', hair: '#2c2c2c' },
    { skin: '#d9a066', shirt: '#e74c3c', hair: '#4a2c14' },
    { skin: '#f7d7a8', shirt: '#27ae60', hair: '#7a4a1f' },
  ];
  return {
    id,
    dish: DISH_BY_ID[dishId],
    patience,
    patienceMax,
    arrivedAt: 0,
    look: looks[id - 1],
    leaving: false,
    leaveReason: null,
    leaveAt: 0,
  };
}

function addHotspot(x, y, w, h, action) {
  hotspots.push({ x, y, w, h, action });
}

function drawTopBar(now) {
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, CANVAS_W, 56);
  drawText(ctx, '🍜 WARUNG RUSH', 16, 29, 26, '#f5efe0', 'left');
  drawText(ctx, `Hari ${state.day}`, 330, 29, 20, '#f2c94c', 'left');
  drawText(ctx, `Rp${state.coins.toLocaleString('id-ID')}`, 470, 29, 20, '#7be495', 'left');
  // Hearts
  for (let i = 0; i < 3; i++) {
    drawText(ctx, i < state.hearts ? '❤️' : '🖤', 660 + i * 34, 29, 22, '#fff');
  }
  // Day timer
  const total = 75 + state.day * 15;
  const ratio = Math.max(0, state.dayTimeLeft / total);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, 770, 20, 120, 16, 8);
  ctx.fill();
  ctx.fillStyle = ratio > 0.4 ? '#58b368' : '#e74c3c';
  roundRect(ctx, 771, 21, 118 * ratio, 14, 7);
  ctx.fill();
  drawText(ctx, `${Math.ceil(state.dayTimeLeft)} dtk`, 830, 29, 13, '#fff');
  addHotspot(906, 10, 44, 36, () => toggleMute());
  drawText(ctx, isMuted() ? '🔇' : '🔊', 928, 29, 20, '#fff');
}

function drawOrderBoard() {
  drawText(ctx, 'PESANAN', 16, 78, 15, '#8a5a28', 'left');
  const cards = state.customers.filter((c) => !c.leaving);
  cards.forEach((c, i) => {
    const x = 14 + i * 236;
    const y = 88;
    const w = 224;
    const h = 96;
    const selected = state.selectedId === c.id;
    ctx.fillStyle = selected ? '#fff8e1' : '#ffffff';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.lineWidth = selected ? 4 : 2;
    ctx.strokeStyle = selected ? '#e67e22' : '#d8c9a3';
    ctx.stroke();
    drawCustomer(ctx, x + 34, y + 62, 0.62, customerMood(c), c.look.skin, c.look.shirt, c.look.hair);
    drawText(ctx, c.dish.name, x + 66, y + 24, 17, '#2c3e50', 'left');
    drawText(ctx, c.dish.blurb, x + 66, y + 46, 12, '#7f8c8d', 'left');
    // Steps: done = filled, next = ringed, later = dim
    c.dish.steps.forEach((stepId, si) => {
      const ing = INGREDIENT_BY_ID[stepId];
      const done = state.selectedId === c.id && si < state.plate.length;
      const isNext = state.selectedId === c.id && si === state.plate.length;
      drawIngredientChip(ctx, ing, x + 78 + si * 34, y + 72, 13, isNext);
      if (done) {
        drawText(ctx, '✓', x + 78 + si * 34, y + 72, 14, '#27ae60');
      }
    });
    drawPatienceBar(ctx, x + 66, y + 84, w - 78, c.patience / c.patienceMax);
    addHotspot(x, y, w, h, () => selectCustomer(state, c.id));
  });
  if (cards.length === 0) {
    drawText(ctx, 'Belum ada pelanggan — sebentar lagi datang…', CANVAS_W / 2, 136, 16, '#8a5a28');
  }
}

function drawKitchen(now) {
  drawCounter(ctx, 196, 240);
  const customer = selectedCustomer(state);
  // Plate
  const shake = now < state.servedFlash ? 0 : now < state.shakeUntil ? Math.sin(now * 60) * 4 : 0;
  drawPlate(ctx, 480 + shake, 306, 66, state.plate);
  if (customer) {
    drawText(ctx, customer.dish.name, 480, 206, 22, '#2c3e50');
    const left = customer.dish.steps.slice(state.plate.length);
    if (left.length > 0) {
      const next = INGREDIENT_BY_ID[left[0]];
      drawText(ctx, `Selanjutnya: ${next.emoji} ${next.name}`, 480, 230, 16, '#3e2712');
    } else {
      drawText(ctx, 'Siap diantar!', 480, 230, 18, '#f2c94c');
    }
  } else {
    drawText(ctx, 'Klik pesanan di papan atas', 480, 218, 18, '#3e2712');
  }
  // Serve button
  const ready = state.plateReady;
  ctx.fillStyle = ready ? '#27ae60' : '#bdc3c7';
  roundRect(ctx, 640, 262, 170, 64, 14);
  ctx.fill();
  if (ready) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1e8449';
    ctx.stroke();
  }
  drawText(ctx, ready ? 'ANTAR! 🍽️' : 'ANTAR', 725, 294, 22, '#fff');
  addHotspot(640, 262, 170, 64, () => servePlate(state, now));
  // Flash when a plate is served
  if (now < state.servedFlash) {
    drawText(ctx, 'Terima kasih! 😊', 480, 380, 20, '#27ae60');
  }
  // Message line
  if (state.message && now < state.messageUntil) {
    ctx.fillStyle = 'rgba(44,62,80,0.92)';
    roundRect(ctx, 220, 396, 520, 32, 10);
    ctx.fill();
    drawText(ctx, state.message, 480, 413, 15, '#fff');
  }
}

function drawIngredientCounter() {
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(0, ING_Y - 8, CANVAS_W, ING_H + 16);
  drawText(ctx, 'BAHAN — klik sesuai urutan resep  (tombol 1-0, Spasi = antar)', 16, ING_Y + 4, 14, '#f5efe0', 'left');
  INGREDIENTS.forEach((ing, i) => {
    const x = ING_X0 + i * (ING_W + ING_GAP);
    const y = ING_Y + 18;
    const next = expectedIngredient(state);
    const isNext = next && next.id === ing.id;
    ctx.fillStyle = isNext ? '#ffe9a8' : '#fdf3e3';
    roundRect(ctx, x, y, ING_W, 96, 10);
    ctx.fill();
    ctx.lineWidth = isNext ? 4 : 2;
    ctx.strokeStyle = isNext ? '#e67e22' : '#d8c9a3';
    ctx.stroke();
    drawIngredientChip(ctx, ing, x + ING_W / 2, y + 34, 24, isNext);
    drawText(ctx, ing.name, x + ING_W / 2, y + 72, 14, '#2c3e50');
    drawText(ctx, `[${(i + 1) % 10}]`, x + ING_W / 2, y + 88, 11, '#95a5a6');
    addHotspot(x, y, ING_W, 96, () => addIngredient(state, ing.id, performance.now() / 1000));
  });
}

function drawCenterPanel(title, lines, buttonLabel, buttonAction, stars = 0) {
  ctx.fillStyle = 'rgba(44,62,80,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fdf3e3';
  roundRect(ctx, 180, 110, 600, 380, 18);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#c0392b';
  ctx.stroke();
  drawText(ctx, title, 480, 160, 34, '#c0392b');
  let y = 210;
  for (const line of lines) {
    drawText(ctx, line, 480, y, 17, '#2c3e50');
    y += 30;
  }
  if (stars > 0) {
    for (let i = 0; i < 3; i++) drawStar(ctx, 420 + i * 60, 300, 26, i < stars);
  }
  ctx.fillStyle = '#27ae60';
  roundRect(ctx, 360, 400, 240, 56, 14);
  ctx.fill();
  drawText(ctx, buttonLabel, 480, 429, 22, '#fff');
  addHotspot(360, 400, 240, 56, buttonAction);
}

function render(now) {
  hotspots = [];
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (state.phase === PHASES.TITLE) {
    drawWarung(ctx);
    drawCounter(ctx, 196, 240);
    drawPlate(ctx, 480, 300, 72, ['nasi', 'telur', 'kecap']);
    drawText(ctx, '🍜 WARUNG RUSH 🍜', 480, 90, 52, '#c0392b');
    drawText(ctx, 'Game masak warung Indonesia — cepat, tepat, jangan sampai pelanggan kabur!', 480, 140, 18, '#5b3a1e');
    drawText(ctx, '1. Klik pesanan di papan atas   2. Klik bahan sesuai urutan resep', 480, 390, 17, '#2c3e50');
    drawText(ctx, '3. Klik ANTAR saat piring siap — makin cepat, makin besar tipnya!', 480, 418, 17, '#2c3e50');
    drawText(ctx, 'Menu: Nasi Goreng • Mie Goreng • Sate Ayam • Es Teh Manis', 480, 452, 16, '#8a5a28');
    ctx.fillStyle = '#27ae60';
    roundRect(ctx, 360, 480, 240, 60, 14);
    ctx.fill();
    drawText(ctx, '▶ MULAI MASAK', 480, 511, 24, '#fff');
    addHotspot(360, 480, 240, 60, () => {
      playClick();
      startDay(state, performance.now() / 1000);
    });
    return;
  }
  if (state.phase === PHASES.DAY_END) {
    drawWarung(ctx);
    const stars = starsForDay(state.servedToday, state.lostToday);
    drawCenterPanel(
      `Hari ${state.day} Selesai!`,
      [
        `Pesanan terantar: ${state.servedToday}   •   Pelanggan kabur: ${state.lostToday}`,
        `Koin hari ini: Rp${state.coins.toLocaleString('id-ID')}`,
        state.day < 3 ? 'Besok pelanggan datang lebih cepat — siap?' : 'Itu hari terakhir! Lihat hasilmu.',
      ],
      state.day < 3 ? '▶ HARI BERIKUTNYA' : '▶ LIHAT HASIL',
      () => {
        playClick();
        if (state.day < 3) nextDay(state, performance.now() / 1000);
        else state.phase = PHASES.GAME_OVER;
      },
      stars,
    );
    return;
  }
  if (state.phase === PHASES.GAME_OVER) {
    drawWarung(ctx);
    drawCenterPanel(
      'Warung Tutup! 🏁',
      [
        `Total pesanan terantar: ${state.totalServed}`,
        `Total koin: Rp${state.totalEarned.toLocaleString('id-ID')}`,
        state.hearts > 0 ? 'Kamu menyelesaikan 3 hari penuh — warungmu laris!' : 'Hati pelanggan habis — tapi warungmu tetap legendaris.',
      ],
      '↻ MAIN LAGI',
      () => {
        playClick();
        const fresh = newGameState();
        Object.assign(state, fresh);
        startDay(state, performance.now() / 1000);
      },
    );
    return;
  }
  // PLAYING
  drawWarung(ctx);
  drawTopBar(now);
  drawOrderBoard();
  drawKitchen(now);
  drawIngredientCounter();
}

function onClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * CANVAS_W;
  const y = ((event.clientY - rect.top) / rect.height) * CANVAS_H;
  for (let i = hotspots.length - 1; i >= 0; i--) {
    const h = hotspots[i];
    if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
      h.action();
      return;
    }
  }
}

function onKey(event) {
  const now = performance.now() / 1000;
  if (event.key === 'm' || event.key === 'M') {
    toggleMute();
    return;
  }
  if (state.phase !== PHASES.PLAYING) {
    if (event.key === 'Enter' || event.key === ' ') {
      if (state.phase === PHASES.TITLE) startDay(state, now);
    }
    return;
  }
  if (event.key === ' ' || event.key === 'Enter') {
    servePlate(state, now);
    return;
  }
  const idx = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(event.key);
  if (idx >= 0 && idx < INGREDIENTS.length) {
    addIngredient(state, INGREDIENTS[idx].id, now);
  }
}

canvas.addEventListener('click', onClick);
window.addEventListener('keydown', onKey);

// Shot modes for deterministic screenshots: ?shot=start|play|mid|serve
const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) setupShot(shot);

window.__warung = { state, PHASES, startDay, addIngredient, servePlate };

let last = performance.now();
function loop(nowMs) {
  const now = nowMs / 1000;
  const dt = frozen ? 0 : Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  if (!frozen) tickGame(state, dt, now);
  render(now);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
