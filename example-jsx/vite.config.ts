import { defineConfig } from 'vite';
import { shalloteer, consoleForwarding } from 'shalloteer/vite';

export default defineConfig({
  plugins: [shalloteer(), consoleForwarding()],
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'JSX.createElement',
    jsxFragment: 'JSX.Fragment',
  },
  server: {
    port: 3001,
    open: true,
    fs: {
      allow: ['..'],
    },
    watch: {
      ignored: ['!**/node_modules/shalloteer/**'],
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['shalloteer'],
  },
});