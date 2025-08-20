import { defineConfig } from 'vite';
import { shalloteer, consoleForwarding } from 'shalloteer/vite';

export default defineConfig({
  plugins: [shalloteer(), consoleForwarding()],
  server: {
    port: 3000,
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
