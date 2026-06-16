import {
  FormHelperText,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { RhUiErrorFillIcon } from "@patternfly/react-icons";

interface FormFieldHelperTextProps {
  helpText?: string;
  errorMessage?: string;
}

export default function FormFieldHelperText({
  helpText,
  errorMessage,
}: FormFieldHelperTextProps) {
  if (!helpText && !errorMessage) return null;

  return (
    <FormHelperText>
      <HelperText>
        {errorMessage ? (
          <HelperTextItem icon={<RhUiErrorFillIcon />} variant="error">
            {errorMessage}
          </HelperTextItem>
        ) : (
          helpText && <HelperTextItem>{helpText}</HelperTextItem>
        )}
      </HelperText>
    </FormHelperText>
  );
}
