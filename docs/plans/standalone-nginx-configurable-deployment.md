# Plan: Configurable standalone nginx deployment

**Status:** Implemented  
**Scope:** `deploy/dev/` — nginx container used to serve the standalone SPA build

## Goal

Make the nginx container that serves the standalone UI build **configurable at runtime** so a single image can be instantiated with different:

- **API upstream** — host and port of the migration-planner API backend
- **API base path** — URL path prefix under which API requests are proxied (e.g. `/api/migration-assessment`)

This allows the same image to be used in dev (e.g. `host.containers.internal:3443`), OpenShift (e.g. `migration-planner-api:3443`), or other environments without rebuilding.

---

## Implemented changes

### 1. Nginx config template (`deploy/dev/nginx.conf.template`)

- **Template** `nginx.conf.template` is the single nginx config source. It is used at container runtime with two placeholders substituted at startup:
  - `${MIGRATION_PLANNER_API_UPSTREAM}` — upstream server (host:port), e.g. `host.containers.internal:3443`
  - `${MIGRATION_PLANNER_API_BASE_URL}` — location path for proxying, e.g. `/api/migration-assessment`
- A single `location` block proxies requests under the base URL to the upstream; the path prefix is stripped so the backend receives paths relative to its root.

### 2. Entrypoint script (`deploy/dev/docker-entrypoint.sh`)

- Runs before nginx. Exports defaults when env vars are unset:
  - `MIGRATION_PLANNER_API_UPSTREAM` → `host.containers.internal:3443`
  - `MIGRATION_PLANNER_API_BASE_URL` → `/api/migration-assessment`
- Uses `envsubst` to substitute **only** these two variables into the template (so nginx’s own `$host`, `$uri`, etc. are not touched).
- Writes the result to `/etc/nginx/nginx.conf` and then `exec`s nginx.

### 3. Containerfile (`deploy/dev/Containerfile`)

- **Build stage:** Unchanged; still uses `MIGRATION_PLANNER_API_BASE_URL` (and other build args) so the SPA is built with the correct API base path.
- **Runtime stage:**
  - Copies `nginx.conf.template` and `docker-entrypoint.sh` from the build context (via the builder stage copy of the repo).
  - Sets `docker-entrypoint.sh` as executable.
  - `CMD` is `/docker-entrypoint.sh` instead of starting nginx directly.

### 4. Build and runtime alignment

- **Build time:** `MIGRATION_PLANNER_API_BASE_URL` is passed as a build arg and baked into the SPA (e.g. in `dev/vite.config.ts`). The frontend sends API requests to that path.
- **Runtime:** The same logical value should be set in `MIGRATION_PLANNER_API_BASE_URL` (and `MIGRATION_PLANNER_API_UPSTREAM` as needed) when running the container so nginx proxies that path to the intended backend. If build and runtime values differ, the UI may call a path that nginx does not proxy (or vice versa).

---

## Environment variables (runtime)

| Variable                         | Default                         | Description                                                                                       |
| -------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `MIGRATION_PLANNER_API_UPSTREAM` | `host.containers.internal:3443` | Backend host:port nginx proxies to.                                                               |
| `MIGRATION_PLANNER_API_BASE_URL` | `/api/migration-assessment`     | Path prefix under which API requests are proxied. Must match the base URL the SPA was built with. |

---

**Runtime image:** `envsubst` is already available in the nginx runtime image (`registry.access.redhat.com/ubi9/nginx-126`); no extra package install is required.

### OpenShift template (addressed)

The OpenShift template (`deploy/dev/ui-template.yaml`) sets `MIGRATION_PLANNER_API_UPSTREAM` and `MIGRATION_PLANNER_API_BASE_URL` on the deployment (via template parameters, defaulting to `migration-planner-api:3443` and `/api/migration-assessment`) and uses port **8081** for the container and service to match the nginx image.

---

## Operational notes (documentation for deployers)

### Build-time vs runtime base URL (must match)

The SPA is built with `MIGRATION_PLANNER_API_BASE_URL` baked in; the frontend always calls that path. Nginx proxies only the path set at runtime via the same variable. **The runtime value must match the build-time value** or the UI will request a path nginx does not proxy (or the opposite). When building the image, pass the same base URL you will use when running the container (e.g. via the OpenShift template parameters or `podman run -e`).

### Location path format convention

Use **no trailing slash** for `MIGRATION_PLANNER_API_BASE_URL` (e.g. `/api/migration-assessment`). Nginx treats it as a prefix location, so both `/api/migration-assessment` and `/api/migration-assessment/` match requests like `/api/migration-assessment/foo`; the default and template use the no-trailing-slash form for consistency and to avoid double slashes when the path is stripped for the upstream.

### Overriding env when running the container locally

The Makefile’s `podman-run` target does not pass `MIGRATION_PLANNER_API_UPSTREAM` or `MIGRATION_PLANNER_API_BASE_URL`; the container uses entrypoint defaults (`host.containers.internal:3443` and `/api/migration-assessment`), which are correct for typical local dev. To use a different API host/port or base path, pass the env vars when running the container, for example:

```bash
podman run -d --name migration-planner-ui -p 8081:8081 \
  -e MIGRATION_PLANNER_API_UPSTREAM=my-api-host:3443 \
  -e MIGRATION_PLANNER_API_BASE_URL=/api/migration-assessment \
  $(IMAGE):$(IMAGE_TAG)
```

Replace `my-api-host:3443` and the base URL as needed. The base URL must still match the value the image was built with.

---

## Files touched

| Path                              | Role                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `deploy/dev/nginx.conf.template`  | Runtime template with `${MIGRATION_PLANNER_API_UPSTREAM}` and `${MIGRATION_PLANNER_API_BASE_URL}`. |
| `deploy/dev/docker-entrypoint.sh` | Defaults env, runs `envsubst`, then `exec nginx`.                                                  |
| `deploy/dev/Containerfile`        | Copies template and entrypoint; CMD is entrypoint.                                                 |
| `deploy/dev/ui-template.yaml`     | Sets env vars and port 8081 for OpenShift deployment.                                              |

---

## References

- Standalone deployment: `docs/standalone-deployment.md`
- Make: `MIGRATION_PLANNER_API_BASE_URL` and build args in `Makefile`; `podman-run` uses entrypoint defaults (see “Overriding env when running the container locally” above for custom values).
- OpenShift: `deploy/dev/ui-template.yaml` — template parameters `MIGRATION_PLANNER_API_UPSTREAM` and `MIGRATION_PLANNER_API_BASE_URL`, container and service use port 8081.
