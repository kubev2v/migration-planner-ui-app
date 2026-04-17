import "@testing-library/jest-dom";

import type { Group } from "@openshift-migration-advisor/planner-sdk";
import { Button } from "@patternfly/react-core";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GroupForm } from "../GroupForm";

const mockGroup: Group = {
  id: "org-1",
  name: "Tech Solutions Inc",
  company: "",
  description: "Test partner description",
  icon: "data:image/svg+xml;base64,test",
  kind: "partner",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Edit GroupForm", () => {
  it("renders all form fields with partner data", () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = render(
      <GroupForm
        id="edit-group-form"
        group={mockGroup}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(getByRole("textbox", { name: /Group Name/i })).toHaveValue(
      "Tech Solutions Inc",
    );
    expect(getByRole("textbox", { name: /Company/i })).toHaveValue("");
    const kindSelect = getByRole("combobox", { name: /Kind/i });
    expect(kindSelect).toHaveValue("partner");
    expect(kindSelect).toBeDisabled();
    expect(getByRole("textbox", { name: /Description/i })).toHaveValue(
      "Test partner description",
    );
    expect(getByRole("textbox", { name: /Icon/i })).toHaveValue(
      "data:image/svg+xml;base64,test",
    );
  });

  it("submits the form with correct values including partner id", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <GroupForm
          id="edit-group-form"
          group={mockGroup}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-group-form">
          Save
        </Button>
      </>,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });
    await user.clear(groupName);
    await user.type(groupName, "Updated Partner Name");

    const company = getByRole("textbox", { name: /Company/i });
    await user.type(company, "Updated Company");

    const description = getByRole("textbox", { name: /Description/i });
    await user.clear(description);
    await user.type(description, "Updated description");

    const icon = getByRole("textbox", { name: /Icon/i });
    await user.clear(icon);
    await user.type(icon, "data:image/svg+xml;base64,updated");

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        id: "org-1",
        name: "Updated Partner Name",
        company: "Updated Company",
        description: "Updated description",
        icon: "data:image/svg+xml;base64,updated",
      });
    });
  });

  it("displays error messages for required fields on submit", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <>
        <GroupForm
          id="edit-group-form"
          group={mockGroup}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-group-form">
          Save
        </Button>
      </>,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });
    await user.clear(groupName);

    const company = getByRole("textbox", { name: /Company/i });
    await user.clear(company);

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Error messages should appear
    expect(getByText("Name is required")).toBeInTheDocument();
    expect(getByText("Company is required")).toBeInTheDocument();
  });

  it("clears error when user starts typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(
      <>
        <GroupForm
          id="edit-group-form"
          group={mockGroup}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-group-form">
          Save
        </Button>
      </>,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });
    await user.clear(groupName);

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    // Error should appear
    expect(getByText("Name is required")).toBeInTheDocument();

    // Type in the field
    await user.type(groupName, "A");

    // Error should disappear
    await waitFor(() => {
      expect(queryByText("Name is required")).not.toBeInTheDocument();
    });
  });

  it("updates form fields when typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <GroupForm
        id="edit-group-form"
        group={mockGroup}
        onSubmit={mockOnSubmit}
      />,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });
    await user.clear(groupName);
    await user.type(groupName, "New Partner Name");

    expect(groupName).toHaveValue("New Partner Name");
  });

  it("displays error on blur for empty required field", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <GroupForm
        id="edit-group-form"
        group={mockGroup}
        onSubmit={mockOnSubmit}
      />,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });

    // Clear and then blur
    await user.clear(groupName);
    await user.tab();

    await waitFor(() => {
      expect(getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("allows icon field to be empty", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <GroupForm
          id="edit-group-form"
          group={mockGroup}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-group-form">
          Save
        </Button>
      </>,
    );

    const company = getByRole("textbox", { name: /Company/i });
    await user.type(company, "Test Company");

    const icon = getByRole("textbox", { name: /Icon/i });
    await user.clear(icon);

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    // Should submit successfully with empty icon
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        id: "org-1",
        name: "Tech Solutions Inc",
        company: "Test Company",
        description: "Test partner description",
        icon: "",
      });
    });
  });
});

describe("Create GroupForm", () => {
  it("renders all form fields empty", () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = render(
      <GroupForm id="create-group-form" onSubmit={mockOnSubmit} />,
    );

    expect(getByRole("textbox", { name: /Group Name/i })).toHaveValue("");
    expect(getByRole("textbox", { name: /Company/i })).toHaveValue("");
    expect(getByRole("combobox", { name: /Kind/i })).toHaveValue("partner");
    expect(getByRole("textbox", { name: /Description/i })).toHaveValue("");
    expect(getByRole("textbox", { name: /Icon/i })).toHaveValue("");
  });

  it("submits the form with correct values without id", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <GroupForm id="create-group-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-group-form">
          Create
        </Button>
      </>,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });
    await user.type(groupName, mockGroup.name);

    const company = getByRole("textbox", { name: /Company/i });
    await user.type(company, "Test Company");

    const kindSelect = getByRole("combobox", { name: /Kind/i });
    await user.selectOptions(kindSelect, "admin");

    const description = getByRole("textbox", { name: /Description/i });
    await user.type(description, mockGroup.description || "");

    const icon = getByRole("textbox", { name: /Icon/i });
    await user.type(icon, mockGroup.icon || "");

    const createButton = getByRole("button", { name: /Create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        name: mockGroup.name,
        company: "Test Company",
        description: mockGroup.description,
        icon: mockGroup.icon,
        kind: "admin",
      });
    });
  });

  it("displays error messages for required fields on submit", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <>
        <GroupForm id="create-group-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-group-form">
          Create
        </Button>
      </>,
    );

    const createButton = getByRole("button", { name: /Create/i });
    await user.click(createButton);

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Error messages should appear
    expect(getByText("Name is required")).toBeInTheDocument();
    expect(getByText("Company is required")).toBeInTheDocument();
  });

  it("clears error when user starts typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(
      <>
        <GroupForm id="create-group-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-group-form">
          Create
        </Button>
      </>,
    );

    const createButton = getByRole("button", { name: /Create/i });
    await user.click(createButton);

    // Error should appear
    expect(getByText("Name is required")).toBeInTheDocument();

    // Type in the field
    const groupName = getByRole("textbox", { name: /Group Name/i });
    await user.type(groupName, "A");

    // Error should disappear
    await waitFor(() => {
      expect(queryByText("Name is required")).not.toBeInTheDocument();
    });
  });

  it("updates form fields when typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <GroupForm id="create-group-form" onSubmit={mockOnSubmit} />,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });
    await user.type(groupName, "New Partner Name");

    expect(groupName).toHaveValue("New Partner Name");
  });

  it("displays error on blur for empty required field", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <GroupForm id="create-group-form" onSubmit={mockOnSubmit} />,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });

    // Type something then clear and blur
    await user.type(groupName, "test");
    await user.clear(groupName);
    await user.tab();

    await waitFor(() => {
      expect(getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("allows icon and description fields to be empty", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <GroupForm id="create-group-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-group-form">
          Create
        </Button>
      </>,
    );

    const groupName = getByRole("textbox", { name: /Group Name/i });
    await user.type(groupName, mockGroup.name);

    const company = getByRole("textbox", { name: /Company/i });
    await user.type(company, "Test Company");

    const createButton = getByRole("button", { name: /Create/i });
    await user.click(createButton);

    // Should submit successfully with empty icon and description
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        name: mockGroup.name,
        company: "Test Company",
        description: "",
        icon: "",
        kind: "partner",
      });
    });
  });
});
