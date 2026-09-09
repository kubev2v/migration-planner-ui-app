import { describe, expect, it } from "vitest";

import {
  getRecommendationToolCards,
  isRecommendationToolAvailable,
} from "../constants";

describe("recommendation tool catalog", () => {
  it("returns only environment-wide tools for All vSphere clusters", () => {
    expect(getRecommendationToolCards(true).map((card) => card.id)).toEqual([
      "time-estimation",
      "complexity",
    ]);
  });

  it("returns cluster tools including the disabled plan placeholder", () => {
    const cards = getRecommendationToolCards(false);
    expect(cards.map((card) => card.id)).toEqual([
      "architecture",
      "time-estimation",
      "complexity",
      "plan",
    ]);
    expect(cards.find((card) => card.id === "plan")?.isDisabled).toBe(true);
  });

  it("treats architecture as unavailable in the aggregate view", () => {
    expect(isRecommendationToolAvailable("architecture", true)).toBe(false);
    expect(isRecommendationToolAvailable("architecture", false)).toBe(true);
    expect(isRecommendationToolAvailable("time-estimation", true)).toBe(true);
    expect(isRecommendationToolAvailable("plan", false)).toBe(false);
  });
});
