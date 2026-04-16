import type { Source } from "@openshift-migration-advisor/planner-sdk";
import { describe, expect, it } from "vitest";

import { getProxyConfig } from "../proxyConfig";

describe("proxyConfig helpers", () => {
  describe("getProxyConfig", () => {
    it("should extract all proxy fields correctly", () => {
      const source: Partial<Source> = {
        infra: {
          proxy: {
            httpUrl: "http://proxy.example.com:8080",
            httpsUrl: "https://proxy.example.com:8443",
            noProxy: "test.example.org",
          },
        },
      };

      const config = getProxyConfig(source as Source);

      expect(config).toEqual({
        httpProxy: "http://proxy.example.com:8080",
        httpsProxy: "https://proxy.example.com:8443",
        noProxy: "test.example.org",
        enableProxy: true,
      });
    });

    it("should return empty strings when proxy is null", () => {
      const source: Partial<Source> = {
        infra: {
          proxy: {
            httpUrl: null,
            httpsUrl: null,
            noProxy: null,
          },
        },
      };

      const config = getProxyConfig(source as Source);

      expect(config).toEqual({
        httpProxy: "",
        httpsProxy: "",
        noProxy: "",
        enableProxy: false,
      });
    });

    it("should return empty strings when infra is undefined", () => {
      const source: Partial<Source> = {
        infra: undefined,
      };

      const config = getProxyConfig(source as Source);

      expect(config).toEqual({
        httpProxy: "",
        httpsProxy: "",
        noProxy: "",
        enableProxy: false,
      });
    });

    it("should detect enableProxy when only noProxy is set", () => {
      const source: Partial<Source> = {
        infra: {
          proxy: {
            httpUrl: null,
            httpsUrl: null,
            noProxy: "test.example.org",
          },
        },
      };

      const config = getProxyConfig(source as Source);

      expect(config.enableProxy).toBe(true);
      expect(config.noProxy).toBe("test.example.org");
    });

    it("should handle undefined source gracefully", () => {
      const config = getProxyConfig(undefined);

      expect(config).toEqual({
        httpProxy: "",
        httpsProxy: "",
        noProxy: "",
        enableProxy: false,
      });
    });

    it("should treat whitespace-only proxy values as empty (enableProxy=false)", () => {
      const source: Partial<Source> = {
        infra: {
          proxy: {
            httpUrl: "   ",
            httpsUrl: "  ",
            noProxy: " ",
          },
        },
      };

      const config = getProxyConfig(source as Source);

      expect(config).toEqual({
        httpProxy: "   ",
        httpsProxy: "  ",
        noProxy: " ",
        enableProxy: false,
      });
    });
  });
});
