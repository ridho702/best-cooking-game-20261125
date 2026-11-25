// Warung Rush — recipes.js
// The menu of the warung: every dish is a fixed sequence of ingredients.
// A dish is served only when its ingredients are added in the exact order.

export const INGREDIENTS = [
  { id: 'nasi',   name: 'Nasi',   color: '#f5efe0', ring: '#d8c9a3', emoji: '🍚' },
  { id: 'mie',    name: 'Mie',    color: '#f2c94c', ring: '#d9a400', emoji: '🍜' },
  { id: 'ayam',   name: 'Ayam',   color: '#e07840', ring: '#b85c28', emoji: '🍗' },
  { id: 'telur',  name: 'Telur',  color: '#fff3b0', ring: '#e0b93c', emoji: '🥚' },
  { id: 'kecap',  name: 'Kecap',  color: '#5b3a1e', ring: '#3e2712', emoji: '🧴' },
  { id: 'bawang', name: 'Bawang', color: '#e8b4d0', ring: '#c77ba6', emoji: '🧅' },
  { id: 'sayur',  name: 'Sayur',  color: '#58b368', ring: '#2f7d3d', emoji: '🥬' },
  { id: 'teh',    name: 'Teh',    color: '#c98a3d', ring: '#9a6524', emoji: '🍵' },
  { id: 'es',     name: 'Es',     color: '#bfe3f2', ring: '#7fb8d4', emoji: '🧊' },
  { id: 'gula',   name: 'Gula',   color: '#ffffff', ring: '#c9c9c9', emoji: '🍬' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(
  INGREDIENTS.map((ing) => [ing.id, ing]),
);

export const DISHES = [
  {
    id: 'nasgor',
    name: 'Nasi Goreng',
    price: 15000,
    steps: ['nasi', 'telur', 'kecap'],
    plate: '#f2c94c',
    blurb: 'Nasi + telur + kecap',
  },
  {
    id: 'migor',
    name: 'Mie Goreng',
    price: 14000,
    steps: ['mie', 'telur', 'sayur'],
    plate: '#e07840',
    blurb: 'Mie + telur + sayur',
  },
  {
    id: 'sate',
    name: 'Sate Ayam',
    price: 18000,
    steps: ['ayam', 'bawang', 'kecap'],
    plate: '#c96f4a',
    blurb: 'Ayam + bawang + kecap',
  },
  {
    id: 'esteh',
    name: 'Es Teh Manis',
    price: 5000,
    steps: ['teh', 'gula', 'es'],
    plate: '#c98a3d',
    blurb: 'Teh + gula + es',
  },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

// How many coins a fast serve is worth on top of the dish price.
export function tipFor(patienceLeft, patienceMax) {
  const ratio = patienceLeft / patienceMax;
  if (ratio > 0.66) return 5000;
  if (ratio > 0.33) return 2000;
  return 0;
}
