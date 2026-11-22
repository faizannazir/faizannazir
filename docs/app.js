import { clamp, step } from "./physics.mjs";

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const toggle = document.querySelector("#motion-toggle");
const arena = document.querySelector("#arena");
const status = document.querySelector("#playground-status");
let paused = reduced.matches,
  inView = false,
  raf = 0,
  previous = 0,
  accumulator = 0;
let width = arena.clientWidth,
  height = arena.clientHeight;
let entrancePending = true;
const tech = [
  ["C#", "Backend", "#b7a9ff"],
  [".NET", "Platform", "#c4b7ff"],
  ["React", "Frontend", "#85e0e0"],
  ["Next.js", "Full-stack", "#e0e4ea"],
  ["TS", "TypeScript", "#8bbdff"],
  ["C++", "Firmware", "#b1c7f1"],
  ["ESP32", "Hardware", "#ffb77b"],
  ["SQL", "Data", "#f3d58b"],
  ["Flutter", "Mobile", "#87d3f7"],
  ["Py", "Python", "#e7d488"],
  ["Git", "Tooling", "#f49d89"],
  ["Kotlin", "Android", "#d8acf0"],
  ["Arduino", "IoT", "#8cd6c3"],
  ["MCP", "Integrations", "#d0c7f7"],
  ["AI", "Tool building", "#f3d3a1"],
  ["Codex", "AI coding", "#c6e2da"],
  ["Claude", "Code", "#eab59b"],
  ["Cursor", "AI editor", "#c2cbd9"],
];
const balls = tech.map(([label, detail, color]) => {
  const el = document.createElement("button");
  el.className = "tech-ball";
  el.type = "button";
  el.setAttribute(
    "aria-label",
    `${label}, ${detail}. Arrow keys to move, Enter to kick.`,
  );
  el.style.setProperty("--ball-color", color);
  const title = document.createElement("strong"),
    caption = document.createElement("span");
  title.textContent = label;
  caption.textContent = detail;
  el.append(title, caption);
  arena.append(el);
  return {
    el,
    label,
    x: 0,
    y: 0,
    r: 40,
    vx: 0,
    vy: 0,
    angle: 0,
    held: false,
    wait: 0,
  };
});
function paint() {
  for (const b of balls)
    b.el.style.transform = `translate3d(${b.x - b.r}px,${b.y - b.r}px,0) rotate(${b.angle}deg)`;
}
function reset() {
  const cols = width < 550 ? 4 : 6,
    rows = Math.ceil(balls.length / cols);
  const radius = Math.min(46, (width - 20) / (cols * 2.35));
  balls.forEach((b, i) => {
    b.r = radius;
    b.x = width * (((i % cols) + 0.5) / cols);
    b.y = 95 + Math.floor(i / cols) * Math.min(115, (height - 150) / rows);
    b.vx = (i % 2 ? 1 : -1) * 24;
    b.vy = 0;
    b.angle = 0;
    b.wait = 0;
    b.el.hidden = !paused && entrancePending;
    b.el.style.setProperty("--radius", radius);
  });
  paint();
}
function frame(time) {
  raf = 0;
  if (paused || !inView || document.hidden) {
    previous = 0;
    return;
  }
  accumulator += previous ? Math.min((time - previous) / 1000, 0.05) : 0;
  previous = time;
  while (accumulator >= 1 / 120) {
    for (const b of balls) {
      if (b.wait > 0) {
        b.wait -= 1 / 120;
        if (b.wait <= 0) b.el.hidden = false;
      }
    }
    step(
      balls.filter((b) => !b.el.hidden),
      width,
      height,
      620,
      1 / 120,
    );
    accumulator -= 1 / 120;
  }
  paint();
  raf = requestAnimationFrame(frame);
}
function run() {
  if (!raf && !paused && inView && !document.hidden) {
    if (entrancePending) {
      entrancePending = false;
      balls.forEach((b, i) => {
        b.wait = i * 0.13;
        b.y = b.r + 6;
        b.el.hidden = i > 0;
      });
      paint();
    }
    raf = requestAnimationFrame(frame);
  }
}
function updateMotion() {
  root.classList.toggle("motion-paused", paused);
  root.classList.toggle("motion-ready", !paused);
  toggle.textContent = paused ? "Enable motion" : "Pause motion";
  if (paused) {
    cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
    accumulator = 0;
    for (const b of balls) {
      b.wait = 0;
      b.el.hidden = false;
    }
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("visible"));
  } else run();
  updateScroll();
}
function kick(b) {
  b.vx = (Math.random() - 0.5) * 700;
  b.vy = -430 - Math.random() * 200;
}
for (const b of balls) {
  let drag = null,
    suppressClick = false;
  b.el.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag) return;
    suppressClick = false;
    const rect = arena.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      dx: event.clientX - rect.left - b.x,
      dy: event.clientY - rect.top - b.y,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      moved: false,
      vx: 0,
      vy: 0,
    };
    b.held = true;
    b.vx = 0;
    b.vy = 0;
    b.el.setPointerCapture(event.pointerId);
    b.el.classList.add("dragging");
  });
  b.el.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const rect = arena.getBoundingClientRect(),
      elapsed = Math.max(8, event.timeStamp - drag.time) / 1000;
    drag.vx = clamp((event.clientX - drag.x) / elapsed, -1000, 1000);
    drag.vy = clamp((event.clientY - drag.y) / elapsed, -1000, 1000);
    drag.moved ||=
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4;
    b.x = clamp(event.clientX - rect.left - drag.dx, b.r, width - b.r);
    b.y = clamp(event.clientY - rect.top - drag.dy, b.r, height - b.r - 5);
    Object.assign(drag, {
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
    });
    paint();
  });
  function release(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.id) return;
    suppressClick = drag.moved || cancelled;
    if (!cancelled && drag.moved && event.timeStamp - drag.time < 100) {
      b.vx = drag.vx;
      b.vy = drag.vy;
    }
    b.held = false;
    b.el.classList.remove("dragging");
    if (drag.moved)
      status.textContent = `${b.label} moved. ${paused ? "Motion is paused." : "Released into the playground."}`;
    drag = null;
  }
  b.el.addEventListener("pointerup", (event) => release(event));
  b.el.addEventListener("pointercancel", (event) => release(event, true));
  b.el.addEventListener("lostpointercapture", (event) => release(event, true));
  b.el.addEventListener("click", (event) => {
    if (suppressClick && event.detail !== 0) {
      suppressClick = false;
      return;
    }
    suppressClick = false;
    entrancePending = false;
    kick(b);
    paused = false;
    updateMotion();
    status.textContent = `${b.label} kicked.`;
  });
  b.el.addEventListener("keydown", (event) => {
    const moves = {
      ArrowLeft: [-20, 0],
      ArrowRight: [20, 0],
      ArrowUp: [0, -20],
      ArrowDown: [0, 20],
    };
    if (!moves[event.key]) return;
    event.preventDefault();
    paused = true;
    updateMotion();
    b.x = clamp(b.x + moves[event.key][0], b.r, width - b.r);
    b.y = clamp(b.y + moves[event.key][1], b.r, height - b.r - 5);
    paint();
    status.textContent = `${b.label} moved ${event.key.slice(5).toLowerCase()}. Motion paused for keyboard positioning.`;
  });
}
toggle.hidden = false;
toggle.addEventListener("click", () => {
  paused = !paused;
  updateMotion();
});
reduced.addEventListener("change", () => {
  paused = reduced.matches;
  updateMotion();
});
new ResizeObserver(() => {
  if (width === arena.clientWidth && height === arena.clientHeight) return;
  width = arena.clientWidth;
  height = arena.clientHeight;
  reset();
}).observe(arena);
new IntersectionObserver(
  ([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
    if (inView) run();
    else {
      cancelAnimationFrame(raf);
      raf = 0;
      previous = 0;
    }
  },
  { threshold: [0, 0.25] },
).observe(arena);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
  } else run();
});
const reveals = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        reveals.unobserve(entry.target);
      }
    }),
  { threshold: 0.08 },
);
document.querySelectorAll(".reveal").forEach((el) => reveals.observe(el));
const progress = document.querySelector(".scroll-progress"),
  timeline = document.querySelector(".timeline");
const art = document.querySelector(".project-art");
let scrollQueued = false;
function updateScroll() {
  scrollQueued = false;
  const range = root.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${range ? scrollY / range : 0})`;
  if (paused || reduced.matches) {
    timeline.style.setProperty("--timeline-progress", 1);
    art.style.setProperty("--art-shift", "0px");
    return;
  }
  const rect = timeline.getBoundingClientRect();
  timeline.style.setProperty(
    "--timeline-progress",
    clamp((innerHeight * 0.7 - rect.top) / rect.height, 0, 1),
  );
  const artRect = art.getBoundingClientRect();
  art.style.setProperty(
    "--art-shift",
    `${clamp((artRect.top - innerHeight / 2) * -0.035, -12, 12)}px`,
  );
}
addEventListener(
  "scroll",
  () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateScroll);
    }
  },
  { passive: true },
);
addEventListener("resize", updateScroll);
reset();
updateMotion();

const refresh = document.querySelector("#refresh-github"),
  githubStatus = document.querySelector("#github-status");
refresh.hidden = false;
refresh.addEventListener("click", async () => {
  refresh.disabled = true;
  githubStatus.textContent = "Reading public GitHub activity…";
  try {
    const cards = [...document.querySelectorAll("[data-repo]")];
    const results = await Promise.all(
      cards.map(async (card) => {
        const response = await fetch(
          `https://api.github.com/repos/faizannazir/${encodeURIComponent(card.dataset.repo)}`,
          { signal: AbortSignal.timeout(10000) },
        );
        if (!response.ok) throw new Error("GitHub unavailable");
        const data = await response.json();
        const date = new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(new Date(data.pushed_at));
        return `${data.stargazers_count} stars · Last pushed ${date}`;
      }),
    );
    cards.forEach((card, i) => {
      card.querySelector(".repo-meta").textContent = results[i];
    });
    githubStatus.textContent =
      "Activity refreshed from public GitHub repositories.";
  } catch {
    githubStatus.textContent =
      "GitHub activity is unavailable right now. Project links still work; try refreshing later.";
  } finally {
    refresh.disabled = false;
  }
});
