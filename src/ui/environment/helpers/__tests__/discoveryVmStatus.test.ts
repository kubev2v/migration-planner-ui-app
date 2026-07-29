import { describe, expect, it } from "vitest";

import type { SourceModel } from "../../../../models/SourceModel";
import {
  DISCOVERY_VM_STATUS_FILTER_NOT_CONNECTED_UPLOADED,
  DISCOVERY_VM_STATUS_FILTER_OPTIONS,
  getDiscoveryVmStatusLabel,
  getSourceDiscoveryVmStatusLabel,
  sourceMatchesDiscoveryVmStatusFilter,
} from "../discoveryVmStatus";

const makeSource = (
  overrides: Partial<SourceModel> & Pick<SourceModel, "id" | "name">,
): SourceModel =>
  ({
    displayStatus: "not-connected",
    onPremises: false,
    ...overrides,
  }) as SourceModel;

describe("discoveryVmStatus", () => {
  it("maps error and up-to-date to the Appliance status labels", () => {
    expect(getDiscoveryVmStatusLabel("error")).toBe("Sharing error");
    expect(getDiscoveryVmStatusLabel("up-to-date")).toBe(
      "Sharing with Red Hat",
    );
  });

  it("maps source-gone to Source removed", () => {
    expect(getDiscoveryVmStatusLabel("source-gone")).toBe("Source removed");
  });

  it("includes source-gone in filter options", () => {
    expect(
      DISCOVERY_VM_STATUS_FILTER_OPTIONS.some((o) => o.key === "source-gone"),
    ).toBe(true);
    expect(
      DISCOVERY_VM_STATUS_FILTER_OPTIONS.find((o) => o.key === "source-gone")
        ?.label,
    ).toBe("Source removed");
  });

  it("includes Uploaded manually in Appliance status filter options", () => {
    expect(
      DISCOVERY_VM_STATUS_FILTER_OPTIONS.some(
        (o) => o.label === "Uploaded manually",
      ),
    ).toBe(true);
  });

  it("maps manual inventory uploads to Uploaded manually", () => {
    const source = makeSource({
      id: "manual-1",
      name: "Manual",
      onPremises: true,
      inventory: {} as SourceModel["inventory"],
      displayStatus: "not-connected",
    });
    expect(getSourceDiscoveryVmStatusLabel(source)).toBe("Uploaded manually");
    expect(
      sourceMatchesDiscoveryVmStatusFilter(
        source,
        DISCOVERY_VM_STATUS_FILTER_NOT_CONNECTED_UPLOADED,
      ),
    ).toBe(true);
    expect(sourceMatchesDiscoveryVmStatusFilter(source, "not-connected")).toBe(
      false,
    );
  });

  it("filters by source-gone using display label mapping", () => {
    const source = makeSource({
      id: "gone-1",
      name: "Removed",
      displayStatus: "source-gone",
    });
    expect(getSourceDiscoveryVmStatusLabel(source)).toBe("Source removed");
    expect(sourceMatchesDiscoveryVmStatusFilter(source, "source-gone")).toBe(
      true,
    );
    expect(sourceMatchesDiscoveryVmStatusFilter(source, "up-to-date")).toBe(
      false,
    );
  });
});
