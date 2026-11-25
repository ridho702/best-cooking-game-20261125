// Warung Rush — orders.js
// Customers, their orders and the passing of a day. A customer walks in,
// waits at the order board with a patience timer, and leaves happy with a
// plate or angry when the timer runs out.

import { DISHES } from './recipes.js';

const CUSTOMER_LOOKS = [
  { skin: '#f2c89b', shirt: '#3498db', hair: '#2c2c2c' },
  { skin: '#d9a066', shirt: '#e74c3c', hair: '#4a2c14' },
  { skin: '#f7d7a8', shirt: '#27ae60', hair: '#7a4a1f' },
  { skin: '#c98d5f', shirt: '#9b59b6', hair: '#1a1a1a' },
  { skin: '#eec39a', shirt: '#f39c12', hair: '#5b3a1e' },
  { skin: '#dba878', shirt: '#16a085', hair: '#3d3d3d' },
];

let nextCustomerId = 1;

export function makeCustomer(day, now) {
  const dish = DISHES[Math.floor(Math.random() * DISHES.length)];
  const patienceMax = Math.max(22, 46 - day * 4);
  return {
    id: nextCustomerId++,
    dish,
    patience: patienceMax,
    patienceMax,
    arrivedAt: now,
    look: CUSTOMER_LOOKS[Math.floor(Math.random() * CUSTOMER_LOOKS.length)],
    leaving: false,
    leaveReason: null,
    leaveAt: 0,
  };
}

// How long until the next customer walks in, in seconds.
export function spawnGapSeconds(day) {
  const base = Math.max(5, 11 - day);
  return base + Math.random() * 4;
}

// Tick every active customer down by dt seconds. Returns the customers
// whose patience just ran out.
export function tickCustomers(customers, dt, now) {
  const expired = [];
  for (const c of customers) {
    if (c.leaving) continue;
    c.patience -= dt;
    if (c.patience <= 0) {
      c.patience = 0;
      c.leaving = true;
      c.leaveReason = 'angry';
      c.leaveAt = now;
      expired.push(c);
    }
  }
  return expired;
}

export function customerMood(customer) {
  if (customer.leaving) return customer.leaveReason === 'served' ? 'happy' : 'angry';
  const ratio = customer.patience / customer.patienceMax;
  if (ratio < 0.3) return 'angry';
  if (ratio < 0.6) return 'worried';
  return 'happy';
}

// Day length in seconds; later days are longer and busier.
export function dayLengthSeconds(day) {
  return 75 + day * 15;
}

export function maxCustomers(day) {
  return Math.min(4, 2 + day);
}
