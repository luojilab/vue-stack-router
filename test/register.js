require('ts-node').register({
  skipProject: true,
  compilerOptions: {
    moduleResolution: 'node',
    noImplicitAny: true,
    strict: true,
    module: 'commonjs',
    target: 'esnext'
  }
});
