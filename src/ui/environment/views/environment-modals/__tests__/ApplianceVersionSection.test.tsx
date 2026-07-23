import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApplianceVersionSection } from "../ApplianceVersionSection";

describe("ApplianceVersionSection", () => {
  it("renders version and release notes link", () => {
    render(
      <ApplianceVersionSection
        displayVersion="v0.13.6"
        isLoading={false}
        releaseNotesUrl="https://kubev2v.github.io/openshift-migration-advisor-docs/releases/"
      />,
    );

    expect(screen.getByText("Appliance version")).toBeInTheDocument();
    expect(screen.getByText("v0.13.6")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View release documentation/i }),
    ).toHaveAttribute(
      "href",
      "https://kubev2v.github.io/openshift-migration-advisor-docs/releases/",
    );
  });

  it("renders a bold definition label in download modal layout", () => {
    render(
      <ApplianceVersionSection
        displayVersion="v0.13.6"
        isLoading={false}
        releaseNotesUrl="https://kubev2v.github.io/openshift-migration-advisor-docs/releases/"
        labelVariant="definition"
      />,
    );

    const label = screen.getByText("Appliance version");
    expect(label.tagName).toBe("DT");
  });

  it("shows a loading spinner while version info is loading", () => {
    render(
      <ApplianceVersionSection
        isLoading={true}
        releaseNotesUrl="https://kubev2v.github.io/openshift-migration-advisor-docs/releases/"
      />,
    );

    expect(
      screen.getByRole("progressbar", { name: "Loading appliance version" }),
    ).toBeInTheDocument();
  });
});
