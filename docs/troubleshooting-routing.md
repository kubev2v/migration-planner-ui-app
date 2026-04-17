# Troubleshooting Routing Issues

## Issue: Incorrect URLs in Production (Missing Basename)

### Symptom

URLs in production are missing the `/openshift/migration-advisor` prefix:

- ❌ `https://console.redhat.com/assessments/xxx/report`
- ✅ `https://console.redhat.com/openshift/migration-advisor/assessments/xxx/report`

This typically occurs after specific navigation flows like:

- Uploading an RVTool file and navigating to the report
- Deep linking from external sources
- Page refreshes during specific workflows

### Root Cause

The issue was caused by **module-load timing** in the federated module environment:

1. In production, the app is loaded as a **Webpack federated module** by the Red Hat Console Chrome
2. The Chrome provides a shared `react-router-dom` instance
3. The `Routes.ts` module was computing `APP_BASENAME` **once at module-load time**
4. If the module loaded before the Chrome's routing was fully initialized, or during hot-module reloading, the basename detection would run against an incorrect URL
5. This caused `APP_BASENAME` to be cached as `""` (empty) even in production

### Solution (Implemented)

The `routes` object now uses **dynamic getters** instead of static constants:

```typescript
// Before (static, computed once)
export const routes = {
  assessments: `${APP_BASENAME}/assessments`,
  assessmentReport: (id: string) => `${APP_BASENAME}/assessments/${id}/report`,
};

// After (dynamic, computed on each access)
export const routes = {
  get assessments() {
    return `${getAppBasename()}/assessments`;
  },
  assessmentReport: (id: string) =>
    `${getAppBasename()}/assessments/${id}/report`,
};
```

Each access to a route now:

1. Calls `getAppBasename()` fresh
2. Reads the current `window.location.pathname`
3. Determines the correct basename for the current context
4. Returns the properly prefixed URL

### Debugging in Production

The routes module logs basename detection events to help diagnose issues:

```javascript
// Check the console for:
[Routes] Basename detected: {
  mode: "microfrontend",  // or "standalone"
  basename: "/openshift/migration-advisor",  // or "(root)"
  currentPathname: "/openshift/migration-advisor/assessments",
  timestamp: "2026-03-06T12:34:56.789Z"
}
```

This log appears:

- On first basename detection
- Whenever the detected basename changes during the session

**Note**: If you see the mode switching between `standalone` and `microfrontend`
during a session, this indicates a routing configuration issue with the Chrome host.

### Prevention

To prevent similar issues in the future:

1. **Never hardcode the basename** in navigation code:

   ```typescript
   // ❌ BAD
   navigate("/openshift/migration-advisor/assessments");

   // ✅ GOOD
   navigate(routes.assessments);
   ```

2. **Never cache computed routes** at module-load time — use getters or functions

3. **Always use the `routes` object** for all navigation, breadcrumbs, and pathname comparisons

4. **Test both modes** when adding new routes:
   - Standalone: `npm run dev:standalone` → http://localhost:3000
   - Microfrontend: Follow the FEC development setup

### Related Files

- `src/routing/Routes.ts` — Route map with dynamic basename resolution
- `src/routing/AppRoutes.tsx` — Route definitions
- `fec.config.js` — Microfrontend configuration (`appUrl`)
- `docs/app-architecture.md` — Routing architecture documentation
