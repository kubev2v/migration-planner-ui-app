import { defineConfig } from "vitest/config";

const nodeMajor = +process.versions.node.split(".")[0];

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/__tests__/vitest.setup.ts"],
    // Node 25+ ships an experimental Web Storage API whose localStorage
    // collides with jsdom's — disable it so jsdom stays in control.
    // https://github.com/vitest-dev/vitest/issues/8757
    execArgv: nodeMajor >= 25 ? ["--no-experimental-webstorage"] : [],
    coverage: {
      provider: "v8",
    },
  },
});
