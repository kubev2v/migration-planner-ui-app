import {
  FormHelperText,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import type { FieldError } from "react-hook-form";

interface FormErrorMessageProps extends React.ComponentProps<
  typeof FormHelperText
> {
  error?: FieldError;
}

export default function FormErrorMessage({
  error,
  ...props
}: FormErrorMessageProps) {
  if (!error) return null;

  return (
    <FormHelperText {...props}>
      <HelperText>
        <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
          {error.message}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
}
