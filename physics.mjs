export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function constrain(ball, width, height) {
  const floor = height - ball.r - 5;
  if (ball.x < ball.r || ball.x > width - ball.r) ball.vx *= -0.82;
  if (ball.y < ball.r || ball.y > floor) ball.vy *= -0.78;
  ball.x = clamp(ball.x, ball.r, width - ball.r);
  ball.y = clamp(ball.y, ball.r, floor);
}

export function step(balls, width, height, gravity, dt) {
  const damping = Math.exp(-0.12 * dt);
  for (const b of balls) {
    if (b.held) continue;
    b.vy += gravity * dt;
    b.vx *= damping;
    b.vy *= damping;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.angle += b.vx * dt * 0.035;
    constrain(b, width, height);
  }
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < balls.length; i++)
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i],
          b = balls[j],
          dx = b.x - a.x,
          dy = b.y - a.y;
        const distance = Math.hypot(dx, dy),
          overlap = a.r + b.r - distance;
        if (overlap <= 0 || (a.held && b.held)) continue;
        const nx = distance ? dx / distance : 1,
          ny = distance ? dy / distance : 0;
        const ia = a.held ? 0 : 1 / (a.r * a.r),
          ib = b.held ? 0 : 1 / (b.r * b.r),
          sum = ia + ib;
        a.x -= (nx * overlap * ia) / sum;
        a.y -= (ny * overlap * ia) / sum;
        b.x += (nx * overlap * ib) / sum;
        b.y += (ny * overlap * ib) / sum;
        const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (relative < 0) {
          const impulse = (-1.8 * relative) / sum;
          a.vx -= impulse * nx * ia;
          a.vy -= impulse * ny * ia;
          b.vx += impulse * nx * ib;
          b.vy += impulse * ny * ib;
        }
      }
    for (const b of balls) if (!b.held) constrain(b, width, height);
  }
}
