import { safeExternalUrl } from "../urlValidation";

describe("safeExternalUrl", () => {
  describe("should return the URL for valid http/https URLs", () => {
    test("https URL", () => {
      expect(safeExternalUrl("https://example.com")).toBe(
        "https://example.com",
      );
    });

    test("http URL", () => {
      expect(safeExternalUrl("http://example.com")).toBe("http://example.com");
    });

    test("https URL with path", () => {
      expect(safeExternalUrl("https://example.com/path/to/resource")).toBe(
        "https://example.com/path/to/resource",
      );
    });

    test("https URL with query parameters", () => {
      expect(safeExternalUrl("https://example.com?foo=bar&baz=qux")).toBe(
        "https://example.com?foo=bar&baz=qux",
      );
    });

    test("https URL with fragment", () => {
      expect(safeExternalUrl("https://example.com#section")).toBe(
        "https://example.com#section",
      );
    });

    test("https URL with port", () => {
      expect(safeExternalUrl("https://example.com:8443/api")).toBe(
        "https://example.com:8443/api",
      );
    });
  });

  describe("should return undefined for dangerous protocols (XSS prevention)", () => {
    test("javascript: protocol", () => {
      expect(safeExternalUrl("javascript:alert(1)")).toBeUndefined();
    });

    test("javascript: protocol with encoded characters", () => {
      expect(
        safeExternalUrl("javascript:alert(document.cookie)"),
      ).toBeUndefined();
    });

    test("data: protocol", () => {
      expect(
        safeExternalUrl("data:text/html,<script>alert(1)</script>"),
      ).toBeUndefined();
    });

    test("vbscript: protocol", () => {
      expect(safeExternalUrl("vbscript:msgbox(1)")).toBeUndefined();
    });

    test("file: protocol", () => {
      expect(safeExternalUrl("file:///etc/passwd")).toBeUndefined();
    });

    test("ftp: protocol", () => {
      expect(safeExternalUrl("ftp://example.com")).toBeUndefined();
    });
  });

  describe("should return undefined for null, undefined, and empty values", () => {
    test("null", () => {
      expect(safeExternalUrl(null)).toBeUndefined();
    });

    test("undefined", () => {
      expect(safeExternalUrl(undefined)).toBeUndefined();
    });

    test("empty string", () => {
      expect(safeExternalUrl("")).toBeUndefined();
    });
  });

  describe("should return undefined for invalid URLs", () => {
    test("malformed URL", () => {
      expect(safeExternalUrl("not-a-url")).toBeUndefined();
    });

    test("URL without protocol", () => {
      expect(safeExternalUrl("example.com")).toBeUndefined();
    });

    test("invalid characters", () => {
      expect(safeExternalUrl("https://exam ple.com")).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    test("protocol-relative URL (//example.com)", () => {
      // Protocol-relative URLs are not valid for URL constructor without a base
      expect(safeExternalUrl("//example.com")).toBeUndefined();
    });

    test("URL with credentials", () => {
      expect(safeExternalUrl("https://user:pass@example.com")).toBe(
        "https://user:pass@example.com",
      );
    });

    test("localhost URL", () => {
      expect(safeExternalUrl("http://localhost:3000")).toBe(
        "http://localhost:3000",
      );
    });

    test("IP address URL", () => {
      expect(safeExternalUrl("https://192.168.1.1")).toBe(
        "https://192.168.1.1",
      );
    });

    test("mixed case protocol (hTTps:)", () => {
      // URL constructor normalizes protocols to lowercase
      expect(safeExternalUrl("hTTps://example.com")).toBe(
        "hTTps://example.com",
      );
    });
  });
});
