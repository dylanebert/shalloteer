import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      rollupTypes: false,
      insertTypesEntry: true,
      outDir: 'dist',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  resolve: {
    alias: {
      '@dimforge/rapier3d': '@dimforge/rapier3d-compat',
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'JSX.createElement',
    jsxFragment: 'JSX.Fragment',
  },
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'vite/index': 'src/vite/index.ts',
        'jsx/index': 'src/jsx/index.ts',
      },
      name: 'Shalloteer',
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['three', 'bitecs', 'vite'],
      output: {
        globals: {
          three: 'THREE',
          bitecs: 'bitECS',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
  },
});
