import { defineConfig, Options } from 'tsup'

import path from 'path'
import fs from 'fs'

export default defineConfig((options) => {

  const commonOptions: Partial<Options> = {
    entry: {
      'global-state-manager': 'src/index.ts'
    },
    sourcemap: true,
    target: 'es2016',
    ...options,
  }

  return [
    // Standard ESM, embedded `process.env.NODE_ENV` checks
    {
      ...commonOptions,
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
      dts: true,
      clean: true,
    },
    {
      ...commonOptions,
      format: ['cjs'],
      outExtension: () => ({ js: '.cjs' }),
      dts: true,
      clean: true,
    },
    // Support Webpack 4 by pointing `"module"` to a file with a `.js` extension
    {
      ...commonOptions,
      entry: {
        'global-state-manager.legacy-esm': 'src/index.ts',
      },
      target: 'es2017',
      format: ['esm'],
      outExtension: () => ({ js: '.js' }),
    },
    // Browser-ready ESM, production + minified
    {
      ...commonOptions,
      entry: {
        'global-state-manager.browser': 'src/index.ts',
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
      minify: true,
    },
  ]
})