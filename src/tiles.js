/**
 * Pattern tiles: fills each rail/strip with square-ish tiles cycling through
 * the seven patterns, and periodically swaps two random tiles with a crossfade.
 * Pattern textures live in public/patterns and are mapped in CSS custom properties (see style.css).
 */
const PATTERNS = ['zebra', 'check', 'polka', 'gingham', 'lace', 'tiger', 'mosaic', 'leopard', 'dots'];
const SWAP_INTERVAL_MS = 4000;
const RAIL_TILE_COUNT = 7; // spec: 6–7 tiles top to bottom on desktop

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function makeTile(pattern) {
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.dataset.pattern = pattern;

  const front = document.createElement('div');
  front.className = 'tile__face tile__face--front';
  const back = document.createElement('div');
  back.className = 'tile__face tile__face--back';

  tile.append(front, back);
  return tile;
}

/** How many tiles fit square-ish along the container's long axis. */
function targetCount(container) {
  const { width, height } = container.getBoundingClientRect();
  if (!width || !height) return PATTERNS.length;
  const vertical = container.classList.contains('pattern-rail') && height > width;
  if (vertical) return RAIL_TILE_COUNT;
  // Horizontal strips: enough tiles that each is roughly square, never fewer than one full cycle
  return Math.max(PATTERNS.length, Math.ceil(width / height));
}

function fill(container) {
  const wanted = targetCount(container);
  const current = container.children.length;
  if (wanted === current) return;

  if (wanted > current) {
    const frag = document.createDocumentFragment();
    for (let i = current; i < wanted; i++) frag.append(makeTile(PATTERNS[i % PATTERNS.length]));
    container.append(frag);
  } else {
    for (let i = current - 1; i >= wanted; i--) container.children[i].remove();
  }
}

function setPattern(tile, pattern) {
  tile.dataset.pattern = pattern;
  tile.querySelector('.tile__face--back').removeAttribute('data-pattern');
  tile.classList.remove('is-swapping');
}

function crossfadeTo(tile, pattern) {
  if (tile.dataset.pattern === pattern) return;
  if (reducedMotion.matches) {
    setPattern(tile, pattern);
    return;
  }
  const back = tile.querySelector('.tile__face--back');
  back.dataset.pattern = pattern;
  // Force a style flush so the opacity transition actually runs
  void back.offsetWidth;
  tile.classList.add('is-swapping');

  const done = (e) => {
    if (e && e.propertyName !== 'opacity') return;
    back.removeEventListener('transitionend', done);
    setPattern(tile, pattern);
  };
  back.addEventListener('transitionend', done);
  // Safety net in case transitionend never fires (tab hidden, etc.)
  setTimeout(done, 800);
}

function swapRandomPair(tiles) {
  if (tiles.length < 2) return;
  let a = Math.floor(Math.random() * tiles.length);
  let b = Math.floor(Math.random() * (tiles.length - 1));
  if (b >= a) b += 1;
  const tileA = tiles[a];
  const tileB = tiles[b];
  const patA = tileA.dataset.pattern;
  const patB = tileB.dataset.pattern;
  if (patA === patB) {
    // Same pattern in both slots: swap one of them for something new instead
    const other = PATTERNS[(PATTERNS.indexOf(patA) + 1 + Math.floor(Math.random() * (PATTERNS.length - 1))) % PATTERNS.length];
    crossfadeTo(tileB, other);
    return;
  }
  crossfadeTo(tileA, patB);
  crossfadeTo(tileB, patA);
}

export function initTiles() {
  const containers = [...document.querySelectorAll('[data-tiles]')];
  if (!containers.length) return;

  containers.forEach(fill);

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) fill(entry.target);
  });
  containers.forEach((c) => ro.observe(c));

  let timer = null;
  const start = () => {
    if (timer) return;
    timer = setInterval(() => {
      const all = containers.flatMap((c) => [...c.querySelectorAll('.tile:not(.is-swapping)')]);
      swapRandomPair(all);
    }, SWAP_INTERVAL_MS);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  // Don't burn cycles (or pile up swaps) while the tab is hidden
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}
