export default [
  {
    input: "dist/esm/index.js",
    output: [
      {
        file: `dist/cjs/index.cjs`,
        format: "cjs",
        sourcemap: true,
      },
    ],
    external: ["node:fs", "ssh2-connect"],
  },
];
