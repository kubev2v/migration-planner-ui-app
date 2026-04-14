import type { Source } from "@openshift-migration-advisor/planner-sdk";
import { describe, expect, it } from "vitest";

import { getNetworkConfig } from "../networkConfig";

describe("networkConfig helpers", () => {
  describe("getNetworkConfig", () => {
    it("should extract all network fields correctly with static config", () => {
      const source: Partial<Source> = {
        infra: {
          vmNetwork: {
            ipv4: {
              ipAddress: "192.168.1.100",
              subnetMask: "255.255.255.0",
              defaultGateway: "192.168.1.1",
              dns: "8.8.8.8",
            },
          },
        },
      };

      const config = getNetworkConfig(source as Source);

      expect(config).toEqual({
        networkConfigType: "static",
        ipAddress: "192.168.1.100",
        subnetMask: "255.255.255.0",
        defaultGateway: "192.168.1.1",
        dns: "8.8.8.8",
      });
    });

    it("should return dhcp when vmNetwork is undefined", () => {
      const source: Partial<Source> = {
        infra: {
          vmNetwork: undefined,
        },
      };

      const config = getNetworkConfig(source as Source);

      expect(config).toEqual({
        networkConfigType: "dhcp",
        ipAddress: "",
        subnetMask: "",
        defaultGateway: "",
        dns: "",
      });
    });

    it("should return dhcp when infra is undefined", () => {
      const source: Partial<Source> = {
        infra: undefined,
      };

      const config = getNetworkConfig(source as Source);

      expect(config).toEqual({
        networkConfigType: "dhcp",
        ipAddress: "",
        subnetMask: "",
        defaultGateway: "",
        dns: "",
      });
    });

    it("should return dhcp when vmNetwork.ipv4 is undefined", () => {
      const source: Partial<Source> = {
        infra: {
          vmNetwork: {
            ipv4: undefined,
          },
        },
      };

      const config = getNetworkConfig(source as Source);

      expect(config).toEqual({
        networkConfigType: "dhcp",
        ipAddress: "",
        subnetMask: "",
        defaultGateway: "",
        dns: "",
      });
    });

    it("should handle undefined source gracefully", () => {
      const config = getNetworkConfig(undefined);

      expect(config).toEqual({
        networkConfigType: "dhcp",
        ipAddress: "",
        subnetMask: "",
        defaultGateway: "",
        dns: "",
      });
    });
  });
});
