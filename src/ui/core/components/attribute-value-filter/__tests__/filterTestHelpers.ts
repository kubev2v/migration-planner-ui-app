import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const getAttributeToggle = (label: string): HTMLElement => {
  const toggles = screen.getAllByRole("button", { name: label });
  const menuToggle = toggles.find((button) =>
    button.classList.contains("pf-v6-c-menu-toggle"),
  );
  if (!menuToggle) {
    throw new Error(`Attribute toggle not found for label: ${label}`);
  }
  return menuToggle;
};

export const openAttributeSelector = async (
  user: ReturnType<typeof userEvent.setup>,
  currentAttributeLabel = "Name",
): Promise<void> => {
  await user.click(getAttributeToggle(currentAttributeLabel));
};

export const selectAttribute = async (
  user: ReturnType<typeof userEvent.setup>,
  attributeLabel: string,
  currentAttributeLabel = "Name",
): Promise<void> => {
  await openAttributeSelector(user, currentAttributeLabel);
  await user.click(screen.getByRole("option", { name: attributeLabel }));
};

export const selectCheckboxOption = async (
  user: ReturnType<typeof userEvent.setup>,
  optionLabel: string,
): Promise<void> => {
  await user.click(screen.getByRole("checkbox", { name: optionLabel }));
};
