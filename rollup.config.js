import rust from '@wasm-tool/rollup-plugin-rust';

export default {
  input: {
    index: 'src/index.js',
  },
  output: {
    dir: 'dist',
    name: 'jsonish',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    rust({
      nodejs: true,
      debug: process.env.NODE_ENV === 'debug',
      verbose: true,
      inlineWasm: true,
    }),
  ],
};
