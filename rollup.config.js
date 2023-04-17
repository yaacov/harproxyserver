import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: {
    index: 'src/index.ts',
    harProxyServer: 'src/harProxyServer.ts',
  },
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name][min].js',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [resolve(), commonjs()],
  external: ['express', 'http-proxy-middleware', 'har-format', 'yargs', 'yargs-parser'],
};
