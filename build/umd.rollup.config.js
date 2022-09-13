import typescript from 'rollup-plugin-typescript2';
export default {
  input: './src/index.ts',
  output: {
    file: 'dist/vue-stack-router.umd.js',
    format: 'umd',
    name: 'vueStackRouter',
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      tsconfigOverride: { compilerOptions: { target: 'es5' } }
    })
  ],
  external: ['vue']
};
