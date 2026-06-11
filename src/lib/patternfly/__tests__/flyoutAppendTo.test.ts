import { describe, expect, it } from "vitest";

import { getFlyoutAppendTo } from "../flyoutAppendTo";

describe("getFlyoutAppendTo", () => {
  it("appends flyouts to document.body for PatternFly typography inheritance", () => {
    expect(getFlyoutAppendTo()).toBe(document.body);
  });
});
