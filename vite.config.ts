import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { execSync } from 'child_process';
import pkg from './package.json';

const getGitHash = (): string => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteSingleFile()
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __COMMIT_HASH__: JSON.stringify(getGitHash()),
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false
  }
});
