import assert from "node:assert";
import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type UserConfig } from "vite";

const DEFAULT_TARGET_HOST = "http://localhost:3443";
const projectRoot = path.resolve(import.meta.dirname, "..");
const linkedMonorepoRoot = path.resolve(
  projectRoot,
  "../migration-planner-agent-ui",
);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(process.cwd(), ".."), [
    "VITE_",
    "MIGRATION_PLANNER_",
  ]);

  assert(
    env.MIGRATION_PLANNER_API_BASE_URL,
    "MIGRATION_PLANNER_API_BASE_URL is required",
  );

  /**
   * Stage cluster: https://migration-planner-assisted-migration-stage.apps.crcs02ue1.urby.p1.openshiftapps.com
   *
   * Keeping this around for reference only. Theoretically we could use this to redirect to the stage cluster
   * for local development as well. However to hit this endpoint API calls need to be authenticated.
   */
  const target = env.MIGRATION_PLANNER_TARGET_HOST ?? DEFAULT_TARGET_HOST;

  const config: UserConfig = {
    plugins: [react()],
    define: {
      "process.env.MIGRATION_PLANNER_API_BASE_URL": JSON.stringify(
        env.MIGRATION_PLANNER_API_BASE_URL,
      ),
      "process.env.MIGRATION_PLANNER_COST_ESTIMATION_API_BASE_URL":
        JSON.stringify(env.MIGRATION_PLANNER_COST_ESTIMATION_API_BASE_URL),
      "process.env.MIGRATION_PLANNER_UI_GIT_COMMIT": JSON.stringify(
        env.MIGRATION_PLANNER_UI_GIT_COMMIT,
      ),
      "process.env.MIGRATION_PLANNER_UI_VERSION": JSON.stringify(
        env.MIGRATION_PLANNER_UI_VERSION,
      ),
      // Standalone dev mode — app is served at "/", no mount-path prefix.
      // The microfrontend (Webpack) build sets this to "/openshift/migration-advisor"
      // via fec.config.js DefinePlugin. See src/routing/Routes.ts.
      "process.env.MIGRATION_PLANNER_APP_BASENAME": JSON.stringify(""),
    },
    resolve: {
      // Linked shared-components resolves TypeScript source via the "development" export.
      conditions: ["development", "import", "module", "browser", "default"],
      // file:../migration-planner-agent-ui/... otherwise pulls React from the monorepo.
      dedupe: ["react", "react-dom"],
      alias: {
        react: path.resolve(projectRoot, "node_modules/react"),
        "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
        "react/jsx-runtime": path.resolve(
          projectRoot,
          "node_modules/react/jsx-runtime",
        ),
        "react/jsx-dev-runtime": path.resolve(
          projectRoot,
          "node_modules/react/jsx-dev-runtime",
        ),
        "@redhat-cloud-services/frontend-components/useChrome": path.resolve(
          import.meta.dirname,
          "src/mocks/useChrome.ts",
        ),
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "@patternfly/react-charts"],
    },
    server: {
      fs: {
        allow: [projectRoot, linkedMonorepoRoot],
      },
      port: 3000,
      proxy: {
        [`${env.MIGRATION_PLANNER_COST_ESTIMATION_API_BASE_URL}/v1/cost-estimation`]:
          {
            target: "http://localhost:9205",
            secure: false,
            changeOrigin: true,
            rewrite: (path) =>
              path.replace(
                new RegExp(
                  `^${env.MIGRATION_PLANNER_COST_ESTIMATION_API_BASE_URL}`,
                ),
                "/api",
              ),
          },
        [env.MIGRATION_PLANNER_API_BASE_URL]: {
          target,
          secure: false,
          changeOrigin: true,
          rewrite: (path: string) =>
            target === DEFAULT_TARGET_HOST
              ? path.replace(
                  new RegExp(`^${env.MIGRATION_PLANNER_API_BASE_URL}`),
                  "",
                )
              : path,
        },
      },
    },
  };

  return config;
});
