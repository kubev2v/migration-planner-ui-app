import { describe, expect, it } from "vitest";

import { normalizeSshKey, validateSshKey } from "../sshKey";

describe("normalizeSshKey", () => {
  it("returns empty string for empty input", () => {
    expect(normalizeSshKey("")).toBe("");
  });

  it("removes line breaks from key", () => {
    const keyWithLineBreaks =
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D user@example.com\n";
    expect(normalizeSshKey(keyWithLineBreaks)).toBe(
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D user@example.com",
    );
  });

  it("removes carriage returns from key", () => {
    const keyWithCarriageReturns =
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D user@example.com\r\n";
    expect(normalizeSshKey(keyWithCarriageReturns)).toBe(
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D user@example.com",
    );
  });

  it("removes multiple consecutive line breaks", () => {
    const keyWithMultipleBreaks =
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D user@example.com\n\n\n";
    expect(normalizeSshKey(keyWithMultipleBreaks)).toBe(
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D user@example.com",
    );
  });

  it("trims whitespace from start and end", () => {
    const keyWithWhitespace =
      "  ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7Z user@example.com  ";
    expect(normalizeSshKey(keyWithWhitespace)).toBe(
      "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7Z user@example.com",
    );
  });

  it("preserves spaces between key parts", () => {
    const normalKey =
      "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7Z user@example.com";
    expect(normalizeSshKey(normalKey)).toBe(normalKey);
  });
});

describe("validateSshKey", () => {
  it("returns null for empty string", () => {
    expect(validateSshKey("")).toBeNull();
  });

  it("returns null for valid RSA key", () => {
    const validRsaKey =
      "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7Z user@example.com";
    expect(validateSshKey(validRsaKey)).toBeNull();
  });

  it("returns null for valid RSA key without comment", () => {
    const validRsaKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7Z";
    expect(validateSshKey(validRsaKey)).toBeNull();
  });

  it("returns null for valid ED25519 key", () => {
    const validEd25519Key =
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D user@example.com";
    expect(validateSshKey(validEd25519Key)).toBeNull();
  });

  it("returns null for valid ED25519 key without comment", () => {
    const validEd25519Key =
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D";
    expect(validateSshKey(validEd25519Key)).toBeNull();
  });

  it("returns null for valid ECDSA key", () => {
    const validEcdsaKey =
      "ssh-ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJrJUO+TtmV36MRgFAoidYt09pPd3oH0/tbQ5dcGs/PesEQ8sSNmdJgGQwO10w/GXbD9PRNF56YZn5KS60ZZ/XQ= user@example.com";
    expect(validateSshKey(validEcdsaKey)).toBeNull();
  });

  it("returns null for valid ECDSA key with different nistp", () => {
    const validEcdsaKey =
      "ssh-ecdsa-sha2-nistp384 AAAAE2VjZHNhLXNoYTItbmlzdHAzODQAAAAIbmlzdHAzODQAAABhBO6T8ELZFwJSsSNbtMiL2RobZnfv/FOmAmDa7/SeMhINqTSMb3eCohJZ/f7AkDYwXPqMEHfmaLmKM/8z3y3SWsuonJ+X2er552TADjyykkdV5eVgOV7lJn+DX4nlRjoxFQ==";
    expect(validateSshKey(validEcdsaKey)).toBeNull();
  });

  it("returns null for valid sk-ecdsa key", () => {
    const validSkEcdsaKey =
      "ssh-sk-ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJrJUO+TtmV36MRgFAoidYt09pPd3oH0/tbQ5dcGs/PesEQ8sSNmdJgGQwO10w/GXbD9PRNF56YZn5KS60ZZ/XQ=";
    expect(validateSshKey(validSkEcdsaKey)).toBeNull();
  });

  it("returns null for key with whitespace that can be trimmed", () => {
    const keyWithWhitespace =
      "  ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7Z user@example.com  ";
    expect(validateSshKey(keyWithWhitespace)).toBeNull();
  });

  it("returns error message for invalid key format", () => {
    const invalidKey = "invalid-key-format";
    expect(validateSshKey(invalidKey)).toBe(
      "Invalid SSH key format. Please provide a valid SSH public key.",
    );
  });

  it("returns error message for key with wrong prefix", () => {
    const invalidKey = "rsa-ssh AAAAB3NzaC1yc2EAAAADAQABAAABgQC7Z";
    expect(validateSshKey(invalidKey)).toBe(
      "Invalid SSH key format. Please provide a valid SSH public key.",
    );
  });

  it("returns error message for key without encoded part", () => {
    const invalidKey = "ssh-rsa";
    expect(validateSshKey(invalidKey)).toBe(
      "Invalid SSH key format. Please provide a valid SSH public key.",
    );
  });

  it("returns error message for key with invalid characters in encoded part", () => {
    const invalidKey = "ssh-rsa AAAA@#$%^&*()";
    expect(validateSshKey(invalidKey)).toBe(
      "Invalid SSH key format. Please provide a valid SSH public key.",
    );
  });

  it("returns error message for private key", () => {
    const privateKey = "-----BEGIN RSA PRIVATE KEY-----";
    expect(validateSshKey(privateKey)).toBe(
      "Invalid SSH key format. Please provide a valid SSH public key.",
    );
  });

  it("returns null for valid key with line breaks", () => {
    const keyWithLineBreaks =
      "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7Z\nuser@example.com";
    expect(validateSshKey(keyWithLineBreaks)).toBeNull();
  });

  it("returns null for valid key with carriage returns", () => {
    const keyWithCarriageReturns =
      "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7Z\r\nuser@example.com";
    expect(validateSshKey(keyWithCarriageReturns)).toBeNull();
  });

  it("returns null for valid key with carriage returns at the end", () => {
    const keyWithCarriageReturns =
      "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7Z user@example.com\r\n";
    expect(validateSshKey(keyWithCarriageReturns)).toBeNull();
  });

  it("returns null for valid key with multiple line breaks", () => {
    const keyWithMultipleBreaks =
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D\n\n\nuser@example.com";
    expect(validateSshKey(keyWithMultipleBreaks)).toBeNull();
  });

  it("returns null for valid key with multiple line breaks at the end", () => {
    const keyWithMultipleBreaks =
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC6iw5jIM9/iS1JvZiSMb86YxY0x3bh79oN2OEfIaz7D user@example.com\n\n\n";
    expect(validateSshKey(keyWithMultipleBreaks)).toBeNull();
  });
});
