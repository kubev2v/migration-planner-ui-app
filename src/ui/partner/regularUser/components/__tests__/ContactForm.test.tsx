import "@testing-library/jest-dom";

import { Button } from "@patternfly/react-core";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Partner } from "../../../../../models/PartnerModel";
import { ContactForm } from "../ContactForm";

const mockPartner: Partner = {
  id: "partner-1",
  name: "Tech Solutions Inc",
  company: "",
  description: "Test partner description",
  icon: "data:image/svg+xml;base64,test",
  kind: "partner",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("ContactForm", () => {
  it("renders all form fields", () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = render(
      <ContactForm
        id="contact-form"
        partner={mockPartner}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(
      getByRole("textbox", { name: /Customer Name/i }),
    ).toBeInTheDocument();
    expect(
      getByRole("textbox", { name: /Customer Point Of Contact Name/i }),
    ).toBeInTheDocument();
    expect(
      getByRole("textbox", { name: /Contact phone/i }),
    ).toBeInTheDocument();
    expect(getByRole("textbox", { name: /Email/i })).toBeInTheDocument();
    expect(
      getByRole("combobox", { name: /vCenter Geo Location/i }),
    ).toBeInTheDocument();
  });

  it("submits the form with correct values including partner", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <>
        <ContactForm
          id="contact-form"
          partner={mockPartner}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="contact-form">
          Contact
        </Button>
      </>,
    );

    const customerName = getByRole("textbox", { name: /Customer Name/i });
    await user.clear(customerName);
    await user.type(customerName, "Acme Corporation");

    const contactName = getByRole("textbox", {
      name: /Customer Point Of Contact Name/i,
    });
    await user.clear(contactName);
    await user.type(contactName, "John Doe");

    const phone = getByRole("textbox", { name: /Contact phone/i });
    await user.clear(phone);
    await user.type(phone, "+1-555-0123");

    const email = getByRole("textbox", { name: /Email/i });
    await user.clear(email);
    await user.type(email, "john.doe@acme.com");

    await user.selectOptions(getByRole("combobox"), "US East (Ohio)");

    const contactButton = getByRole("button", { name: /Contact/i });
    await user.click(contactButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        partnerId: "partner-1",
        customerName: "Acme Corporation",
        customerPointOfContactName: "John Doe",
        contactPhone: "+1-555-0123",
        email: "john.doe@acme.com",
        vcenterGeoLocation: "us-east-2",
      });
    });
  });

  it("displays error messages for required fields on submit", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <>
        <ContactForm
          id="contact-form"
          partner={mockPartner}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="contact-form">
          Contact
        </Button>
      </>,
    );

    const contactButton = getByRole("button", { name: /Contact/i });
    await user.click(contactButton);

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Error messages should appear
    expect(getByText("Customer Name is required")).toBeInTheDocument();
    expect(
      getByText("Customer Point Of Contact Name is required"),
    ).toBeInTheDocument();
    expect(getByText("Email is required")).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <>
        <ContactForm
          id="contact-form"
          partner={mockPartner}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="contact-form">
          Contact
        </Button>
      </>,
    );

    const email = getByRole("textbox", { name: /Email/i });
    await user.type(email, "invalid-email");

    const contactButton = getByRole("button", { name: /Contact/i });
    await user.click(contactButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(getByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("clears error when user starts typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(
      <>
        <ContactForm
          id="contact-form"
          partner={mockPartner}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="contact-form">
          Contact
        </Button>
      </>,
    );

    const contactButton = getByRole("button", { name: /Contact/i });
    await user.click(contactButton);

    // Error should appear
    expect(getByText("Customer Name is required")).toBeInTheDocument();

    // Type in the field
    const customerName = getByRole("textbox", { name: /Customer Name/i });
    await user.type(customerName, "A");

    // Error should disappear
    await waitFor(() => {
      expect(queryByText("Customer Name is required")).not.toBeInTheDocument();
    });
  });

  it("updates form fields when typing", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <ContactForm
        id="contact-form"
        partner={mockPartner}
        onSubmit={mockOnSubmit}
      />,
    );

    const customerName = getByRole("textbox", { name: /Customer Name/i });
    await user.type(customerName, "Test Company");

    expect(customerName).toHaveValue("Test Company");
  });

  it("displays error on blur for empty required field", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <ContactForm
        id="contact-form"
        partner={mockPartner}
        onSubmit={mockOnSubmit}
      />,
    );

    const customerName = getByRole("textbox", { name: /Customer Name/i });

    // Focus and then blur without entering anything
    await user.click(customerName);
    await user.tab();

    await waitFor(() => {
      expect(getByText("Customer Name is required")).toBeInTheDocument();
    });
  });

  it("displays all region options in the dropdown", () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = render(
      <ContactForm
        id="contact-form"
        onSubmit={mockOnSubmit}
        partner={mockPartner}
      />,
    );

    const select = getByRole("combobox", { name: /vCenter Geo Location/i });
    const options = select.querySelectorAll("option");

    // Should have placeholder + all regions (35 regions + "Other" + 1 placeholder = 37)
    expect(options.length).toBe(36);
    expect(options[0]).toHaveTextContent("Select a region");
    expect(options[1]).toHaveTextContent("US East (N. Virginia)");
    expect(options[2]).toHaveTextContent("US East (Ohio)");
  });
});
