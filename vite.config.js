import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Short commit hash baked in at build time so bug reports can say which deploy
// they came from. Falls back to 'dev' when git isn't available.
let build = 'dev';
try {
  build = execSync('git rev-parse --short HEAD').toString().trim() || 'dev';
} catch { /* git not available — keep 'dev' */ }

export default defineConfig({
  base: '/tower-defence/',
  define: {
    __BUILD__: JSON.stringify(build),
  },
});
