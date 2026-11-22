import test from "node:test";
import assert from "node:assert/strict";
import { step } from "../docs/physics.mjs";
const ball = (data = {}) => ({
  x: 100,
  y: 100,
  r: 30,
  vx: 0,
  vy: 0,
  angle: 0,
  held: false,
  ...data,
});
test("gravity accelerates a ball downwards", () => {
  const b = ball();
  step([b], 400, 400, 620, 1 / 120);
  assert.ok(b.vy > 0 && b.y > 100);
});
test("wall and floor impacts reverse velocity and keep balls inside", () => {
  const b = ball({ x: 369, y: 364, vx: 500, vy: 500 });
  step([b], 400, 400, 0, 1 / 120);
  assert.ok(b.vx < 0 && b.vy < 0);
  assert.ok(b.x <= 370 && b.y <= 365);
});
test("a head-on collision separates balls and transfers momentum", () => {
  const a = ball({ x: 100, vx: 100 }),
    b = ball({ x: 159, vx: -100 });
  step([a, b], 400, 400, 0, 1 / 120);
  assert.ok(a.vx < 0 && b.vx > 0);
  assert.ok(Math.hypot(b.x - a.x, b.y - a.y) >= 59.99);
});
test("a held ball stays anchored while colliding with a free ball", () => {
  const a = ball({ held: true }),
    b = ball({ x: 150, vx: -100 });
  step([a, b], 400, 400, 620, 1 / 120);
  assert.equal(a.x, 100);
  assert.equal(a.y, 100);
  assert.ok(b.x >= 159);
});
test("zero-distance collisions resolve to finite separated positions", () => {
  const a = ball(),
    b = ball();
  step([a, b], 400, 400, 0, 1 / 120);
  assert.ok(Number.isFinite(a.x));
  assert.ok(Math.abs(a.x - b.x) >= 60);
});
test("long-running narrow-screen physics stays bounded and finite", () => {
  const balls = Array.from({ length: 12 }, (_, i) =>
    ball({
      r: 27,
      x: 40 + (i % 4) * 70,
      y: 80 + Math.floor(i / 4) * 85,
      vx: (i - 6) * 120,
      vy: -300,
    }),
  );
  for (let i = 0; i < 7200; i++) step(balls, 290, 480, 620, 1 / 120);
  for (const b of balls) {
    assert.ok([b.x, b.y, b.vx, b.vy].every(Number.isFinite));
    assert.ok(b.x >= b.r && b.x <= 290 - b.r && b.y >= b.r && b.y <= 475 - b.r);
  }
});
