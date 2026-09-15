/**
 * Counts each stat up from 0 the first time it scrolls into view.
 * Parses "41.9%", "63%", "$1.16T" into prefix / number / suffix so the
 * formatting is preserved while the digits animate.
 */
const DURATION_MS = 1400;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function parseTarget(text) {
  const m = text.match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!m) return null;
  const numeric = m[2].replace(/,/g, '');
  const decimals = (numeric.split('.')[1] || '').length;
  return { prefix: m[1], value: parseFloat(numeric), decimals, suffix: m[3] };
}

function format({ prefix, decimals, suffix }, n) {
  return `${prefix}${n.toFixed(decimals)}${suffix}`;
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function animate(el, target) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / DURATION_MS);
    el.textContent = format(target, target.value * easeOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function initStats() {
  const values = [...document.querySelectorAll('.stat__value[data-count]')];
  if (!values.length) return;

  const targets = new Map();
  for (const el of values) {
    const target = parseTarget(el.dataset.count);
    if (!target) continue;
    targets.set(el, target);
    if (!reducedMotion.matches) el.textContent = format(target, 0);
  }

  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animate(entry.target, targets.get(entry.target));
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.4 }
  );
  targets.forEach((_, el) => io.observe(el));
}
