import { describe, expect, it } from "vitest";

import {
  areStaticIpFieldsEmpty,
  hasStaticIpErrors,
  validateHttpProxy,
  validateHttpsProxy,
  validateIpAddress,
  validateNoProxy,
  validateProxyGroup,
  validateStaticIpFields,
  validateSubnetMask,
} from "../validation";

describe("validation", () => {
  describe("validateIpAddress", () => {
    it("returns null for empty input", () => {
      expect(validateIpAddress("")).toBeNull();
      expect(validateIpAddress("   ")).toBeNull();
    });

    it("validates correct IP addresses", () => {
      expect(validateIpAddress("192.168.1.1")).toBeNull();
      expect(validateIpAddress("10.0.0.1")).toBeNull();
      expect(validateIpAddress("255.255.255.255")).toBeNull();
      expect(validateIpAddress("0.0.0.0")).toBeNull();
    });

    it("rejects invalid IP formats", () => {
      expect(validateIpAddress("999.999.999.999")).not.toBeNull();
      expect(validateIpAddress("192.168.1")).not.toBeNull();
      expect(validateIpAddress("192.168.1.1.1")).not.toBeNull();
      expect(validateIpAddress("abc.def.ghi.jkl")).not.toBeNull();
    });

    it("rejects octets out of range", () => {
      expect(validateIpAddress("256.1.1.1")).not.toBeNull();
      expect(validateIpAddress("1.1.1.300")).not.toBeNull();
      expect(validateIpAddress("1.1.1.-1")).not.toBeNull();
    });
  });

  describe("validateSubnetMask", () => {
    it("returns null for empty input", () => {
      expect(validateSubnetMask("")).toBeNull();
      expect(validateSubnetMask("   ")).toBeNull();
    });

    it("validates correct subnet masks", () => {
      expect(validateSubnetMask("1")).toBeNull();
      expect(validateSubnetMask("24")).toBeNull();
      expect(validateSubnetMask("32")).toBeNull();
    });

    it("rejects invalid subnet masks", () => {
      expect(validateSubnetMask("0")).toContain("between 1 and 32");
      expect(validateSubnetMask("33")).toContain("between 1 and 32");
      expect(validateSubnetMask("abc")).toContain("between 1 and 32");
      expect(validateSubnetMask("-1")).toContain("between 1 and 32");
    });
  });

  describe("validateHttpProxy", () => {
    it("returns null for empty input", () => {
      expect(validateHttpProxy("")).toBeNull();
      expect(validateHttpProxy("   ")).toBeNull();
    });

    it("validates correct HTTP URLs", () => {
      expect(validateHttpProxy("http://proxy.example.com")).toBeNull();
      expect(validateHttpProxy("http://proxy.example.com:8080")).toBeNull();
      expect(validateHttpProxy("HTTP://PROXY.COM")).toBeNull();
    });

    it("rejects non-HTTP URLs", () => {
      expect(validateHttpProxy("https://proxy.com")).toContain(
        "must start with http://",
      );
      expect(validateHttpProxy("ftp://proxy.com")).toContain(
        "must start with http://",
      );
      expect(validateHttpProxy("proxy.com")).toContain(
        "must start with http://",
      );
    });

    it("rejects invalid HTTP URLs", () => {
      expect(validateHttpProxy("http://")).not.toBeNull();
      expect(validateHttpProxy("http:// invalid")).not.toBeNull();
      expect(validateHttpProxy("http://[invalid]")).not.toBeNull();
    });
  });

  describe("validateHttpsProxy", () => {
    it("returns null for empty input", () => {
      expect(validateHttpsProxy("")).toBeNull();
      expect(validateHttpsProxy("   ")).toBeNull();
    });

    it("validates correct HTTPS URLs", () => {
      expect(validateHttpsProxy("https://proxy.example.com")).toBeNull();
      expect(validateHttpsProxy("https://proxy.example.com:8443")).toBeNull();
      expect(validateHttpsProxy("HTTPS://PROXY.COM")).toBeNull();
    });

    it("rejects non-HTTPS URLs", () => {
      expect(validateHttpsProxy("http://proxy.com")).toContain(
        "must start with https://",
      );
      expect(validateHttpsProxy("ftp://proxy.com")).toContain(
        "must start with https://",
      );
      expect(validateHttpsProxy("proxy.com")).toContain(
        "must start with https://",
      );
    });

    it("rejects invalid HTTPS URLs", () => {
      expect(validateHttpsProxy("https://")).not.toBeNull();
      expect(validateHttpsProxy("https:// invalid")).not.toBeNull();
      expect(validateHttpsProxy("https://[invalid]")).not.toBeNull();
    });
  });

  describe("validateProxyGroup", () => {
    it("returns null when proxy is disabled", () => {
      expect(validateProxyGroup(false, "", "", "")).toBeNull();
      expect(validateProxyGroup(false, "http://test", "", "")).toBeNull();
    });

    it("returns null when proxy is enabled with at least one field", () => {
      expect(validateProxyGroup(true, "http://proxy.com", "", "")).toBeNull();
      expect(validateProxyGroup(true, "", "https://proxy.com", "")).toBeNull();
      expect(validateProxyGroup(true, "", "", "example.com")).toBeNull();
    });

    it("returns error when proxy is enabled with no fields", () => {
      expect(validateProxyGroup(true, "", "", "")).toContain(
        "At least one proxy field",
      );
      expect(validateProxyGroup(true, "   ", "   ", "   ")).toContain(
        "At least one proxy field",
      );
    });
  });

  describe("validateStaticIpFields", () => {
    it("validates all fields and returns errors", () => {
      const result = validateStaticIpFields(
        "192.168.1.1",
        "24",
        "192.168.1.254",
        "8.8.8.8",
      );

      expect(result.ipAddressError).toBeNull();
      expect(result.subnetMaskError).toBeNull();
      expect(result.defaultGatewayError).toBeNull();
      expect(result.dnsError).toBeNull();
    });

    it("returns errors for invalid fields", () => {
      const result = validateStaticIpFields("invalid", "99", "bad", "wrong");

      expect(result.ipAddressError).toContain("Invalid IP");
      expect(result.subnetMaskError).toContain("between 1 and 32");
      expect(result.defaultGatewayError).toContain("Invalid IP");
      expect(result.dnsError).toContain("Invalid IP");
    });

    it("returns null errors for empty fields", () => {
      const result = validateStaticIpFields("", "", "", "");

      expect(result.ipAddressError).toBeNull();
      expect(result.subnetMaskError).toBeNull();
      expect(result.defaultGatewayError).toBeNull();
      expect(result.dnsError).toBeNull();
    });
  });

  describe("hasStaticIpErrors", () => {
    it("returns false when no errors", () => {
      expect(
        hasStaticIpErrors({
          ipAddressError: null,
          subnetMaskError: null,
          defaultGatewayError: null,
          dnsError: null,
        }),
      ).toBe(false);
    });

    it("returns true when any error exists", () => {
      expect(
        hasStaticIpErrors({
          ipAddressError: "error",
          subnetMaskError: null,
          defaultGatewayError: null,
          dnsError: null,
        }),
      ).toBe(true);

      expect(
        hasStaticIpErrors({
          ipAddressError: null,
          subnetMaskError: "error",
          defaultGatewayError: null,
          dnsError: null,
        }),
      ).toBe(true);

      expect(
        hasStaticIpErrors({
          ipAddressError: null,
          subnetMaskError: null,
          defaultGatewayError: "error",
          dnsError: null,
        }),
      ).toBe(true);

      expect(
        hasStaticIpErrors({
          ipAddressError: null,
          subnetMaskError: null,
          defaultGatewayError: null,
          dnsError: "error",
        }),
      ).toBe(true);
    });
  });

  describe("areStaticIpFieldsEmpty", () => {
    it("returns false when all fields have values", () => {
      expect(
        areStaticIpFieldsEmpty("192.168.1.1", "24", "192.168.1.254", "8.8.8.8"),
      ).toBe(false);
    });

    it("returns true when any field is empty", () => {
      expect(areStaticIpFieldsEmpty("", "24", "192.168.1.254", "8.8.8.8")).toBe(
        true,
      );
      expect(
        areStaticIpFieldsEmpty("192.168.1.1", "", "192.168.1.254", "8.8.8.8"),
      ).toBe(true);
      expect(areStaticIpFieldsEmpty("192.168.1.1", "24", "", "8.8.8.8")).toBe(
        true,
      );
      expect(
        areStaticIpFieldsEmpty("192.168.1.1", "24", "192.168.1.254", ""),
      ).toBe(true);
    });

    it("returns true when any field contains only whitespace", () => {
      expect(
        areStaticIpFieldsEmpty("   ", "24", "192.168.1.254", "8.8.8.8"),
      ).toBe(true);
      expect(
        areStaticIpFieldsEmpty(
          "192.168.1.1",
          "   ",
          "192.168.1.254",
          "8.8.8.8",
        ),
      ).toBe(true);
    });

    it("returns true when all fields are empty", () => {
      expect(areStaticIpFieldsEmpty("", "", "", "")).toBe(true);
      expect(areStaticIpFieldsEmpty("   ", "   ", "   ", "   ")).toBe(true);
    });
  });

  describe("validateNoProxy", () => {
    it("returns null for empty input", () => {
      expect(validateNoProxy("")).toBeNull();
      expect(validateNoProxy("   ")).toBeNull();
    });

    it("returns null for wildcard", () => {
      expect(validateNoProxy("*")).toBeNull();
    });

    it("validates single domain", () => {
      expect(validateNoProxy("test.example.com")).toBeNull();
      expect(validateNoProxy("example.com")).toBeNull();
      expect(validateNoProxy("sub.domain.example.com")).toBeNull();
    });

    it("validates domain with leading dot", () => {
      expect(validateNoProxy(".example.com")).toBeNull();
      expect(validateNoProxy(".test.example.com")).toBeNull();
    });

    it("validates comma-separated domains", () => {
      expect(validateNoProxy("test.example.com,example.org")).toBeNull();
      expect(validateNoProxy("test.example.com, example.org")).toBeNull();
      expect(validateNoProxy("localhost,127.0.0.1,.example.com")).toBeNull();
    });

    it("validates IP addresses", () => {
      expect(validateNoProxy("127.0.0.1")).toBeNull();
      expect(validateNoProxy("192.168.1.1")).toBeNull();
      expect(validateNoProxy("10.0.0.0")).toBeNull();
      expect(validateNoProxy("localhost,127.0.0.1")).toBeNull();
    });

    it("accepts trailing comma", () => {
      expect(validateNoProxy("test.example.com,")).toBeNull();
      expect(validateNoProxy("test.example.com, ")).toBeNull();
    });

    it("rejects invalid domain formats", () => {
      expect(validateNoProxy("-invalid.com")).not.toBeNull();
      expect(validateNoProxy("invalid-.com")).not.toBeNull();
      expect(validateNoProxy("invalid..com")).not.toBeNull();
      expect(validateNoProxy(".")).not.toBeNull();
      expect(validateNoProxy("..example.com")).not.toBeNull();
    });

    it("rejects invalid characters", () => {
      expect(validateNoProxy("invalid_domain.com")).not.toBeNull();
      expect(validateNoProxy("invalid domain.com")).not.toBeNull();
      expect(validateNoProxy("invalid@domain.com")).not.toBeNull();
    });

    it("provides helpful error message", () => {
      const result = validateNoProxy("-invalid.com");
      expect(result).toContain("Invalid entry");
      expect(result).toContain("-invalid.com");
    });
  });
});
