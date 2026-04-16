import "@testing-library/jest-dom";

import type { Group } from "@openshift-migration-advisor/planner-sdk";
import { Button } from "@patternfly/react-core";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditGroupForm } from "../EditGroupForm";

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

describe("EditGroupForm", () => {
  it("renders all form fields with partner data", () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = render(
      <EditGroupForm
        id="edit-group-form"
        group={mockGroup}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(getByRole("textbox", { name: /Group Name/i })).toHaveValue(
      "Tech Solutions Inc",
    );
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
        <EditGroupForm
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
        <EditGroupForm
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

    const description = getByRole("textbox", { name: /Description/i });
    await user.clear(description);

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Error messages should appear
    expect(getByText("Group Name is required")).toBeInTheDocument();
    expect(getByText("Description is required")).toBeInTheDocument();
  });

  it("clears error when user starts typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(
      <>
        <EditGroupForm
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
    expect(getByText("Group Name is required")).toBeInTheDocument();

    // Type in the field
    await user.type(groupName, "A");

    // Error should disappear
    await waitFor(() => {
      expect(queryByText("Group Name is required")).not.toBeInTheDocument();
    });
  });

  it("updates form fields when typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <EditGroupForm
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
      <EditGroupForm
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
      expect(getByText("Group Name is required")).toBeInTheDocument();
    });
  });

  it("allows icon field to be empty", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <EditGroupForm
          id="edit-group-form"
          group={mockGroup}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-group-form">
          Save
        </Button>
      </>,
    );

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
        description: "Test partner description",
        icon: "",
      });
    });
  });
});
