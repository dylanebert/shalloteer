import { defineConfig } from 'vite';
import { shalloteer, consoleForwarding } from 'shalloteer/vite';

export default defineConfig({
  plugins: [shalloteer(), consoleForwarding()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
});
