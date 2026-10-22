import { defineConfig } from "vitest/config";

const nodeMajor = +process.versions.node.split(".")[0];

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    // Linked shared-components uses a "development" export to source; omit it in
    // tests so hooks resolve the same React instance as the app.
    conditions: ["import", "module", "browser", "default"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/__tests__/vitest.setup.ts"],
    // PatternFly Charts v8 / user-event sequences run close to the default 5s
    // when the full suite is loaded; give interaction tests more headroom.
    testTimeout: 15_000,
    // Node 25+ ships an experimental Web Storage API whose localStorage
    // collides with jsdom's — disable it so jsdom stays in control.
    // https://github.com/vitest-dev/vitest/issues/8757
    execArgv: nodeMajor >= 25 ? ["--no-experimental-webstorage"] : [],
    coverage: {
      provider: "v8",
    },
  },
});
