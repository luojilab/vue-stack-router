import typescript from "rollup-plugin-typescript2";
export default {
  input: "./src/index.ts",
  output: {
    file: "dist/vue-stack-router.js",
    format: "cjs",
    name: "VueStackRouter",
    exports: "named"
  },
  plugins: [typescript({ target: "es5" })],
  external: ["vue"]
};
