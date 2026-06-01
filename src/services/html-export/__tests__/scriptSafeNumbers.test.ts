import { describe, expect, it } from "vitest";

import {
  coerceFiniteNumber,
  stringifyScriptNumbers,
} from "../scriptSafeNumbers";

describe("scriptSafeNumbers", () => {
  describe("coerceFiniteNumber", () => {
    it("returns finite numbers unchanged", () => {
      expect(coerceFiniteNumber(42)).toBe(42);
      expect(coerceFiniteNumber("123")).toBe(123);
    });

    it("returns 0 for non-numeric and non-finite values", () => {
      expect(coerceFiniteNumber("not-a-number")).toBe(0);
      expect(coerceFiniteNumber("</script><img src=x onerror=alert(1)>")).toBe(
        0,
      );
      expect(coerceFiniteNumber(Infinity)).toBe(0);
      expect(coerceFiniteNumber(null)).toBe(0);
      expect(coerceFiniteNumber(undefined)).toBe(0);
    });
  });

  describe("stringifyScriptNumbers", () => {
    it("serializes only JSON numbers", () => {
      expect(stringifyScriptNumbers([1, 2, 3])).toBe("[1,2,3]");
    });

    it("does not embed script-breaking strings", () => {
      const payload = "</script><img src=x onerror=alert(1)>";
      expect(stringifyScriptNumbers([payload])).toBe("[0]");
      expect(stringifyScriptNumbers([payload])).not.toContain("</script>");
    });
  });
});
