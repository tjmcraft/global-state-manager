import terser from '@rollup/plugin-terser';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json" assert { type: 'json' };

export default [
  {
    input: "src/index.ts",
    external: Object.keys(pkg.peerDependencies || {}).concat('react-dom'),
    output: [
			{
				file: 'dist/index.js',
				format: "es",
        sourcemap: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
			},
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
  },
];