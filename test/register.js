require("ts-node").register({
  skipProject: true,
  compilerOptions: {
    moduleResolution: "node",
    noImplicitAny: false,
    strict: true,
    module: "commonjs",
    target: "esnext",
  }
});
