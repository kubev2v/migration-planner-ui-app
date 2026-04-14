import type { FormGroupProps as PFFormGroupProps } from "@patternfly/react-core";
import type React from "react";

export interface FormGroupProps extends Omit<PFFormGroupProps, "fieldId"> {
  id: string;
  name: string;
  label?: string;
  isRequired?: boolean;
  placeholder?: string;
  formHelperText?: React.ReactNode;
}
