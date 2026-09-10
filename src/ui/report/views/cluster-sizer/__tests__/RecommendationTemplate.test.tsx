import "@testing-library/jest-dom";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecommendationTemplate } from "../RecommendationTemplate";

afterEach(() => cleanup());

describe("RecommendationTemplate", () => {
  it("shows the form and hides results until submit", () => {
    render(
      <RecommendationTemplate
        id="architecture"
        preferencesContent={<div>Form fields</div>}
        resultsContent={<div>Results panel</div>}
        onGenerate={vi.fn()}
      />,
    );

    expect(screen.getByText("Form fields")).toBeInTheDocument();
    expect(screen.queryByText("Results panel")).not.toBeInTheDocument();
  });

  it("replaces the form with results after submit", () => {
    const onGenerate = vi.fn();
    render(
      <RecommendationTemplate
        id="architecture"
        preferencesContent={<div>Form fields</div>}
        resultsContent={<div>Results panel</div>}
        onGenerate={onGenerate}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Generate recommendation" }),
    );

    expect(onGenerate).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Results panel")).toBeInTheDocument();
    expect(screen.queryByText("Form fields")).not.toBeInTheDocument();
  });

  it("starts on results when initialShowResults is set", () => {
    render(
      <RecommendationTemplate
        id="architecture"
        preferencesContent={<div>Form fields</div>}
        resultsContent={<div>Results panel</div>}
        onGenerate={vi.fn()}
        initialShowResults
        isPreferencesDisabled
      />,
    );

    expect(screen.getByText("Results panel")).toBeInTheDocument();
    expect(screen.queryByText("Form fields")).not.toBeInTheDocument();
  });

  it("notifies the parent when the controlled phase should change", () => {
    const onPhaseChange = vi.fn();
    render(
      <RecommendationTemplate
        id="architecture"
        preferencesContent={<div>Form fields</div>}
        resultsContent={<div>Results panel</div>}
        onGenerate={vi.fn()}
        phase="form"
        onPhaseChange={onPhaseChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Generate recommendation" }),
    );

    expect(onPhaseChange).toHaveBeenCalledWith("results");
  });
});
