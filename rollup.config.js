import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'package/index.js',
      format: 'esm',
      sourcemap: false
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  }
];
