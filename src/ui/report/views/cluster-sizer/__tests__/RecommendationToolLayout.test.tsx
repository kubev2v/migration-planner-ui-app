import "@testing-library/jest-dom";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  RecommendationToolLayout,
  RecommendationToolResultsActions,
} from "../RecommendationToolLayout";

afterEach(() => cleanup());

describe("RecommendationToolLayout", () => {
  it("renders the back link, title, help, and actions", () => {
    const onBack = vi.fn();
    render(
      <RecommendationToolLayout
        title="Migration complexity"
        onBack={onBack}
        help={<span>Help</span>}
        actions={<button type="button">Copy as plain text</button>}
      >
        <div>Tool body</div>
      </RecommendationToolLayout>,
    );

    expect(
      screen.getByRole("heading", { name: "Migration complexity" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
    expect(screen.getByText("Tool body")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Back to recommendation tools/ }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe("RecommendationToolResultsActions", () => {
  it("renders edit and copy actions", () => {
    const onEdit = vi.fn();
    const onCopy = vi.fn();
    render(
      <RecommendationToolResultsActions
        isReadOnly={false}
        isEditDisabled={false}
        onEdit={onEdit}
        canCopy
        onCopy={onCopy}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Edit migration preferences" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy as plain text" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("hides edit in read-only mode", () => {
    render(
      <RecommendationToolResultsActions
        isReadOnly
        isEditDisabled={false}
        onEdit={vi.fn()}
        canCopy={false}
        onCopy={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Edit migration preferences" }),
    ).not.toBeInTheDocument();
  });
});
