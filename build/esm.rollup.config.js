import typescript from "rollup-plugin-typescript2";
export default {
  input: "./src/index.ts",
  output: {
    file: "dist/vue-stack-router.esm.js",
    format: "es",
    name: "VueStackRouter"
  },
  // plugins: [typescript({ target: "es5" })],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      tsconfigOverride: { compilerOptions: { target: "es5" } }
    })
  ],
  external: ["vue"]
};
