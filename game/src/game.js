// Warung Rush — game.js
// The heart of the warung: the game state, the assembly of a dish on the
// plate, serving it, coins, hearts and the passing of days.

import { DISH_BY_ID, INGREDIENT_BY_ID, tipFor } from './recipes.js';
import {
  makeCustomer,
  spawnGapSeconds,
  tickCustomers,
  dayLengthSeconds,
  maxCustomers,
} from './orders.js';
import {
  playClick,
  playCorrect,
  playWrong,
  playCoin,
  playAngry,
  playDayClear,
} from './audio.js';

export const PHASES = {
  TITLE: 'title',
  PLAYING: 'playing',
  DAY_END: 'day-end',
  GAME_OVER: 'game-over',
};

export function newGameState() {
  return {
    phase: PHASES.TITLE,
    day: 1,
    coins: 0,
    hearts: 3,
    servedToday: 0,
    lostToday: 0,
    customers: [],
    selectedId: null,
    plate: [], // ingredient ids already placed, in order
    plateReady: false,
    dayTimeLeft: 0,
    nextSpawnIn: 2,
    message: '',
    messageUntil: 0,
    shakeUntil: 0,
    servedFlash: 0,
    totalServed: 0,
    totalEarned: 0,
    muted: false,
  };
}

export function startDay(state, now) {
  state.phase = PHASES.PLAYING;
  state.customers = [];
  state.selectedId = null;
  state.plate = [];
  state.plateReady = false;
  state.servedToday = 0;
  state.lostToday = 0;
  state.dayTimeLeft = dayLengthSeconds(state.day);
  state.nextSpawnIn = 1.5;
  state.message = `Hari ${state.day} — layani pelanggan!`;
  state.messageUntil = now + 2.5;
  spawnCustomer(state, now);
}

export function spawnCustomer(state, now) {
  if (state.customers.filter((c) => !c.leaving).length >= maxCustomers(state.day)) return;
  const c = makeCustomer(state.day, now);
  state.customers.push(c);
  if (!state.selectedId) state.selectedId = c.id;
}

export function selectedCustomer(state) {
  return state.customers.find((c) => c.id === state.selectedId && !c.leaving) ?? null;
}

export function selectCustomer(state, id) {
  const c = state.customers.find((x) => x.id === id && !x.leaving);
  if (!c) return;
  state.selectedId = id;
  state.plate = [];
  state.plateReady = false;
  playClick();
}

// Add one ingredient to the plate. It must be the next step of the
// selected customer's dish, or the plate buzzes and patience drops.
export function addIngredient(state, ingredientId, now) {
  if (state.phase !== PHASES.PLAYING) return;
  const customer = selectedCustomer(state);
  if (!customer) return;
  const dish = customer.dish;
  const expected = dish.steps[state.plate.length];
  if (ingredientId === expected) {
    state.plate.push(ingredientId);
    playCorrect();
    if (state.plate.length === dish.steps.length) {
      state.plateReady = true;
      state.message = `${dish.name} siap! Antar sekarang!`;
      state.messageUntil = now + 2;
    }
  } else {
    playWrong();
    customer.patience = Math.max(0, customer.patience - 2);
    state.shakeUntil = now + 0.25;
    const want = INGREDIENT_BY_ID[expected];
    state.message = `Bukan ${INGREDIENT_BY_ID[ingredientId].name}! Butuh ${want.name} dulu.`;
    state.messageUntil = now + 1.6;
  }
}

// Serve the finished plate to the selected customer.
export function servePlate(state, now) {
  if (state.phase !== PHASES.PLAYING || !state.plateReady) return;
  const customer = selectedCustomer(state);
  if (!customer) return;
  const dish = customer.dish;
  const tip = tipFor(customer.patience, customer.patienceMax);
  const earned = dish.price + tip;
  state.coins += earned;
  state.totalEarned += earned;
  state.totalServed += 1;
  state.servedToday += 1;
  customer.leaving = true;
  customer.leaveReason = 'served';
  customer.leaveAt = now;
  state.servedFlash = now + 0.8;
  state.message = `+Rp${earned.toLocaleString('id-ID')}${tip ? ` (termasuk tip Rp${tip.toLocaleString('id-ID')})` : ''}`;
  state.messageUntil = now + 2;
  playCoin();
  state.plate = [];
  state.plateReady = false;
  const next = state.customers.find((c) => !c.leaving);
  state.selectedId = next ? next.id : null;
}

export function starsForDay(served, lost) {
  if (lost === 0 && served >= 5) return 3;
  if (served >= 3 && lost <= 1) return 2;
  if (served >= 1) return 1;
  return 0;
}

export function tickGame(state, dt, now) {
  if (state.phase !== PHASES.PLAYING) return;

  state.dayTimeLeft -= dt;
  if (state.dayTimeLeft <= 0) {
    state.dayTimeLeft = 0;
    endDay(state, now);
    return;
  }

  // New customers walk in.
  state.nextSpawnIn -= dt;
  if (state.nextSpawnIn <= 0) {
    spawnCustomer(state, now);
    state.nextSpawnIn = spawnGapSeconds(state.day);
  }

  // Patience runs out: angry walk-outs cost a heart.
  const expired = tickCustomers(state.customers, dt, now);
  for (const c of expired) {
    state.lostToday += 1;
    state.hearts -= 1;
    state.message = 'Pelanggan pergi karena terlalu lama menunggu!';
    state.messageUntil = now + 2;
    playAngry();
    if (state.selectedId === c.id) {
      state.selectedId = null;
      state.plate = [];
      state.plateReady = false;
      const next = state.customers.find((x) => !x.leaving);
      state.selectedId = next ? next.id : null;
    }
    if (state.hearts <= 0) {
      state.hearts = 0;
      state.phase = PHASES.GAME_OVER;
      return;
    }
  }

  // Sweep away customers who already left.
  state.customers = state.customers.filter((c) => !c.leaving || now - c.leaveAt < 1.2);
}

function endDay(state, now) {
  state.phase = PHASES.DAY_END;
  state.plate = [];
  state.plateReady = false;
  state.selectedId = null;
  playDayClear();
}

export function nextDay(state, now) {
  state.day += 1;
  startDay(state, now);
}

export function dishStepsLeft(state) {
  const customer = selectedCustomer(state);
  if (!customer) return [];
  return customer.dish.steps.slice(state.plate.length);
}

export function expectedIngredient(state) {
  const left = dishStepsLeft(state);
  return left.length ? INGREDIENT_BY_ID[left[0]] : null;
}
