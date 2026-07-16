export type TextFilterAttribute = {
  id: string;
  label: string;
  type: "text";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
};

export type CheckboxFilterOption = {
  value: string;
  label: string;
};

export type CheckboxFilterAttribute = {
  id: string;
  label: string;
  type: "checkbox";
  options: CheckboxFilterOption[];
  selections: string[];
  onSelectionsChange: (selections: string[]) => void;
};

export type AttributeValueFilterAttribute =
  TextFilterAttribute | CheckboxFilterAttribute;
