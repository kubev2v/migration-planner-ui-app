import { FormGroup, TextArea, ValidatedOptions } from "@patternfly/react-core";
import { type FieldError, useFormContext } from "react-hook-form";

import FormErrorMessage from "./FormErrorMessage";
import type { FormGroupProps } from "./types";

export default function TextAreaFormGroup({
  id,
  label,
  name,
  isRequired = false,
  placeholder = "",
  ...props
}: FormGroupProps) {
  const methods = useFormContext();
  const error = methods.formState.errors[name] as FieldError | undefined;
  const isTouched = methods.formState.touchedFields[name] as
    | boolean
    | undefined;

  const showError = error && isTouched;

  return (
    <FormGroup label={label} isRequired={isRequired} fieldId={id} {...props}>
      <TextArea
        id={id}
        placeholder={placeholder}
        isRequired={isRequired}
        validated={
          showError ? ValidatedOptions.error : ValidatedOptions.default
        }
        {...methods.register(name)}
      />
      <FormErrorMessage error={showError ? error : undefined} />
    </FormGroup>
  );
}
