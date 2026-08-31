import { OsInfoSupportTierEnum } from "@openshift-migration-advisor/planner-sdk";
import { describe, expect, it } from "vitest";

import { getExampleOsSupportTier } from "../exampleOsSupportTiers";
import { getExampleInventory } from "../inventoryFixture";

describe("getExampleOsSupportTier", () => {
  it("maps certified guest operating systems", () => {
    expect(getExampleOsSupportTier("Red Hat Enterprise Linux 9 (64-bit)")).toBe(
      OsInfoSupportTierEnum.Certified,
    );
    expect(
      getExampleOsSupportTier("Microsoft Windows Server 2022 (64-bit)"),
    ).toBe(OsInfoSupportTierEnum.Certified);
  });

  it("maps commercial vendor supported guest operating systems", () => {
    expect(getExampleOsSupportTier("SUSE Linux Enterprise 15 (64-bit)")).toBe(
      OsInfoSupportTierEnum.VendorSupported,
    );
    expect(getExampleOsSupportTier("Microsoft Windows 10 (64-bit)")).toBe(
      OsInfoSupportTierEnum.VendorSupported,
    );
    expect(getExampleOsSupportTier("Microsoft Windows 11 (64-bit)")).toBe(
      OsInfoSupportTierEnum.VendorSupported,
    );
  });

  it("maps community supported guest operating systems", () => {
    expect(getExampleOsSupportTier("CentOS 9 (64-bit)")).toBe(
      OsInfoSupportTierEnum.CommunitySupported,
    );
    expect(getExampleOsSupportTier("Ubuntu Linux (64-bit)")).toBe(
      OsInfoSupportTierEnum.CommunitySupported,
    );
    expect(getExampleOsSupportTier("Debian GNU/Linux 12 (64-bit)")).toBe(
      OsInfoSupportTierEnum.CommunitySupported,
    );
    expect(getExampleOsSupportTier("Red Hat Fedora (64-bit)")).toBe(
      OsInfoSupportTierEnum.CommunitySupported,
    );
    expect(getExampleOsSupportTier("Amazon Linux 2 (64-bit)")).toBe(
      OsInfoSupportTierEnum.CommunitySupported,
    );
  });

  it("maps remaining guest operating systems to special handling", () => {
    expect(getExampleOsSupportTier("Other Linux (64-bit)")).toBe(
      OsInfoSupportTierEnum.SpecialHandling,
    );
    expect(getExampleOsSupportTier("VMware ESXi 8.0 or later")).toBe(
      OsInfoSupportTierEnum.SpecialHandling,
    );
    expect(getExampleOsSupportTier("VMware Photon OS (64-bit)")).toBe(
      OsInfoSupportTierEnum.SpecialHandling,
    );
  });
});

describe("example inventory OS support tiers", () => {
  it("includes all four support tiers in the example inventory", () => {
    const inventory = getExampleInventory();
    const tiers = new Set(
      Object.values(inventory.vcenter?.vms?.osInfo ?? {}).map(
        (info) => info.supportTier,
      ),
    );

    expect(tiers).toEqual(
      new Set([
        OsInfoSupportTierEnum.Certified,
        OsInfoSupportTierEnum.VendorSupported,
        OsInfoSupportTierEnum.CommunitySupported,
        OsInfoSupportTierEnum.SpecialHandling,
      ]),
    );
  });
});
