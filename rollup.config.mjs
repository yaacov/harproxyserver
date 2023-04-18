import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from "@rollup/plugin-json";

export default [
  {
    input: {
      index: 'src/index.ts',
    },
    output: [
      {
        dir: 'dist',
        format: 'es',
        entryFileNames: '[name].min.js',
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [json(), nodeResolve({ preferBuiltins: true, mainFields: ['browser'] }), resolve(), commonjs(), typescript({ module: "esnext" })],
    external: ['express', 'http-proxy-middleware', 'http-status-codes', 'yargs', 'yargs-parser'],
  },
  {
    input: {
      harProxyServer: 'src/harProxyServer.ts',
    },
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        entryFileNames: '[name].js',
      },
    ],
    plugins: [json(), nodeResolve({ preferBuiltins: true }), resolve(), commonjs(), typescript({ module: "esnext" })],
    external: ['express', 'http-proxy-middleware', 'http-status-codes', 'yargs', 'yargs-parser'],
  }
];
