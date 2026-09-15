import { describe, expect, it } from "vitest";

import {
  getRecommendationToolCards,
  isRecommendationToolAvailable,
} from "../constants";

describe("recommendation tool catalog", () => {
  it("returns only environment-wide tools for All vSphere clusters", () => {
    expect(
      getRecommendationToolCards({ isAggregateView: true }).map(
        (card) => card.id,
      ),
    ).toEqual(["time-estimation", "complexity"]);
  });

  it("includes cost estimation for partners on the aggregate view", () => {
    expect(
      getRecommendationToolCards({
        isAggregateView: true,
        isPartner: true,
      }).map((card) => card.id),
    ).toEqual(["cost-estimation", "time-estimation", "complexity"]);
  });

  it("returns cluster tools including the disabled plan placeholder", () => {
    const cards = getRecommendationToolCards({ isAggregateView: false });
    expect(cards.map((card) => card.id)).toEqual([
      "architecture",
      "time-estimation",
      "complexity",
      "plan",
    ]);
    expect(cards.find((card) => card.id === "plan")?.isDisabled).toBe(true);
  });

  it("includes cost estimation for partners on a single cluster", () => {
    expect(
      getRecommendationToolCards({
        isAggregateView: false,
        isPartner: true,
      }).map((card) => card.id),
    ).toEqual([
      "architecture",
      "cost-estimation",
      "time-estimation",
      "complexity",
      "plan",
    ]);
  });

  it("treats architecture as unavailable in the aggregate view", () => {
    expect(
      isRecommendationToolAvailable("architecture", { isAggregateView: true }),
    ).toBe(false);
    expect(
      isRecommendationToolAvailable("architecture", { isAggregateView: false }),
    ).toBe(true);
    expect(
      isRecommendationToolAvailable("time-estimation", {
        isAggregateView: true,
      }),
    ).toBe(true);
    expect(
      isRecommendationToolAvailable("plan", { isAggregateView: false }),
    ).toBe(false);
  });

  it("treats cost estimation as partner-only", () => {
    expect(
      isRecommendationToolAvailable("cost-estimation", {
        isAggregateView: false,
      }),
    ).toBe(false);
    expect(
      isRecommendationToolAvailable("cost-estimation", {
        isAggregateView: true,
      }),
    ).toBe(false);
    expect(
      isRecommendationToolAvailable("cost-estimation", {
        isAggregateView: false,
        isPartner: true,
      }),
    ).toBe(true);
    expect(
      isRecommendationToolAvailable("cost-estimation", {
        isAggregateView: true,
        isPartner: true,
      }),
    ).toBe(true);
  });
});
