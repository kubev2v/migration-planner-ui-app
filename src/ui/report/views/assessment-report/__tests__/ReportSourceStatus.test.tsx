import "@testing-library/jest-dom";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ReportSourceStatus,
  RVTOOLS_FILE_UPLOAD_SOURCE,
} from "../ReportSourceStatus";

vi.mock("../../../../environment/views/AgentStatusView", () => ({
  AgentStatusView: (): React.ReactElement => (
    <div data-testid="agent-status-view" />
  ),
}));

afterEach(() => cleanup());

describe("ReportSourceStatus", () => {
  it("shows the RVTools file-upload source line", () => {
    render(<ReportSourceStatus sourceType="rvtools" />);

    expect(screen.getByText(RVTOOLS_FILE_UPLOAD_SOURCE)).toBeInTheDocument();
    expect(
      screen.queryByText(/Discovery appliance status/),
    ).not.toBeInTheDocument();
  });

  it("shows discovery appliance status for agent-based reports", () => {
    render(<ReportSourceStatus sourceType="source" />);

    expect(screen.getByText(/Discovery appliance status/)).toBeInTheDocument();
    expect(screen.getByTestId("agent-status-view")).toBeInTheDocument();
    expect(
      screen.queryByText(RVTOOLS_FILE_UPLOAD_SOURCE),
    ).not.toBeInTheDocument();
  });
});
