import { Checkbox, FormGroup } from "@patternfly/react-core";
import { Controller, type FieldError, useFormContext } from "react-hook-form";

import FormErrorMessage from "./FormErrorMessage";
import type { FormGroupProps } from "./types";

export default function CheckboxFormGroup({
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
    <FormGroup isRequired={isRequired} fieldId={id} {...props}>
      <Controller
        name={name}
        control={methods.control}
        render={({ field }) => {
          return (
            <Checkbox
              label={label}
              id={id}
              placeholder={placeholder}
              isRequired={isRequired}
              isChecked={field.value as boolean}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          );
        }}
      />
      <FormErrorMessage error={showError ? error : undefined} />
    </FormGroup>
  );
}
