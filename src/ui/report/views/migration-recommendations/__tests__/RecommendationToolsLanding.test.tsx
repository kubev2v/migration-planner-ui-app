import "@testing-library/jest-dom";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRecommendationToolCards } from "../constants";
import { RecommendationToolsLanding } from "../RecommendationToolsLanding";

afterEach(() => cleanup());

describe("RecommendationToolsLanding", () => {
  it("renders the heading, description, and environment-wide cards", () => {
    const onSelectTool = vi.fn();
    render(
      <RecommendationToolsLanding
        tools={getRecommendationToolCards(true)}
        onSelectTool={onSelectTool}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Migration recommendations" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Use recommendations tool for additional migration information.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Migration time estimation")).toBeInTheDocument();
    expect(screen.getByText("Migration complexity")).toBeInTheDocument();
    expect(
      screen.queryByText("OpenShift cluster architecture"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Migration plan")).not.toBeInTheDocument();
  });

  it("renders cluster-scoped cards including the disabled plan placeholder", () => {
    render(
      <RecommendationToolsLanding
        tools={getRecommendationToolCards(false)}
        onSelectTool={vi.fn()}
      />,
    );

    expect(
      screen.getByText("OpenShift cluster architecture"),
    ).toBeInTheDocument();
    expect(screen.getByText("Migration time estimation")).toBeInTheDocument();
    expect(screen.getByText("Migration complexity")).toBeInTheDocument();
    expect(screen.getByText("Migration plan")).toBeInTheDocument();
    expect(
      screen.getByText("Plan content placeholder (coming soon)."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Open Migration plan tool/ }),
    ).not.toBeInTheDocument();
  });

  it("opens a tool when Open tool is clicked", () => {
    const onSelectTool = vi.fn();
    render(
      <RecommendationToolsLanding
        tools={getRecommendationToolCards(true)}
        onSelectTool={onSelectTool}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Migration time estimation tool",
      }),
    );

    expect(onSelectTool).toHaveBeenCalledWith("time-estimation");
  });
});
