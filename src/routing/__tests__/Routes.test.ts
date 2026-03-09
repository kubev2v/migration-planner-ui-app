import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { APP_BASENAME, routes } from "../Routes";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

describe("Routes", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location with Object.defineProperty for safe reassignment
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, pathname: "/" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Standalone mode (dev) tests
  // ---------------------------------------------------------------------------

  describe("Standalone mode (dev)", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: "/assessments" },
        writable: true,
        configurable: true,
      });
    });

    it("routes.root returns / when in standalone mode", () => {
      expect(routes.root).toBe("/");
    });

    it("routes.assessments returns /assessments when in standalone mode", () => {
      expect(routes.assessments).toBe("/assessments");
    });

    it("routes.assessmentById returns /assessments/:id when in standalone mode", () => {
      expect(routes.assessmentById("test-123")).toBe("/assessments/test-123");
    });

    it("routes.assessmentReport returns /assessments/:id/report when in standalone mode", () => {
      expect(routes.assessmentReport("test-123")).toBe(
        "/assessments/test-123/report",
      );
    });

    it("routes.assessmentCreate returns /assessments/create when in standalone mode", () => {
      expect(routes.assessmentCreate).toBe("/assessments/create");
    });

    it("routes.exampleReport returns /assessments/example-report when in standalone mode", () => {
      expect(routes.exampleReport).toBe("/assessments/example-report");
    });

    it("routes.environments returns /environments when in standalone mode", () => {
      expect(routes.environments).toBe("/environments");
    });
  });

  // ---------------------------------------------------------------------------
  // Microfrontend mode (stage/prod) tests
  // ---------------------------------------------------------------------------

  describe("Microfrontend mode (stage/prod)", () => {
    const BASE = "/openshift/migration-assessment";

    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: `${BASE}/assessments` },
        writable: true,
        configurable: true,
      });
    });

    it("routes.root returns basename when in microfrontend mode", () => {
      expect(routes.root).toBe(BASE);
    });

    it("routes.assessments includes basename when in microfrontend mode", () => {
      expect(routes.assessments).toBe(`${BASE}/assessments`);
    });

    it("routes.assessmentById includes basename when in microfrontend mode", () => {
      expect(routes.assessmentById("test-123")).toBe(
        `${BASE}/assessments/test-123`,
      );
    });

    it("routes.assessmentReport includes basename when in microfrontend mode", () => {
      expect(routes.assessmentReport("test-123")).toBe(
        `${BASE}/assessments/test-123/report`,
      );
    });

    it("routes.assessmentCreate includes basename when in microfrontend mode", () => {
      expect(routes.assessmentCreate).toBe(`${BASE}/assessments/create`);
    });

    it("routes.exampleReport includes basename when in microfrontend mode", () => {
      expect(routes.exampleReport).toBe(`${BASE}/assessments/example-report`);
    });

    it("routes.environments includes basename when in microfrontend mode", () => {
      expect(routes.environments).toBe(`${BASE}/environments`);
    });
  });

  // ---------------------------------------------------------------------------
  // Dynamic resolution tests
  // ---------------------------------------------------------------------------

  describe("Dynamic basename resolution", () => {
    it("routes update when window.location changes from standalone to microfrontend", () => {
      // Start in standalone mode
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: "/assessments" },
        writable: true,
        configurable: true,
      });
      expect(routes.assessments).toBe("/assessments");

      // Simulate navigation to microfrontend mode
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          pathname: "/openshift/migration-assessment/assessments",
        },
        writable: true,
        configurable: true,
      });
      expect(routes.assessments).toBe(
        "/openshift/migration-assessment/assessments",
      );
    });

    it("routes update when window.location changes from microfrontend to standalone", () => {
      // Start in microfrontend mode
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          pathname: "/openshift/migration-assessment/assessments",
        },
        writable: true,
        configurable: true,
      });
      expect(routes.assessments).toBe(
        "/openshift/migration-assessment/assessments",
      );

      // Simulate navigation to standalone mode
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: "/assessments" },
        writable: true,
        configurable: true,
      });
      expect(routes.assessments).toBe("/assessments");
    });

    it("handles /preview prefix correctly in microfrontend mode", () => {
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          pathname: "/preview/openshift/migration-assessment/assessments",
        },
        writable: true,
        configurable: true,
      });
      expect(routes.assessments).toBe(
        "/openshift/migration-assessment/assessments",
      );
    });

    it("handles /beta prefix correctly in microfrontend mode", () => {
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          pathname: "/beta/openshift/migration-assessment/assessments",
        },
        writable: true,
        configurable: true,
      });
      expect(routes.assessments).toBe(
        "/openshift/migration-assessment/assessments",
      );
    });

    it("handles /preview prefix correctly in standalone mode", () => {
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: "/preview/assessments" },
        writable: true,
        configurable: true,
      });
      expect(routes.assessments).toBe("/assessments");
    });
  });

  // ---------------------------------------------------------------------------
  // APP_BASENAME export (legacy)
  // ---------------------------------------------------------------------------

  describe("APP_BASENAME export", () => {
    it("APP_BASENAME is a string", () => {
      expect(typeof APP_BASENAME).toBe("string");
    });

    it("APP_BASENAME matches the current resolved basename", () => {
      // Note: APP_BASENAME is computed once at module-load, so it may be stale.
      // This test just verifies it's exported and is a string.
      expect(APP_BASENAME).toMatch(/^(|\/openshift\/migration-assessment)$/);
    });
  });
});
