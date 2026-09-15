import { defineConfig } from 'vite';

// Served from https://olna3466.github.io/rareform/ on GitHub Pages, so built
// asset URLs need the repo name as a prefix. Local dev stays at "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/rareform/' : '/',
}));
