import { Button } from "@patternfly/react-core";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type Environment, EnvironmentForm } from "../EnvironmentForm";

describe("Create mode", () => {
  it("submits form with all required fields", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    const { getByRole } = render(
      <>
        <EnvironmentForm id="create-environment-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-environment-form">
          Create
        </Button>
      </>,
    );

    const name = getByRole("textbox", { name: /Name/i });
    await user.type(name, "test-environment");

    const createButton = getByRole("button", { name: /Create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        name: "test-environment",
        sshKey: "",
        enableProxy: false,
        httpProxy: "",
        httpsProxy: "",
        noProxy: "",
        networkConfigType: "dhcp",
        dns: "",
        subnetMask: "",
        defaultGateway: "",
        ipAddress: "",
      });
    });
  });

  it("submits form with all fields", async () => {
    const mockOnSubmit = vi.fn();

    const user = userEvent.setup();

    const { getByRole, getByLabelText, findByRole, getByPlaceholderText } =
      render(
        <>
          <EnvironmentForm
            id="create-environment-form"
            onSubmit={mockOnSubmit}
          />
          <Button
            variant="primary"
            type="submit"
            form="create-environment-form"
          >
            Create
          </Button>
        </>,
      );

    const name = getByRole("textbox", { name: /Name/i });
    await user.type(name, "test-environment");

    const sshKey = getByRole("textbox", { name: /SSH Key/i });
    await user.type(
      sshKey,
      "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC user@host",
    );

    const enableProxy = getByLabelText(/Enable proxy/i);
    await user.click(enableProxy);

    const httpProxy = await findByRole("textbox", { name: /HTTP proxy URL/i });
    await user.type(httpProxy, "http://proxy.example.com:8080");

    const httpsProxy = await findByRole("textbox", {
      name: /HTTPS proxy URL/i,
    });
    await user.type(httpsProxy, "https://proxy.example.com:8443");

    const noProxy = await findByRole("textbox", { name: /No proxy domains/i });
    await user.type(noProxy, "localhost,127.0.0.1");

    const staticIpRadio = getByRole("radio", {
      name: /Static IP configuration/i,
    });
    await user.click(staticIpRadio);

    const ipAddress = await findByRole("textbox", { name: /IP address/i });
    await user.type(ipAddress, "192.168.1.100");

    // Subnet mask doesn't have its own label, find by placeholder
    const subnetMask = getByPlaceholderText("24");
    await user.type(subnetMask, "24");

    const defaultGateway = getByRole("textbox", { name: /Default gateway/i });
    await user.type(defaultGateway, "192.168.1.1");

    const dns = getByRole("textbox", { name: /DNS/i });
    await user.type(dns, "8.8.8.8");

    const createButton = getByRole("button", { name: /Create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        defaultGateway: "192.168.1.1",
        dns: "8.8.8.8",
        enableProxy: true,
        httpProxy: "http://proxy.example.com:8080",
        httpsProxy: "https://proxy.example.com:8443",
        noProxy: "localhost,127.0.0.1",
        ipAddress: "192.168.1.100",
        name: "test-environment",
        networkConfigType: "static",
        sshKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC user@host",
        subnetMask: "24",
      });
    });
  });
});

describe("Edit mode", () => {
  it("pre-fills form fields when environment is provided", () => {
    const mockOnSubmit = vi.fn();

    const environment: Environment = {
      name: "existing-environment",
      defaultGateway: "192.168.1.1",
      dns: "8.8.8.8",
      enableProxy: true,
      httpProxy: "http://proxy.example.com:8080",
      httpsProxy: "https://proxy.example.com:8443",
      noProxy: "localhost,127.0.0.1",
      ipAddress: "192.168.1.100",
      networkConfigType: "static",
      sshKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC user@host",
      subnetMask: "22",
    };

    const { getByRole, getByLabelText, getByPlaceholderText } = render(
      <>
        <EnvironmentForm
          id="edit-environment-form"
          environment={environment}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-environment-form">
          Update
        </Button>
      </>,
    );

    const name = getByRole("textbox", { name: /Name/i });
    expect(name).toHaveValue("existing-environment");

    const enableProxyCheckbox = getByLabelText(/Enable proxy/i);
    expect(enableProxyCheckbox).toBeChecked();

    const httpProxy = getByRole("textbox", { name: /HTTP proxy URL/i });
    expect(httpProxy).toHaveValue("http://proxy.example.com:8080");

    const httpsProxy = getByRole("textbox", { name: /HTTPS proxy URL/i });
    expect(httpsProxy).toHaveValue("https://proxy.example.com:8443");

    const noProxy = getByRole("textbox", { name: /No proxy domains/i });
    expect(noProxy).toHaveValue("localhost,127.0.0.1");

    const staticIpRadio = getByRole("radio", {
      name: /Static IP configuration/i,
    });
    expect(staticIpRadio).toBeChecked();

    const ipAddress = getByRole("textbox", { name: /IP address/i });
    expect(ipAddress).toHaveValue("192.168.1.100");

    // Subnet mask doesn't have its own label, find by placeholder
    const subnetMask = getByPlaceholderText("24");
    expect(subnetMask).toHaveValue("22");

    const defaultGateway = getByRole("textbox", { name: /Default gateway/i });
    expect(defaultGateway).toHaveValue("192.168.1.1");

    const dns = getByRole("textbox", { name: /DNS/i });
    expect(dns).toHaveValue("8.8.8.8");
  });

  it("disables name field when environment is provided", () => {
    const mockOnSubmit = vi.fn();

    const environment: Environment = {
      name: "existing-environment",
      defaultGateway: "192.168.1.1",
      dns: "8.8.8.8",
      enableProxy: true,
      httpProxy: "http://proxy.example.com:8080",
      httpsProxy: "https://proxy.example.com:8443",
      noProxy: "localhost,127.0.0.1",
      ipAddress: "192.168.1.100",
      networkConfigType: "static",
      sshKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC user@host",
      subnetMask: "22",
    };

    const { getByRole } = render(
      <>
        <EnvironmentForm
          id="edit-environment-form"
          environment={environment}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-environment-form">
          Update
        </Button>
      </>,
    );

    const name = getByRole("textbox", { name: /Name/i });
    expect(name).toBeDisabled();
  });

  it("submits updated values when form is edited", async () => {
    const mockOnSubmit = vi.fn();

    const user = userEvent.setup();
    const environment: Environment = {
      name: "existing-environment",
      defaultGateway: "192.168.1.1",
      dns: "8.8.8.8",
      enableProxy: true,
      httpProxy: "http://proxy.example.com:8080",
      httpsProxy: "https://proxy.example.com:8443",
      noProxy: "localhost,127.0.0.1",
      ipAddress: "192.168.1.100",
      networkConfigType: "static",
      sshKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC user@host",
      subnetMask: "22",
    };

    const { getByRole, getByLabelText } = render(
      <>
        <EnvironmentForm
          id="edit-environment-form"
          environment={environment}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-environment-form">
          Update
        </Button>
      </>,
    );

    // Enable proxy by clicking the checkbox
    const enableProxyCheckbox = getByLabelText(/Enable proxy/i);
    expect(enableProxyCheckbox).toBeChecked();

    // Wait for proxy field to appear (should be pre-filled with old value from environment)
    const httpProxy = getByRole("textbox", { name: /HTTP proxy URL/i });
    expect(httpProxy).toHaveValue("http://proxy.example.com:8080");

    // Update it to the new value
    await user.clear(httpProxy);
    await user.type(httpProxy, "http://new-proxy.example.com:8080");

    const updateButton = getByRole("button", { name: /Update/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toMatchObject({
        name: "existing-environment",
        httpProxy: "http://new-proxy.example.com:8080",
      });
    });
  });

  it("enableProxy is set to false but proxy value are conserved", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    const environment: Environment = {
      name: "existing-environment",
      defaultGateway: "192.168.1.1",
      dns: "8.8.8.8",
      enableProxy: true,
      httpProxy: "http://proxy.example.com:8080",
      httpsProxy: "https://proxy.example.com:8443",
      noProxy: "localhost,127.0.0.1",
      ipAddress: "192.168.1.100",
      networkConfigType: "static",
      sshKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC user@host",
      subnetMask: "22",
    };

    const { getByRole, getByLabelText } = render(
      <>
        <EnvironmentForm
          id="edit-environment-form"
          environment={environment}
          onSubmit={mockOnSubmit}
        />
        <Button variant="primary" type="submit" form="edit-environment-form">
          Update
        </Button>
      </>,
    );

    const name = getByRole("textbox", { name: /Name/i });
    expect(name).toHaveValue("existing-environment");

    const enableProxyCheckbox = getByLabelText(/Enable proxy/i);
    expect(enableProxyCheckbox).toBeChecked();

    await userEvent.click(enableProxyCheckbox);

    const updateButton = getByRole("button", { name: /Update/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockOnSubmit.mock.calls.length).toBe(1);
      expect(mockOnSubmit.mock.calls[0][0]).toMatchObject({
        enableProxy: false,
        httpProxy: "http://proxy.example.com:8080",
        httpsProxy: "https://proxy.example.com:8443",
        noProxy: "localhost,127.0.0.1",
      });
    });
  });
});

describe("Error handling", () => {
  it("display error on ssh field if invalid", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    const { getByRole, getByText } = render(
      <>
        <EnvironmentForm id="create-environment-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-environment-form">
          Create
        </Button>
      </>,
    );

    const sshKey = getByRole("textbox", { name: /SSH Key/i });
    await user.type(sshKey, "not a ssh key");
    await user.tab();
    const sshErrorMessage =
      "Invalid SSH key format. Please provide a valid SSH public key.";
    expect(getByText(sshErrorMessage)).toBeInTheDocument();
  });

  it("display error on proxy fields if invalid", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, findByRole, getByText } = render(
      <>
        <EnvironmentForm id="create-environment-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-environment-form">
          Create
        </Button>
      </>,
    );

    const enableProxy = getByLabelText(/Enable proxy/i);
    await user.click(enableProxy);

    await user.tab();

    const proxyErrorMessage =
      "At least one proxy field is required when proxy is enabled";
    expect(getByText(proxyErrorMessage)).toBeInTheDocument();

    const httpProxy = await findByRole("textbox", { name: /HTTP proxy URL/i });
    await user.type(httpProxy, "not a valid url");
    await user.tab();
    expect(getByText("URL must start with http://")).toBeInTheDocument();

    const httpsProxy = await findByRole("textbox", {
      name: /HTTPS proxy URL/i,
    });
    await user.type(httpsProxy, "not a valid url");
    await user.tab();
    expect(getByText("URL must start with https://")).toBeInTheDocument();
  });

  it("display error on static ip fields", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    const { getByRole, getByText, findByRole } = render(
      <>
        <EnvironmentForm id="create-environment-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-environment-form">
          Create
        </Button>
      </>,
    );

    const staticIpRadio = getByRole("radio", {
      name: /Static IP configuration/i,
    });
    await user.click(staticIpRadio);

    const ipAddress = await findByRole("textbox", { name: /IP address/i });
    await user.type(ipAddress, "not a valid ip");
    await user.tab();
    const ipErrorMessage =
      "Invalid IP address format. Please use format like 192.168.1.100";
    expect(getByText(ipErrorMessage)).toBeInTheDocument();
    await user.clear(ipAddress);

    const defaultGateway = getByRole("textbox", { name: /Default gateway/i });
    await user.type(defaultGateway, "not a valid ip");
    await user.tab();
    expect(getByText(ipErrorMessage)).toBeInTheDocument();
    await user.clear(defaultGateway);

    const dns = getByRole("textbox", { name: /DNS/i });
    await user.type(dns, "not a valid ip");
    await user.tab();
    expect(getByText(ipErrorMessage)).toBeInTheDocument();
  });

  it("display error on subnet field", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    const { getByRole, getByText, getByPlaceholderText } = render(
      <>
        <EnvironmentForm id="create-environment-form" onSubmit={mockOnSubmit} />
        <Button variant="primary" type="submit" form="create-environment-form">
          Create
        </Button>
      </>,
    );

    const staticIpRadio = getByRole("radio", {
      name: /Static IP configuration/i,
    });
    await user.click(staticIpRadio);

    const subnetMask = getByPlaceholderText("24");
    await user.type(subnetMask, "no");
    await user.tab();
    const subnetMaskError = "Subnet mask must be between 1 and 32";
    expect(getByText(subnetMaskError)).toBeInTheDocument();
  });
});
