import "@testing-library/jest-dom";

import type { Member } from "@openshift-migration-advisor/planner-sdk";
import { Button } from "@patternfly/react-core";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GroupMemberForm } from "../GroupMemberForm";

const mockMember: Member = {
  username: "johndoe",
  email: "john.doe@example.com",
  groupId: "group-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Edit GroupMemberForm", () => {
  it("renders all form fields with member data", () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = render(
      <GroupMemberForm
        id="edit-member-form"
        member={mockMember}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(getByRole("textbox", { name: /Username/i })).toHaveValue("johndoe");
    expect(getByRole("textbox", { name: /Username/i })).toBeDisabled();
    expect(getByRole("textbox", { name: /Email/i })).toHaveValue(
      "john.doe@example.com",
    );
  });

  it("submits the form with correct values", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <GroupMemberForm
          id="edit-member-form"
          member={mockMember}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-member-form">
          Save
        </Button>
      </>,
    );

    const email = getByRole("textbox", { name: /Email/i });
    await user.clear(email);
    await user.type(email, "updated.email@example.com");

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toMatchObject({
        username: "johndoe",
        email: "updated.email@example.com",
      });
    });
  });

  it("displays error messages for required fields on submit", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <>
        <GroupMemberForm
          id="edit-member-form"
          member={mockMember}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-member-form">
          Save
        </Button>
      </>,
    );

    const email = getByRole("textbox", { name: /Email/i });
    await user.clear(email);

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Error message should appear
    expect(getByText("Email is required")).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <>
        <GroupMemberForm
          id="edit-member-form"
          member={mockMember}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-member-form">
          Save
        </Button>
      </>,
    );

    const email = getByRole("textbox", { name: /Email/i });
    await user.clear(email);
    await user.type(email, "invalid-email");

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Error message should appear
    expect(getByText("Email must be valid")).toBeInTheDocument();
  });

  it("clears error when user starts typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(
      <>
        <GroupMemberForm
          id="edit-member-form"
          member={mockMember}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-member-form">
          Save
        </Button>
      </>,
    );

    const email = getByRole("textbox", { name: /Email/i });
    await user.clear(email);

    const saveButton = getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    // Error should appear
    expect(getByText("Email is required")).toBeInTheDocument();

    // Type in the field
    await user.type(email, "a");

    // Error should disappear
    await waitFor(() => {
      expect(queryByText("Email is required")).not.toBeInTheDocument();
    });
  });

  it("displays error on blur for empty required field", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <GroupMemberForm
        id="edit-member-form"
        member={mockMember}
        onSubmit={mockOnSubmit}
      />,
    );

    const email = getByRole("textbox", { name: /Email/i });

    // Clear and then blur
    await user.clear(email);
    await user.tab();

    await waitFor(() => {
      expect(getByText("Email is required")).toBeInTheDocument();
    });
  });
});

describe("Create GroupMemberForm", () => {
  it("renders all form fields empty", () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = render(
      <GroupMemberForm id="create-member-form" onSubmit={mockOnSubmit} />,
    );

    expect(getByRole("textbox", { name: /Username/i })).toHaveValue("");
    expect(getByRole("textbox", { name: /Email/i })).toHaveValue("");
  });

  it("submits the form with correct values", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <GroupMemberForm id="create-member-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-member-form">
          Add
        </Button>
      </>,
    );

    const username = getByRole("textbox", { name: /Username/i });
    await user.type(username, "johndoe");

    const email = getByRole("textbox", { name: /Email/i });
    await user.type(email, "john.doe@example.com");

    const addButton = getByRole("button", { name: /Add/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toMatchObject({
        username: "johndoe",
        email: "john.doe@example.com",
      });
    });
  });

  it("displays error messages for required fields on submit", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <>
        <GroupMemberForm id="create-member-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-member-form">
          Add
        </Button>
      </>,
    );

    const addButton = getByRole("button", { name: /Add/i });
    await user.click(addButton);

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Error messages should appear
    expect(getByText("Username is required")).toBeInTheDocument();
    expect(getByText("Email is required")).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <>
        <GroupMemberForm id="create-member-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-member-form">
          Add
        </Button>
      </>,
    );

    const username = getByRole("textbox", { name: /Username/i });
    await user.type(username, "johndoe");

    const email = getByRole("textbox", { name: /Email/i });
    await user.type(email, "not-an-email");

    const addButton = getByRole("button", { name: /Add/i });
    await user.click(addButton);

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Error message should appear
    expect(getByText("Email must be valid")).toBeInTheDocument();
  });

  it("clears error when user starts typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(
      <>
        <GroupMemberForm id="create-member-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-member-form">
          Add
        </Button>
      </>,
    );

    const addButton = getByRole("button", { name: /Add/i });
    await user.click(addButton);

    // Error should appear
    expect(getByText("Username is required")).toBeInTheDocument();

    // Type in the field
    const username = getByRole("textbox", { name: /Username/i });
    await user.type(username, "A");

    // Error should disappear
    await waitFor(() => {
      expect(queryByText("Username is required")).not.toBeInTheDocument();
    });
  });

  it("updates form fields when typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <GroupMemberForm id="create-member-form" onSubmit={mockOnSubmit} />,
    );

    const username = getByRole("textbox", { name: /Username/i });
    await user.type(username, "johndoe");

    expect(username).toHaveValue("johndoe");
  });

  it("displays error on blur for empty required field", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <GroupMemberForm id="create-member-form" onSubmit={mockOnSubmit} />,
    );

    const username = getByRole("textbox", { name: /Username/i });

    // Type something then clear and blur
    await user.type(username, "test");
    await user.clear(username);
    await user.tab();

    await waitFor(() => {
      expect(getByText("Username is required")).toBeInTheDocument();
    });
  });
});
