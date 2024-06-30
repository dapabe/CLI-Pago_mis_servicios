import { defineConfig } from 'tsup';

export default defineConfig((opts) => ({
  format: 'esm',
  clean: true,
  entry: ['src/index.ts'],
  minify: opts.env?.NODE_ENV === 'prod',
}));
