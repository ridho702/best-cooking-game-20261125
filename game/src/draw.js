// Warung Rush — draw.js
// Every picture in the game is drawn on the canvas with paths and arcs:
// the warung, the customers, the plates and the food. No image files.

import { INGREDIENT_BY_ID } from './recipes.js';

export const CANVAS_W = 960;
export const CANVAS_H = 600;

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawText(ctx, text, x, y, size, color, align = 'center', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// The striped awning and wall of the warung, drawn behind everything.
export function drawWarung(ctx) {
  ctx.fillStyle = '#f7ead1';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Awning stripes
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#c0392b' : '#fdf3e3';
    ctx.fillRect(i * 80, 0, 80, 34);
  }
  ctx.fillStyle = '#8e2f24';
  ctx.fillRect(0, 34, CANVAS_W, 6);
  // Wall tiles
  ctx.strokeStyle = '#e8d5b0';
  ctx.lineWidth = 1;
  for (let y = 70; y < 170; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
}

// A wooden counter strip.
export function drawCounter(ctx, y, h) {
  ctx.fillStyle = '#a4713b';
  ctx.fillRect(0, y, CANVAS_W, h);
  ctx.fillStyle = '#8a5a28';
  ctx.fillRect(0, y, CANVAS_W, 5);
  ctx.fillStyle = '#c08a4e';
  for (let x = 20; x < CANVAS_W; x += 90) {
    ctx.fillRect(x, y + 10, 46, 4);
  }
}

// One ingredient as a round chip with its emoji and name.
export function drawIngredientChip(ctx, ing, x, y, r, selected = false) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = ing.color;
  ctx.fill();
  ctx.lineWidth = selected ? 5 : 3;
  ctx.strokeStyle = selected ? '#e67e22' : ing.ring;
  ctx.stroke();
  ctx.font = `${Math.round(r * 0.9)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ing.emoji, x, y - 2);
}

// A white plate, optionally holding a stack of ingredient chips.
export function drawPlate(ctx, cx, cy, r, stepIds) {
  // Shadow
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.85, r * 1.05, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();
  // Plate
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d5c9a8';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
  ctx.strokeStyle = '#efe6cf';
  ctx.stroke();
  // Food piled on the plate
  const n = stepIds.length;
  stepIds.forEach((id, i) => {
    const ing = INGREDIENT_BY_ID[id];
    const angle = -Math.PI / 2 + (i - (n - 1) / 2) * 0.55;
    const px = cx + Math.cos(angle) * r * 0.34;
    const py = cy + Math.sin(angle) * r * 0.3;
    ctx.beginPath();
    ctx.arc(px, py, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = ing.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = ing.ring;
    ctx.stroke();
    ctx.font = `${Math.round(r * 0.34)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ing.emoji, px, py);
  });
}

// A waiting customer: simple flat character with a mood face.
export function drawCustomer(ctx, x, y, scale, mood, skin, shirt, hair) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Body
  ctx.fillStyle = shirt;
  roundRect(ctx, -26, -6, 52, 58, 12);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(0, -28, 24, 0, Math.PI * 2);
  ctx.fillStyle = skin;
  ctx.fill();
  // Hair
  ctx.beginPath();
  ctx.arc(0, -34, 24, Math.PI, Math.PI * 2);
  ctx.fillStyle = hair;
  ctx.fill();
  ctx.fillRect(-24, -36, 48, 8);
  // Eyes
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-9, -28, 2.6, 0, Math.PI * 2);
  ctx.arc(9, -28, 2.6, 0, Math.PI * 2);
  ctx.fill();
  // Mouth by mood
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  if (mood === 'happy') {
    ctx.arc(0, -20, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  } else if (mood === 'angry') {
    ctx.moveTo(-8, -14);
    ctx.lineTo(8, -20);
  } else {
    ctx.arc(0, -14, 7, 1.15 * Math.PI, 1.85 * Math.PI);
  }
  ctx.stroke();
  ctx.restore();
}

// A patience bar above a customer card.
export function drawPatienceBar(ctx, x, y, w, ratio) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  roundRect(ctx, x, y, w, 10, 5);
  ctx.fill();
  const col = ratio > 0.5 ? '#58b368' : ratio > 0.25 ? '#f2c94c' : '#e74c3c';
  if (ratio > 0) {
    ctx.fillStyle = col;
    roundRect(ctx, x + 1, y + 1, Math.max(4, (w - 2) * ratio), 8, 4);
    ctx.fill();
  }
}

// A small star (for the day-end screen).
export function drawStar(ctx, cx, cy, r, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? '#f2c94c' : '#d8d8d8';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d9a400';
  ctx.stroke();
}
