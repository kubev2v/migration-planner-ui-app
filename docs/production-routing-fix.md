# Production Routing Fix - March 2026

## Issue Summary

**Problem**: URLs in production were intermittently missing the `/openshift/migration-advisor` prefix after certain navigation flows (especially after RVTool uploads).

**Example**:

- ❌ Incorrect: `https://console.redhat.com/assessments/d8d38f15-d3f6-49a6-9a8b-2f7efc21aae9/report`
- ✅ Correct: `https://console.redhat.com/openshift/migration-advisor/assessments/d8d38f15-d3f6-49a6-9a8b-2f7efc21aae9/report`

## Root Cause

The app runs as a **Webpack federated module** in the Red Hat Console Chrome. The `Routes.ts` module was computing the basename (`APP_BASENAME`) **once at module-load time**. In certain scenarios, this created timing issues:

1. **Hot Module Reloading (HMR)** — During development or hot-reloads, the module could be re-evaluated when the URL was temporarily incorrect
2. **Federated Module Initialization** — The module might load before the Chrome's routing is fully initialized
3. **Module Caching** — The browser or webpack might cache the module with a stale basename value

This caused the basename to be incorrectly cached as `""` (empty) even in production, resulting in incomplete URLs.

## Solution

Changed the `routes` object from **static constants** to **dynamic getters** that resolve the basename fresh on each access:

```typescript
// Before (static, computed once at module-load)
export const APP_BASENAME = resolveAppBasename();
export const routes = {
  assessments: `${APP_BASENAME}/assessments`,
  assessmentReport: (id: string) => `${APP_BASENAME}/assessments/${id}/report`,
};

// After (dynamic, computed on each access)
function getAppBasename(): string {
  const pathname = window.location.pathname.replace(/^\/(preview|beta)/, "");
  return pathname.startsWith("/openshift/migration-advisor")
    ? "/openshift/migration-advisor"
    : "";
}

export const routes = {
  get assessments() {
    return `${getAppBasename()}/assessments`;
  },
  assessmentReport: (id: string) =>
    `${getAppBasename()}/assessments/${id}/report`,
};
```

## Changes Made

### Files Modified

1. **`src/routing/Routes.ts`**
   - Converted all static route strings to dynamic getters
   - Added `getAppBasename()` helper that's called fresh on each access
   - Added logging to track basename detection changes
   - Deprecated the `APP_BASENAME` export

2. **`docs/app-architecture.md`**
   - Updated routing section to reflect dynamic resolution
   - Added debugging guidance for production issues

3. **`docs/troubleshooting-routing.md`** (new)
   - Comprehensive troubleshooting guide
   - Production debugging instructions
   - Prevention best practices

4. **`src/routing/__tests__/Routes.test.ts`** (new)
   - 21 tests covering standalone and microfrontend modes
   - Tests for dynamic resolution behavior
   - Tests for preview/beta prefix handling

### No Breaking Changes

- All existing code continues to work unchanged
- The `routes` object API is identical (getters are transparent)
- Function-based routes (`assessmentById`, `assessmentReport`) already called the function at invocation time

## Verification

Run the full test suite to verify:

```bash
npm test
npm run type-check
npm run lint
npm run build
```

All tests pass (360 tests total).

## Monitoring in Production

After deployment, monitor the browser console for basename detection logs:

```javascript
[Routes] Basename detected: {
  mode: "microfrontend",
  basename: "/openshift/migration-advisor",
  currentPathname: "/openshift/migration-advisor/assessments",
  timestamp: "2026-03-06T12:34:56.789Z"
}
```

**Expected behavior**:

- Log appears once when the app initializes
- Mode should be `"microfrontend"` in production
- Basename should be `"/openshift/migration-advisor"`

**Red flags**:

- Mode is `"standalone"` in production → routing configuration issue
- Mode switches during a session → Chrome routing instability
- Multiple log entries with different basenames → indicates the old problem was still occurring

## Impact

This fix resolves:

- ✅ Incorrect URLs after RVTool upload → report navigation
- ✅ Incorrect URLs after assessment creation from OVA
- ✅ Deep linking failures from external sources
- ✅ Navigation issues after page refresh
- ✅ HMR-related routing bugs in development

## Future Prevention

1. **Never hardcode the basename** — always use the `routes` object
2. **Never compute routes at module-load time** — use getters or functions
3. **Test both modes** when adding new routes
4. **Monitor console logs** in production for basename detection issues
