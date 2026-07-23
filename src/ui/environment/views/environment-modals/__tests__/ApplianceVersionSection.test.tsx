import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ApplianceVersionDefinitionList,
  ApplianceVersionSection,
} from "../ApplianceVersionSection";

describe("ApplianceVersionSection", () => {
  it("renders version and release notes link", () => {
    render(
      <ApplianceVersionSection
        displayVersion="v0.13.6"
        isLoading={false}
        releaseNotesUrl="https://kubev2v.github.io/openshift-migration-advisor-docs/releases/"
      />,
    );

    expect(screen.getByText("v0.13.6")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View release documentation/i }),
    ).toHaveAttribute(
      "href",
      "https://kubev2v.github.io/openshift-migration-advisor-docs/releases/",
    );
  });

  it("wraps definition terms in a dl in download modal layout", () => {
    const { container } = render(
      <ApplianceVersionDefinitionList
        displayVersion="v0.13.6"
        isLoading={false}
        releaseNotesUrl="https://kubev2v.github.io/openshift-migration-advisor-docs/releases/"
      />,
    );

    const definitionList = container.querySelector("dl");
    expect(definitionList).not.toBeNull();
    expect(definitionList?.querySelector("dt")).toHaveTextContent(
      "Appliance version",
    );
    expect(definitionList?.querySelector("dd")).toHaveTextContent("v0.13.6");
  });

  it("shows a loading spinner while version info is loading", () => {
    render(
      <ApplianceVersionSection
        displayVersion="Unknown"
        isLoading={true}
        releaseNotesUrl="https://kubev2v.github.io/openshift-migration-advisor-docs/releases/"
      />,
    );

    expect(
      screen.getByRole("progressbar", { name: "Loading appliance version" }),
    ).toBeInTheDocument();
  });
});
