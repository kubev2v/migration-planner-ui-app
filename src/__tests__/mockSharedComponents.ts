type SharedComponentsModule =
  typeof import("@openshift-migration-advisor/shared-components");

/**
 * Mocks `@openshift-migration-advisor/shared-components`, keeping every real
 * export and only replacing the ones you pass in.
 *
 * Call it *inside* the `vi.mock` factory (not to produce it) — `vi.mock` is
 * hoisted above imports, so the factory must stay a plain function that only
 * references this helper when it actually runs.
 *
 * @example
 * vi.mock(
 *   "@openshift-migration-advisor/shared-components",
 *   (importOriginal) =>
 *     mockSharedComponents(importOriginal, {
 *       OSDistribution: () => <div data-testid="os-distribution" />,
 *     }),
 * );
 */
export const mockSharedComponents = async (
  importOriginal: <T = SharedComponentsModule>() => Promise<T>,
  overrides: Partial<SharedComponentsModule>,
): Promise<SharedComponentsModule> => {
  const actual = await importOriginal<SharedComponentsModule>();

  return {
    ...actual,
    ...overrides,
  };
};
